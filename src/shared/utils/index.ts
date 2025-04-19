import json from "@/shared/i18n/locales/vi/vi.json";
import type { RecursivelyReplaceNullWithUndefined } from "@/shared/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { UserRoles } from "../constants";
import { UserRole } from "../constants/roles";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function nullsToUndefined<T>(
  obj: T,
): RecursivelyReplaceNullWithUndefined<T> {
  if (obj === null) {
    return undefined as any;
  }

  // object check based on: https://stackoverflow.com/a/51458052/6489012
  if (obj?.constructor.name === "Object") {
    for (const key in obj) {
      obj[key] = nullsToUndefined(obj[key]) as any;
    }
  }
  return obj as any;
}

type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  error: E;
  data: null;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

export async function tryCatch<T, E = Error>(
  promise: Promise<T>,
): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}

export const getUrl = () => {
  return process.env.NEXT_PUBLIC_VERCEL_URL!;
};

export function format(str: string, ...args: any[]): string {
  return str.replace(/{(\d+)}/g, (match, index) => {
    return typeof args[index] !== "undefined" ? args[index] : match;
  });
}

export function convertRole(role?: string) {
  // Viewer, Editor, Owner, Administrator
  switch (role) {
    case UserRoles.Viewer:
      return json.role.viewer;

    case UserRoles.Editor:
      return json.role.editor;

    case UserRoles.Owner:
      return json.role.owner;

    case UserRoles.Administrator:
      return json.role.administrator;

    default:
      throw new Error("Invalid Role");
  }
}

/**
 * Converts a string | undefined value to a string
 * @param value - The input string or undefined value
 * @param defaultValue - The default value to return if input is undefined (defaults to empty string)
 * @returns A non-undefined string value
 */
export const toStringValue = (
  value: string | undefined,
  defaultValue: string = "",
): string => {
  return value !== undefined ? value : defaultValue;
};

/**
 * Maps a value that can be undefined to a specified value or default
 * Similar to toStringValue but with more flexibility on input and output types
 * @param value - The input value which could be undefined
 * @param defaultValue - The default value to return if input is undefined
 * @returns The input value or the default value if input is undefined
 */
export function mapUndefinable<T>(value: T | undefined, defaultValue: T): T {
  return value !== undefined ? value : defaultValue;
}

export const RoleUtils = {
  isViewer: (role?: string) => role === UserRole.Editor,
  isEditor: (role?: string) => role === UserRole.Owner,
  isOwner: (role?: string) => role === UserRole.Owner,
  isAdmin: (role?: string) => role === UserRole.Admin,
};
