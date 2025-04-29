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

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex-1 flex items-center justify-start">
            <Link
              href="/"
              className="flex-shrink-0 flex items-center space-x-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
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
                  className="px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-600 transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <Link
                  href="/workout/new"
                  className="px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-600 transition-colors duration-200"
                >
                  New Workout
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin/users"
                    className="px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-600 transition-colors duration-200"
                  >
                    Manage Users
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="ml-3 relative hidden md:block">
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
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
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
                    className="text-red-600 focus:text-red-600"
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors duration-200 shadow"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-600 focus:outline-none"
            >
              <svg
                className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? "block" : "hidden"} md:hidden`}>
        {session ? (
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-blue-600">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/workout/new"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              New Workout
            </Link>
            {session.user.role === "ADMIN" && (
              <Link
                href="/admin/users"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Manage Users
              </Link>
            )}
            <Button
              onClick={() => {
                setIsMenuOpen(false);
                signOut({ callbackUrl: "/auth/signin" });
              }}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-600"
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-blue-600">
            <Link
              href="/auth/signin"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
