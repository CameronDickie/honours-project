import React, {useState, useEffect} from 'react';
import {View, Button, TextInput, StyleSheet, Text} from 'react-native';
import {useWindowDimensions, Platform} from 'react-native';
import Tree from './components/Tree';
import {Socket} from 'socket.io-client';
import io from 'socket.io-client';
import {SignIn} from './views/SignIn';
import {FamilyView} from './views/FamilyView';
import {
  FamilyDataProvider,
  FamilyData,
  useFamilyData,
} from './components/FamilyDataContext';

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  memberStatus: (isAssociated: boolean) => void;
  initialData: (familyData: FamilyData) => void;
}

interface ClientToServerEvents {
  joinFamily: (
    dataToSend: UserData,
    callback: (response: boolean) => void,
  ) => void;
  createFamily: (
    dataToSend: UserData,
    callback: (response: boolean) => void,
  ) => void;
  initialDataRequest: () => void
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
  const {setFamilyData} = useFamilyData();
  const [isFamilyAssociated, setIsFamilyAssociated] = useState(false);
  const [memberId, setMemberId] = useState(0)
  const [socket, setSocket] = useState<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);

  useEffect(() => {
    const serverURL =
      Platform.OS === 'android'
        ? 'http://192.168.122.1:9000'
        : 'http://localhost:9000';
    const socketIo = io(serverURL);

    setSocket(socketIo);

    // Make a GET request to 'getMemId'
    fetch(`${serverURL}/getMemId`)
      .then(response => response.json()) // assuming server responds with json
      .then(data => {
        const memId = data.memId;  // assuming the server sends the ID as {"memId": "some-id"}
        setMemberId(memId);
        socketIo.emit('handleConnection', memId);
      })
      .catch(error => {
        console.error("There was an error fetching the memId:", error);
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

  const width = useWindowDimensions().width;
  const height = useWindowDimensions().height;

  return (
    <View style={{height: height}}>
      {isFamilyAssociated ? (
        <FamilyView screenHeight={height} screenWidth={width} />
      ) : (
        <SignIn socket={socket} setIsFamilyAssociated={setIsFamilyAssociated} />
      )}
    </View>
  );
};

function App(): JSX.Element {
  return (
    <FamilyDataProvider>
      <SocketAndRoutes />
    </FamilyDataProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 10,
    borderRadius: 5,
  },
  inputError: {
    borderColor: 'red', // Add red outline for error
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  button: {
    marginBottom: 10, // Add margin bottom to buttons
  },
});

export default App;
