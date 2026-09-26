export interface AppConfig {
  appName: string;
  environment: string;
  port: number;
  jwtSecret: string;
  jwtExpirySeconds: number;
  apiPrefix: string;
  criticalModules: string[];
  features: {
    enableOAuth2: boolean;
    enableStripeV2: boolean;
    enableAuditMetrics: boolean;
  };
}

export const config: AppConfig = {
  appName: "Enterprise Nexus Core",
  environment: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "8080", 10),
  jwtSecret: process.env.JWT_SECRET || "nexus-super-secret-key-v2-2026",
  jwtExpirySeconds: 3600,
  apiPrefix: "/api/v2",
  criticalModules: [
    "src/auth/jwt.ts",
    "src/auth/oauth.ts",
    "src/db/database.ts",
    "src/payments/stripeProvider.ts"
  ],
  features: {
    enableOAuth2: true,
    enableStripeV2: true,
    enableAuditMetrics: true
  }
};
