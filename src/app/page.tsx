"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storageService } from "@/lib/storage";
import { ROUTES } from "@/lib/constants";

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if a project exists and redirect accordingly
    const hasProject = storageService.hasExistingProject();
    if (hasProject) {
      router.replace(ROUTES.DASHBOARD);
    } else {
      router.replace(ROUTES.SETUP);
    }
    setIsChecking(false);
  }, [router]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
}
