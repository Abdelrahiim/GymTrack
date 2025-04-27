"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";

export default function SignIn() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-900">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-2xl transform transition-all">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h2 className="mt-2 text-4xl font-extrabold text-gray-900 tracking-tight">GymTrack</h2>
          <p className="mt-3 text-gray-600 text-lg">
            Sign in to track your fitness journey
          </p>
        </div>
        <div className="mt-10">
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <Image 
                src="/google-logo.svg" 
                alt="Google Logo" 
                width={24} 
                height={24}
                className="h-6 w-6"
              />
            </span>
            Sign in with Google
          </button>
        </div>
        <div className="mt-10 text-center text-sm text-gray-500">
          <p>Train smarter, track better, achieve more.</p>
        </div>
      </div>
    </div>
  );
} 