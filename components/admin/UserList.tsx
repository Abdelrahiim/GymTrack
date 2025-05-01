"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { updateUserRole, deleteUser } from "@/actions/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: "ADMIN" | "USER";
  createdAt: Date;
}

export function UserList({ users }: { users: User[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    setLoading(true);
    setError(null);
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";

    try {
      await updateUserRole(userId, newRole as "ADMIN" | "USER");
      router.refresh();
    } catch (error) {
      console.error("Error updating user role:", error);
      setError("Failed to update user role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await deleteUser(userId);
      router.refresh();
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Failed to delete user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-4">
                <div className="relative h-12 w-12">
                  {user.image ? (
                    <Image
                      className="rounded-full"
                      src={user.image}
                      alt=""
                      fill
                      sizes="48px"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-lg font-medium">
                        {user.name?.charAt(0) || "U"}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {user.name || "Unnamed User"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Role</p>
                  <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={() => handleRoleToggle(user.id, user.role)}
                  className="flex-1"
                >
                  {user.role === "ADMIN" ? "Make User" : "Make Admin"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={loading}
                  onClick={() => handleDeleteUser(user.id)}
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 