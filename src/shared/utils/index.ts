import type { RecursivelyReplaceNullWithUndefined } from "@/shared/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
  if (!process.env.VERCEL_URL) return `http://localhost:3000`;
  return `https://${process.env.VERCEL_URL}`;
};
