// ============================================
// Types
// ============================================

type CountryCode = "VI" | "CN" | "IN" | "US" | "ID" | "BR";

type PhoneConfig = {
	countryCode: string;
	countryName: string;
	minLength: number;
	maxLength: number;
	patterns: RegExp[];
	formatTemplate: string;
	placeholder: string;
	trunkPrefix: string; // Leading digit to remove for international format
};

type ParsedPhone = {
	isValid: boolean;
	countryCode: CountryCode | null;
	dialCode: string;
	nationalNumber: string;
	formatted: string;
	international: string;
	e164: string;
	uri: string;
};

type FormatStyle = "national" | "international" | "e164" | "uri";

// ============================================
// Phone Configuration - Top 5 Countries
// ============================================

const phoneConfig: Record<CountryCode, PhoneConfig> = {
	// Vietnam: +84
	VI: {
		countryCode: "84",
		countryName: "Vietnam",
		minLength: 9,
		maxLength: 10,
		patterns: [
			/^[3|5|7|8|9]\d{8}$/, // New format (9 digits)
			/^[1-9]\d{8,9}$/, // General
		],
		formatTemplate: "XXX XXX XXXX",
		placeholder: "091 234 5678",
		trunkPrefix: "0",
	},
	// China: +86
	CN: {
		countryCode: "86",
		countryName: "China",
		minLength: 11,
		maxLength: 11,
		patterns: [
			/^1[3-9]\d{9}$/, // Mobile: 13x, 14x, 15x, 16x, 17x, 18x, 19x
			/^[2-9]\d{7,10}$/, // Landline
		],
		formatTemplate: "XXX XXXX XXXX",
		placeholder: "138 0000 0000",
		trunkPrefix: "",
	},

	// India: +91
	IN: {
		countryCode: "91",
		countryName: "India",
		minLength: 10,
		maxLength: 10,
		patterns: [
			/^[6-9]\d{9}$/, // Mobile starts with 6, 7, 8, or 9
		],
		formatTemplate: "XXXXX XXXXX",
		placeholder: "98765 43210",
		trunkPrefix: "0",
	},

	// United States: +1
	US: {
		countryCode: "1",
		countryName: "United States",
		minLength: 10,
		maxLength: 10,
		patterns: [
			/^[2-9]\d{2}[2-9]\d{6}$/, // NPA-NXX-XXXX format
		],
		formatTemplate: "(XXX) XXX-XXXX",
		placeholder: "(555) 123-4567",
		trunkPrefix: "1",
	},

	// Indonesia: +62
	ID: {
		countryCode: "62",
		countryName: "Indonesia",
		minLength: 9,
		maxLength: 12,
		patterns: [
			/^8[1-9]\d{7,10}$/, // Mobile: 81x, 82x, 83x, etc.
			/^[2-9]\d{6,10}$/, // Landline
		],
		formatTemplate: "XXXX-XXXX-XXXX",
		placeholder: "0812-3456-7890",
		trunkPrefix: "0",
	},

	// Brazil: +55
	BR: {
		countryCode: "55",
		countryName: "Brazil",
		minLength: 10,
		maxLength: 11,
		patterns: [
			/^[1-9]{2}9\d{8}$/, // Mobile: DDD + 9 + 8 digits
			/^[1-9]{2}[2-5]\d{7}$/, // Landline: DDD + 8 digits
		],
		formatTemplate: "(XX) XXXXX-XXXX",
		placeholder: "(11) 98765-4321",
		trunkPrefix: "0",
	},
};

// ============================================
// Utility Functions
// ============================================

/**
 * Strip all non-numeric characters
 */
function stripNonNumeric(input: string): string {
	return input.replace(/\D/g, "");
}

/**
 * Remove country code and trunk prefix from number
 */
function extractNationalNumber(digits: string, config: PhoneConfig): string {
	let national = digits;

	// Remove country code if present
	if (national.startsWith(config.countryCode)) {
		national = national.slice(config.countryCode.length);
	}

	// Remove trunk prefix if present
	if (config.trunkPrefix && national.startsWith(config.trunkPrefix)) {
		national = national.slice(config.trunkPrefix.length);
	}

	// Remove leading zeros
	national = national.replace(/^0+/, "");

	return national;
}

// ============================================
// Core Functions
// ============================================

/**
 * Detect country from phone number
 */
export function detectCountry(phone: string): CountryCode | null {
	const digits = stripNonNumeric(phone);

	// Check by country code prefix
	const countryByPrefix: [string, CountryCode][] = [
		["86", "CN"],
		["91", "IN"],
		["1", "US"],
		["62", "ID"],
		["55", "BR"],
	];

	for (const [prefix, country] of countryByPrefix) {
		if (digits.startsWith(prefix)) {
			const national = digits.slice(prefix.length);
			if (validatePhone(national, country)) {
				return country;
			}
		}
	}

	// Try to match by pattern without country code
	for (const [code, config] of Object.entries(phoneConfig)) {
		const national = extractNationalNumber(digits, config);
		if (config.patterns.some((p) => p.test(national))) {
			return code as CountryCode;
		}
	}

	return null;
}

