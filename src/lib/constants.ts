/**
 * Application Constants
 * Single source of truth for all constant values
 */

/**
 * localStorage key names
 */
export const STORAGE_KEYS = {
  LANGUAGE: "shop_language",
} as const;

/**
 * API endpoint paths
 */
export const API_ENDPOINTS = {
  HEALTH: "/api/health",
  INGREDIENTS: "/api/ingredients",
  PRODUCTS: "/api/products",
} as const;

/**
 * Route paths
 */
export const ROUTES = {
  HOME: "/",
  ADMIN: "/admin",
  ADMIN_INGREDIENTS: "/admin/ingredients",
  ADMIN_PRODUCTS: "/admin/products",
} as const;
