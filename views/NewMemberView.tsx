import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import {
  useFamilyData,
  extractAttributesFromTree,
  createFamilyMember,
  addMemberToTree,
} from '../components/FamilyDataContext';
import {useSocket} from '../components/SocketContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NewMemberView: React.FC = () => {
  const {toMergeData, familyData, setFamilyData, setToMergeData} =
    useFamilyData();
  const {setIsFamilyAssociated} = useSocket();

  const [parentModalVisible, setParentModalVisible] = useState(false);
  const [childModalVisible, setChildModalVisible] = useState(false);
  const [selectedChildOfItems, setSelectedChildOfItems] = useState<string[]>(
    [],
  );
  const [selectedParentOfItems, setSelectedParentOfItems] = useState<string[]>(
    [],
  );

  const [name, setName] = useState(familyData.rootMember?.name || '');
  const [birthdate, setBirthdate] = useState(
    familyData.rootMember?.birthdate || '',
  );
  const [deathdate, setDeathdate] = useState(
    familyData.rootMember?.deathdate || '',
  );

  useEffect(() => {
    setName(familyData.rootMember?.name || '');
    setBirthdate(familyData.rootMember?.birthdate || '');
    setDeathdate(familyData.rootMember?.deathdate || '');
  }, [familyData]);

  const saveFamilyDataToStorage = async (data: typeof familyData) => {
    try {
      await AsyncStorage.setItem('familyData', JSON.stringify(data));
    } catch (error) {
      console.error("Couldn't save family data to storage:", error);
    }
  };

  const memberNames = extractAttributesFromTree(toMergeData.rootMember, [
    'name',
  ]).map(member => member.name);

  const toggleChildOfSelection = (name: string) => {
    setSelectedChildOfItems(prev => {
      if (prev.includes(name)) {
        return prev.filter(item => item !== name);
      } else {
        return [...prev, name];
      }
    });
  };

  const toggleParentOfSelection = (name: string) => {
    setSelectedParentOfItems(prev => {
      if (prev.includes(name)) {
        return prev.filter(item => item !== name);
      } else {
        return [...prev, name];
      }
    });
  };

  const performJoinFamily = () => {
    // For now, we're just logging the lists. You can process them as needed.
    console.log('Child of:', selectedChildOfItems);
    console.log('Parent of:', selectedParentOfItems);

    if (
      selectedChildOfItems.length === 0 &&
      selectedParentOfItems.length === 0
    ) {
      Alert.alert(
        'Error',
        'You need to be related to at least one member to join.',
      );
      return;
    }

    if (!name) {
      Alert.alert('Error', 'You must have a name to join.');
      return;
    }

    const newMember = createFamilyMember({
      name: name,
      birthdate: birthdate,
      deathdate: deathdate || null,
      user: familyData.rootMember?.user,
      relationships: {
        children: [], // these will be populated in addMemberToTree
        parents: [],
        partner: [], // Assuming no partner is set during creation. Adjust if otherwise.
      },
    });

    const updatedRoot = addMemberToTree(
      toMergeData.rootMember,
      newMember,
      selectedChildOfItems,
      selectedParentOfItems,
    );

    //once we confirm that updatedRoot is in the correct format, set this familyData to updatedRoot
    setFamilyData(() => {
      //then, once familyData has been set, we ensure isFamilyAssociated is true
      setIsFamilyAssociated(true);
      saveFamilyDataToStorage({rootMember: updatedRoot});
      return {rootMember: updatedRoot};
    });
    setToMergeData(() => {
      return {rootMember: null};
    });
    //then, we broadcast the update to the rest of the members in the family.
  };

  const renderChildOfListItem = ({item}: {item: string}) => (
    <View style={styles.listItem}>
      <Text>{item}</Text>
      <CheckBox
        value={selectedChildOfItems.includes(item)}
        onValueChange={() => toggleChildOfSelection(item)}
      />
    </View>
  );

  const renderParentOfListItem = ({item}: {item: string}) => (
    <View style={styles.listItem}>
      <Text>{item}</Text>
      <CheckBox
        value={selectedParentOfItems.includes(item)}
        onValueChange={() => toggleParentOfSelection(item)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textField}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.textField}
        placeholder="Birthdate (YYYY-MM-DD)"
        value={birthdate}
        onChangeText={setBirthdate}
      />

      <TextInput
        style={styles.textField}
        placeholder="Deathdate (YYYY-MM-DD)"
        value={deathdate}
        onChangeText={setDeathdate}
      />
      <TouchableOpacity
        onPress={() => setParentModalVisible(true)}
        style={styles.modalToggle}>
        <Text style={styles.selectText}>I am the child of</Text>
        <Text style={styles.triangle}>▶</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setChildModalVisible(true)}
        style={styles.modalToggle}>
        <Text style={styles.selectText}>I am the parent of</Text>
        <Text style={styles.triangle}>▶</Text>
      </TouchableOpacity>

      {/* Parent Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={parentModalVisible}>
        <View style={styles.modalView}>
          <FlatList
            data={memberNames}
            renderItem={renderChildOfListItem}
            keyExtractor={item => item}
          />
          <TouchableOpacity
            onPress={() => setParentModalVisible(false)}
            style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Child Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={childModalVisible}>
        <View style={styles.modalView}>
          <FlatList
            data={memberNames}
            renderItem={renderParentOfListItem}
            keyExtractor={item => item}
          />
          <TouchableOpacity
            onPress={() => setChildModalVisible(false)}
            style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Join Family Button */}
      <TouchableOpacity onPress={performJoinFamily} style={styles.joinButton}>
        <Text style={styles.joinButtonText}>Join Family</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  modalToggle: {
    flexDirection: 'row', // to place text and triangle side by side
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'blue',
    borderRadius: 5,
  },
  selectText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  triangle: {
    fontSize: 20,
    marginLeft: 5,
  },
  modalView: {
    flex: 1,
    marginTop: 50,
    marginBottom: 50,
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginTop: 20,
  },
  closeButtonText: {
    fontSize: 16,
    textAlign: 'center',
  },
  joinButton: {
    padding: 15,
    backgroundColor: 'blue',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
  },
  textField: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 10,
    paddingLeft: 10,
    borderRadius: 5,
  },
});

export default NewMemberView;
