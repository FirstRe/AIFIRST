"use client";

import { useTranslation } from "react-i18next";

export function EmptyState() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6">
        <i className="fas fa-clipboard-list text-3xl text-white/40"></i>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">
        {t("emptyState.title")}
      </h3>
      <p className="text-white/60 max-w-sm">{t("emptyState.description")}</p>
    </div>
  );
}
