"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

function getVisitorId() {
  const key = "wh_visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function ViewCounter() {
  const pathname = usePathname();

  useEffect(() => {
    const visitorId = getVisitorId();
    navigator.sendBeacon(
      "/api/analytics/pageview",
      JSON.stringify({ pagePath: pathname, visitorId }),
    );
  }, [pathname]);

  return null;
}
