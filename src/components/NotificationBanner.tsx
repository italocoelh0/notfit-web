



import React, { useEffect } from 'react';
import { Notification } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationBannerProps {
    notification: Notification | null;
    onDismiss: () => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ notification, onDismiss }) => {
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                onDismiss();
            }, 3000); // Auto-dismiss after 3 seconds

            return () => clearTimeout(timer);
        }
    }, [notification, onDismiss]);

    return (
        <AnimatePresence>
            {notification && (
                <motion.div
                    layout
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed top-4 left-0 right-0 z-[100] px-4"
                >
                    <div className="container mx-auto max-w-4xl">
                        <div className="bg-surface-100 border border-surface-200 text-on-surface rounded-lg shadow-lg p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <i className="fa-solid fa-bell text-primary"></i>
                                <p className="font-medium text-sm">{notification.message}</p>
                            </div>
                            <button onClick={onDismiss} className="text-on-surface-secondary hover:text-on-surface text-lg">&times;</button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotificationBanner;