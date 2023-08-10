import React, {useState} from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Switch,
  Platform,
  ActionSheetIOS,
  Alert,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import Tree from '../components/Tree';
import {
  FamilyMember,
  useFamilyData,
  getIndividuals,
} from '../components/FamilyDataContext';
import {performJoinFamily} from '../components/SocketContext';

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

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedUser2, setSelectedUser2] = useState<string | null>(null);

  const [arrowModalVisible, setArrowModalVisible] = useState(false);
  const [displayId, setDisplayId] = useState(false);
  const [joinFamilyId, setJoinFamilyId] = useState<string>('');

  const allUsers: string[] = []; // This will store all the user names for the dropdown

  // This function populates the allUsers array with user names
  const populateUserNames = (member: FamilyMember | null) => {
    if (!member) return;

    if (member.user && member.user.email) {
      allUsers.push(member.name);
    }

    member.relationships.children.forEach(child => {
      populateUserNames(child);
    });
    member.relationships.parents.forEach(parent => {
      populateUserNames(parent);
    });
  };

  populateUserNames(familyData.rootMember);

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
    setArrowModalVisible(true);
  };
  const handleJoinFamily = () => {
    //TODO: this needs to be refactored as this is not how i want to go about this

    // First, present the user with a warning
    Alert.alert(
      'Join Another Family',
      'You will need to be re-invited to your current family if you join another.',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Joining family cancelled.'),
          style: 'cancel',
        },
        {
          text: 'Accept',
          onPress: () => {
            // The logic for joining a family after the user accepts the warning
            console.log(`Joining family with ID: ${joinFamilyId}`);
            if (familyData.rootMember !== null) {
              performJoinFamily(joinFamilyId, familyData.rootMember);
            } else {
              console.log('no family data in storage');
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  const showActionSheet = (setSelected: (value: string) => void) => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', ...allUsers],
        cancelButtonIndex: 0,
      },
      buttonIndex => {
        if (buttonIndex !== 0) {
          setSelected(allUsers[buttonIndex - 1]);
        }
      },
    );
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
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleArrowPress}
          activeOpacity={0.6}>
          <Text style={styles.iconText}>-</Text>
        </TouchableOpacity>
        {/* Other button... */}
      </View>

      {/* Modal for adding a family member */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        {/* <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1} // Keep it fully opaque when pressed
          onPress={handleModalClose} // Close the modal when this is pressed
        > */}
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

            {Platform.OS === 'ios' ? (
              <TouchableOpacity
                onPress={() => showActionSheet(setSelectedUser)}>
                <Text style={styles.input}>
                  {selectedUser || 'Select User...'}
                </Text>
              </TouchableOpacity>
            ) : (
              <Picker
                selectedValue={selectedUser}
                style={styles.pickerStyle}
                onValueChange={itemValue =>
                  setSelectedUser(itemValue as string)
                }>
                <Picker.Item label="Select User..." value={null} />
                {allUsers.map((user, index) => (
                  <Picker.Item key={index} label={user} value={user} />
                ))}
              </Picker>
            )}

            {Platform.OS === 'ios' ? (
              <TouchableOpacity
                onPress={() => showActionSheet(setSelectedUser2)}>
                <Text style={styles.input}>
                  {selectedUser2 || 'Select User...'}
                </Text>
              </TouchableOpacity>
            ) : (
              <Picker
                selectedValue={selectedUser2}
                style={styles.pickerStyle}
                onValueChange={itemValue =>
                  setSelectedUser2(itemValue as string)
                }>
                <Picker.Item label="Select User..." value={null} />
                {allUsers.map((user, index) => (
                  <Picker.Item key={index} label={user} value={user} />
                ))}
              </Picker>
            )}
            <View style={styles.inlineContainer}>
              <Switch
                value={isUser}
                onValueChange={setIsUser}
                style={styles.switch}
              />
              <Text style={styles.subtitle}>Create a new User</Text>
            </View>

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
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={addFamilyMember}>
              <Text style={styles.buttonText}>Add Member</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleModalClose}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        {/* </TouchableOpacity> */}
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={arrowModalVisible}>
        <ScrollView contentContainerStyle={styles.modalView}>
          <Text style={[styles.modalTitle, styles.centeredText]}>
            Join a Family
          </Text>

          <View style={styles.inlineContainer}>
            <Switch
              value={displayId}
              onValueChange={setDisplayId}
              style={styles.switch}
            />
            <Text style={styles.subtitle}>Display Family ID</Text>
          </View>

          {displayId && (
            <Text style={[styles.centeredText, {marginBottom: 20}]}>
              {familyData.rootMember?.id}
            </Text>
          )}

          <TextInput
            placeholder="Enter Family ID to join"
            value={joinFamilyId}
            onChangeText={setJoinFamilyId}
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleJoinFamily}>
            <Text style={styles.buttonText}>Join Family</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setArrowModalVisible(false)}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
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
    width: '100%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    // Removed the marginHorizontal (since it's unnecessary now)
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
  inlineContainer: {
    flexDirection: 'row', // to layout children in a row
    alignItems: 'center', // vertically centering children
    marginBottom: 20, // optional, for some spacing after this container
  },

  switch: {
    marginRight: 10, // to give some space between the switch and the text
  },

  pickerStyle: {
    height: 50,
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    marginBottom: 20,
  },

  // New styles for the buttons
  primaryButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: '#7f8c8d',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600', // semi-bold for emphasis
    marginBottom: 8, // space between the subtitle and its corresponding dropdown
    color: '#2c3e50', // a dark shade for better readability
  },
});
