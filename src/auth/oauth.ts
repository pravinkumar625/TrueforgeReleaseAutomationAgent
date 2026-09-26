import { JWTManager } from "./jwt";

export interface OAuth2Provider {
  name: string;
  clientId: string;
  redirectUri: string;
}

export class OAuth2Service {
  private providers: Map<string, OAuth2Provider> = new Map();

  constructor() {
    this.registerProvider("google", {
      name: "Google OAuth",
      clientId: "google-client-id-nexus-prod",
      redirectUri: "https://nexus.enterprise.com/auth/callback/google"
    });
    this.registerProvider("github", {
      name: "GitHub OAuth",
      clientId: "github-client-id-nexus-prod",
      redirectUri: "https://nexus.enterprise.com/auth/callback/github"
    });
  }

  public registerProvider(id: string, provider: OAuth2Provider): void {
    this.providers.set(id, provider);
  }

  public generateAuthUrl(providerId: string, state: string): string {
    const provider = this.providers.get(providerId);
    if (!provider) throw new Error(`OAuth provider '${providerId}' not configured.`);
    return `https://auth.${providerId}.com/oauth/authorize?client_id=${provider.clientId}&redirect_uri=${encodeURIComponent(provider.redirectUri)}&state=${state}`;
  }

  public handleCallback(providerId: string, authCode: string): { accessToken: string; userId: string } {
    if (!authCode || authCode.length < 5) {
      throw new Error("Invalid OAuth authorization code");
    }
    const mockUserId = `oauth_${providerId}_${Date.now()}`;
    const token = JWTManager.signToken(mockUserId, `${mockUserId}@external.com`, "user");

    return {
      accessToken: token,
      userId: mockUserId
    };
  }
}
