// FamilyDataContext.tsx
import React, {createContext, useContext, useState} from 'react';

interface Person {
  firstName: string;
  lastName: string;
}

export interface FamilyData {
  // Define the shape of the data you expect here. I'll use a simple example.
  members: Array<Person>;
  // ... any other fields
}

const defaultFamilyData: FamilyData = {
  members: [],
  // ... any other default values
};

interface FamilyDataProviderProps {
  children: React.ReactNode;
}

interface FamilyDataContextProps {
  familyData: FamilyData;
  setFamilyData: React.Dispatch<React.SetStateAction<FamilyData>>;
}

const FamilyDataContext = createContext<FamilyDataContextProps | undefined>(
  undefined,
);

export const useFamilyData = () => {
  const context = useContext(FamilyDataContext);
  if (!context) {
    throw new Error('useFamilyData must be used within a FamilyDataProvider');
  }
  return context;
};

export const FamilyDataProvider: React.FC<FamilyDataProviderProps> = ({
  children,
}) => {
  const [familyData, setFamilyData] = useState<FamilyData>(defaultFamilyData);

  return (
    <FamilyDataContext.Provider value={{familyData, setFamilyData}}>
      {children}
    </FamilyDataContext.Provider>
  );
};
