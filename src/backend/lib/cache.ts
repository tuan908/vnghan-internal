import json from "@/shared/i18n/locales/vi/vi.json";
import { tryCatch } from "@/shared/utils";
import { Redis } from "@upstash/redis"; // Lightweight Redis client that works in edge environments
import type { Context } from "hono";

// Define cache options interface
export interface CacheOptions {
	ttl?: number; // Time to live in seconds (default: 60 = 1 minute)
	methods?: string[]; // HTTP methods to cache (default: ['GET'])
	keyGenerator?: (c: Context) => string; // Function to generate cache keys
	varyByHeaders?: string[]; // Headers that should vary the cache key
	cacheControl?: string; // Cache-Control header value
	namespace?: string; // Redis key namespace
	REDIS_URL?: string;
	REDIS_TOKEN?: string;
	maxFileSizeBytes?: number;
	cacheableFileTypes?: string[];
	compressFiles?: boolean;
}

// Define cache entry structure
export interface CacheEntry {
	body: string; // Base64 encoded body
	headers: Record<string, string>;
	status: number;
	createdAt: number;
	contentType: string;
	isFile?: boolean;
	fileData?: string; // Base64 encoded file data
	compressed?: boolean;
	tags?: string[];
	resourceTagging?: boolean;
}

// Cache store interface
export interface CacheStore {
	get(key: string): Promise<CacheEntry | null>;
	set(key: string, value: CacheEntry, ttl: number): Promise<void>;
	delete(key: string): Promise<void>;
	clear(pattern?: string): Promise<void>;
	ping(): Promise<boolean>; // New method to check connection health
	addTagToKey(tag: string, key: string): Promise<void>;
	getKeysByTag(tag: string): Promise<string[]>;
	invalidateByTag(tag: string): Promise<number>;
	setWithTags(
		key: string,
		value: CacheEntry,
		ttl: number,
		tags: string[],
	): Promise<void>;
}

// Connection pool to manage Redis connections
const redisConnections = new Map<string, Redis>();

// Redis implementation of CacheStore
export class RedisCacheStore implements CacheStore {
	private redis: Redis;
	private namespace: string;
	private connectionKey: string;

	constructor(
		redisUrl: string,
		redisToken: string,
		namespace: string = "hono-cache:",
	) {
		this.connectionKey = `${redisUrl}:${namespace}`;

		// Reuse connection if it exists
		if (redisConnections.has(this.connectionKey)) {
			this.redis = redisConnections.get(this.connectionKey)!;
		} else {
			this.redis = new Redis({
				url: redisUrl,
				token: redisToken,
				automaticDeserialization: true,
			});
			redisConnections.set(this.connectionKey, this.redis);
		}

		this.namespace = namespace;
	}

	private getNamespacedKey(key: string): string {
		return `${this.namespace}${key}`;
	}

	// New method to check connection health
	async ping(): Promise<boolean> {
		try {
			const result = await this.redis.ping();
			return result === "PONG";
		} catch (error) {
			console.error("Redis ping error:", error);
			return false;
		}
	}

	async get(key: string): Promise<CacheEntry | null> {
		const promise = this.redis.get<CacheEntry | string>(
			this.getNamespacedKey(key),
		);
		const { data } = await tryCatch(promise);
		if (!data) return null;

		if (typeof data === "object") {
			return data as CacheEntry;
		}
		return JSON.parse(data as string) as CacheEntry;
	}

	async set(key: string, value: CacheEntry, ttl: number): Promise<void> {
		const serialized = JSON.stringify(value);
		const promise = this.redis.set(this.getNamespacedKey(key), serialized, {
			ex: ttl,
		});
		const { error } = await tryCatch(promise);
		if (error) throw error;
	}

	async delete(key: string): Promise<void> {
		const promise = this.redis.del(this.getNamespacedKey(key));
		const { error } = await tryCatch(promise);
		if (error) throw error;
	}

	async clear(pattern?: string): Promise<void> {
		try {
			if (pattern) {
				const keys = await this.redis.keys(`${this.namespace}${pattern}*`);
				if (keys.length > 0) {
					await this.redis.del(...keys);
				}
			} else {
				const keys = await this.redis.keys(`${this.namespace}*`);
				if (keys.length > 0) {
					await this.redis.del(...keys);
				}
			}
		} catch (error) {
			console.error("Redis cache clear error:", error);
		}
	}

	// Get the underlying Redis client
	getClient(): Redis {
		return this.redis;
	}

	/**
	 * Add a tag to a cache key
	 */
	async addTagToKey(tag: string, key: string): Promise<void> {
		const tagSetKey = `${this.namespace}:tags:${tag}`;
		await this.redis.sadd(tagSetKey, key);
	}

	/**
	 * Get all cache keys with a specific tag
	 */
	async getKeysByTag(tag: string): Promise<string[]> {
		const tagSetKey = `${this.namespace}:tags:${tag}`;
		return await this.redis.smembers(tagSetKey);
	}

	/**
	 * Invalidate all cache entries with a specific tag
	 */
	async invalidateByTag(tag: string): Promise<number> {
		const keys = await this.getKeysByTag(tag);
		if (keys.length === 0) return 0;

		// Delete all the cache entries
		await Promise.all(keys.map((key) => this.redis.del(key)));

		// Clean up the tag set
		const tagSetKey = `${this.namespace}:tags:${tag}`;
		await this.redis.del(tagSetKey);

		return keys.length;
	}

