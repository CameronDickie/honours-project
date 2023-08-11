import React, {createContext, useState, useContext, ReactNode} from 'react';

interface Notification {
  message: string;
  approve?: () => void; // Optional approve callback
  decline?: () => void; // Optional decline callback
}

interface NotificationContextProps {
  showNotification: (notification: Notification) => void; // Updated signature
  hideNotification: () => void;
  notification: Notification | null; // Updated to handle the Notification object
  isActive: boolean;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(
  undefined,
);

export const NotificationProvider: React.FC<{children: ReactNode}> = ({
  children,
}) => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);

  const showNotification = (notif: Notification) => {
    setNotification(notif);
    setIsActive(true);
  };

  const hideNotification = () => {
    setNotification(null);
    setIsActive(false);
  };

  return (
    <NotificationContext.Provider
      value={{showNotification, hideNotification, notification, isActive}}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider',
    );
  }
  return context;
};
