"use client";

import { useEffect, useRef, useState } from "react";
import { Cloud, CloudOff, LoaderCircle } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  loadItineraryFromCloud,
  loadPreferencesFromCloud,
  saveItineraryToCloud,
  savePreferencesToCloud,
  type CloudMapPrefs,
  type CloudPreferencesPayload,
} from "@/lib/cloudItinerary";
import { isBundledDemoItinerary } from "@/lib/demoDetect";
import { useItineraryEditor } from "@/store/itineraryEditor";
import { useFamilyStore } from "@/store/family";
import { useMapPip } from "@/store/mapPip";
import { useTripMetaStore } from "@/store/tripMeta";

function mapPrefsSnapshot(): CloudMapPrefs {
  const s = useMapPip.getState();
  return {
    open: s.open,
    size: s.size,
    place: s.place,
    selectedDistrict: s.selectedDistrict,
    activePinId: s.activePinId,
    showPinList: s.showPinList,
  };
}

function preferencesSnapshot(): Omit<CloudPreferencesPayload, "updatedAt"> {
  const trip = useTripMetaStore.getState();
  return {
    family: useFamilyStore.getState().family,
    map: mapPrefsSnapshot(),
    trip: {
      startDate: trip.startDate,
      endDate: trip.endDate,
    },
    budgetIls: trip.budgetIls,
    isPersonalAccount: trip.isPersonalAccount,
  };
}

