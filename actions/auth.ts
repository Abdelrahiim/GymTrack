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

    if (password !== confirmPassword) {
      return { error: "Passwords do not match" };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "User already exists" };
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    // Sign in the user
    try {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        return { error: error.message };
      }
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Something went wrong" };
  }
}

export async function signInUser(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.message };
    }
    throw error;
  }
} 