import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-background py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-primary"
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
            <span className="font-bold text-lg">GymTrack</span>
          </div>
          
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <Link 
              href="https://facebook.com" 
              target="_blank"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </Link>
            <Link 
              href="https://instagram.com" 
              target="_blank"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </Link>
          </div>

          <div className="text-sm text-muted-foreground text-center md:text-right">
            <p>© {new Date().getFullYear()} GymTrack. All rights reserved.</p>
            <p className="text-xs mt-1">Created by Cap Mohammed Saleh</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
