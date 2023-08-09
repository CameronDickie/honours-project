import React, {useState} from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Button,
  Switch,
} from 'react-native';
import Tree from '../components/Tree';
import {FamilyMember, useFamilyData} from '../components/FamilyDataContext';

interface FamilyViewProps {
  screenHeight: number;
  screenWidth: number;
}

export const FamilyView: React.FC<FamilyViewProps> = ({
  screenHeight,
  screenWidth,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [memberName, setMemberName] = useState<string>('');
  const [memberBirthdate, setMemberBirthdate] = useState<string>('');
  const [memberDeathdate, setMemberDeathdate] = useState<string>('');
  const [memberEmail, setMemberEmail] = useState<string>('');
  const [memberPassword, setMemberPassword] = useState<string>('');
  const [isUser, setIsUser] = useState<boolean>(false); // Toggle this to show/hide user fields

  const {familyData, setFamilyData} = useFamilyData(); // Access family data from context

  const addFamilyMember = () => {
    // Here you would usually interact with your backend or other logic to actually add the member to your data structure
    // For the sake of this example, I'll just show a mock structure to add it to your local state

    const newMember: FamilyMember = {
      id: Math.random().toString(), // In a real scenario, ID generation should be more sophisticated
      name: memberName,
      birthdate: memberBirthdate,
      deathdate: memberDeathdate || null,
      user: isUser
        ? {
            email: memberEmail,
            password: memberPassword, // Remember to hash this before storing or sending to any server
            socketConnection: null,
            online: false,
          }
        : null,
      relationships: {
        partner: [],
        children: [],
        parents: [],
      },
    };

    // For this mock example, I'll just replace the root member
    setFamilyData({
      rootMember: newMember,
    });

    handleModalClose();
  };

  const handlePlusPress = () => {
    setModalVisible(true); // Show the modal
  };

  const handleModalClose = () => {
    setModalVisible(false); // Hide the modal
  };

  const handleArrowPress = () => {
    console.log('Arrow button pressed!');
  };

  return (
    <View style={{flex: 1}}>
      <Tree screenHeight={screenHeight} screenWidth={screenWidth} />

      {/* Buttons Container */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handlePlusPress}
          activeOpacity={0.6}>
          <Text style={styles.iconText}>+</Text>
        </TouchableOpacity>
        {/* Other button... */}
      </View>

      {/* Modal for adding a family member */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1} // Keep it fully opaque when pressed
          onPress={handleModalClose} // Close the modal when this is pressed
        >
          <ScrollView
            contentContainerStyle={styles.modalView}
            onStartShouldSetResponder={() => true}>
            <View style={{width: '100%'}}>
              <Text style={[styles.modalTitle, styles.centeredText]}>
                Add a Family Member
              </Text>
              <TextInput
                placeholder="Name"
                value={memberName}
                onChangeText={setMemberName}
                style={styles.input}
              />
              <TextInput
                placeholder="Birthdate (e.g., YYYY-MM-DD)"
                value={memberBirthdate}
                onChangeText={setMemberBirthdate}
                style={styles.input}
              />
              <TextInput
                placeholder="Deathdate (e.g., YYYY-MM-DD)"
                value={memberDeathdate}
                onChangeText={setMemberDeathdate}
                style={styles.input}
              />
              <Switch
                value={isUser}
                onValueChange={setIsUser}
                style={styles.switch}
              />
              {isUser && (
                <>
                  <TextInput
                    placeholder="Email"
                    value={memberEmail}
                    onChangeText={setMemberEmail}
                    style={styles.input}
                  />
                  <TextInput
                    placeholder="Password"
                    value={memberPassword}
                    onChangeText={setMemberPassword}
                    secureTextEntry={true}
                    style={styles.input}
                  />
                </>
              )}
              <Button title="Add Member" onPress={addFamilyMember} />
              <Button title="Close" onPress={handleModalClose} />
            </View>
          </ScrollView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: 'lightgray', // For visibility
    padding: 10,
    borderRadius: 30,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  iconText: {
    fontSize: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // This makes the background slightly dark when the modal is open
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: {width: 0, height: 2}, // For iOS shadow
    shadowOpacity: 0.25, // For iOS shadow
    shadowRadius: 4, // For iOS shadow
  },
  centeredText: {
    textAlign: 'center',
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    marginBottom: 20,
  },
  switch: {
    marginVertical: 10,
  },
});
