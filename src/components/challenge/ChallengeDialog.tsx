import { useState, useMemo } from 'react';
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
import { 
  Swords, 
  Search, 
  User, 
  Loader2,
  Shuffle,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useChallenges } from '@/hooks/useChallenges';
import { useFriendships } from '@/hooks/useFriendships';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface Subject {
  id: string;
  name: string;
  color: string;
  subscription_tier: string;
}

interface ChallengeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  onOpenFriends?: () => void;
}

export const ChallengeDialog = ({ open, onOpenChange, subjects, onOpenFriends }: ChallengeDialogProps) => {
  const { user } = useAuth();
  const { createChallenge, isCreating } = useChallenges();
  const { friends } = useFriendships();
  const [step, setStep] = useState<'subject' | 'friend'>('subject');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch user profile to check subscription
  const { data: profile } = useQuery({
    queryKey: ['profile-subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const isFreePlan = !profile?.subscription_plan || profile.subscription_plan === 'free';
  
  const availableSubjects = useMemo(() => {
    const filtered = isFreePlan 
      ? subjects.filter(s => s.subscription_tier === 'free' || (s as any).is_premium === false)
      : subjects;
    
    // Sort free subjects in order: Mathematics, Physics, ICT
    const order = ["Mathematics", "Physics", "Information and Communication Technology", "ICT"];
    return filtered.sort((a, b) => {
      const aIndex = order.findIndex(o => a.name.toLowerCase().includes(o.toLowerCase()));
      const bIndex = order.findIndex(o => b.name.toLowerCase().includes(o.toLowerCase()));
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }, [subjects, isFreePlan]);

  // Fetch friend profiles for challenging
  const { data: friendProfiles = [], isLoading: friendsLoading } = useQuery({
    queryKey: ['friend-profiles-for-challenge', friends, searchQuery],
    queryFn: async () => {
      if (friends.length === 0) return [];
      
      let query = supabase
        .from('profiles')
        .select('id, display_name, avatar_url, level, xp_points')
        .in('id', friends);

      if (searchQuery) {
        query = query.ilike('display_name', `%${searchQuery}%`);
      }

      const { data, error } = await query.order('xp_points', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: open && step === 'friend' && friends.length > 0,
  });

  const handleSelectSubject = (subjectId: string | null) => {
    setSelectedSubject(subjectId);
    setStep('friend');
  };

  const handleChallenge = (userId: string) => {
    createChallenge(
      { challengedId: userId, subjectId: selectedSubject || undefined },
      {
        onSuccess: () => {
          onOpenChange(false);
          setStep('subject');
          setSelectedSubject(null);
        },
      }
    );
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep('subject');
    setSelectedSubject(null);
    setSearchQuery('');
  };

  const handleOpenFriends = () => {
    handleClose();
    onOpenFriends?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            {step === 'subject' ? 'Choose Subject' : 'Challenge a Friend'}
          </DialogTitle>
          <DialogDescription>
            {step === 'subject' 
              ? 'Select a subject for the challenge or mix all subjects'
              : 'Choose a friend to challenge to a quiz battle!'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'subject' ? (
          <div className="space-y-3 py-4">
            {availableSubjects.map((subject) => (
              <Button
                key={subject.id}
                variant="outline"
                className="w-full justify-start gap-3 h-12"
                onClick={() => handleSelectSubject(subject.id)}
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: subject.color }}
                />
                <span className="font-medium">{subject.name}</span>
              </Button>
            ))}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>
            <Button 
              variant="default" 
              className="w-full gap-2"
              onClick={() => handleSelectSubject(null)}
            >
              <Shuffle className="h-4 w-4" />
              Mix All Subjects
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {friends.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            )}

            <ScrollArea className="h-[300px]">
              {friendsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">
                    You need friends to challenge!
                  </p>
                  <Button onClick={handleOpenFriends}>
                    <Users className="h-4 w-4 mr-2" />
                    Add Friends
                  </Button>
                </div>
              ) : friendProfiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No friends found matching your search
                </div>
              ) : (
                <div className="space-y-2">
                  {friendProfiles.map((u) => (
                    <div
                      key={u.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        "hover:bg-muted/50 hover:border-primary/50"
                      )}
                      onClick={() => handleChallenge(u.id)}
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
                      {isCreating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Swords className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setStep('subject')}
            >
              Back to Subject Selection
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
