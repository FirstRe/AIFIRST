"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { projectApi } from "@/lib/api";
import { ROUTES } from "@/lib/constants";

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if a project exists via API and redirect accordingly
    const checkProject = async () => {
      try {
        const project = await projectApi.get();
        if (project) {
          router.replace(ROUTES.DASHBOARD);
        } else {
          router.replace(ROUTES.SETUP);
        }
      } catch {
        // If API fails, redirect to setup
        router.replace(ROUTES.SETUP);
      }
      setIsChecking(false);
    };

    checkProject();
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
