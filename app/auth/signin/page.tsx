"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function SignIn() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-900 p-4 sm:p-6">
      <div className="w-full max-w-md mx-auto space-y-8 p-6 sm:p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">GymTrack</h2>
          <p className="mt-3 text-gray-600 text-base sm:text-lg">
            Sign in to track your fitness journey
          </p>
        </div>
        
        <div className="mt-10">
          <Button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="relative w-full flex justify-center py-4 px-4 text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl h-auto"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <Image 
                src="/google-logo.svg" 
                alt="Google Logo" 
                width={24} 
                height={24}
                className="h-5 w-5 sm:h-6 sm:w-6"
              />
            </span>
            Sign in with Google
          </Button>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Train smarter, track better, achieve more.</p>
        </div>
      </div>
    </div>
  );
} 