import React, { createContext, useContext, useState } from 'react';

export const EditModeContext = createContext({});

export const EditModeProvider = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isMovementLocked, setIsMovementLocked] = useState(() => {
    localStorage.removeItem('rfn_layout_locked');
    const lockSaved = localStorage.getItem('rfn_movement_locked');
    return lockSaved ? JSON.parse(lockSaved) : false;
  });

  const [isFunctionLocked, setIsFunctionLocked] = useState(() => {
    const lockSaved = localStorage.getItem('rfn_function_locked');
    return lockSaved ? JSON.parse(lockSaved) : true;
  });

  const [inputTokens, setInputTokens] = useState(0);
  const [outputTokens, setOutputTokens] = useState(0);
  const [flatCostUSD, setFlatCostUSD] = useState(0);

  const addFlatCost = (amount) => setFlatCostUSD(prev => prev + amount);

  const toggleEditMode = () => {
    const nextEdit = !isEditMode;
    setIsEditMode(nextEdit);
    if (nextEdit) {
      setIsMovementLocked(true);
      setIsFunctionLocked(true);
      localStorage.setItem('rfn_movement_locked', JSON.stringify(true));
      localStorage.setItem('rfn_function_locked', JSON.stringify(true));
    }
  };

  return (
    <EditModeContext.Provider value={{
      isEditMode, editMode: isEditMode, setIsEditMode, toggleEditMode,
      isMovementLocked, setIsMovementLocked,
      isFunctionLocked, setIsFunctionLocked,
      inputTokens, setInputTokens,
      outputTokens, setOutputTokens,
      flatCostUSD, setFlatCostUSD, addFlatCost
    }}>
      {children}
    </EditModeContext.Provider>
  );
};

export const useEditMode = () => {
  const context = useContext(EditModeContext);
  if (context === undefined || Object.keys(context).length === 0) {
    return { isEditMode: false, toggleEditMode: () => {} }; // Fallback para evitar crash
  }
  return context;
};
