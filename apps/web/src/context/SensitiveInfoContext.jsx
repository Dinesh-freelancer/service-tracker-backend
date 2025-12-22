import React, { createContext, useState, useContext } from 'react';

const SensitiveInfoContext = createContext();

export const SensitiveInfoProvider = ({ children }) => {
  // Default to true as per requirements (no persistence, secure default)
  const [hideSensitive, setHideSensitive] = useState(true);

  const toggleSensitive = () => {
    setHideSensitive((prev) => !prev);
  };

  return (
    <SensitiveInfoContext.Provider value={{ hideSensitive, toggleSensitive }}>
      {children}
    </SensitiveInfoContext.Provider>
  );
};

export const useSensitiveInfo = () => {
  const context = useContext(SensitiveInfoContext);
  if (!context) {
    throw new Error('useSensitiveInfo must be used within a SensitiveInfoProvider');
  }
  return context;
};
