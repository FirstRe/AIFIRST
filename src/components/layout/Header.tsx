"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useLanguage } from "@/hooks/useLanguage";
import type { ExportData } from "@/types";

interface HeaderProps {
  projectName: string;
  onExport: () => ExportData | null;
  onImport: (data: ExportData) => Promise<{ isValid: boolean; error?: string }>;
  onNewProject: () => void | Promise<void>;
}

export function Header({
  projectName,
  onExport,
  onImport,
  onNewProject,
}: HeaderProps) {
  const { t } = useTranslation();
  const { currentLanguage, setLanguage } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const handleExport = () => {
    const data = onExport();
    if (!data) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, "_")}_requirements.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = await onImport(data);
      if (!result.isValid) {
        setImportError(result.error || t("errors.invalidFileFormat"));
      } else {
        setImportError(null);
      }
    } catch {
      setImportError(t("errors.errorReadingFile"));
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleNewProject = () => {
    setShowNewProjectModal(true);
  };

  const confirmNewProject = () => {
    onNewProject();
    setShowNewProjectModal(false);
  };

  const handleLanguageChange = (lang: "en" | "th") => {
    setLanguage(lang);
    setShowLanguageDropdown(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Project Name */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <i className="fas fa-clipboard-list text-2xl text-purple-400"></i>
                <span className="text-xl font-bold text-white">
                  {t("common.appName")}
                </span>
              </div>
              <div className="hidden sm:block h-6 w-px bg-white/20"></div>
              <h1 className="hidden sm:block text-lg font-medium text-white/90">
                {projectName}
              </h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="min-w-[60px]"
                >
                  <i className="fas fa-globe mr-2"></i>
                  <span className="uppercase font-medium">
                    {currentLanguage}
                  </span>
                </Button>
                {showLanguageDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowLanguageDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-32 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg z-50 overflow-hidden">
                      <button
                        onClick={() => handleLanguageChange("en")}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors flex items-center gap-2 ${
                          currentLanguage === "en"
                            ? "text-purple-400 bg-white/5"
                            : "text-white/90"
                        }`}
                      >
                        <span className="w-6 text-center">🇺🇸</span>
                        {t("language.en")}
                      </button>
                      <button
                        onClick={() => handleLanguageChange("th")}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors flex items-center gap-2 ${
                          currentLanguage === "th"
                            ? "text-purple-400 bg-white/5"
                            : "text-white/90"
                        }`}
                      >
                        <span className="w-6 text-center">🇹🇭</span>
                        {t("language.th")}
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="h-6 w-px bg-white/20 hidden sm:block"></div>

              <Button variant="ghost" size="sm" onClick={handleExport}>
                <i className="fas fa-download mr-2"></i>
                <span className="hidden sm:inline">{t("header.export")}</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleImportClick}>
                <i className="fas fa-upload mr-2"></i>
                <span className="hidden sm:inline">{t("header.import")}</span>
              </Button>
              <Button variant="secondary" size="sm" onClick={handleNewProject}>
                <i className="fas fa-plus mr-2"></i>
                <span className="hidden sm:inline">
                  {t("header.newProject")}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </header>

      {/* Import Error Toast */}
      {importError && (
        <div className="fixed top-20 right-4 z-50 bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <i className="fas fa-exclamation-circle"></i>
          <span>{importError}</span>
          <button
            onClick={() => setImportError(null)}
            className="text-white/80 hover:text-white"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* New Project Confirmation Modal */}
      <Modal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        title={t("modal.createNewProject")}
      >
        <p className="text-white/80 mb-6">
          {t("modal.newProjectConfirmation")}
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setShowNewProjectModal(false)}>
            {t("common.cancel")}
          </Button>
          <Button variant="danger" onClick={confirmNewProject}>
            {t("modal.createNewProject")}
          </Button>
        </div>
      </Modal>
    </>
  );
}
