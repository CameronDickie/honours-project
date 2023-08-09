import React, {useState, useEffect} from 'react';
import {View, Button, TextInput, StyleSheet, Text} from 'react-native';
import {useWindowDimensions, Platform} from 'react-native';
import io from 'socket.io-client';
import {SignIn} from './views/SignIn';
import {Authentication} from './views/Authentication';
import {FamilyView} from './views/FamilyView';
import {
  FamilyDataProvider,
  FamilyData,
  useFamilyData,
} from './components/FamilyDataContext';
import {SocketProvider, useSocket} from './components/SocketContext';

export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  memberStatus: (isAssociated: boolean) => void;
  initialData: (familyData: FamilyData) => void;
}

export interface ClientToServerEvents {
  joinFamily: (
    dataToSend: UserData,
    callback: (response: boolean) => void,
  ) => void;
  createFamily: (
    dataToSend: UserData,
    callback: (response: boolean) => void,
  ) => void;
  initialDataRequest: () => void;
}

interface InterServerEvents {
  ping: () => void;
}
interface Person {
  firstName: string;
  lastName: string;
}

interface UserData {
  person: Person;
  password: string;
  email: string;
  familyID: string;
}

const SocketAndRoutes = (): JSX.Element => {
  const {socket, isFamilyAssociated} = useSocket(); // Use the socket from the context!
  const {setFamilyData} = useFamilyData();

  const width = useWindowDimensions().width;
  const height = useWindowDimensions().height;

  return (
    <View style={{height: height}}>
      {isFamilyAssociated ? (
        <FamilyView screenHeight={height} screenWidth={width} />
      ) : (
        <Authentication />
        // <SignIn socket={socket} setIsFamilyAssociated={setIsFamilyAssociated} />
      )}
    </View>
  );
};

function App(): JSX.Element {
  return (
    <FamilyDataProvider>
      <SocketProvider>
        <SocketAndRoutes />
      </SocketProvider>
    </FamilyDataProvider>
  );
}

export default App;
