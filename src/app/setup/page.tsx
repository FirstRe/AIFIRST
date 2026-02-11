'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useProject } from '@/hooks/useProject';
import { ROUTES } from '@/lib/constants';

export default function SetupPage() {
  const router = useRouter();
  const { createProject } = useProject();
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = createProject(projectName);
    if (!result.isValid) {
      setError(result.error || 'Failed to create project');
      return;
    }

    router.push(ROUTES.DASHBOARD);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
            <i className="fas fa-clipboard-list text-4xl text-purple-400"></i>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ReqTrack</h1>
          <p className="text-white/60">Requirements Tracking Made Simple</p>
        </div>

        {/* Setup Card */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-white text-center">
              <i className="fas fa-rocket text-purple-400 mr-2"></i>
              Create New Project
            </h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Project Name"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter your project name"
                maxLength={100}
                autoFocus
              />

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg">
                <i className="fas fa-arrow-right mr-2"></i>
                Get Started
              </Button>
            </form>

            <p className="text-center text-white/50 text-sm mt-6">
              Your data is stored locally in your browser
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-white/40 text-sm mt-8">
          <i className="fas fa-heart text-pink-400 mr-1"></i>
          Built with Next.js & Tailwind CSS
        </p>
      </div>
    </div>
  );
}

