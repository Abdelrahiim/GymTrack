import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			role: "ADMIN" | "USER";
		} & DefaultSession["user"];
	}

	interface User extends DefaultUser {
			role?: "ADMIN" | "USER";
	}
	}

declare module "next-auth/jwt" {
	interface JWT extends DefaultJWT {
		id?: string;
		role?: "ADMIN" | "USER";
	}
}
