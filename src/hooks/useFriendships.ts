import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useEffect } from 'react';

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
  profile?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    level: number;
    xp_points: number;
  };
}

export const useFriendships = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch friendships where user is either sender or receiver
  const { data: friendships = [], isLoading } = useQuery({
    queryKey: ['friendships', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`user_id.eq.${user?.id},friend_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Friend[];
    },
    enabled: !!user,
  });

  // Real-time subscription for friendship updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`friendships:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `friend_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['friendships', user.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['friendships', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  // Get accepted friends (the user ID that is not the current user)
  const friends = friendships
    .filter(f => f.status === 'accepted')
    .map(f => f.user_id === user?.id ? f.friend_id : f.user_id);

  // Get pending friend requests received
  const pendingReceived = friendships.filter(
    f => f.status === 'pending' && f.friend_id === user?.id
  );

  // Get pending friend requests sent
  const pendingSent = friendships.filter(
    f => f.status === 'pending' && f.user_id === user?.id
  );

  // Send a friend request
  const sendFriendRequest = useMutation({
    mutationFn: async (friendId: string) => {
      // Check if friendship already exists
      const existing = friendships.find(
        f => (f.user_id === user?.id && f.friend_id === friendId) ||
             (f.friend_id === user?.id && f.user_id === friendId)
      );

      if (existing) {
        throw new Error('Friend request already exists');
      }

      const { data, error } = await supabase
        .from('friendships')
        .insert({
          user_id: user?.id,
          friend_id: friendId,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification for the friend
      await supabase.from('notifications').insert({
        user_id: friendId,
        type: 'friend_request',
        title: 'New Friend Request!',
        message: 'Someone wants to be your friend!',
        data: { friendship_id: data.id },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      toast.success('Friend request sent!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send friend request');
    },
  });

  // Accept a friend request
  const acceptFriendRequest = useMutation({
    mutationFn: async (friendshipId: string) => {
      const friendship = friendships.find(f => f.id === friendshipId);
      if (!friendship) throw new Error('Friendship not found');

      const { data, error } = await supabase
        .from('friendships')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', friendshipId)
        .select()
        .single();

      if (error) throw error;

      // Notify the requester
      await supabase.from('notifications').insert({
        user_id: friendship.user_id,
        type: 'friend_accepted',
        title: 'Friend Request Accepted!',
        message: 'Your friend request has been accepted!',
        data: { friendship_id: friendshipId },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      toast.success('Friend request accepted!');
    },
    onError: () => {
      toast.error('Failed to accept friend request');
    },
  });

  // Decline a friend request
  const declineFriendRequest = useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'declined', updated_at: new Date().toISOString() })
        .eq('id', friendshipId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      toast.success('Friend request declined');
    },
    onError: () => {
      toast.error('Failed to decline friend request');
    },
  });

  // Check if a user is a friend
  const isFriend = (userId: string) => friends.includes(userId);

  // Check if there's a pending request
  const hasPendingRequest = (userId: string) => {
    return friendships.some(
      f => f.status === 'pending' && 
           ((f.user_id === user?.id && f.friend_id === userId) ||
            (f.friend_id === user?.id && f.user_id === userId))
    );
  };

  return {
    friendships,
    friends,
    pendingReceived,
    pendingSent,
    isLoading,
    sendFriendRequest: sendFriendRequest.mutate,
    acceptFriendRequest: acceptFriendRequest.mutate,
    declineFriendRequest: declineFriendRequest.mutate,
    isSending: sendFriendRequest.isPending,
    isFriend,
    hasPendingRequest,
  };
};
