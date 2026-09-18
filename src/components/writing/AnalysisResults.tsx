import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, AlertCircle, TrendingUp, BookOpen, Sparkles, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AnalysisResultsProps {
  results: any;
  onAskTutor: (errorContext: string) => void;
  onPracticeMistake: (errorData: any) => void;
}

export function AnalysisResults({ results, onAskTutor, onPracticeMistake }: AnalysisResultsProps) {
  if (!results) return null;

  const { scores, errors, improved_text, feedback, vocabulary_suggestions } = results;

  const renderScore = (label: string, score: number) => {
    let color = "bg-green-500";
    if (score < 60) color = "bg-red-500";
    else if (score < 80) color = "bg-yellow-500";

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-muted-foreground">{label}</span>
          <span className="font-bold">{score}%</span>
        </div>
        <Progress value={score} className="h-2" indicatorColor={color} />
      </div>
    );
  };

  const getErrorIcon = (type: string) => {
    switch(type) {
      case 'grammar': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'spelling': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'vocabulary': return <BookOpen className="h-4 w-4 text-blue-500" />;
      default: return <Sparkles className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Writing Scores
            </CardTitle>
            <CardDescription>Your overall performance breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between">
              <span className="font-bold text-lg">Overall Score</span>
              <span className="text-2xl font-bold text-primary">{scores.overall}%</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {renderScore("Grammar", scores.grammar)}
              {renderScore("Vocabulary", scores.vocabulary)}
              {renderScore("Punctuation", scores.punctuation)}
              {renderScore("Spelling", scores.spelling)}
              {renderScore("Clarity", scores.clarity)}
            </div>
          </CardContent>
        </Card>

        {/* Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              General Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">Strengths</h4>
              <ul className="space-y-1">
                {feedback?.strengths?.map((s: string, i: number) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-orange-600 mb-2 flex items-center gap-2">Areas for Improvement</h4>
              <ul className="space-y-1">
                {feedback?.improvements?.map((s: string, i: number) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Details */}
      <Tabs defaultValue="errors" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="errors">Specific Mistakes ({errors?.length || 0})</TabsTrigger>
          <TabsTrigger value="improved">Improved Text</TabsTrigger>
          <TabsTrigger value="vocabulary">Vocabulary Upgrade</TabsTrigger>
        </TabsList>
        
        <TabsContent value="errors" className="mt-4 space-y-4">
          {errors?.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground border rounded-xl bg-card">
              <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
              No specific errors found! Great job!
            </div>
          ) : (
            errors?.map((err: any, idx: number) => (
              <Card key={idx} className="border-l-4 border-l-orange-500">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground">
                      {getErrorIcon(err.type)} {err.type}
                    </div>
                    <div className="text-lg">
                      <span className="line-through text-red-500/70 mr-2">{err.original}</span>
                      <span className="text-green-600 font-medium">{err.correction}</span>
                    </div>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">{err.explanation}</p>
                  </div>
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onAskTutor(`I made a mistake in my writing. I wrote "${err.original}" instead of "${err.correction}". The explanation given was: ${err.explanation}. Can you explain this rule to me in more detail?`)}
                    >
                      Ask AI Tutor
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => onPracticeMistake(err)}
                    >
                      Practice This
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="improved" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-lg leading-relaxed whitespace-pre-wrap">{improved_text}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vocabulary" className="mt-4 space-y-4">
          {(!vocabulary_suggestions || vocabulary_suggestions.length === 0) ? (
            <div className="p-8 text-center text-muted-foreground border rounded-xl bg-card">
              No vocabulary upgrades suggested for this text.
            </div>
          ) : (
            vocabulary_suggestions?.map((vocab: any, idx: number) => (
              <Card key={idx}>
                <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg text-muted-foreground line-through">{vocab.original}</span>
                    <span className="text-muted-foreground">→</span>
                    <div className="flex flex-wrap gap-2">
                      {vocab.better_options.map((opt: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-blue-500/10 text-blue-600 font-medium rounded-full text-sm">
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
