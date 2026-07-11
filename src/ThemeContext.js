// src/ThemeContext.js — Tema oscuro/claro y tamaño de letra
import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
  const [darkMode,  setDarkMode]  = useState(false);
  const [fontSize,  setFontSize]  = useState(14); // 12, 14, 16, 18

  // Cargar preferencias guardadas al iniciar
  React.useEffect(() => {
    async function load() {
      try {
        const dm = await AsyncStorage.getItem('darkMode');
        const fs = await AsyncStorage.getItem('fontSize');
        if (dm !== null) setDarkMode(dm === 'true');
        if (fs !== null) setFontSize(parseInt(fs));
      } catch {}
    }
    load();
  }, []);

  async function toggleDark() {
    const next = !darkMode;
    setDarkMode(next);
    await AsyncStorage.setItem('darkMode', String(next));
  }

  async function changeFontSize(size) {
    setFontSize(size);
    await AsyncStorage.setItem('fontSize', String(size));
  }

  // Colores dinámicos según tema
  const theme = {
    darkMode,
    fontSize,
    toggleDark,
    changeFontSize,
    // Colores
    bg:       darkMode ? '#121212' : '#edeae0',
    card:     darkMode ? '#1e1e1e' : '#ffffff',
    text:     darkMode ? '#f0f0f0' : '#2c2c2a',
    muted:    darkMode ? '#888888' : '#888780',
    border:   darkMode ? '#333333' : '#d3d1c7',
    inputBg:  darkMode ? '#2a2a2a' : '#f7f5f0',
    // Colores fijos (no cambian con tema)
    green:      '#4a7c59',
    greenDark:  '#2d5a3d',
    red:        '#c0574a',
    brown:      '#8c7355',
    navy:       '#1a2234',
  };

  return (
    <ThemeCtx.Provider value={theme}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() { return useContext(ThemeCtx); }
