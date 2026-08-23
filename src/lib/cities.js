// City registry for FRESH MANAGER.
//
// Two data architectures coexist on purpose (per approved decision):
//
// 1. LEGACY (Detroit, Atlanta) — flat top-level collections prefixed by
//    a short city code: fd_growers / fd_listings / fd_alerts (Detroit),
//    fa_growers / fa_listings / fa_alerts (Atlanta). These are NOT
//    touched structurally — FRESH MANAGER only writes into them using
//    the same shape the public apps already read.
//
// 2. SCALABLE / CITY-AWARE (Lithonia, and all future cities) — nested
//    under cities/{cityId}/growers, cities/{cityId}/listings,
//    cities/{cityId}/alerts. Every record also carries a cityId field
//    so it can be queried with collectionGroup() later if needed.
//
// Do NOT migrate Detroit or Atlanta into the cities/ structure here.
// That is a separate, explicitly-approved future step.

export const CITIES = {
  detroit: {
    id: "detroit",
    label: "Fresh Detroit",
    architecture: "legacy",
    collections: {
      growers: "fd_growers",
      listings: "fd_listings",
      alerts: "fd_alerts",
    },
  },
  atlanta: {
    id: "atlanta",
    label: "Fresh ATL",
    architecture: "legacy",
    collections: {
      growers: "fa_growers",
      listings: "fa_listings",
      alerts: "fa_alerts",
    },
  },
  lithonia: {
    id: "lithonia",
    label: "Fresh Lithonia",
    architecture: "city-aware",
    // Base path only — dataService builds cities/lithonia/<sub> from this.
    basePath: "cities/lithonia",
  },
};

export const CITY_LIST = Object.values(CITIES);

export function getCity(cityId) {
  const city = CITIES[cityId];
  if (!city) throw new Error(`Unknown cityId: ${cityId}`);
  return city;
}

export function isLegacyCity(cityId) {
  return CITIES[cityId]?.architecture === "legacy";
}
