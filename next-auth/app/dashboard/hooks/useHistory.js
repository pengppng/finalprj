"use client";
import { useState, useEffect } from "react";

export default function useHistory(apiBase, enabled) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    setLoading(true);
    fetch(`${apiBase}/api/history`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setHistory(d?.data || []))
      .finally(() => setLoading(false));
  }, [enabled, apiBase]);

  return { history, loading };
}
