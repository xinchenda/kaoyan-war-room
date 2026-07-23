"use client";

import { useEffect } from "react";

const REPAIR_VERSION = "safari-navigation-v4";

export default function Home() {
  useEffect(() => {
    async function openDashboard() {
      try {
        if ("serviceWorker" in navigator && localStorage.getItem("kaoyan-sw-repair") !== REPAIR_VERSION) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations
            .filter((registration) => new URL(registration.scope).pathname.startsWith("/dashboard/"))
            .map((registration) => registration.unregister()));

          if ("caches" in window) {
            const keys = await caches.keys();
            await Promise.all(keys.filter((key) => key.startsWith("kaoyan-war-room-")).map((key) => caches.delete(key)));
          }
          localStorage.setItem("kaoyan-sw-repair", REPAIR_VERSION);
        }
      } finally {
        window.location.replace(`/dashboard/index.html?release=${REPAIR_VERSION}`);
      }
    }

    openDashboard();
  }, []);

  return (
    <main className="repair-screen">
      <div className="repair-mark">410</div>
      <h1>正在打开考研冲刺台</h1>
      <p>正在更新本地缓存，请稍候。</p>
    </main>
  );
}
