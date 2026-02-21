"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useProject } from "@/hooks/useProject";
import { ROUTES } from "@/lib/constants";

export default function SetupPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { createProject } = useProject();
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await createProject(projectName);
      if (!result.isValid) {
        setError(result.error || t("errors.failedToCreate"));
        return;
      }

      router.push(ROUTES.DASHBOARD);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-100 border border-indigo-200 mb-4">
            <i className="fas fa-clipboard-list text-4xl text-indigo-500"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("common.appName")}
          </h1>
          <p className="text-gray-500">{t("setup.tagline")}</p>
        </div>

        {/* Setup Card */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 text-center">
              <i className="fas fa-rocket text-indigo-500 mr-2"></i>
              {t("setup.createNewProject")}
            </h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label={t("setup.projectName")}
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder={t("setup.projectNamePlaceholder")}
                maxLength={100}
                autoFocus
              />

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    {t("common.loading")}
                  </>
                ) : (
                  <>
                    <i className="fas fa-arrow-right mr-2"></i>
                    {t("setup.getStarted")}
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-gray-400 text-sm mt-6">
              {t("setup.localStorageNote")}
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-8">
          <i className="fas fa-heart text-pink-400 mr-1"></i>
          {t("setup.builtWith")}
        </p>
      </div>
    </div>
  );
}
