// src/components/ThemeToggle.tsx
import React from "react";
import Toggle from "@cloudscape-design/components/toggle";
import { useTheme } from "./ThemeProvider";
import { Mode } from "@cloudscape-design/global-styles";

const ThemeToggle: React.FC = () => {
  const { colorMode, setColorMode } = useTheme();

  return (
    <Toggle
      checked={colorMode === "dark"}
      onChange={({ detail }) =>
        setColorMode(detail.checked ? ("dark" as Mode) : ("light" as Mode))
      }
    >
      Dark mode
    </Toggle>
  );
};

export default ThemeToggle;
