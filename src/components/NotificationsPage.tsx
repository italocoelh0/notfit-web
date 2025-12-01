

import React from 'react';
import { AppNotification, UserData } from '../types';
import { motion } from 'framer-motion';

interface NotificationsPageProps {
  notifications: AppNotification[];
  currentUser: UserData;
  onFollowToggle: (targetUserId: string) => void;
  onViewProfile: (userId: string) => void;
}

interface NotificationItemProps {
  notification: AppNotification;
  isFollowing: boolean;
  onFollowToggle: (id: string) => void;
  onViewProfile: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, isFollowing, onFollowToggle, onViewProfile }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 p-4 bg-surface-100 rounded-lg"
    >
      <div className="w-12 h-12 bg-surface-200 rounded-full flex-shrink-0 overflow-hidden cursor-pointer" onClick={() => onViewProfile(notification.fromUserId)}>
        {notification.fromUserAvatar.startsWith('data:image') ? (
            <img src={notification.fromUserAvatar} alt={notification.fromUserName} className="w-full h-full object-cover" />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">{notification.fromUserAvatar}</div>
        )}
      </div>
      <div className="flex-1 cursor-pointer" onClick={() => onViewProfile(notification.fromUserId)}>
        <p className="text-sm">
          <span className="font-semibold">{notification.fromUserName}</span> começou a seguir você.
        </p>
        <p className="text-xs text-on-surface-secondary">
          {new Date(notification.timestamp).toLocaleDateString()}
        </p>
      </div>
      <button 
        onClick={() => onFollowToggle(notification.fromUserId)}
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isFollowing ? 'bg-surface-200 text-on-surface' : 'bg-primary text-white'}`}
      >
        {isFollowing ? 'Seguindo' : 'Seguir de volta'}
      </button>
    </motion.div>
  );
};

const NotificationsPage: React.FC<NotificationsPageProps> = ({ notifications, currentUser, onFollowToggle, onViewProfile }) => {
  return (
    <div>
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-surface-100 rounded-lg">
          <i className="fa-regular fa-bell-slash text-5xl text-on-surface-secondary mb-4"></i>
          <h3 className="text-xl font-bold">Nenhuma notificação</h3>
          <p className="text-on-surface-secondary text-center">
            Suas notificações sobre novos seguidores aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(noti => {
            const isFollowing = currentUser.followingIds.includes(noti.fromUserId);
            return (
              <NotificationItem 
                key={noti.id}
                notification={noti}
                isFollowing={isFollowing}
                onFollowToggle={onFollowToggle}
                onViewProfile={onViewProfile}
              />
            )
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;