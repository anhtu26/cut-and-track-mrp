import { useEffect, useLayoutEffect } from "react";

/**
 * Use useLayoutEffect on the client and useEffect on the server to avoid SSR warnings
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" && typeof window.document !== "undefined"
    ? useLayoutEffect
    : useEffect;

export default useIsomorphicLayoutEffect;