/**
 * Validate phone number for a specific country
 */
export function validatePhone(phone: string, country: CountryCode): boolean {
	const config = phoneConfig[country];
	if (!config) return false;

	const digits = stripNonNumeric(phone);
	const national = extractNationalNumber(digits, config);

	// Check length
	if (
		national.length < config.minLength ||
		national.length > config.maxLength
	) {
		return false;
	}

	// Check patterns
	return config.patterns.some((pattern) => pattern.test(national));
}

/**
 * Format phone number with template
 */
function applyFormat(digits: string, template: string): string {
	let result = "";
	let digitIndex = 0;

	for (const char of template) {
		if (char === "X") {
			if (digitIndex < digits.length) {
				result += digits[digitIndex++];
			}
		} else {
			if (digitIndex < digits.length) {
				result += char;
			}
		}
	}

	// Append remaining digits
	if (digitIndex < digits.length) {
		result += digits.slice(digitIndex);
	}

	return result.trim();
}

/**
 * Format phone number
 */
export function formatPhone(
	phone: string,
	country: CountryCode = "VI",
	style: FormatStyle = "national",
): string {
	const config = phoneConfig[country];
	if (!config) return phone;

	const digits = stripNonNumeric(phone);
	const national = extractNationalNumber(digits, config);

	switch (style) {
		case "national":
			return applyFormat(national, config.formatTemplate);

		case "international":
			return `+${config.countryCode} ${applyFormat(national, config.formatTemplate)}`;

		case "e164":
			return `+${config.countryCode}${national}`;

		case "uri":
			return `tel:+${config.countryCode}${national}`;

		default:
			return applyFormat(national, config.formatTemplate);
	}
}

/**
 * Parse phone number into structured data
 */
export function parsePhone(phone: string, country?: CountryCode): ParsedPhone {
	const digits = stripNonNumeric(phone);
	const detectedCountry = country ?? detectCountry(phone);

	const invalid: ParsedPhone = {
		isValid: false,
		countryCode: null,
		dialCode: "",
		nationalNumber: "",
		formatted: phone,
		international: phone,
		e164: "",
		uri: "",
	};

	if (!detectedCountry) return invalid;

	const config = phoneConfig[detectedCountry];
	const national = extractNationalNumber(digits, config);
	const isValid = validatePhone(national, detectedCountry);

	if (!isValid) return invalid;

	return {
		isValid: true,
		countryCode: detectedCountry,
		dialCode: `+${config.countryCode}`,
		nationalNumber: national,
		formatted: formatPhone(national, detectedCountry, "national"),
		international: formatPhone(national, detectedCountry, "international"),
		e164: formatPhone(national, detectedCountry, "e164"),
		uri: formatPhone(national, detectedCountry, "uri"),
	};
}

/**
 * Get phone input mask/placeholder for country
 */
export function getPhonePlaceholder(country: CountryCode): string {
	return phoneConfig[country]?.placeholder ?? "";
}

/**
 * Get country dial code
 */
export function getDialCode(country: CountryCode): string {
	return `+${phoneConfig[country]?.countryCode ?? ""}`;
}

/**
 * Get all supported countries
 */
export function getSupportedCountries(): Array<{
	code: CountryCode;
	name: string;
	dialCode: string;
}> {
	return Object.entries(phoneConfig).map(([code, config]) => ({
		code: code as CountryCode,
		name: config.countryName,
		dialCode: `+${config.countryCode}`,
	}));
}

/**
 * Format phone for display with flag emoji
 */
export function formatPhoneWithFlag(
	phone: string,
	country: CountryCode,
): string {
	const flags: Record<CountryCode, string> = {
		VI: "🇻🇳",
		CN: "🇨🇳",
		IN: "🇮🇳",
		US: "🇺🇸",
		ID: "🇮🇩",
		BR: "🇧🇷",
	};

	const formatted = formatPhone(phone, country, "international");
	return `${flags[country]} ${formatted}`;
}

/**
 * Compare two phone numbers (regardless of format)
 */
export function isSamePhone(
	phone1: string,
	phone2: string,
	country?: CountryCode,
): boolean {
	const parsed1 = parsePhone(phone1, country);
	const parsed2 = parsePhone(phone2, country);

	if (!parsed1.isValid || !parsed2.isValid) return false;

	return parsed1.e164 === parsed2.e164;
}

/**
 * Input formatter - format as user types
 */
export function formatPhoneInput(
	input: string,
	country: CountryCode = "VI",
): string {
	const config = phoneConfig[country];
	if (!config) return input;

	const digits = stripNonNumeric(input);

	// Don't format if too short
	if (digits.length < 3) return digits;

	return applyFormat(digits, config.formatTemplate);
}

// ============================================
// Extend/Register New Country
// ============================================

export function registerCountry(code: string, config: PhoneConfig): void {
	(phoneConfig as Record<string, PhoneConfig>)[code] = config;
}
