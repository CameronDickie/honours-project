import React, {useState} from 'react';
import {
  View,
  Button,
  TextInput,
  StyleSheet,
  Text,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useSocket} from '../components/SocketContext';
import {useFamilyData} from '../components/FamilyDataContext';

const SERVER_URL =
  Platform.OS === 'android'
    ? 'http://192.168.122.1:9000'
    : 'http://localhost:9000';

export const Authentication: React.FC = () => {
  const [view, setView] = useState<'login' | 'signup' | 'joinFamily'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const {socket, setIsFamilyAssociated, onlineUsers} = useSocket(); // Use the socket from the context!
  const {setFamilyData} = useFamilyData();

  const handleJoinRequest = (email: string) => {
    console.log(`Requesting to join ${email}'s family.`);
    // Here you'll probably need to send a socket event or make another API call.
  };

  const handleCreateFamily = () => {
    // TODO: Implement the logic for creating a new family
    Alert.alert('Feature Coming Soon', 'This feature will be available soon.');
  };

  const handleFamilyChoice = () => {
    Alert.alert(
      'Family Options',
      'Would you like to create a new family or join an existing one?',
      [
        {
          text: 'Create New Family',
          onPress: () => {
            // TODO: Handle logic for creating a new family here.
            handleCreateFamily();
          },
        },
        {
          text: 'Join Existing Family',
          onPress: () => setView('joinFamily'),
        },
      ],
    );
  };

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
            socket.emit('userOnline', email);

            socket.emit('askForOnlineUsers');
            handleFamilyChoice();
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
            socket.emit('userOnline', email);

            socket.emit('askForOnlineUsers');
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
      {view === 'joinFamily' && (
        <ScrollView>
          <Text style={styles.subtitle}>Online users to join</Text>
          {onlineUsers.map((user, index) => (
            <View key={index} style={styles.userRow}>
              <Text>{user}</Text>
              <TouchableOpacity onPress={() => handleJoinRequest(user)}>
                <Text style={styles.joinButton}>+</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.createNewFamilyButton}
            onPress={handleCreateFamily}>
            <Text style={styles.createNewFamilyText}>Create New Family</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
      {view !== 'joinFamily' && (
        <>
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
        </>
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

  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: 'gray',
    alignItems: 'center',
  },
  joinButton: {
    fontSize: 24,
    color: '#007BFF',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600', // semi-bold for emphasis
    marginBottom: 8, // space between the subtitle and its corresponding dropdown
    color: '#2c3e50', // a dark shade for better readability
  },
  createNewFamilyButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  createNewFamilyText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
