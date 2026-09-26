import { InMemoryDatabase } from "../db/database";
import { JWTManager } from "../auth/jwt";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "merchant";
  status: "active" | "suspended";
}

export class UserService {
  private db = InMemoryDatabase.getInstance();

  public createUser(email: string, name: string, role: "admin" | "user" | "merchant" = "user"): UserProfile {
    const existing = this.db.findAll("users", (u) => u.email === email);
    if (existing.length > 0) {
      throw new Error(`User with email ${email} already exists.`);
    }

    const userId = `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const record = this.db.insert("users", {
      id: userId,
      email,
      name,
      role,
      status: "active"
    });

    return record as unknown as UserProfile;
  }

  public getUserById(id: string): UserProfile | null {
    const user = this.db.findById("users", id);
    return user as unknown as UserProfile | null;
  }

  public listUsers(): UserProfile[] {
    return this.db.findAll("users") as unknown as UserProfile[];
  }

  public loginUser(email: string): { token: string; user: UserProfile } {
    const users = this.db.findAll("users", (u) => u.email === email);
    if (users.length === 0) {
      throw new Error("User not found");
    }

    const user = users[0] as unknown as UserProfile;
    const token = JWTManager.signToken(user.id, user.email, user.role);

    return { token, user };
  }
}
