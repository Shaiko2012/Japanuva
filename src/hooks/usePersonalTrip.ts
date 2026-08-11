"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useTripMetaStore } from "@/store/tripMeta";

/** Personal trip = logged in or explicitly marked after Google sign-in. */
export function usePersonalTrip(): boolean {
  const isPersonal = useTripMetaStore((s) => s.isPersonalAccount);
  const { user } = useAuth();
  return isPersonal || Boolean(user);
}
