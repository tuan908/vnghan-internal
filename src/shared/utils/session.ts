import { type JWTPayload, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { cache } from "react";

export interface Session extends JWTPayload {
  id: number;
  username: string;
  role: string;
}

function getJwtSecretKey(): Uint8Array {
  const sessionSecret = process.env.JWT_TOKEN_SECRET;

  if (!sessionSecret) {
    throw new Error("JWT Secret key is not defined");
  }
  return new TextEncoder().encode(sessionSecret);
}

export async function decrypt(input: string) {
  try {
    const { payload } = await jwtVerify(input, getJwtSecretKey());
    return payload as Session;
  } catch {
    return undefined;
  }
}

export const getSession = cache(async () => {
  const reqCookies = await cookies();
  const sessionCookie = reqCookies.get("access_token")?.value;
  if (!sessionCookie) return undefined;

  const session = await decrypt(sessionCookie);
  if (!session) return undefined;

  return session;
});
