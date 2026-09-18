import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  Loader2, 
  User,
  MessageSquare,
  Lightbulb,
  Calculator,
  Maximize2,
  Minimize2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { parseAndValidateTutorResponse, formatTutorResponseAsHumanText } from '@/types/tutorTypes';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AITutorChatProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
  lessonTitle?: string;
  lessonId?: string;
  unitTitle?: string;
  subjectName?: string;
  subjectId?: string;
  qualification?: string;
}

const defaultSuggestedQuestions = [
  "How do I solve quadratic equations?",
  "Explain step by step how to find the derivative",
  "Help me understand trigonometric ratios",
  "What's the formula for compound interest?"
];

export const AITutorChat = ({ 
  isOpen, 
  onClose, 
  embedded = false,
  lessonTitle, 
  lessonId,
  unitTitle, 
  subjectName,
  subjectId,
  qualification = 'o_level'
}: AITutorChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<{id: string, name: string}[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>(subjectId);
  const [selectedSubjectName, setSelectedSubjectName] = useState<string | undefined>(subjectName);
  const [isMaximized, setIsMaximized] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeSubjectId = subjectId || selectedSubjectId;
  const activeSubjectName = subjectName || selectedSubjectName || 'General';

  // Load history on mount
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('ai_tutor_chat_history');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch (e) {
        console.error('Failed to load chat history', e);
      }
    }
  }, [isOpen]);

  // Save history on change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('ai_tutor_chat_history', JSON.stringify(messages));
    } else {
      localStorage.removeItem('ai_tutor_chat_history');
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && !subjectId && subjects.length === 0) {
      // Fetch subjects if opened globally
      const fetchSubjects = async () => {
        const { data } = await supabase.from('subjects').select('id, name').order('name');
        if (data) setSubjects(data);
      };
      fetchSubjects();
    }
  }, [isOpen, subjectId, subjects.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    import('@/lib/analytics').then(({ track }) => track('ai_tutor_used', { subject: activeSubjectName, unit: unitTitle, lesson: lessonTitle }));


    let assistantContent = '';

    try {
      const qualName = qualification === 'a_level' ? 'A Level' : qualification === 'igcse' ? 'IGCSE' : 'O Level';
      const context = `You are an AI tutor helping a student with Cambridge ${qualName} ${activeSubjectName}${
        unitTitle ? ` (Unit: ${unitTitle})` : ''
      }${lessonTitle ? ` (Lesson: ${lessonTitle})` : ''}.`;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMsg],
            context,
            lessonId,
            subjectId: activeSubjectId,
            subjectName: activeSubjectName
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Rate limit exceeded. Please wait a moment and try again.');
          setIsLoading(false);
          return;
        }
        if (response.status === 402) {
          toast.error('AI credits exhausted. Please try again later.');
          setIsLoading(false);
          return;
        }
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => 
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: 'assistant', content: assistantContent }];
              });
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // After streaming completes, validate structured model output and format into human person-to-person tutoring
      const validated = parseAndValidateTutorResponse(assistantContent);
      if (validated) {
        const humanFriendly = formatTutorResponseAsHumanText(validated);
        setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: humanFriendly } : m));
      }
    } catch (error) {
      console.error('AI Tutor error:', error);
      toast.error('Failed to get response. Please try again.');
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const chatCard = (
    <Card className={cn(
      "h-full flex flex-col overflow-hidden",
      embedded 
        ? "w-full h-[650px] md:h-[720px] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900" 
        : "shadow-2xl border-2"
    )}>
      <CardHeader className={cn(
        "pb-3",
        embedded 
          ? "bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800" 
          : "bg-gradient-to-r from-primary/10 to-accent/10"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white shadow-xs">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">AI {activeSubjectName} Tutor</CardTitle>
              <p className="text-xs text-muted-foreground">
                Step-by-step problem solving & mark scheme explanations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button 
                variant="ghost" 
                size="icon" 
                title="Clear History"
                onClick={() => {
                  setMessages([]);
                  localStorage.removeItem('ai_tutor_chat_history');
                }}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
            {!embedded && (
              <>
                <Button variant="ghost" size="icon" onClick={() => setIsMaximized(!isMaximized)}>
                  {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
              
              {!subjectId && (
                <div className="mt-4">
                  <Select 
                    value={selectedSubjectId} 
                    onValueChange={(val) => {
                      setSelectedSubjectId(val);
                      setSelectedSubjectName(subjects.find(s => s.id === val)?.name);
                    }}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select a subject..." />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(lessonTitle || unitTitle) && (
                <div className="flex gap-2 mt-2">
                  {unitTitle && <Badge variant="secondary">{unitTitle}</Badge>}
                  {lessonTitle && <Badge variant="outline">{lessonTitle}</Badge>}
                </div>
              )}
            </CardHeader>

            <CardContent className="p-0 flex-1 flex flex-col min-h-0">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calculator className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Ask me anything!</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      I'll solve problems step-by-step and explain the concepts.
                    </p>
                    <div className="space-y-2">
                      {defaultSuggestedQuestions.slice(0, 2).map((q, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left h-auto py-2"
                          onClick={() => sendMessage(q)}
                        >
                          <Lightbulb className="h-4 w-4 mr-2 shrink-0 text-accent" />
                          <span className="truncate">{q}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex gap-3",
                          msg.role === 'user' ? "justify-end" : "justify-start"
                        )}
                      >
                        {msg.role === 'assistant' && (
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2 max-w-[85%]",
                            msg.role === 'user'
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          <div className="text-sm whitespace-pre-wrap leading-relaxed">
                            {msg.role === 'assistant' ? (() => {
                              const v = parseAndValidateTutorResponse(msg.content);
                              return v ? formatTutorResponseAsHumanText(v) : msg.content;
                            })() : msg.content}
                          </div>
                        </div>
                        {msg.role === 'user' && (
                          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center shrink-0">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && messages[messages.length - 1]?.role === 'user' && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div className="bg-muted rounded-2xl px-4 py-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t mt-auto">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Type your ${activeSubjectName.toLowerCase()} question...`}
                    className="min-h-[44px] max-h-[120px] resize-none"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={() => sendMessage()} 
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="shrink-0"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
  );

  if (embedded) {
    return chatCard;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={cn(
            "fixed z-50 transition-all duration-300 ease-in-out",
            isMaximized 
              ? "inset-4 md:inset-8" 
              : "bottom-4 right-4 w-[400px] max-w-[calc(100vw-2rem)]"
          )}
        >
          {chatCard}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
