import { config } from "../config";
import crypto from "crypto";

export interface JWTPayload {
  userId: string;
  email: string;
  role: "admin" | "user" | "merchant";
  exp: number;
  iat: number;
  apiVersion: string; // V2 Breaking Payload Field
}

export class JWTManager {
  private static base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  }

  private static base64UrlDecode(str: string): string {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    return Buffer.from(base64, "base64").toString("utf8");
  }

  public static signToken(userId: string, email: string, role: "admin" | "user" | "merchant"): string {
    const header = { alg: "HS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const payload: JWTPayload = {
      userId,
      email,
      role,
      iat: now,
      exp: now + config.jwtExpirySeconds,
      apiVersion: "2.0.0" // Breaking API v2 change
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    const signature = crypto
      .createHmac("sha256", config.jwtSecret)
      .update(signatureInput)
      .digest("base64url");

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  public static verifyToken(token: string): JWTPayload {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT token format");
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    const signatureInput = `${headerB64}.${payloadB64}`;

    const expectedSignature = crypto
      .createHmac("sha256", config.jwtSecret)
      .update(signatureInput)
      .digest("base64url");

    if (signatureB64 !== expectedSignature) {
      throw new Error("JWT signature verification failed");
    }

    const payload: JWTPayload = JSON.parse(this.base64UrlDecode(payloadB64));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      throw new Error("JWT token expired");
    }

    return payload;
  }
}
