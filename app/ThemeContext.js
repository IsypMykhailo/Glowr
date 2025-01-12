// ThemeContext.js

import React, { createContext, useState, useEffect, useContext } from "react";
import { Appearance } from "react-native";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme);
    });

    // Cleanup listener on unmount
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
