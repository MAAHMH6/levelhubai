import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Square, Trash2, Check, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WritingEditorProps {
  onCheck: (text: string) => void;
  isChecking: boolean;
}

export function WritingEditor({ onCheck, isChecking }: WritingEditorProps) {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPunctuating, setIsPunctuating] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              currentTranscript += event.results[i][0].transcript + " ";
            }
          }
          if (currentTranscript) {
            setText((prev) => prev + currentTranscript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsRecording(false);
          if (event.error !== "no-speech") {
            toast.error("Microphone error. Please ensure permissions are granted.");
          }
        };

        recognitionRef.current.onend = () => {
          // If manually stopped, it will already be false
          if (isRecording) {
            // Restart if it stopped automatically but we still want to record
            try {
              recognitionRef.current?.start();
            } catch (e) {
              setIsRecording(false);
            }
          }
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);

  const handleStartRecording = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }
    setText(""); // Optionally clear or append. Let's clear for a fresh voice recording.
    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    
    // Automatically apply punctuation via AI
    if (text.trim().length > 0) {
      await applyPunctuation(text);
    }
  };

  const applyPunctuation = async (rawText: string) => {
    setIsPunctuating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-punctuator`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ text: rawText })
      });
      if (!res.ok) throw new Error("Failed to punctuate");
      const data = await res.json();
      setText(data.text);
      toast.success("Text formatted successfully");
    } catch (err: any) {
      console.error(err);
      toast.error("Could not automatically punctuate text");
    } finally {
      setIsPunctuating(false);
    }
  };

  const handleClear = () => {
    setText("");
  };

  return (
    <div className="space-y-4">
      {isRecording && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="font-medium">Recording... Speak clearly. LevelHubAI will convert your speech.</span>
          </div>
          <Button variant="destructive" size="sm" onClick={handleStopRecording}>
            <Square className="h-4 w-4 mr-2" /> Stop Recording
          </Button>
        </div>
      )}
      
      {isPunctuating && (
        <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-xl flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="font-medium">Formatting and punctuating your speech...</span>
        </div>
      )}

      <div className="relative">
        <Textarea
          placeholder="Write or paste your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[300px] text-lg resize-none p-6 pb-20"
          disabled={isRecording || isPunctuating}
        />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isRecording && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleStartRecording}
                disabled={isChecking || isPunctuating}
                className="gap-2 text-primary hover:text-primary"
              >
                <Mic className="h-4 w-4" /> 🎙️ Speak & Write
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClear}
              disabled={isRecording || isPunctuating || text.length === 0}
              className="text-muted-foreground"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Clear
            </Button>
          </div>
          
          <Button 
            size="lg" 
            onClick={() => onCheck(text)}
            disabled={text.trim().length === 0 || isRecording || isPunctuating || isChecking}
            className="gap-2"
          >
            {isChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Check Writing
          </Button>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground text-center">
        Try saying "comma", "full stop", or "question mark" while speaking to explicitly add punctuation.
      </p>
    </div>
  );
}
