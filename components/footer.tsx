import Link from "next/link";
import { FaFacebook, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";

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
              <title>Cap M.Saleh Logo</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="font-bold text-lg">Cap M.Saleh</span>
          </div>

          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <Link
              href="https://www.facebook.com/share/1HdfNPvs1k/?mibextid=wwXIfr"
              target="_blank"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <FaFacebook className="h-5 w-5" />
            </Link>
            <Link
              href="https://www.instagram.com/mohammed_saleh_fahmey?igsh=eDhwOXcwNXZlbjB4&utm_source=qr"
              target="_blank"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <FaInstagram className="h-5 w-5" />
            </Link>
            <Link
              href="https://www.tiktok.com/@cap_mohamed_saleh?_t=ZS-8vxmT0cxsl6&_r=1"
              target="_blank"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <FaTiktok className="h-5 w-5" />
            </Link>
            <Link
              href="https://www.youtube.com/@capmohamedsaleh4132"
              target="_blank"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <FaYoutube className="h-5 w-5" />
            </Link>
          </div>

          <div className="text-sm text-muted-foreground text-center md:text-right">
            <p>© {new Date().getFullYear()} Cap M.Saleh. All rights reserved.</p>
            <p className="text-xs mt-1">Created by Cap Mohammed Saleh</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
