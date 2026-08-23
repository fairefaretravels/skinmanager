// City-aware data access layer.
//
// Every FRESH MANAGER screen calls THIS module instead of touching
// Firestore directly. That's what lets Detroit/Atlanta (legacy flat
// collections) and Lithonia (nested cities/ collections) share the same
// UI code without any screen needing to know which architecture a city
// uses.
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { getCity, isLegacyCity } from "./cities";

// ── Collection path resolution ──────────────────────────────────────────
function collectionPath(cityId, kind) {
  // kind: "growers" | "listings" | "alerts"
  const city = getCity(cityId);
  if (isLegacyCity(cityId)) {
    return city.collections[kind]; // e.g. "fd_growers"
  }
  return `${city.basePath}/${kind}`; // e.g. "cities/lithonia/growers"
}

function colRef(cityId, kind) {
  return collection(db, collectionPath(cityId, kind));
}

// ── Live subscriptions ───────────────────────────────────────────────────
export function watchGrowers(cityId, cb, onError) {
  const q = query(colRef(cityId, "growers"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onError);
}

export function watchListings(cityId, cb, onError) {
  const q = query(colRef(cityId, "listings"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onError);
}

export function watchAlerts(cityId, cb, onError) {
  const q = query(colRef(cityId, "alerts"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onError);
}

// ── Growers (Farms Directory) ────────────────────────────────────────────
export async function createGrower(cityId, adminUid, growerData) {
  const payload = {
    ...growerData,
    cityId, // harmless additive field on legacy docs too; ignored by existing readers
    managedByOperator: true,
    enteredByUid: adminUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    active: growerData.active !== false,
  };
  return addDoc(colRef(cityId, "growers"), payload);
}

export async function updateGrower(cityId, growerId, adminUid, patch) {
  const ref = doc(db, collectionPath(cityId, "growers"), growerId);
  return updateDoc(ref, { ...patch, updatedAt: serverTimestamp(), enteredByUid: adminUid });
}

// ── Listings (Marketplace Listings) ──────────────────────────────────────
// IMPORTANT: one Firestore document PER PRODUCT. No items[] array.
// `products` is an array of { product, quantity, unit } collected from the
// "Today's Availability" screen; this fans them out into N separate
// addDoc() calls so each can be independently claimed/updated/sold
// out/unpublished/expired by the public marketplace listener, exactly
// like existing fd_listings / fa_listings documents.
export async function publishListings(cityId, adminUid, grower, products) {
  const results = [];
  for (const p of products) {
    const payload = {
      growerId: grower.id,
      growerName: grower.farmName || grower.name || "",
      product: p.product,
      quantity: Number(p.quantity) || 0,
      unit: p.unit,
      status: "available",
      cityId,
      managedByOperator: true,
      enteredByUid: adminUid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    // eslint-disable-next-line no-await-in-loop
    const ref = await addDoc(colRef(cityId, "listings"), payload);
    results.push(ref.id);
  }
  return results;
}

export async function updateListingStatus(cityId, listingId, adminUid, status) {
  const ref = doc(db, collectionPath(cityId, "listings"), listingId);
  return updateDoc(ref, { status, updatedAt: serverTimestamp(), enteredByUid: adminUid });
}

export async function deleteListing(cityId, listingId) {
  const ref = doc(db, collectionPath(cityId, "listings"), listingId);
  return deleteDoc(ref);
}

// ── Alerts ────────────────────────────────────────────────────────────────
export async function createAlert(cityId, adminUid, alertData) {
  const payload = {
    ...alertData,
    cityId,
    managedByOperator: true,
    enteredByUid: adminUid,
    createdAt: serverTimestamp(),
    active: true,
  };
  return addDoc(colRef(cityId, "alerts"), payload);
}

export async function resolveAlert(cityId, alertId, adminUid) {
  const ref = doc(db, collectionPath(cityId, "alerts"), alertId);
  return updateDoc(ref, { active: false, resolvedAt: serverTimestamp(), enteredByUid: adminUid });
}
