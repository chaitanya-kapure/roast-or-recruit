import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("ror-mode") || "roast";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    localStorage.setItem("ror-mode", mode);
  }, [mode]);

  const toggleMode = () => setMode((m) => (m === "roast" ? "recruit" : "roast"));

  return (
    <ThemeContext.Provider value={{ mode, setMode, toggleMode, isRoast: mode === "roast", isRecruit: mode === "recruit" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
