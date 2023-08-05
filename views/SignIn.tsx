import React, {useState} from 'react';
import {View, Button, TextInput, StyleSheet, Text} from 'react-native';
import {Socket} from 'socket.io-client';

interface SignInProps {
  setIsFamilyAssociated: React.Dispatch<React.SetStateAction<boolean>>;
  socket: Socket | null;
}

export const SignIn: React.FC<SignInProps> = ({
  socket,
  setIsFamilyAssociated,
}) => {
  //STATE STUFF
  const [familyID, setFamilyID] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const [isFirstNameValid, setIsFirstNameValid] = useState(true);
  const [isLastNameValid, setIsLastNameValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isFamilyIDValid, setIsFamilyIDValid] = useState(true);

  const handleSubmitJoin = () => {
    // Validation checks
    const isAllValid =
      firstName.trim() !== '' &&
      lastName.trim() !== '' &&
      password.trim() !== '' &&
      email.trim() !== '' &&
      familyID.trim() !== '';

    if (socket && isAllValid) {
      const dataToSend = {
        firstName,
        lastName,
        password,
        email,
        familyID: familyID,
      };

      socket.emit('joinFamily', dataToSend, (response: boolean) => {
        if (response === true) {
          console.log('found a family to join and joined the family');
          setIsFamilyAssociated(true);
        } else if (response === false) {
          console.log('failed to join a family');
        } else {
          console.log('broken');
        }
      });
    } else {
      // Show error messages for each invalid field
      setIsFirstNameValid(firstName.trim() !== '');
      setIsLastNameValid(lastName.trim() !== '');
      setIsPasswordValid(password.trim() !== '');
      setIsEmailValid(email.trim() !== '');
      setIsFamilyIDValid(familyID.trim() !== '');
    }
  };

  const handleCreateFamily = () => {
    // Validation checks
    const isAllValid =
      firstName.trim() !== '' &&
      lastName.trim() !== '' &&
      password.trim() !== '' &&
      email.trim() !== '' &&
      familyID.trim() !== '';

    if (socket && isAllValid) {
      const dataToSend = {
        firstName,
        lastName,
        password,
        email,
        familyID: familyID,
      };

      socket.emit('createFamily', dataToSend, (response: boolean) => {
        if (response === true) {
          console.log('family has been created');
          setIsFamilyAssociated(true);
        } else if (response === false) {
          console.log(
            'failed to create family. likely due to this familyID already existing',
          );
        } else {
          console.log('broken');
        }
      });
    } else {
      // Show error messages for each invalid field
      setIsFirstNameValid(firstName.trim() !== '');
      setIsLastNameValid(lastName.trim() !== '');
      setIsPasswordValid(password.trim() !== '');
      setIsEmailValid(email.trim() !== '');
      setIsFamilyIDValid(familyID.trim() !== '');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        editable
        style={[styles.input, !isFirstNameValid && styles.inputError]}
        value={firstName}
        onChangeText={text => {
          setFirstName(text);
          setIsFirstNameValid(text.trim() !== '');
        }}
        placeholder="First Name"
      />
      {!isFirstNameValid && (
        <Text style={styles.errorText}>Please enter a valid First Name</Text>
      )}
      <TextInput
        editable
        style={[styles.input, !isLastNameValid && styles.inputError]}
        value={lastName}
        onChangeText={text => {
          setLastName(text);
          setIsLastNameValid(text.trim() !== '');
        }}
        placeholder="Last Name"
      />
      {!isLastNameValid && (
        <Text style={styles.errorText}>Please enter a valid Last Name</Text>
      )}
      <TextInput
        editable
        style={[styles.input, !isPasswordValid && styles.inputError]}
        value={password}
        onChangeText={text => {
          setPassword(text);
          setIsPasswordValid(text.trim() !== '');
        }}
        placeholder="Password"
        secureTextEntry
      />
      {!isPasswordValid && (
        <Text style={styles.errorText}>Please enter a valid Password</Text>
      )}
      <TextInput
        editable
        style={[styles.input, !isEmailValid && styles.inputError]}
        value={email}
        onChangeText={text => {
          setEmail(text);
          setIsEmailValid(text.trim() !== '');
        }}
        placeholder="Email Address"
        keyboardType="email-address"
      />
      {!isEmailValid && (
        <Text style={styles.errorText}>Please enter a valid Email Address</Text>
      )}
      <TextInput
        editable
        style={[styles.input, !isFamilyIDValid && styles.inputError]}
        value={familyID}
        onChangeText={text => {
          setFamilyID(text);
          setIsFamilyIDValid(text.trim() !== '');
        }}
        placeholder="Family ID"
      />
      {!isFamilyIDValid && (
        <Text style={styles.errorText}>Please enter a valid Family ID</Text>
      )}
      <Button
        title="Join Family"
        onPress={() => {
          handleSubmitJoin();
        }}
      />
      <Button title="Create Family" onPress={() => handleCreateFamily()} />
    </View>
  );
};

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
