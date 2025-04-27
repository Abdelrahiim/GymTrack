"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getUsers() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    // Get all users
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return { users };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function createUser(formData: {
  name: string;
  email: string;
  role: "ADMIN" | "USER";
}) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const { name, email, role } = formData;

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: role || "USER",
      },
    });

    revalidatePath("/admin/users");
    return { user };
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function updateUserRole(userId: string, role: "ADMIN" | "USER") {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    // Update user
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role,
      },
    });

    revalidatePath("/admin/users");
    return { user };
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
}

export async function deleteUser(userId: string) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    // Delete user
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
}
