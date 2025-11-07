
import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import Notification from './Notification';

const NotificationPanel: React.FC = () => {
  const context = useContext(AppContext);

  if (!context) return null;

  const { notifications, removeNotification } = context;

  return (
    <div className="fixed top-5 right-5 z-[100] w-full max-w-sm space-y-3">
      {notifications.map(notif => (
        <Notification 
          key={notif.id}
          type={notif.type} 
          message={notif.message} 
          onClose={() => removeNotification(notif.id)} 
        />
      ))}
    </div>
  );
};

export default NotificationPanel;
