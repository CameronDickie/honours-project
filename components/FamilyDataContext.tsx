// FamilyDataContext.tsx
import React, {createContext, useContext, useState} from 'react';

export interface Relationship {
  id: string;
  startDate: string;
  endDate: string | null;
}

export interface User {
  email: string;
  password: string; // Ideally, you would never save the raw password, consider using hashing.
  socketConnection: string | null; // Store the socket id/connection info
  online: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  birthdate: string;
  deathdate: string | null;
  user: User | null; // If the member is also a user, populate this field. Otherwise, it'll be null.
  relationships: {
    partner: Relationship[];
    children: FamilyMember[];
    parents: FamilyMember[];
  };
}

export interface FamilyData {
  rootMember: FamilyMember | null;
  // ... any other fields
}

const defaultFamilyData: FamilyData = {
  rootMember: null,
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
