import { Bell, UserPlus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { useFriendships } from '@/hooks/useFriendships';
import { useChallenges } from '@/hooks/useChallenges';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { acceptFriendRequest, declineFriendRequest, pendingReceived } = useFriendships();
  const { acceptChallenge, declineChallenge } = useChallenges();
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'challenge_request':
        return '⚔️';
      case 'challenge_accepted':
        return '✅';
      case 'challenge_completed':
        return '🏆';
      case 'badge_earned':
        return '🎖️';
      case 'friend_request':
        return '👋';
      case 'friend_accepted':
        return '🤝';
      default:
        return '📢';
    }
  };

  const handleAction = (notification: any, action: 'accept' | 'decline') => {
    if (notification.type === 'friend_request' && notification.data?.friendship_id) {
      if (action === 'accept') {
        acceptFriendRequest(notification.data.friendship_id);
      } else {
        declineFriendRequest(notification.data.friendship_id);
      }
    } else if (notification.type === 'challenge_request' && notification.data?.challenge_id) {
      if (action === 'accept') {
        acceptChallenge(notification.data.challenge_id);
      } else {
        declineChallenge(notification.data.challenge_id);
      }
    }
    markAsRead(notification.id);
  };

  const isActionable = (notification: any) => {
    if (notification.type === 'friend_request') {
      // Check if this friend request is still pending
      return pendingReceived.some(p => p.id === notification.data?.friendship_id);
    }
    if (notification.type === 'challenge_request') {
      return !notification.is_read;
    }
    return false;
  };

  return (
    <>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={() => markAllAsRead()}
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 transition-colors cursor-pointer hover:bg-accent/50",
                    !notification.is_read && "bg-primary/5"
                  )}
                  onClick={() => {
                    if (!notification.is_read) markAsRead(notification.id);
                    setSelectedNotification(notification);
                  }}
                >
                  <div className="flex gap-3">
                    <span className="text-xl">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                      
                      {/* Action buttons for friend requests and challenges */}
                      {isActionable(notification) && (
                        <div className="flex gap-2 mt-2">
                          <Button 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => handleAction(notification, 'accept')}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => handleAction(notification, 'decline')}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                    {!notification.is_read && !isActionable(notification) && (
                      <div 
                        className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" 
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>

    <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedNotification && getNotificationIcon(selectedNotification.type)}
            {selectedNotification?.title}
          </DialogTitle>
          <DialogDescription>
            {selectedNotification && formatDistanceToNow(new Date(selectedNotification.created_at), { addSuffix: true })}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm">{selectedNotification?.message}</p>
        </div>
        {selectedNotification && isActionable(selectedNotification) && (
          <div className="flex gap-2 justify-end mt-4">
            <Button 
              size="sm" 
              onClick={() => {
                handleAction(selectedNotification, 'accept');
                setSelectedNotification(null);
              }}
            >
              <Check className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                handleAction(selectedNotification, 'decline');
                setSelectedNotification(null);
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Decline
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
};
