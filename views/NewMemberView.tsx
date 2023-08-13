import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import {
  useFamilyData,
  extractAttributesFromTree,
} from '../components/FamilyDataContext';

const NewMemberView: React.FC = () => {
  const {toMergeData} = useFamilyData();

  const [parentModalVisible, setParentModalVisible] = useState(false);
  const [childModalVisible, setChildModalVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const memberNames = extractAttributesFromTree(toMergeData.rootMember, [
    'name',
  ]).map(member => member.name);

  const toggleItemSelection = (name: string) => {
    setSelectedItems(prev => {
      if (prev.includes(name)) {
        return prev.filter(item => item !== name);
      } else {
        return [...prev, name];
      }
    });
  };

  const renderListItem = ({item}: {item: string}) => (
    <View style={styles.listItem}>
      <Text>{item}</Text>
      <CheckBox
        value={selectedItems.includes(item)}
        onValueChange={() => toggleItemSelection(item)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
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
            renderItem={renderListItem}
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
            renderItem={renderListItem}
            keyExtractor={item => item}
          />
          <TouchableOpacity
            onPress={() => setChildModalVisible(false)}
            style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    marginBottom: 20,
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
});

export default NewMemberView;
