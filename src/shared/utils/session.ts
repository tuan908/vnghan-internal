import { type JWTPayload, jwtVerify, SignJWT } from "jose";
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

export async function encrypt(payload: Session) {
  try {
    const secretKey = new TextEncoder().encode(process.env.JWT_TOKEN_SECRET!);
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(
        Math.floor(Date.now() / 1000) +
          Number(process.env.JWT_TOKEN_EXPIRED!) / 1000,
      )
      .sign(secretKey);

    return token;
  } catch (error) {
    console.error(error);
    return undefined;
  }
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
