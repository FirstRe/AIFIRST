"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/layout/Header";
import { RequirementsList } from "@/components/requirements/RequirementsList";
import { RequirementForm } from "@/components/requirements/RequirementForm";
import { EffortSummary } from "@/components/requirements/EffortSummary";
import { useProject } from "@/hooks/useProject";
import { useRequirements } from "@/hooks/useRequirements";
import { ROUTES } from "@/lib/constants";
import type { ExportData } from "@/types";

export default function DashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    project,
    isLoading: projectLoading,
    deleteProject,
    refetch: refetchProject,
  } = useProject();
  const {
    requirements,
    isLoading: requirementsLoading,
    stats,
    addRequirement,
    updateRequirement,
    deleteRequirement,
    toggleStatus,
    exportData,
    importData,
    refetch: refetchRequirements,
  } = useRequirements();

  // Redirect to setup if no project
  useEffect(() => {
    if (!projectLoading && !project) {
      router.push(ROUTES.SETUP);
    }
  }, [projectLoading, project, router]);

  const handleNewProject = useCallback(async () => {
    await deleteProject();
    router.push(ROUTES.SETUP);
  }, [deleteProject, router]);

  const handleExport = useCallback(() => {
    return exportData(project);
  }, [exportData, project]);

  const handleImport = useCallback(
    async (data: ExportData): Promise<{ isValid: boolean; error?: string }> => {
      const result = await importData(data);
      if (result.isValid) {
        // Refetch project and requirements after import
        await refetchProject();
        await refetchRequirements();
      }
      return result;
    },
    [importData, refetchProject, refetchRequirements],
  );

  // Loading state
  if (projectLoading || requirementsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // No project state (should redirect)
  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header
        projectName={project.name}
        onExport={handleExport}
        onImport={handleImport}
        onNewProject={handleNewProject}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Requirements List - 8 cols */}
          <div className="lg:col-span-8">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <i className="fas fa-list text-purple-400"></i>
                {t("dashboard.requirements")}
                <span className="text-white/50 text-sm font-normal">
                  ({stats.total})
                </span>
              </h2>
            </div>
            <RequirementsList
              requirements={requirements}
              onToggle={toggleStatus}
              onUpdate={updateRequirement}
              onDelete={deleteRequirement}
            />
          </div>

          {/* Sidebar - 4 cols */}
          <div className="lg:col-span-4 space-y-6 lg:mt-11">
            <EffortSummary stats={stats} />
            <RequirementForm onSubmit={addRequirement} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-white/40 text-sm border-t border-white/10">
        <p>
          <i className="fas fa-code mr-1"></i>
          {t("dashboard.footer")}
        </p>
      </footer>
    </div>
  );
}
