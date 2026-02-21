"use client";

import { useTranslation } from "react-i18next";

export function EmptyState() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <i className="fas fa-clipboard-list text-3xl text-gray-400"></i>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {t("emptyState.title")}
      </h3>
      <p className="text-gray-500 max-w-sm">{t("emptyState.description")}</p>
    </div>
  );
}
