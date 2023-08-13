import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Tree from '../components/Tree';
import NewMemberView from './NewMemberView';

interface FamilyViewProps {
  screenHeight: number;
  screenWidth: number;
}

export const FamilyView: React.FC<FamilyViewProps> = ({
  screenHeight,
  screenWidth,
}) => {
  const [creatingFamilyMember, setCreatingFamilyMember] =
    useState<boolean>(false);

  const handlePlusPress = () => {
    setCreatingFamilyMember(true);
  };

  const handleCancelPress = () => {
    setCreatingFamilyMember(false);
  };

  return (
    <View style={{flex: 1}}>
      {creatingFamilyMember ? (
        <>
          <NewMemberView />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleCancelPress}
              activeOpacity={0.6}>
              <Text style={styles.iconText}>x</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Tree screenHeight={screenHeight} screenWidth={screenWidth} />
          {/* Buttons Container */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handlePlusPress}
              activeOpacity={0.6}>
              <Text style={styles.iconText}>+</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
