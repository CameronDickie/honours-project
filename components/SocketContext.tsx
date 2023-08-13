import React, {createContext, useContext, useEffect, useState} from 'react';
import io, {Socket} from 'socket.io-client';
import {Platform} from 'react-native';
import {ServerToClientEvents, ClientToServerEvents} from '../App'; // Update this import path!
import {
  FamilyData,
  useFamilyData,
  FamilyMember,
  User,
} from './FamilyDataContext';

import {useNotification} from './NotificationController';

const SERVER_URL =
  Platform.OS === 'android'
    ? 'http://192.168.122.1:9000'
    : 'http://localhost:9000';

interface SocketContextProps {
  socket: Socket | null;
  isFamilyAssociated: boolean;
  setIsFamilyAssociated: React.Dispatch<React.SetStateAction<boolean>>;
  memberId: number | null;
  onlineUsers: string[];
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

export async function performJoinFamily(
  joinFamilyId: string,
  rootMember: FamilyMember,
) {
  try {
    const response = await fetch(SERVER_URL + '/joinFamily', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        familyId: joinFamilyId,
        familyData: rootMember,
      }),
    });

    const result = await response.json();
    if (response.ok) {
      // Handle successful join
      console.log('Successfully joined the family!', result);
    } else {
      // Handle error from the server
      console.error('Error joining the family:', result.error);
    }
  } catch (error: any) {
    // Handle network error
    console.error('Network error:', error.message);
  }
}

export const SocketProvider: React.FC<SocketProviderProps> = ({children}) => {
  const {setFamilyData, familyData, setToMergeData, toMergeData} =
    useFamilyData();
  const {showNotification} = useNotification();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isFamilyAssociated, setIsFamilyAssociated] = useState(false);
  const [memberId, setMemberId] = useState(0); // to be replaced with cookie information but for now incremental integers work
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    const socketIo = socket;
    socketIo?.on('joinRequest', data => {
      showNotification({
        message: `User ${data.from} wants to join your family! If you hit accept, you will allow them to view your family tree.`,
        approve: () => {
          console.log('Approved', familyData);
          // Handle approve logic...

          // Get the current family data from the FamilyDataContext
          // Emit the family data to the signaling server with the id of the requesting client
          socketIo.emit('shareFamilyData', {
            to: data.from,
            familyData: familyData,
          });
        },
        decline: () => {
          console.log('Declined');
          // Handle decline logic...
        },
      });
    });

    socketIo?.on('receiveFamilyData', data => {
      console.log('Received family data:', data);
      console.log('myFamilyData', familyData);
      //display the relationship view but for now lets just console.log

      // setFamilyData(data);
    });
  }, [familyData]);
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

    //i think this is no longer used???
    //this is their first recieving of the data, which should be organized properly and the root member properly assigned
    socketIo.on('initialData', (data: FamilyMember) => {
      if (!data) return;
      setFamilyData(prevData => ({...prevData, rootMember: data}));
      //ensure that the user has the familyView
      setIsFamilyAssociated(true);
    });

    //i don't think that this is being used either but im not sure about this one
    socketIo.on('joinResponse', (data: any) => {
      console.log('Received joinResponse:', data);
      // Handle the response as required
    });
    // Handle user status changes
    socketIo.on(
      'userStatusChange',
      (data: {email: string; status: 'online' | 'offline'}) => {
        if (data.status === 'online') {
          setOnlineUsers(prevEmails => {
            if (!prevEmails.includes(data.email)) {
              return [...prevEmails, data.email]; // Add the email to the list if not already present
            }
            return prevEmails; // Return previous state if email already present
          });
        } else if (data.status === 'offline') {
          setOnlineUsers(prevEmails =>
            prevEmails.filter(email => email !== data.email),
          ); // Remove the email from the list
        }
      },
    );

    socketIo.on('onlineUsersList', (onlineUsers: string[]) => {
      console.log(onlineUsers);
      setOnlineUsers(onlineUsers); // Directly set the list of online users
    });

    socketIo.on('joinRequest', data => {
      showNotification({
        message: `User ${data.from} wants to join your family! If you hit accept, you will allow them to view your family tree.`,
        approve: () => {
          console.log('Approved', familyData);
          // Handle approve logic...

          // Get the current family data from the FamilyDataContext
          // Emit the family data to the signaling server with the id of the requesting client
          socketIo.emit('shareFamilyData', {
            to: data.from,
            familyData: familyData,
          });
        },
        decline: () => {
          console.log('Declined');
          // Handle decline logic...
        },
      });
    });

    socketIo.on('receiveFamilyData', data => {
      console.log('Received family data:', data);
      //display the relationship view but for now lets just console.log
      //currently in the joinFamily view in the Authentication section
      setToMergeData(() => {
        return data;
      });
      // setFamilyData(data);
    });

    return () => {
      socketIo.disconnect();
    };
  }, []);

  //do I need to export all of these values? can this be reduced?
  return (
    <SocketContext.Provider
      value={{
        socket,
        isFamilyAssociated,
        memberId,
        setIsFamilyAssociated,
        onlineUsers,
      }}>
      {children}
    </SocketContext.Provider>
  );
};
