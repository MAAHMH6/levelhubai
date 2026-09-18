import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Target, 
  Shuffle, 
  Clock, 
  Zap,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface SubjectQuizTabProps {
  subjectId: string;
  subjectSlug: string;
  subjectName: string;
}

interface Topic {
  id: string;
  name: string;
  order_index: number;
  questionCount: number;
}

export const SubjectQuizTab = ({ subjectId, subjectSlug, subjectName }: SubjectQuizTabProps) => {
  const navigate = useNavigate();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  // Fetch topics for this subject with question counts
  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['subject-topics', subjectId],
    queryFn: async () => {
      const { data: topicsData, error } = await supabase
        .from('topics')
        .select(`
          id,
          name,
          order_index,
          quiz_questions(count)
        `)
        .eq('subject_id', subjectId)
        .order('order_index');

      if (error) throw error;

      return (topicsData || []).map(t => ({
        id: t.id,
        name: t.name,
        order_index: t.order_index,
        questionCount: t.quiz_questions?.[0]?.count || 0,
      })) as Topic[];
    },
    enabled: !!subjectId,
  });

  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const selectAll = () => {
    setSelectedTopics(topics.map(t => t.id));
  };

  const clearAll = () => {
    setSelectedTopics([]);
  };

  const startQuiz = (count: number) => {
    const topicParam = selectedTopics.length > 0 
      ? `&topics=${selectedTopics.join(',')}`
      : '';
    navigate(`/quiz?subject=${subjectSlug}&count=${count}${topicParam}&random=true`);
  };

  const totalQuestions = topics.reduce((sum, t) => sum + t.questionCount, 0);
  const selectedQuestionCount = selectedTopics.length > 0
    ? topics.filter(t => selectedTopics.includes(t.id)).reduce((sum, t) => sum + t.questionCount, 0)
    : totalQuestions;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {subjectName} Quiz
          </CardTitle>
          <Badge variant="secondary">
            {selectedQuestionCount} questions available
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Topic Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              Select Topics (leave empty for all)
            </h4>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[200px] pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {topics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Button
                    variant={selectedTopics.includes(topic.id) ? "default" : "outline"}
                    className="w-full justify-between h-auto py-3 px-4"
                    onClick={() => toggleTopic(topic.id)}
                  >
                    <span className="truncate text-left">{topic.name}</span>
                    <Badge 
                      variant={selectedTopics.includes(topic.id) ? "secondary" : "outline"}
                      className="ml-2 shrink-0"
                    >
                      {topic.questionCount}
                    </Badge>
                  </Button>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Quiz Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card 
            className="cursor-pointer hover:border-primary/50 transition-all hover:-translate-y-1"
            onClick={() => startQuiz(5)}
          >
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h4 className="font-semibold mb-1">Quick Quiz</h4>
              <p className="text-xs text-muted-foreground">5 random questions</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-accent/50 transition-all hover:-translate-y-1"
            onClick={() => startQuiz(10)}
          >
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <h4 className="font-semibold mb-1">Timed Challenge</h4>
              <p className="text-xs text-muted-foreground">10 questions</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-success/50 transition-all hover:-translate-y-1"
            onClick={() => startQuiz(20)}
          >
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shuffle className="h-5 w-5 text-success" />
              </div>
              <h4 className="font-semibold mb-1">Deep Practice</h4>
              <p className="text-xs text-muted-foreground">20 questions</p>
            </CardContent>
          </Card>
        </div>

        {topics.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No quiz topics available yet.</p>
            <p className="text-sm">Complete some lessons first!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
