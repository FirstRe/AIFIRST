"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface RequirementFormProps {
  onSubmit: (
    description: string,
    effort: number,
  ) => Promise<{ isValid: boolean; error?: string }>;
}

export function RequirementForm({ onSubmit }: RequirementFormProps) {
  const { t } = useTranslation();
  const [description, setDescription] = useState("");
  const [effort, setEffort] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const effortValue = parseFloat(effort);
    if (isNaN(effortValue)) {
      setError(t("errors.invalidEffort"));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onSubmit(description, effortValue);
      if (!result.isValid) {
        setError(result.error || t("errors.failedToAdd"));
        return;
      }

      // Reset form
      setDescription("");
      setEffort("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <i className="fas fa-plus-circle text-green-500"></i>
          {t("requirementForm.title")}
        </h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("requirementForm.description")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("requirementForm.descriptionPlaceholder")}
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
            />
          </div>

          <Input
            label={t("requirementForm.effort")}
            type="number"
            step="0.01"
            min="0.01"
            max="9999"
            value={effort}
            onChange={(e) => setEffort(e.target.value)}
            placeholder={t("requirementForm.effortPlaceholder")}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                {t("common.loading")}
              </>
            ) : (
              <>
                <i className="fas fa-plus mr-2"></i>
                {t("requirementForm.addButton")}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
