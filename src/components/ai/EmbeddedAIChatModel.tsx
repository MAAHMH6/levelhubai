import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  BookOpen, 
  CheckCircle, 
  Lightbulb, 
  HelpCircle,
  Clock,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { featureStorage } from '@/integrations/supabase/featureClient';

interface Message {
  id: string;
  sender: 'ai' | 'student';
  text: string;
  timestamp: string;
}

interface EmbeddedAIChatModelProps {
  subjectName: string;
  syllabusCode?: string;
  programmeLabel: string;
  topicTitle?: string;
  studentName: string;
}

export const EmbeddedAIChatModel: React.FC<EmbeddedAIChatModelProps> = ({
  subjectName,
  syllabusCode,
  programmeLabel,
  topicTitle,
  studentName,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hello ${studentName}! I am your Cambridge AI Tutor for **${subjectName}** (${syllabusCode || 'Syllabus'}) under the **${programmeLabel}** curriculum.\n\nI can help you break down difficult concepts, guide you step-by-step through structured Cambridge questions, or give hints for past exam problems. What would you like to explore today?`,
      timestamp: 'Just now',
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const studentMsg: Message = {
      id: Date.now().toString(),
      sender: 'student',
      text: text.trim(),
      timestamp: 'Just now',
    };

    setMessages(prev => [...prev, studentMsg]);
    setInput('');
    setIsTyping(true);

    featureStorage.incrementUsage('ai_tutor');

    setTimeout(() => {
      let aiResponse = `In **${subjectName}** (${programmeLabel}), `;

      if (text.toLowerCase().includes('equation') || text.toLowerCase().includes('solve') || text.toLowerCase().includes('calculate')) {
        aiResponse += `here is the rigorous Cambridge solution methodology:\n\n1. **Identify Given Data:** Write down all variables and verify SI units.\n2. **Formula Selection:** State the exact formula from the syllabus.\n3. **Substitution:** Substitute the numbers before simplification to earn method marks.\n4. **Final Answer:** State numerical answer rounded to 2–3 significant figures with correct units.`;
      } else if (text.toLowerCase().includes('quiz') || text.toLowerCase().includes('question')) {
        aiResponse += `here is an exam-style question:\n\n**Cambridge Structured Question [3 Marks]:**\nExplain the mechanism and significance of this process in **${subjectName}**. In your answer, state two conditions required for optimal performance.\n\n*Would you like to draft an answer for me to grade against the marking criteria?*`;
      } else {
        aiResponse += `here is a clear explanation:\n\n- **Core Rule:** Examiners look for standard technical terms rather than everyday descriptions.\n- **Key Definition:** Always cite the fundamental relationship established in the syllabus.\n- **Common Student Error:** Forgetting to mention the specific conditions or assumptions.`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: aiResponse,
          timestamp: 'Just now',
        }
      ]);
      setIsTyping(false);
    }, 900);
  };

  const quickPrompts = [
    `Explain the most important Cambridge concepts in ${subjectName}`,
    `Give me a 3-mark structured question with mark scheme`,
    `What are the top 3 mistakes students make in ${subjectName}?`,
    `Step-by-step calculation example`,
  ];

  return (
    <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden flex flex-col h-[580px]">
      {/* AI Tutor Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">{subjectName} AI Tutor</span>
              <Badge variant="secondary" className="text-[10px] bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                {syllabusCode || 'Syllabus'}
              </Badge>
            </div>
            <div className="text-[11px] text-slate-400">
              {topicTitle ? `Topic: ${topicTitle}` : `${programmeLabel} Exam Mode`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-slate-500 font-semibold">Active & Synced</span>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div 
            key={m.id}
            className={`flex items-start gap-3 ${m.sender === 'student' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold ${m.sender === 'ai' ? 'bg-teal-600' : 'bg-slate-800'}`}>
              {m.sender === 'ai' ? <Bot className="w-4 h-4" /> : studentName.charAt(0).toUpperCase()}
            </div>

            <div className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${
              m.sender === 'student' 
                ? 'bg-teal-600 text-white rounded-tr-none font-medium' 
                : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 rounded-tl-none space-y-2'
            }`}>
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs pl-11">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-teal-600" />
            <span>AI Tutor is drafting Cambridge-aligned response...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Actions */}
      <div className="p-3 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 hover:border-teal-300 whitespace-nowrap transition-all shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-3 bg-white dark:bg-slate-900">
        <Input 
          placeholder={`Ask anything about ${subjectName} or ask to check your answer...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-xs h-11"
        />
        <Button 
          onClick={() => handleSend()}
          className="bg-teal-600 hover:bg-teal-500 text-white rounded-2xl h-11 px-5 shrink-0 font-bold"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};
