"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { ADMIN_SESSION_WARNING_SECONDS } from "@/lib/admin-session";

const activityInterval = 30_000;

export default function SessionGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status, update } = useSession();
  const [warning, setWarning] = useState<"idle" | "absolute" | null>(null);
  const [leaving, setLeaving] = useState(false);
  const pending = useRef(false);
  const exiting = useRef(false);
  const activity = useRef(false);
  const lastSent = useRef(-activityInterval);
  const clock = useRef({ serverTime: 0, receivedAt: 0 });

  const finishSession = useEffectEvent(async (clearCookie = true) => {
    if (exiting.current) return;
    exiting.current = true;
    setLeaving(true);
    try {
      if (clearCookie) await signOut({ redirect: false });
    } finally {
      window.location.replace("/admin/login?reason=expired");
    }
  });

  const check = useEffectEvent(async () => {
    if (exiting.current || status === "loading") return;
    if (session?.error || status === "unauthenticated") {
      // Another tab may already have cleared the cookie; avoid a second sign-out
      // that could race with a fresh login on that tab.
      await finishSession(status !== "unauthenticated");
      return;
    }
    if (
      !session?.user ||
      !session.serverTime ||
      !session.idleExpiresAt ||
      !session.absoluteExpiresAt
    )
      return;

    // Use server time and a monotonic elapsed time, independent of the device clock.
    if (clock.current.serverTime !== session.serverTime)
      clock.current = {
        serverTime: session.serverTime,
        receivedAt: performance.now(),
      };
    const now =
      clock.current.serverTime + performance.now() - clock.current.receivedAt;
    const deadline = Math.min(session.idleExpiresAt, session.absoluteExpiresAt);
    const remaining = deadline - now;
    setWarning(
      remaining <= ADMIN_SESSION_WARNING_SECONDS * 1000
        ? session.absoluteExpiresAt <= session.idleExpiresAt
          ? "absolute"
          : "idle"
        : null,
    );
    if (pending.current) return;
    if (
      remaining > 0 &&
      (!activity.current ||
        performance.now() - lastSent.current < activityInterval)
    )
      return;

    pending.current = true;
    const renew = remaining > 0 && activity.current;
    if (renew) {
      lastSent.current = performance.now();
      activity.current = false;
    }
    try {
      // A passive read at the deadline picks up activity from another admin tab.
      // It cannot extend either timeout or revive an expired session on the server.
      const current = await update(renew ? { activity: true } : undefined);
      if (current?.error || (current && !current.user)) await finishSession();
      else if (!current && remaining <= 0) await finishSession();
      else if (!current && renew) activity.current = true;
    } catch {
      if (remaining <= 0) await finishSession();
      else if (renew) activity.current = true;
    } finally {
      pending.current = false;
    }
  });

  const onActivity = useEffectEvent((event: Event) => {
    if (!event.isTrusted || document.visibilityState !== "visible") return;
    activity.current = true;
    void check();
  });

  useEffect(() => {
    const events = ["pointerdown", "pointermove", "keydown", "scroll", "input"];
    const record = (event: Event) => onActivity(event);
    const inspect = () => void check();
    for (const event of events)
      window.addEventListener(event, record, { passive: true, capture: true });
    document.addEventListener("visibilitychange", inspect);
    const initial = window.setTimeout(inspect, 0);
    const timer = window.setInterval(inspect, 1000);
    return () => {
      for (const event of events)
        window.removeEventListener(event, record, { capture: true });
      document.removeEventListener("visibilitychange", inspect);
      clearTimeout(initial);
      clearInterval(timer);
    };
  }, []);

  if (leaving || !session?.user || session.error) return null;
  return (
    <>
      {children}
      {warning && (
        <div
          role="status"
          aria-live="polite"
          className="admin-panel fixed bottom-5 left-5 right-5 z-50 !p-5 shadow-xl sm:left-auto sm:w-[380px]"
        >
          <p className="font-medium">Sesi akan berakhir</p>
          <p className="muted mt-2 text-sm">
            {warning === "absolute"
              ? "Batas 1 jam hampir tercapai, simpan perubahan sebelum login kembali"
              : "Sesi berakhir dalam kurang dari 1 menit tanpa aktivitas"}
          </p>
          {warning === "idle" && (
            <button
              type="button"
              className="button button-secondary mt-4"
              onClick={() => void update({ activity: true })}
            >
              Lanjutkan sesi
            </button>
          )}
        </div>
      )}
    </>
  );
}
