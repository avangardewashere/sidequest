"use client";

import { useEffect, useRef } from "react";
import { recordBehaviorEvent, type BehaviorEventName } from "@/lib/client-api";

export function useBehaviorEvent(
  name: BehaviorEventName,
  properties?: Record<string, unknown>,
) {
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (hasFiredRef.current) {
      return;
    }
    hasFiredRef.current = true;
    void recordBehaviorEvent(name, properties);
  }, [name, properties]);
}
