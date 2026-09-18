import { motion } from 'framer-motion';
import { Award, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BadgeCard } from './BadgeCard';
import { useBadges } from '@/hooks/useBadges';
import { useNavigate } from 'react-router-dom';

interface RecentBadgesProps {
  limit?: number;
  showViewAll?: boolean;
}

export const RecentBadges = ({ limit = 4, showViewAll = true }: RecentBadgesProps) => {
  const { userBadges, allBadges, isLoading } = useBadges();
  const navigate = useNavigate();

  const recentBadges = userBadges.slice(0, limit);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-5 bg-muted rounded w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 justify-center">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="w-16 h-16 rounded-full bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recentBadges.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Recent Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Award className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Complete activities to earn badges!</p>
            <p className="text-xs mt-1">{allBadges.length} badges to unlock</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Recent Badges
          </CardTitle>
          {showViewAll && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => navigate('/learn')}
            >
              View All
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 justify-center flex-wrap">
          {recentBadges.map((userBadge, index) => (
            <motion.div
              key={userBadge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <BadgeCard
                badge={userBadge.badge}
                earned={true}
                earnedAt={userBadge.earned_at}
                size="sm"
                showProgress={false}
              />
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
