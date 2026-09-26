import { JWTManager } from "../auth/jwt";
import { OAuth2Service } from "../auth/oauth";
import { UserService } from "../users/userService";

export function runAuthTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  // Test 1: JWT Signing and Verification
  try {
    const token = JWTManager.signToken("usr_123", "alice@example.com", "user");
    const payload = JWTManager.verifyToken(token);
    if (payload.userId === "usr_123" && payload.apiVersion === "2.0.0") {
      results.push({ name: "JWT Sign & Verify (with V2 payload schema)", passed: true });
    } else {
      results.push({ name: "JWT Sign & Verify", passed: false, error: "Payload fields mismatch" });
    }
  } catch (err: any) {
    results.push({ name: "JWT Sign & Verify", passed: false, error: err.message });
  }

  // Test 2: Expired or tampered JWT
  try {
    const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMifQ.fake_signature";
    JWTManager.verifyToken(fakeToken);
    results.push({ name: "JWT Reject Invalid Signature", passed: false, error: "Failed to reject fake signature" });
  } catch {
    results.push({ name: "JWT Reject Invalid Signature", passed: true });
  }

  // Test 3: OAuth URL Generation & Callback
  try {
    const oauth = new OAuth2Service();
    const url = oauth.generateAuthUrl("google", "state_xyz");
    if (!url.includes("google-client-id")) {
      throw new Error("Invalid OAuth URL generated");
    }
    const res = oauth.handleCallback("google", "code_valid_12345");
    if (res.accessToken && res.userId) {
      results.push({ name: "OAuth2 Provider URL & Callback Handling", passed: true });
    } else {
      results.push({ name: "OAuth2 Provider Handling", passed: false, error: "No token returned" });
    }
  } catch (err: any) {
    results.push({ name: "OAuth2 Provider Handling", passed: false, error: err.message });
  }

  // Test 4: User Service Duplicate Registration Prevention
  try {
    const us = new UserService();
    const email = `unique_${Date.now()}@test.com`;
    us.createUser(email, "Bob Builder", "user");
    try {
      us.createUser(email, "Bob Duplicate", "user");
      results.push({ name: "Prevent Duplicate User Email", passed: false, error: "Duplicate email was allowed" });
    } catch {
      results.push({ name: "Prevent Duplicate User Email", passed: true });
    }
  } catch (err: any) {
    results.push({ name: "User Service Registration", passed: false, error: err.message });
  }

  return results;
}
