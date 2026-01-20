"use client";
import { useState, useEffect } from "react";

export default function useUsage(apiBase) {
  const [usageCount, setUsageCount] = useState(0);

  useEffect(() => {
    fetch(`${apiBase}/api/usage`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setUsageCount(d?.total_usage || 0));
  }, [apiBase]);

  return { usageCount, setUsageCount };
}
