import React, {createContext, useContext, useEffect, useState} from 'react';
import io, {Socket} from 'socket.io-client';
import {Platform} from 'react-native';
import {ServerToClientEvents, ClientToServerEvents} from '../App'; // Update this import path!
import {FamilyData, useFamilyData, FamilyMember} from './FamilyDataContext';

const SERVER_URL =
  Platform.OS === 'android'
    ? 'http://192.168.122.1:9000'
    : 'http://localhost:9000';

interface SocketContextProps {
  socket: Socket | null;
  isFamilyAssociated: boolean;
  setIsFamilyAssociated: React.Dispatch<React.SetStateAction<boolean>>;
  memberId: number | null;
  // ... any other socket-related states you might want to expose
}

interface SocketProviderProps {
  children: React.ReactNode;
}

interface MemberStatus {
  isAssociated: boolean;
  receivedMemId: number;
}
const SocketContext = createContext<SocketContextProps | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({children}) => {
  const {setFamilyData} = useFamilyData();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isFamilyAssociated, setIsFamilyAssociated] = useState(false);
  const [memberId, setMemberId] = useState(0); // to be replaced with cookie information but for now incremental integers work

  useEffect(() => {
    const socketIo = io(SERVER_URL);
    setSocket(socketIo);

    //remnant of previous implementation, however leaving it in in case it is needed in the future
    socketIo.on('connect', () => {});

    // Listen to the 'memberStatus' event and set 'isFamilyAssociated'
    socketIo.on('memberStatus', (status: MemberStatus) => {
      const {isAssociated, receivedMemId} = status;

      //request the data for the family, if the family is associated
      if (isAssociated) {
        socketIo.emit('initialDataRequest', receivedMemId);
      } else {
        //ensure that the user has the signup view
        setIsFamilyAssociated(false);
      }
    });

    //this is their first recieving of the data, which should be organized properly and the root member properly assigned
    socketIo.on('initialData', (data: FamilyMember) => {
      if (!data) return;
      setFamilyData(prevData => ({...prevData, rootMember: data}));
      //ensure that the user has the familyView
      setIsFamilyAssociated(true);
    });

    return () => {
      socketIo.disconnect();
    };
  }, []);

  //do I need to export all of these values? can this be reduced?
  return (
    <SocketContext.Provider
      value={{socket, isFamilyAssociated, memberId, setIsFamilyAssociated}}>
      {children}
    </SocketContext.Provider>
  );
};
