import React, { useState, useEffect } from 'react';
import { View, Button, TextInput, StyleSheet } from 'react-native';
import { useWindowDimensions } from 'react-native';
import Tree from './components/Tree';
import { Socket } from 'socket.io-client';
import io from 'socket.io-client';

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
  hello: () => void;
  joinFamily: (famID: string, callback: (response: boolean) => void) => void;
  createFamily: (famID: string, callback: (response: boolean) => void) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  clientAttemptedID: string;
}

function App(): JSX.Element {
  const width = useWindowDimensions().width;
  const height = useWindowDimensions().height;

  const [isFamilyAssociated, setIsFamilyAssociated] = useState(false);
  const [textFieldValue, setTextFieldValue] = useState('');
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  useEffect(() => {
    const socketIo = io('http://localhost:9000');

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, []);

  const handleSubmitJoin = () => {
    if (socket) {
      socket.emit('joinFamily', textFieldValue, (response) => {
        console.log(response);
        if(response === true) {
          console.log('found a family to join and joined the family')
          setIsFamilyAssociated(true)
        } else if (response === false) {
          console.log('failed to join a family')
        } else {
          console.log('broken');
        }
      });
    }
  }

  const handleCreateFamily = () => {
    if (socket) {
      socket.emit('createFamily', textFieldValue, (response) => {
        console.log(response)
        if(response === true) {
          console.log('family has been created');
          setIsFamilyAssociated(true);
        } else if(response === false) {
          console.log('failed to create family. likely due to this familyID already existing');
        } else {
          console.log('broken');
        }
         
      })
    }
  }

  return (
    <View style={{height: height}}>
      {
        isFamilyAssociated ? (
          <Tree screenHeight={height} screenWidth={width} />
        ) : (
          <View style={styles.container}>
            <TextInput 
              style={styles.input} 
              value={textFieldValue} 
              onChangeText={text => setTextFieldValue(text)} 
              placeholder="Enter family ID"
              onSubmitEditing={handleSubmitJoin}
            />
            <Button 
              title="Join Family" 
              onPress={() => handleSubmitJoin()} 
            />
            <Button 
              title="Create Family" 
              onPress={() => handleCreateFamily()} 
            />
          </View>
        )
      }
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,  
    elevation: 5
  },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 15,
    borderRadius: 5,
  },
});

export default App;
