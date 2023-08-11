import React from 'react';
import {View, Text, StyleSheet, Animated, TouchableOpacity} from 'react-native';

interface NotificationModalProps {
  notification: {
    message: string;
    approve?: () => void;
    decline?: () => void;
  } | null;
  isActive: boolean;
  hideNotification: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
  isActive,
  hideNotification,
}) => {
  // Use Animated library for slide-in effect (this is a basic implementation, you can enhance it)
  const position = new Animated.Value(isActive ? -100 : 0);

  Animated.timing(position, {
    toValue: isActive ? 0 : -100,
    duration: 500,
    useNativeDriver: false,
  }).start();

  if (!isActive || !notification) return null;

  return (
    <Animated.View style={[styles.notificationContainer, {top: position}]}>
      <Text style={styles.notificationText}>{notification.message}</Text>

      {notification.approve && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (notification.approve) notification.approve();
            hideNotification();
          }}>
          <Text style={styles.actionText}>✔️</Text>
        </TouchableOpacity>
      )}

      {notification.decline && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (notification.decline) notification.decline();
            hideNotification();
          }}>
          <Text style={styles.actionText}>❌</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F7F7F7', // Slightly darker white
    padding: 10,
    zIndex: 1000,
    borderColor: 'grey', // Grey stroke
    borderWidth: 1,
    borderRadius: 5, // Added for a smoother edge look
  },
  notificationText: {
    flex: 1,
    color: 'black', // Updated text color for visibility
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 5, // Added for better touch feel
    backgroundColor: '#E0E0E0', // Slightly darker than the notification background
    borderRadius: 5, // Rounded corners for the buttons
    marginLeft: 5, // Added space between message and buttons
  },
  actionText: {
    color: 'black', // Updated to black for better visibility
    fontSize: 18,
  },
});
