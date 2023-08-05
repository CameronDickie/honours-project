import React, {useState, useEffect} from 'react';
import {View, Button, TextInput, StyleSheet, Text} from 'react-native';
import {useWindowDimensions, Platform} from 'react-native';
import Tree from './components/Tree';
import {Socket} from 'socket.io-client';
import io from 'socket.io-client';
import {SignIn} from './views/SignIn';
import {FamilyView} from './views/FamilyView';

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
  hello: () => void;
  joinFamily: (
    dataToSend: UserData,
    callback: (response: boolean) => void,
  ) => void;
  createFamily: (
    dataToSend: UserData,
    callback: (response: boolean) => void,
  ) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface UserData {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  familyID: string;
}

function App(): JSX.Element {
  const width = useWindowDimensions().width;
  const height = useWindowDimensions().height;

  const [isFamilyAssociated, setIsFamilyAssociated] = useState(false);
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

    return () => {
      socketIo.disconnect();
    };
  }, []);

  return (
    <View style={{height: height}}>
      {isFamilyAssociated ? (
        <FamilyView screenHeight={height} screenWidth={width} />
      ) : (
        <SignIn socket={socket} setIsFamilyAssociated={setIsFamilyAssociated} />
      )}
    </View>
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
