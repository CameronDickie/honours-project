// FamilyDataContext.tsx
import React, {createContext, useContext, useState} from 'react';

export interface Relationship {
  id: string;
  startDate: string;
  endDate: string | null;
}

export interface FamilyMember {
  id: string;
  name: string;
  birthdate: string;
  deathdate: string | null;
  relationships: {
    partner: Relationship[];
    children: string[];
    parents: string[];
  };
}

export interface FamilyData {
  members: Array<FamilyMember>;
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
