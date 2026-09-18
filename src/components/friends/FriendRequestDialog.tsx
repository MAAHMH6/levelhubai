import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Search, 
  User, 
  Loader2,
  UserPlus,
  Check,
  X,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFriendships } from '@/hooks/useFriendships';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface FriendRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FriendRequestDialog = ({ open, onOpenChange }: FriendRequestDialogProps) => {
  const { user } = useAuth();
  const { 
    pendingReceived, 
    pendingSent,
    friends,
    sendFriendRequest, 
    acceptFriendRequest, 
    declineFriendRequest,
    isSending,
    isFriend,
    hasPendingRequest
  } = useFriendships();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch users for adding friends
  const { data: searchResults = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users-for-friends', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, level, xp_points')
        .neq('id', user?.id)
        .ilike('display_name', `%${searchQuery}%`)
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: open && searchQuery.trim().length > 0,
  });

  // Fetch profiles for pending received requests
  const { data: pendingProfiles = [] } = useQuery({
    queryKey: ['pending-friend-profiles', pendingReceived.map(p => p.user_id)],
    queryFn: async () => {
      if (pendingReceived.length === 0) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, level, xp_points')
        .in('id', pendingReceived.map(p => p.user_id));

      if (error) throw error;
      return data;
    },
    enabled: pendingReceived.length > 0,
  });

  // Fetch profiles for friends list
  const { data: friendProfiles = [] } = useQuery({
    queryKey: ['friend-profiles', friends],
    queryFn: async () => {
      if (friends.length === 0) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, level, xp_points')
        .in('id', friends);

      if (error) throw error;
      return data;
    },
    enabled: friends.length > 0,
  });

  const handleAddFriend = (userId: string) => {
    sendFriendRequest(userId);
  };

  const getButtonState = (userId: string) => {
    if (isFriend(userId)) {
      return { text: 'Friends', variant: 'secondary' as const, disabled: true, icon: Check };
    }
    if (hasPendingRequest(userId)) {
      return { text: 'Pending', variant: 'outline' as const, disabled: true, icon: Clock };
    }
    return { text: 'Add Friend', variant: 'default' as const, disabled: false, icon: UserPlus };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Friends
          </DialogTitle>
          <DialogDescription>
            Manage your friends and send friend requests
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends">
              Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="relative">
              Requests
              {pendingReceived.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {pendingReceived.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="add">Add</TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-4">
            <ScrollArea className="h-[300px]">
              {friendProfiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No friends yet</p>
                  <p className="text-sm">Add friends to challenge them!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {friendProfiles.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center gap-3 p-3 rounded-lg border"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={friend.avatar_url || undefined} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {friend.display_name || 'Anonymous'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Level {friend.level} • {friend.xp_points} XP
                        </p>
                      </div>
                      <Badge variant="secondary">
                        <Check className="h-3 w-3 mr-1" />
                        Friend
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="requests" className="mt-4">
            <ScrollArea className="h-[300px]">
              {pendingReceived.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No pending requests</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingReceived.map((request) => {
                    const profile = pendingProfiles.find(p => p.id === request.user_id);
                    return (
                      <div
                        key={request.id}
                        className="flex items-center gap-3 p-3 rounded-lg border"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={profile?.avatar_url || undefined} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {profile?.display_name || 'Anonymous'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Level {profile?.level || 1} • {profile?.xp_points || 0} XP
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            onClick={() => acceptFriendRequest(request.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => declineFriendRequest(request.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="add" className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <ScrollArea className="h-[250px]">
              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : searchQuery.trim() === '' ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Search for users to add</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No users found
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((u) => {
                    const buttonState = getButtonState(u.id);
                    const Icon = buttonState.icon;
                    
                    return (
                      <div
                        key={u.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border"
                        )}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={u.avatar_url || undefined} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {u.display_name || 'Anonymous'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Level {u.level} • {u.xp_points} XP
                          </p>
                        </div>
                        <Button 
                          size="sm"
                          variant={buttonState.variant}
                          disabled={buttonState.disabled || isSending}
                          onClick={() => handleAddFriend(u.id)}
                        >
                          {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Icon className="h-4 w-4 mr-1" />
                              {buttonState.text}
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
