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

//A helper function which creates an object with only the desired attributes for a given FamilyMember
const extractAttributes = (member: FamilyMember, attributes: string[]): any => {
  let obj: any = {};

  attributes.forEach(attr => {
    if (member.hasOwnProperty(attr)) {
      obj[attr] = (member as any)[attr];
    }
  });

  return obj;
};

// Usage:
// const attributesList = ["name", "birthdate"];
// const extractedData = extractAttributesFromTree(familyData.rootMember, attributesList);
// console.log(extractedData);

/*
  Starts at the root and collects data based on the provided attributes. 
  It then recursively does the same for all the children and parents of the current member
  @returns a list of JSON objects corresponding to a FamilyMember in the Tree
*/
const extractAttributesFromTree = (
  root: FamilyMember | null,
  attributes: string[],
): any[] => {
  if (!root) return [];

  const currentMemberAttributes = extractAttributes(root, attributes);
  const results: any[] = [currentMemberAttributes];

  root.relationships.children.forEach(child => {
    results.push(...extractAttributesFromTree(child, attributes));
  });
  root.relationships.parents.forEach(parent => {
    results.push(...extractAttributesFromTree(parent, attributes));
  });

  return results;
};

export const getIndividuals = (
  root: FamilyMember | null,
  attributes: string[],
) => {
  return extractAttributesFromTree(root, attributes);
};

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
