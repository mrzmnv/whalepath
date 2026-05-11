import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) throw new Error("SESSION_SECRET environment variable is not set");
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(token: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}
