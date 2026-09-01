import { useEffect, useCallback } from "react";

import { supabase } from "../lib/supabaseClient.js";
import useProfile from "./useProfile.js";

function applyThemeMode(mode) {
  const root = document.documentElement;

  const resolved =
    mode === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : mode;

  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

function applyAccentColor(color) {
  document.documentElement.setAttribute("data-accent", color || "blue");
}

export default function useTheme() {
  const { profile, setProfile } = useProfile();

  useEffect(() => {
    const mode =
      profile?.theme_mode || localStorage.getItem("theme_mode") || "system";
    const accent =
      profile?.accent_color || localStorage.getItem("accent_color") || "blue";

    applyThemeMode(mode);
    applyAccentColor(accent);

    if (mode !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyThemeMode("system");

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [profile?.theme_mode, profile?.accent_color]);

  const setThemeMode = useCallback(
    async (mode) => {
      applyThemeMode(mode);
      localStorage.setItem("theme_mode", mode);
      setProfile((prev) => ({ ...prev, theme_mode: mode }));

      if (profile?.id) {
        await supabase
          .from("profiles")
          .update({ theme_mode: mode })
          .eq("id", profile.id);
      }
    },
    [profile?.id, setProfile]
  );

  const setAccentColor = useCallback(
    async (color) => {
      applyAccentColor(color);
      localStorage.setItem("accent_color", color);
      setProfile((prev) => ({ ...prev, accent_color: color }));

      if (profile?.id) {
        await supabase
          .from("profiles")
          .update({ accent_color: color })
          .eq("id", profile.id);
      }
    },
    [profile?.id, setProfile]
  );

  return {
    themeMode: profile?.theme_mode || "system",
    accentColor: profile?.accent_color || "blue",
    setThemeMode,
    setAccentColor,
  };
    }
