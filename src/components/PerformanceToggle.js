import React from 'react';
import { useTheme } from '../ThemeContext';

function PerformanceToggle() {
  const { highPerformance, togglePerformance } = useTheme();
  
  return (
    <button 
      className="performance-toggle" 
      onClick={togglePerformance} 
      title={highPerformance ? "Switch to lite mode" : "Enable animations"}
    >
      {highPerformance ? '⚡' : '🔋'}
    </button>
  );
}

export default PerformanceToggle;

// This file can be deleted if not used