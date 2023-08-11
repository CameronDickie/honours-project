import React, {useState, useEffect} from 'react';
import {View, Button, TextInput, StyleSheet, Text} from 'react-native';
import {useWindowDimensions} from 'react-native';
import {Authentication} from './views/Authentication';
import {FamilyView} from './views/FamilyView';
import {FamilyDataProvider, FamilyData} from './components/FamilyDataContext';
import {SocketProvider, useSocket} from './components/SocketContext';
import {
  NotificationProvider,
  useNotification,
} from './components/NotificationController';
import {NotificationModal} from './components/NotificationModal';
/*
Socket event section should be better defined
*/
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

/*
interfaces which serve to be templates that can be sent to the server side
(I think person is not actually being used anywhere now this might be removed) 
*/
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

const NotificationDisplay = () => {
  const {notification, isActive, hideNotification} = useNotification();
  return (
    <NotificationModal
      notification={notification}
      isActive={isActive}
      hideNotification={hideNotification}
    />
  );
};
/*
A JSX object which serves to provide screen information and control what view the user is seeing
*/
const ViewController = (): JSX.Element => {
  const {isFamilyAssociated} = useSocket();

  const width = useWindowDimensions().width;
  const height = useWindowDimensions().height;
  return (
    <View style={{height: height}}>
      {isFamilyAssociated ? (
        <FamilyView screenHeight={height} screenWidth={width} />
      ) : (
        <Authentication />
      )}
    </View>
  );
};

function App(): JSX.Element {
  return (
    <FamilyDataProvider>
      <NotificationProvider>
        <SocketProvider>
          <ViewController />
          <NotificationDisplay />
        </SocketProvider>
      </NotificationProvider>
    </FamilyDataProvider>
  );
}

export default App;
