import { RecursivelyReplaceNullWithUndefined } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function nullsToUndefined<T>(
  obj: T
): RecursivelyReplaceNullWithUndefined<T> {
  if (obj === null) {
    return undefined as any;
  }

  // object check based on: https://stackoverflow.com/a/51458052/6489012
  if (obj?.constructor.name === "Object") {
    for (let key in obj) {
      obj[key] = nullsToUndefined(obj[key]) as any;
    }
  }
  return obj as any;
}

export function getApiUrl() {
  if (process.env.NODE_ENV === "production")
    return `https://${process.env.DEPLOYMENT_ID}.workers.dev/api/v1`;
  return "http://localhost:8787/api/v1";
}
