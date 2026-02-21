"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin interface
    router.replace(ROUTES.ADMIN);
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  );
}
