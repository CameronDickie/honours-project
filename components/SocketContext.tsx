import React, {createContext, useContext, useEffect, useState} from 'react';
import io, {Socket} from 'socket.io-client';
import {Platform} from 'react-native';
import {ServerToClientEvents, ClientToServerEvents} from '../App'; // Update this import path!
import {FamilyData, useFamilyData} from './FamilyDataContext';

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

    // After the socket connects, fetch the memId
    socketIo.on('connect', () => {
      // Make a GET request to 'getMemId'
      fetch(`${SERVER_URL}/getMemId`)
        .then(response => response.json())
        .then(data => {
          const receivedMemId = data.memId;
          setMemberId(receivedMemId);
          socketIo.emit('handleConnection', receivedMemId);
        })
        .catch(error => {
          console.error('There was an error fetching the memId:', error);
        });
    });

    socketIo.on('handFamilyData', (data: FamilyData) => {
      setFamilyData(data);
    });

    // Listen to the 'memberStatus' event and set 'isFamilyAssociated'
    socketIo.on('memberStatus', (isAssociated: boolean) => {
      //request the data for the family, if the family is associated
      if (isAssociated) {
        socketIo.emit('initialDataRequest', memberId);
      } else {
        //ensure that the user has the signup view
        setIsFamilyAssociated(false);
      }
    });

    socketIo.on('initialData', (data: FamilyData) => {
      if (!data) return;
      setFamilyData(data);
      //ensure that the user has the familyView
      setIsFamilyAssociated(true);
    });

    return () => {
      socketIo.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{socket, isFamilyAssociated, memberId, setIsFamilyAssociated}}>
      {children}
    </SocketContext.Provider>
  );
};
