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
import {Picker} from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSocket} from '../components/SocketContext';
import {
  FamilyMember,
  createFamilyMember,
  useFamilyData,
} from '../components/FamilyDataContext';

const SERVER_URL =
  Platform.OS === 'android'
    ? 'http://192.168.122.1:9000'
    : 'http://localhost:9000';

export const Authentication: React.FC = () => {
  const [view, setView] = useState<
    'login' | 'signup' | 'joinFamily' | 'createFamily'
  >('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const {socket, setIsFamilyAssociated, onlineUsers} = useSocket(); // Use the socket from the context!
  const {setFamilyData, familyData} = useFamilyData();

  const [name, setName] = useState<string>('');
  const [birthdate, setBirthdate] = useState<string>('');
  const [deathdate, setDeathdate] = useState<string | undefined>('');

  const saveFamilyDataToStorage = async (data: typeof familyData) => {
    try {
      await AsyncStorage.setItem('familyData', JSON.stringify(data));
    } catch (error) {
      console.error("Couldn't save family data to storage:", error);
    }
  };

  const loadFamilyDataFromStorage = async () => {
    try {
      const data = await AsyncStorage.getItem('familyData');
      if (data !== null) {
        setFamilyData(() => {
          //discard old data
          const newData = JSON.parse(data);
          setIsFamilyAssociated(true);
          return newData;
        });
      }
    } catch (error) {
      console.error("Couldn't load family data from storage:", error);
    }
  };

  const handleJoinRequest = (targetEmail: string) => {
    console.log(`Requesting to join ${targetEmail}'s family.`);
    if (socket) {
      const requestData = {
        requesterEmail: email,
        targetEmail: targetEmail,
      };
      socket.emit('requestToJoin', requestData);
    }
    // Here you'll probably need to send a socket event or make another API call.
  };
  const handleCreateFamilySubmission = () => {
    // TODO: Here you will call the relevant API or socket method to send the new family data.
    // Construct the data for the new family member (excluding the id, since it will be generated by the function)
    const memberData = {
      name,
      birthdate,
      deathdate,
      user: email, // Using 'email' to populate the 'user' field
      relationships: {
        partner: [],
        children: [],
        parents: [],
      },
    };

    // Use the createFamilyMember function to create a new family member with a unique ID
    const newFamilyMember = createFamilyMember(memberData);
    setFamilyData(prevData => {
      const updatedData = {...prevData, rootMember: newFamilyMember};
      saveFamilyDataToStorage(updatedData); // Save data to AsyncStorage
      setIsFamilyAssociated(true);
      return updatedData;
    });
  };
  const handleCreateFamily = () => {
    setName(firstName + ' ' + lastName);
    // Setting the view to display the createFamily UI
    setView('createFamily');
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

  //a method to create a root member during the signup phase.
  const createRootMember = () => {
    // Use firstName and lastName to set the root member's name
    setName(firstName + ' ' + lastName);
    // Construct the data for the new family member
    const memberData = {
      name: firstName + ' ' + lastName,
      birthdate: '',
      deathdate: undefined,
      user: email, // Using 'email' to populate the 'user' field
      relationships: {
        partner: [],
        children: [],
        parents: [],
      },
    };

    // Use the createFamilyMember function to create a new family member with a unique ID
    const newFamilyMember = createFamilyMember(memberData);
    setFamilyData(prevData => {
      const updatedData = {...prevData, rootMember: newFamilyMember};
      saveFamilyDataToStorage(updatedData); // Save data to AsyncStorage
      return updatedData;
    });
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

            // Create the root member for the user after successful sign up
            createRootMember();

            // Now present the user with family options
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

            loadFamilyDataFromStorage(); // Load data from AsyncStorage
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
      {view === 'createFamily' && (
        <>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Name"
          />
          <TextInput
            style={styles.input}
            value={birthdate}
            onChangeText={setBirthdate}
            placeholder="Birthdate (e.g., YYYY-MM-DD)"
          />
          <TextInput
            style={styles.input}
            value={deathdate}
            onChangeText={setDeathdate}
            placeholder="Deathdate (e.g., YYYY-MM-DD)"
          />
          <Button
            title="Submit Family Data"
            onPress={handleCreateFamilySubmission}
          />
        </>
      )}
      {view === 'joinFamily' && (
        <ScrollView>
          <Text style={styles.subtitle}>Online users to join</Text>
          {onlineUsers.map((user, index) => {
            if (familyData.rootMember && user !== familyData.rootMember.user) {
              // Check to exclude the current user
              return (
                <View key={index} style={styles.userRow}>
                  <Text>{user}</Text>
                  <TouchableOpacity onPress={() => handleJoinRequest(user)}>
                    <Text style={styles.joinButton}>+</Text>
                  </TouchableOpacity>
                </View>
              );
            } else {
              return null; // Render nothing for the current user
            }
          })}
          <TouchableOpacity
            style={styles.createNewFamilyButton}
            onPress={handleCreateFamily}>
            <Text style={styles.createNewFamilyText}>Create New Family</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
      {view !== 'joinFamily' && view !== 'createFamily' && (
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
