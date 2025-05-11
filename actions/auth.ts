"use server";

import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function registerUser(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const confirmPassword = formData.get("confirm-password") as string;


    // Input validation
    if (!email || !password || !name || !confirmPassword) {
      console.error("Missing required fields");
      return { error: "All fields are required" };
    }

    if (password !== confirmPassword) {
      console.error("Passwords do not match");
      return { error: "Passwords do not match" };
    }

    if (password.length < 6) {
      console.error("Password too short");
      return { error: "Password must be at least 6 characters long" };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error("User already exists:", email);
      return { error: "User with this email already exists" };
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user with NextAuth compatible fields
    console.log("Creating new user in database");
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "USER", // Custom role field
        emailVerified: null, // NextAuth expects this field
        image: null, // NextAuth expects this field
      },
    });

    console.log("User created successfully:", user.id);

    if (!user) {
      console.error("Failed to create user");
      return { error: "Failed to create user" };
    }

    return { success: true, userId: user.id, message: "Account created successfully!" };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Failed to create account. Please try again." };
  }
}
