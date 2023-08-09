import React, {useState} from 'react';
import {
  View,
  Button,
  TextInput,
  StyleSheet,
  Text,
  Platform,
} from 'react-native';
import {useSocket} from '../components/SocketContext';
import {useFamilyData} from '../components/FamilyDataContext';

const SERVER_URL =
  Platform.OS === 'android'
    ? 'http://192.168.122.1:9000'
    : 'http://localhost:9000';

export const Authentication: React.FC = () => {
  const [view, setView] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const {socket, setIsFamilyAssociated} = useSocket(); // Use the socket from the context!
  const {setFamilyData} = useFamilyData();

  const handleAction = () => {
    const dataToSend = {
      email,
      password,
      firstName,
      lastName,
    };

    if (view === 'signup') {
      // Making an API call for SignUp
      fetch(`${SERVER_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success && socket) {
            // setFamilyData(prevData => ({...prevData, rootMember: data.data}));
            // setIsFamilyAssociated(true);
            console.log('Sign up successful, id: ' + data.data);
            socket.emit('handleConnection', data.data);
          } else {
            console.log('Action failed:', data.error);
          }
        })
        .catch(error => {
          console.error('API call failed:', error);
        });
    } else {
      // Handle Login logic here
      console.log('Logging in...');

      // Making an API call for Login
      fetch(`${SERVER_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success && socket) {
            // setFamilyData(prevData => ({...prevData, rootMember: data.data}));
            // setIsFamilyAssociated(true)
            socket.emit('handleConnection', data.data);
          } else {
            console.log('Login failed:', data.error);
          }
        })
        .catch(error => {
          console.error('API call failed:', error);
        });
    }
  };

  return (
    <View style={styles.container}>
      {view === 'signup' && (
        <>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First Name"
          />
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last Name"
          />
        </>
      )}
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email Address"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      <Button
        title={view === 'signup' ? 'Sign Up' : 'Login'}
        onPress={handleAction}
      />
      {view === 'signup' ? (
        <Text style={styles.switchText} onPress={() => setView('login')}>
          Already have an account? Login
        </Text>
      ) : (
        <Text style={styles.switchText} onPress={() => setView('signup')}>
          Don't have an account? Sign Up
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    padding: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 15,
    borderRadius: 5,
  },
  switchText: {
    marginTop: 20,
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
});