export function CloudSync() {
  const { user, configured } = useAuth();
  const days = useItineraryEditor((s) => s.days);
  const selectedDayId = useItineraryEditor((s) => s.selectedDayId);
  const lastSavedAt = useItineraryEditor((s) => s.lastSavedAt);
  const dirty = useItineraryEditor((s) => s.dirty);
  const hydrateFromCloud = useItineraryEditor((s) => s.hydrateFromCloud);
  const saveChanges = useItineraryEditor((s) => s.saveChanges);

  const family = useFamilyStore((s) => s.family);
  const hydrateFamily = useFamilyStore((s) => s.hydrateFromCloud);

  const startDate = useTripMetaStore((s) => s.startDate);
  const endDate = useTripMetaStore((s) => s.endDate);
  const budgetIls = useTripMetaStore((s) => s.budgetIls);
  const hydrateTrip = useTripMetaStore((s) => s.hydrateFromCloud);
  const markPersonalAccount = useTripMetaStore((s) => s.markPersonalAccount);
  const resetToEmpty = useItineraryEditor((s) => s.resetToEmpty);

  const mapOpen = useMapPip((s) => s.open);
  const mapSize = useMapPip((s) => s.size);
  const mapPlace = useMapPip((s) => s.place);
  const mapDistrict = useMapPip((s) => s.selectedDistrict);
  const mapPin = useMapPip((s) => s.activePinId);
  const mapList = useMapPip((s) => s.showPinList);
  const hydrateMap = useMapPip((s) => s.hydrateFromCloud);

  const [status, setStatus] = useState<"idle" | "syncing" | "saved" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);
  const loadedForUid = useRef<string | null>(null);
  const skipNextItinerarySave = useRef(false);
  const prefsReady = useRef(false);

  useEffect(() => {
    if (!configured || !user) {
      loadedForUid.current = null;
      prefsReady.current = false;
      return;
    }
    if (loadedForUid.current === user.uid) return;

    let cancelled = false;
    (async () => {
      setStatus("syncing");
      setMessage("טוען מהענן...");
      try {
        const [remoteItinerary, remotePrefs] = await Promise.all([
          loadItineraryFromCloud(user.uid),
          loadPreferencesFromCloud(user.uid),
        ]);
        if (cancelled) return;
        loadedForUid.current = user.uid;

        if (remoteItinerary?.days?.length) {
          const start =
            remotePrefs?.trip?.startDate ??
            useTripMetaStore.getState().startDate;

          if (isBundledDemoItinerary(remoteItinerary.days)) {
            // Old cloud save from demo — wipe and replace with empty personal trip
            markPersonalAccount();
            resetToEmpty(start);
            const state = useItineraryEditor.getState();
            skipNextItinerarySave.current = true;
            await saveItineraryToCloud(user.uid, {
              days: state.days,
              selectedDayId: state.selectedDayId,
              lastSavedAt: new Date().toISOString(),
            });
            saveChanges();
            setMessage("נוקה מסלול דמו · התחילו טיול ריק");
          } else {
            skipNextItinerarySave.current = true;
            markPersonalAccount();
            hydrateFromCloud({
              days: remoteItinerary.days,
              selectedDayId: remoteItinerary.selectedDayId,
              lastSavedAt: remoteItinerary.lastSavedAt,
            });
            setMessage("הנתונים סונכרנו מהענן");
          }
        } else {
          // New Google account → empty personal trip (not demo seed)
          const start = useTripMetaStore.getState().startDate;
          markPersonalAccount();
          resetToEmpty(start);
          const state = useItineraryEditor.getState();
          await saveItineraryToCloud(user.uid, {
            days: state.days,
            selectedDayId: state.selectedDayId,
            lastSavedAt: state.lastSavedAt,
          });
          setMessage("טיול אישי ריק · התחילו למלא");
        }

        // Strip leftover demo from localStorage after sign-in
        const localStart = useTripMetaStore.getState().startDate;
        if (useItineraryEditor.getState().clearDemoIfPresent(localStart)) {
          skipNextItinerarySave.current = false;
          if (!cancelled) {
            const state = useItineraryEditor.getState();
            await saveItineraryToCloud(user.uid, {
              days: state.days,
              selectedDayId: state.selectedDayId,
              lastSavedAt: new Date().toISOString(),
            });
            saveChanges();
            setMessage("נוקה מסלול דמו מהמכשיר");
          }
        }

        // Merge cloud prefs into local stores (cloud wins when present)
        if (remotePrefs?.family) hydrateFamily(remotePrefs.family);
        if (remotePrefs?.map) hydrateMap(remotePrefs.map);
        if (
          remotePrefs?.trip ||
          remotePrefs?.budgetIls != null ||
          remotePrefs?.isPersonalAccount != null
        ) {
          hydrateTrip({
            startDate: remotePrefs.trip?.startDate,
            endDate: remotePrefs.trip?.endDate,
            budgetIls: remotePrefs.budgetIls,
            isPersonalAccount: true,
          });
        }

        // Always write a full merged snapshot so family/dates never get "lost"
        await savePreferencesToCloud(user.uid, preferencesSnapshot());
        prefsReady.current = true;

        setStatus("saved");
      } catch (err) {
        if (cancelled) return;
        prefsReady.current = true;
        setStatus("error");
        setMessage(
          err instanceof Error ? err.message : "סנכרון מהענן נכשל",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured, user?.uid]);

  useEffect(() => {
    if (!configured || !user || !dirty) return;
    if (skipNextItinerarySave.current) {
      skipNextItinerarySave.current = false;
      return;
    }

    const timer = window.setTimeout(async () => {
      setStatus("syncing");
      try {
        const state = useItineraryEditor.getState();
        await saveItineraryToCloud(user.uid, {
          days: state.days,
          selectedDayId: state.selectedDayId,
          lastSavedAt: new Date().toISOString(),
        });
        saveChanges();
        setStatus("saved");
        setMessage("מסלול נשמר בענן");
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "שמירה בענן נכשלה");
      }
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [configured, user, dirty, days, selectedDayId, lastSavedAt, saveChanges]);

  useEffect(() => {
    if (!configured || !user) return;
    if (!prefsReady.current || loadedForUid.current !== user.uid) return;

    const timer = window.setTimeout(async () => {
      setStatus("syncing");
      try {
        await savePreferencesToCloud(user.uid, preferencesSnapshot());
        setStatus("saved");
        setMessage("משפחה, תאריכים והעדפות נשמרו");
      } catch (err) {
        setStatus("error");
        setMessage(
          err instanceof Error ? err.message : "שמירת העדפות נכשלה",
        );
      }
    }, 900);

    return () => window.clearTimeout(timer);
  }, [
    configured,
    user,
    family,
    startDate,
    endDate,
    budgetIls,
    mapOpen,
    mapSize,
    mapPlace,
    mapDistrict,
    mapPin,
    mapList,
  ]);

  if (!configured || !user) return null;

  return (
    <div className="pointer-events-none fixed bottom-5 end-5 z-[65]">
      <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong/95 px-3 py-1.5 text-[11px] text-muted shadow-lg backdrop-blur-md">
        {status === "syncing" ? (
          <LoaderCircle className="h-3.5 w-3.5 animate-spin text-accent" />
        ) : status === "error" ? (
          <CloudOff className="h-3.5 w-3.5 text-warning" />
        ) : (
          <Cloud className="h-3.5 w-3.5 text-success" />
        )}
        <span>{message ?? "מסונכרן לענן"}</span>
      </div>
    </div>
  );
}