	/**
	 * Enhanced set method that supports tags
	 */
	async setWithTags(
		key: string,
		value: CacheEntry,
		ttl: number,
		tags: string[],
	): Promise<void> {
		// First set the cache entry
		await this.set(key, value, ttl);

		// Then add the key to each tag's set
		await Promise.all(tags.map((tag) => this.addTagToKey(tag, key)));

		// Store the tags with the entry for reference
		value.tags = tags;
	}
}

// Default options
export const defaultOptions: CacheOptions = {
	ttl: 60, // 60 seconds default
	methods: ["GET"],
	keyGenerator: (c: Context) => {
		return `${c.req.method}:${c.req.url}`;
	},
	varyByHeaders: [],
	cacheControl: "public, max-age=60",
	namespace: "hono-cache:",
	REDIS_URL: process.env.REDIS_URL,
	REDIS_TOKEN: process.env.REDIS_TOKEN,
};

// Helper to encode response body to string
export async function encodeBody(json: any): Promise<string> {
	return new Promise((resolve) => {
		const arrayBuffer = str2ab(JSON.stringify(json));
		const encodedBody = Buffer.from(arrayBuffer).toString("base64");
		resolve(encodedBody);
	});
}

// Helper to decode body from string
export function decodeBody(bodyString: string): Promise<ArrayBuffer> {
	return new Promise((resolve) => {
		const cachedBody = Buffer.from(bodyString, "base64").buffer;
		resolve(cachedBody);
	});
}

// Updated cache invalidation helper - can now accept a cache store instance
export const invalidateCache = async (
	cacheStoreOrRedisUrl?: RedisCacheStore | string,
	redisTokenOrPattern?: string,
	patternOrNamespace?: string,
	namespace: string = "hono-cache:",
): Promise<void> => {
	// Handle different parameter scenarios
	let cacheStore: RedisCacheStore;
	let pattern: string | undefined;

	if (cacheStoreOrRedisUrl instanceof RedisCacheStore) {
		// First parameter is a cache store instance
		cacheStore = cacheStoreOrRedisUrl;
		pattern = redisTokenOrPattern;
	} else {
		// First parameter is a Redis URL
		const redisUrl = cacheStoreOrRedisUrl || process.env.REDIS_URL;
		const redisToken = redisTokenOrPattern || process.env.REDIS_TOKEN;
		pattern = patternOrNamespace;

		if (!redisUrl || !redisToken) {
			throw new Error(json.error.missingEnvironmentVariables);
		}

		cacheStore = new RedisCacheStore(redisUrl, redisToken, namespace);
	}

	return cacheStore.clear(pattern);
};

// New function to cleanup Redis connections
export const cleanupConnections = async (): Promise<void> => {
	// Upstash Redis doesn't have explicit close method
	// Clear the connections map to allow garbage collection
	redisConnections.clear();
};

/**
 * Converts an ArrayBuffer to a string with proper handling for various encodings.
 * @param {ArrayBuffer} buf - The ArrayBuffer to convert.
 * @param {string} [encoding='utf-8'] - The encoding to use ('utf-8', 'utf-16', etc.)
 * @returns {string} The decoded string from the buffer.
 */
export function ab2str(
	buf: ArrayBuffer | null | undefined,
	encoding: string = "utf-8",
): string {
	// Guard against null or undefined input
	if (!buf) {
		return "";
	}

	try {
		// Use TextDecoder for more reliable conversion with proper encoding support
		const decoder = new TextDecoder(encoding);
		return decoder.decode(buf);
	} catch (error) {
		// Fallback method for older browsers (less efficient and less robust)
		if (encoding.toLowerCase() === "utf-16") {
			// Handle UTF-16 specifically
			const uint16Array = new Uint16Array(buf);
			return String.fromCharCode.apply(null, Array.from(uint16Array));
		} else {
			// Default to UTF-8
			const uint8Array = new Uint8Array(buf);
			return String.fromCharCode.apply(null, Array.from(uint8Array));
		}
	}
}

/**
 * Converts a string to an ArrayBuffer with proper Unicode support.
 * @param {string} str - The string to convert.
 * @param {string} [encoding='utf-8'] - The encoding to use ('utf-8', 'utf-16', etc.)
 * @returns {ArrayBuffer} The resulting ArrayBuffer containing the encoded string.
 */
export function str2ab(
	str: string,
	encoding: string = "utf-8",
): ArrayBuffer | SharedArrayBuffer {
	// Guard against null or undefined input
	if (!str) {
		return new ArrayBuffer(0);
	}

	try {
		// Use TextEncoder for more reliable conversion (note: TextEncoder only supports UTF-8)
		if (encoding.toLowerCase() === "utf-8") {
			const encoder = new TextEncoder();
			// Create a new ArrayBuffer from the Uint8Array to ensure we return an actual ArrayBuffer
			const uint8Array = encoder.encode(str);
			const arrayBuffer = uint8Array.buffer.slice(0);
			return arrayBuffer;
		}

		// For UTF-16 and other encodings, use the manual approach
		if (encoding.toLowerCase() === "utf-16") {
			const buf = new ArrayBuffer(str.length * 2); // 2 bytes per character
			const bufView = new Uint16Array(buf);

			for (let i = 0; i < str.length; i++) {
				bufView[i] = str.charCodeAt(i);
			}

			return buf;
		}

		// For other encodings, fall back to UTF-8
		const encoder = new TextEncoder();
		const uint8Array = encoder.encode(str);
		return uint8Array.buffer.slice(0);
	} catch (error) {
		// Fallback for older browsers or if TextEncoder fails
		const buf = new ArrayBuffer(str.length * 2);
		const bufView = new Uint16Array(buf);

		for (let i = 0; i < str.length; i++) {
			bufView[i] = str.charCodeAt(i);
		}

		return buf;
	}
}
