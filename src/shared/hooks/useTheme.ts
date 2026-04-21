/**
 * useTheme
 *
 * Manages dark/light theme with DI service integration.
 * Returns [isDark, toggleTheme] tuple.
 */

import { useCallback, useState } from "react";
import { useServices } from "../../services";

export function useTheme(): [boolean, () => void] {
  const services = useServices();
  const [isDark, setIsDark] = useState(() => services.theme.getInitialTheme());

  const toggle = useCallback(() => {
    setIsDark((prev: boolean) => {
      const next = services.theme.toggleTheme(prev);
      services.theme.applyTheme(next);
      return next;
    });
  }, [services]);

  return [isDark, toggle];
}
