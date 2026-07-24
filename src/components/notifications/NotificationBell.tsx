import React, { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import { notificationService } from '../../services/notificationService';
import { AppNotification } from '../../types';
import { Link } from 'react-router';
import { Spinner } from '../ui/Spinner';

export function NotificationBell({ userId }: { userId?: string }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const unsubscribeCount = notificationService.subscribeToUnreadCount(userId, (count) => {
      setUnreadCount(count);
    });

    return () => unsubscribeCount();
  }, [userId]);

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      const unsubscribe = notificationService.subscribeToNotifications(userId, (data) => {
        setNotifications(data);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [isOpen, userId]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await notificationService.markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    await notificationService.markAllAsRead(userId);
  };

  if (!userId) return null;

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-current relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-transparent"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-background border border-border shadow-xl rounded-sm z-50 overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                <h3 className="font-semibold text-sm uppercase tracking-wider">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-8 flex justify-center"><Spinner /></div>
                ) : notifications.length > 0 ? (
                  <div className="divide-y divide-border">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-4 transition-colors relative group ${notification.read ? 'bg-background opacity-80' : 'bg-muted/10'}`}
                      >
                        {!notification.read && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-foreground" />
                        )}
                        <Link 
                          to={notification.link || '#'} 
                          onClick={() => {
                            if (!notification.read) {
                              notificationService.markAsRead(notification.id);
                            }
                            setIsOpen(false);
                          }}
                          className="block"
                        >
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider">{notification.title}</span>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                        </Link>
                        {!notification.read && (
                          <button 
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border rounded-full hover:bg-muted"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center flex flex-col items-center">
                    <Bell className="w-8 h-8 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No notifications yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
