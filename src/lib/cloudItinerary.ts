import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { FamilyMemberCounts, DistrictId } from "@/data/trip";
import type { MapPlace } from "@/lib/maps";
import type { PipSize } from "@/store/mapPip";
import type { EditorDay } from "@/types/editor";

export interface CloudItineraryPayload {
  days: EditorDay[];
  selectedDayId: string;
  lastSavedAt: string | null;
  updatedAt?: unknown;
}

export interface CloudMapPrefs {
  open: boolean;
  size: PipSize;
  place: MapPlace;
  selectedDistrict: DistrictId | null;
  activePinId: string | null;
  showPinList: boolean;
}

export interface CloudTripDates {
  startDate: string;
  endDate: string;
}

export interface CloudPreferencesPayload {
  family: FamilyMemberCounts;
  map: CloudMapPrefs;
  trip?: CloudTripDates;
  budgetIls?: number;
  isPersonalAccount?: boolean;
  updatedAt?: unknown;
}

export async function loadItineraryFromCloud(
  uid: string,
): Promise<CloudItineraryPayload | null> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase לא מוגדר");

  const ref = doc(db, "users", uid, "trip", "itinerary");
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as CloudItineraryPayload;
}

export async function saveItineraryToCloud(
  uid: string,
  payload: Omit<CloudItineraryPayload, "updatedAt">,
) {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase לא מוגדר");

  const ref = doc(db, "users", uid, "trip", "itinerary");
  await setDoc(
    ref,
    {
      ...payload,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function loadPreferencesFromCloud(
  uid: string,
): Promise<CloudPreferencesPayload | null> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase לא מוגדר");

  const ref = doc(db, "users", uid, "trip", "preferences");
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as CloudPreferencesPayload;
}

export async function savePreferencesToCloud(
  uid: string,
  payload: Omit<CloudPreferencesPayload, "updatedAt">,
) {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase לא מוגדר");

  const ref = doc(db, "users", uid, "trip", "preferences");
  await setDoc(
    ref,
    {
      family: payload.family,
      map: payload.map,
      trip: payload.trip,
      budgetIls: payload.budgetIls,
      isPersonalAccount: payload.isPersonalAccount ?? true,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
