"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex-1 flex items-center justify-start">
            <Link
              href="/"
              className="flex-shrink-0 flex items-center space-x-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span className="text-xl font-bold">GymTrack</span>
            </Link>

            {session && (
              <div className="hidden md:flex ml-10 space-x-1">
                <Link
                  href="/"
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium",
                    "text-muted-foreground hover:text-foreground transition-colors"
                  )}
                >
                  Dashboard
                </Link>
                <Link
                  href="/workout/new"
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium",
                    "text-muted-foreground hover:text-foreground transition-colors"
                  )}
                >
                  New Workout
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin/users"
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium",
                      "text-muted-foreground hover:text-foreground transition-colors"
                    )}
                  >
                    Manage Users
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="ml-3 relative hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center focus:outline-none">
                  <span className="mr-3 text-sm font-medium">
                    {session.user.name}
                  </span>
                  {session.user.image ? (
                    <Image
                      className="h-8 w-8 rounded-full object-cover"
                      src={session.user.image}
                      alt={`${session.user.name}'s profile`}
                      width={32}
                      height={32}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                      <span>{session.user.name?.charAt(0)}</span>
                    </div>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                    className="text-destructive focus:text-destructive"
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/auth/signin"
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium",
                  "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                )}
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="focus:outline-none"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col h-full">
                  <div className="flex-1 space-y-4 py-4">
                    {session ? (
                      <>
                        <div className="flex items-center space-x-4 px-4 py-2">
                          {session.user.image ? (
                            <Image
                              className="h-10 w-10 rounded-full object-cover"
                              src={session.user.image}
                              alt={`${session.user.name}'s profile`}
                              width={40}
                              height={40}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                              <span>{session.user.name?.charAt(0)}</span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium">{session.user.name}</p>
                            <p className="text-xs text-muted-foreground">{session.user.email}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Link
                            href="/"
                            className={cn(
                              "block px-4 py-2 text-sm",
                              "text-muted-foreground hover:text-foreground transition-colors"
                            )}
                          >
                            Dashboard
                          </Link>
                          <Link
                            href="/workout/new"
                            className={cn(
                              "block px-4 py-2 text-sm",
                              "text-muted-foreground hover:text-foreground transition-colors"
                            )}
                          >
                            New Workout
                          </Link>
                          {session.user.role === "ADMIN" && (
                            <Link
                              href="/admin/users"
                              className={cn(
                                "block px-4 py-2 text-sm",
                                "text-muted-foreground hover:text-foreground transition-colors"
                              )}
                            >
                              Manage Users
                            </Link>
                          )}
                          <Link
                            href="/profile"
                            className={cn(
                              "block px-4 py-2 text-sm",
                              "text-muted-foreground hover:text-foreground transition-colors"
                            )}
                          >
                            Profile
                          </Link>
                          <Link
                            href="/settings"
                            className={cn(
                              "block px-4 py-2 text-sm",
                              "text-muted-foreground hover:text-foreground transition-colors"
                            )}
                          >
                            Settings
                          </Link>
                        </div>
                        <div className="pt-4">
                          <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                          >
                            Sign out
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <Link
                          href="/auth/signin"
                          className={cn(
                            "block w-full px-4 py-2 text-center text-sm font-medium",
                            "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
                          )}
                        >
                          Sign In
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
