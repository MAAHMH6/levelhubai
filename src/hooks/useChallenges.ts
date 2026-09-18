import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Challenge {
  id: string;
  challenger_id: string;
  challenged_id: string;
  subject_id: string | null;
  status: string;
  question_count: number;
  challenger_score: number;
  challenged_score: number;
  challenger_completed_at: string | null;
  challenged_completed_at: string | null;
  winner_id: string | null;
  winner_xp: number;
  loser_xp: number;
  created_at: string;
  expires_at: string;
  completed_at: string | null;
}

export const useChallenges = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['challenges', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .or(`challenger_id.eq.${user?.id},challenged_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Challenge[];
    },
    enabled: !!user,
  });

  const pendingChallenges = challenges.filter(
    c => c.status === 'pending' && c.challenged_id === user?.id
  );

  const activeChallenges = challenges.filter(
    c => c.status === 'in_progress' || c.status === 'accepted'
  );

  const createChallenge = useMutation({
    mutationFn: async ({ 
      challengedId, 
      subjectId 
    }: { 
      challengedId: string; 
      subjectId?: string;
    }) => {
      const { data, error } = await supabase
        .from('challenges')
        .insert({
          challenger_id: user?.id,
          challenged_id: challengedId,
          subject_id: subjectId || null,
          question_count: 10,
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification for the challenged user
      await supabase.from('notifications').insert({
        user_id: challengedId,
        type: 'challenge_request',
        title: 'New Challenge!',
        message: 'Someone has challenged you to a quiz battle!',
        data: { challenge_id: data.id },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast.success('Challenge sent!');
    },
    onError: () => {
      toast.error('Failed to send challenge');
    },
  });

  const acceptChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      const { data, error } = await supabase
        .from('challenges')
        .update({ status: 'accepted' })
        .eq('id', challengeId)
        .select()
        .single();

      if (error) throw error;

      // Notify challenger
      await supabase.from('notifications').insert({
        user_id: data.challenger_id,
        type: 'challenge_accepted',
        title: 'Challenge Accepted!',
        message: 'Your challenge has been accepted! Start the battle now.',
        data: { challenge_id: challengeId },
      });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast.success('Challenge accepted! Starting battle...');
      // Navigate to battle page
      window.location.href = `/challenge/${data.id}`;
    },
  });

  const declineChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      const { error } = await supabase
        .from('challenges')
        .update({ status: 'declined' })
        .eq('id', challengeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast.success('Challenge declined');
    },
  });

  const completeChallenge = useMutation({
    mutationFn: async ({ 
      challengeId, 
      score 
    }: { 
      challengeId: string; 
      score: number;
    }) => {
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) throw new Error('Challenge not found');

      const isChallenger = challenge.challenger_id === user?.id;
      const updateData = isChallenger
        ? { challenger_score: score, challenger_completed_at: new Date().toISOString() }
        : { challenged_score: score, challenged_completed_at: new Date().toISOString() };

      const { data, error } = await supabase
        .from('challenges')
        .update(updateData)
        .eq('id', challengeId)
        .select()
        .single();

      if (error) throw error;

      // Check if both completed
      if (data.challenger_completed_at && data.challenged_completed_at) {
        const winnerId = data.challenger_score > data.challenged_score 
          ? data.challenger_id 
          : data.challenged_score > data.challenger_score
          ? data.challenged_id
          : null;

        await supabase
          .from('challenges')
          .update({ 
            status: 'completed',
            winner_id: winnerId,
            completed_at: new Date().toISOString()
          })
          .eq('id', challengeId);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });

  return {
    challenges,
    pendingChallenges,
    activeChallenges,
    isLoading,
    createChallenge: createChallenge.mutate,
    acceptChallenge: acceptChallenge.mutate,
    declineChallenge: declineChallenge.mutate,
    completeChallenge: completeChallenge.mutate,
    isCreating: createChallenge.isPending,
  };
};
