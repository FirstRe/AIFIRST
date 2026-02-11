'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { ExportData } from '@/types';

interface HeaderProps {
  projectName: string;
  onExport: () => ExportData | null;
  onImport: (data: ExportData) => { isValid: boolean; error?: string };
  onNewProject: () => void;
}

export function Header({ projectName, onExport, onImport, onNewProject }: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleExport = () => {
    const data = onExport();
    if (!data) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}_requirements.json`;
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
      const result = onImport(data);
      if (!result.isValid) {
        setImportError(result.error || 'Invalid file format');
      } else {
        setImportError(null);
      }
    } catch {
      setImportError('Error reading file');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNewProject = () => {
    setShowNewProjectModal(true);
  };

  const confirmNewProject = () => {
    onNewProject();
    setShowNewProjectModal(false);
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
                <span className="text-xl font-bold text-white">ReqTrack</span>
              </div>
              <div className="hidden sm:block h-6 w-px bg-white/20"></div>
              <h1 className="hidden sm:block text-lg font-medium text-white/90">{projectName}</h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleExport}>
                <i className="fas fa-download mr-2"></i>
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleImportClick}>
                <i className="fas fa-upload mr-2"></i>
                <span className="hidden sm:inline">Import</span>
              </Button>
              <Button variant="secondary" size="sm" onClick={handleNewProject}>
                <i className="fas fa-plus mr-2"></i>
                <span className="hidden sm:inline">New Project</span>
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
          <button onClick={() => setImportError(null)} className="text-white/80 hover:text-white">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* New Project Confirmation Modal */}
      <Modal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        title="Create New Project"
      >
        <p className="text-white/80 mb-6">
          This will delete all current requirements and create a new project. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setShowNewProjectModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmNewProject}>
            Create New Project
          </Button>
        </div>
      </Modal>
    </>
  );
}

