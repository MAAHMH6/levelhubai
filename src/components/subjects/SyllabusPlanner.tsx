import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { BookOpen, CheckCircle, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Topic {
  id: string;
  name: string;
  order_index: number;
  lesson_id?: string | null;
}

interface Lesson {
  id: string;
  title: string;
  unit_id: string;
}

interface Unit {
  id: string;
  title: string;
  unit_number: number;
}

export function SyllabusPlanner({ subjectId }: { subjectId: string }) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  
  const [topicProgress, setTopicProgress] = useState<Record<string, boolean>>({});
  const [lessonProgress, setLessonProgress] = useState<Record<string, boolean>>({});
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (subjectId) {
      loadData();
    }
  }, [subjectId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Curriculum Hierarchy
      const [uRes, lRes, tRes] = await Promise.all([
        supabase.from('units').select('id, title, unit_number').eq('subject_id', subjectId).order('unit_number'),
        supabase.from('lessons').select('id, title, unit_id').order('lesson_number'),
        supabase.from('topics').select('id, name, order_index, lesson_id').eq('subject_id', subjectId).order('order_index')
      ]);

      if (uRes.error) throw uRes.error;
      
      const fetchedUnits = uRes.data || [];
      const unitIds = fetchedUnits.map(u => u.id);
      
      const fetchedLessons = (lRes.data || []).filter(l => unitIds.includes(l.unit_id));
      const fetchedTopics = tRes.data || [];
      
      setUnits(fetchedUnits);
      setLessons(fetchedLessons);
      
      // Filter out the dummy "Curriculum Content" if it's the only one and has no lesson_id
      const validTopics = fetchedTopics.filter(t => t.lesson_id || fetchedTopics.length > 1);
      setTopics(validTopics);

      // 2. Fetch Progress
      const topicIds = validTopics.map(t => t.id);
      const lessonIds = fetchedLessons.map(l => l.id);

      const [tpRes, lpRes] = await Promise.all([
        topicIds.length > 0 ? supabase.from('student_topic_progress').select('topic_id, is_completed').eq('student_id', user.id).in('topic_id', topicIds) : Promise.resolve({ data: [] }),
        lessonIds.length > 0 ? supabase.from('lesson_progress').select('lesson_id, lesson_completed').eq('user_id', user.id).in('lesson_id', lessonIds) : Promise.resolve({ data: [] })
      ]);

      const tpMap: Record<string, boolean> = {};
      (tpRes.data || []).forEach((p: any) => tpMap[p.topic_id] = p.is_completed);
      setTopicProgress(tpMap);

      const lpMap: Record<string, boolean> = {};
      (lpRes.data || []).forEach((p: any) => lpMap[p.lesson_id] = p.lesson_completed);
      setLessonProgress(lpMap);

    } catch (e: any) {
      console.error(e);
      toast({ title: "Error loading syllabus", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = async (topicId: string, currentStatus: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newStatus = !currentStatus;
      setTopicProgress(prev => ({ ...prev, [topicId]: newStatus }));

      const { error } = await supabase
        .from('student_topic_progress')
        .upsert({
          student_id: user.id,
          topic_id: topicId,
          is_completed: newStatus,
          completed_at: newStatus ? new Date().toISOString() : null
        }, { onConflict: 'student_id,topic_id' });

      if (error) throw error;
      
      if (newStatus) toast({ title: "Topic Completed!", duration: 2000 });
    } catch (e: any) {
      setTopicProgress(prev => ({ ...prev, [topicId]: currentStatus }));
      toast({ title: "Failed to update", description: e.message, variant: "destructive" });
    }
  };

  const toggleLesson = async (lessonId: string, currentStatus: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newStatus = !currentStatus;
      setLessonProgress(prev => ({ ...prev, [lessonId]: newStatus }));

      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          lesson_completed: newStatus,
          lesson_completed_at: newStatus ? new Date().toISOString() : null
        }, { onConflict: 'user_id,lesson_id' });

      if (error) throw error;
      
      if (newStatus) toast({ title: "Lesson Mastered!", duration: 2000 });
    } catch (e: any) {
      setLessonProgress(prev => ({ ...prev, [lessonId]: currentStatus }));
      toast({ title: "Failed to update", description: e.message, variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="py-8 text-center text-muted-foreground animate-pulse">Loading syllabus...</div>;
  }

  if (units.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <BookOpen className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-4" />
          <p className="text-muted-foreground">No syllabus mapped for this subject yet.</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate overall progress based on checkable items (topics if present, otherwise lessons)
  let totalItems = 0;
  let completedItems = 0;

  lessons.forEach(lesson => {
    const lessonTopics = topics.filter(t => t.lesson_id === lesson.id);
    if (lessonTopics.length > 0) {
      totalItems += lessonTopics.length;
      completedItems += lessonTopics.filter(t => topicProgress[t.id]).length;
    } else {
      totalItems += 1;
      if (lessonProgress[lesson.id]) completedItems += 1;
    }
  });

  const progressPercent = Math.round((completedItems / (totalItems || 1)) * 100) || 0;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-card to-card/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                Syllabus Tracker
              </CardTitle>
              <CardDescription>Keep track of the official curriculum you have mastered.</CardDescription>
            </div>
            <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg border">
              <Badge variant={progressPercent === 100 ? "default" : "secondary"} className="text-sm">
                {completedItems} / {totalItems}
              </Badge>
              <div className="flex-col gap-1 hidden sm:flex">
                <div className="w-32">
                  <Progress value={progressPercent} className="h-2" />
                </div>
                <span className="text-xs text-muted-foreground text-right">{progressPercent}% Done</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full space-y-4" defaultValue={[units[0]?.id]}>
            {units.map((unit) => {
              const unitLessons = lessons.filter(l => l.unit_id === unit.id);
              
              // Calculate unit specific progress
              let uTotal = 0;
              let uCompleted = 0;
              unitLessons.forEach(l => {
                const lTopics = topics.filter(t => t.lesson_id === l.id);
                if (lTopics.length > 0) {
                  uTotal += lTopics.length;
                  uCompleted += lTopics.filter(t => topicProgress[t.id]).length;
                } else {
                  uTotal += 1;
                  if (lessonProgress[l.id]) uCompleted += 1;
                }
              });
              const uProgress = Math.round((uCompleted / (uTotal || 1)) * 100) || 0;

              return (
                <AccordionItem key={unit.id} value={unit.id} className="border rounded-lg bg-card overflow-hidden">
                  <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 transition-colors hover:no-underline group">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          U{unit.unit_number}
                        </div>
                        <span className="font-semibold text-left">{unit.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-normal text-muted-foreground">
                        <span className="hidden sm:inline">{uCompleted}/{uTotal}</span>
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${uProgress}%` }} />
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="bg-muted/20 border-t pb-0">
                    <div className="divide-y">
                      {unitLessons.map((lesson, i) => {
                        const lessonTopics = topics.filter(t => t.lesson_id === lesson.id);
                        
                        if (lessonTopics.length === 0) {
                          // No topics mapped -> Check off the lesson itself
                          const isCompleted = !!lessonProgress[lesson.id];
                          return (
                            <motion.div
                              key={lesson.id}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.02 }}
                              className={`flex items-start space-x-3 p-4 transition-colors ${
                                isCompleted ? 'bg-primary/5' : 'hover:bg-muted/50'
                              }`}
                            >
                              <Checkbox 
                                id={`lesson-${lesson.id}`} 
                                checked={isCompleted}
                                onCheckedChange={() => toggleLesson(lesson.id, isCompleted)}
                                className="mt-1"
                              />
                              <div className="grid gap-1.5 leading-none cursor-pointer flex-1" onClick={() => toggleLesson(lesson.id, isCompleted)}>
                                <label
                                  htmlFor={`lesson-${lesson.id}`}
                                  className={`text-sm md:text-base font-medium cursor-pointer ${
                                    isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
                                  }`}
                                >
                                  {lesson.title}
                                </label>
                              </div>
                              {isCompleted && <CheckCircle className="h-5 w-5 text-primary" />}
                            </motion.div>
                          );
                        }

                        // Has topics mapped -> Render lesson as header, topics as checkboxes
                        return (
                          <div key={lesson.id} className="p-4 space-y-3">
                            <h4 className="font-medium text-sm text-foreground/80 flex items-center gap-2">
                              {lesson.title}
                            </h4>
                            <div className="space-y-2 pl-2">
                              {lessonTopics.map(topic => {
                                const isCompleted = !!topicProgress[topic.id];
                                return (
                                  <div key={topic.id} className="flex items-start space-x-3 group">
                                    <Checkbox 
                                      id={`topic-${topic.id}`} 
                                      checked={isCompleted}
                                      onCheckedChange={() => toggleTopic(topic.id, isCompleted)}
                                      className="mt-0.5"
                                    />
                                    <label
                                      htmlFor={`topic-${topic.id}`}
                                      className={`text-sm cursor-pointer select-none flex-1 transition-colors ${
                                        isCompleted ? 'text-muted-foreground line-through' : 'text-foreground group-hover:text-primary'
                                      }`}
                                    >
                                      {topic.name}
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
