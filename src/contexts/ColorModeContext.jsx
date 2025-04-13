// src/contexts/ColorModeContext.jsx
import React from 'react';

// Create a context with a default value (an object with a toggle function)
const ColorModeContext = React.createContext({
  toggleColorMode: () => {}, // Default empty function
});

export default ColorModeContext;