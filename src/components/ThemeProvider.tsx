// src/components/ThemeProvider.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { applyMode, Mode } from "@cloudscape-design/global-styles";

interface ThemeContextType {
  colorMode: Mode;
  setColorMode: (mode: Mode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colorMode: "light" as Mode,
  setColorMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize with system preference or fallback to light
  const [colorMode, setColorMode] = useState<Mode>(() => {
    // Check if we're in the browser
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("colorMode");
      if (savedMode === "light" || savedMode === "dark") {
        return savedMode as Mode;
      }

      // Check system preference
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        return "dark" as Mode;
      }
    }
    return "light" as Mode;
  });

  // Apply the theme when it changes
  useEffect(() => {
    applyMode(colorMode);
    localStorage.setItem("colorMode", colorMode);
  }, [colorMode]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't explicitly set a preference
      if (!localStorage.getItem("colorMode")) {
        setColorMode(e.matches ? ("dark" as Mode) : ("light" as Mode));
      }
    };

    // Modern approach with addEventListener
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ colorMode, setColorMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
