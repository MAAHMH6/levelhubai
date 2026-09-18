import { supabase } from "@/integrations/supabase/client";
import { MATH_CURRICULUM, ICT_CURRICULUM } from "@/data/curriculumData";

export type AIRequestType = "quiz" | "paper" | "summary";

interface GenerateQuizParams {
  subject: string;
  lessonTitle?: string;
  unitTitle?: string;
  questionCount?: number;
  previousQuestions?: string[];
}

interface GeneratePaperParams {
  subject: string;
  unitTitle?: string;
}

interface SummarizePaperParams {
  paperText: string;
}

function getCurriculum(subject: string, lessonTitle?: string, unitTitle?: string): string {
  const subjectLower = subject.toLowerCase();
  let fullCurriculum = "";

  if (subjectLower.includes("math")) {
    fullCurriculum = MATH_CURRICULUM;
  } else if (subjectLower.includes("ict") || subjectLower.includes("computer")) {
    fullCurriculum = ICT_CURRICULUM;
  } else {
    return `O-Level ${subject} curriculum content`;
  }

  // If a specific unit is requested, try to extract that section
  if (unitTitle) {
    const unitPattern = new RegExp(
      `(UNIT\\s+\\d+[:\\s]+${unitTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?)(?=UNIT\\s+\\d+[:\\s]|$)`,
      "i"
    );
    const match = fullCurriculum.match(unitPattern);
    if (match) return match[1];
  }

  // If a specific lesson is requested, try to find relevant section
  if (lessonTitle) {
    const lines = fullCurriculum.split("\n");
    const relevantLines: string[] = [];
    let capturing = false;
    let captureCount = 0;

    for (const line of lines) {
      if (line.toLowerCase().includes(lessonTitle.toLowerCase().substring(0, 20))) {
        capturing = true;
        captureCount = 0;
      }
      if (capturing) {
        relevantLines.push(line);
        captureCount++;
        if (captureCount > 30) break;
      }
    }

    if (relevantLines.length > 5) {
      return relevantLines.join("\n");
    }
  }

  // Return full curriculum (truncated if too long)
  if (fullCurriculum.length > 8000) {
    return fullCurriculum.substring(0, 8000);
  }
  return fullCurriculum;
}

export async function generateQuiz(params: GenerateQuizParams) {
  const curriculum = getCurriculum(params.subject, params.lessonTitle, params.unitTitle);

  const { data, error } = await supabase.functions.invoke("openrouter-ai", {
    body: {
      type: "quiz",
      subject: params.subject,
      curriculum,
      lessonTitle: params.lessonTitle,
      unitTitle: params.unitTitle,
      questionCount: params.questionCount || 5,
      previousQuestions: params.previousQuestions || [],
    },
  });

  if (error) throw new Error(error.message || "Failed to generate quiz");
  if (!data?.success) throw new Error(data?.error || "Failed to generate quiz");
  return data.questions;
}

export async function generatePaper(params: GeneratePaperParams) {
  const curriculum = getCurriculum(params.subject, undefined, params.unitTitle);

  const { data, error } = await supabase.functions.invoke("openrouter-ai", {
    body: {
      type: "paper",
      subject: params.subject,
      curriculum,
      unitTitle: params.unitTitle,
    },
  });

  if (error) throw new Error(error.message || "Failed to generate paper");
  if (!data?.success) throw new Error(data?.error || "Failed to generate paper");
  return data.content;
}

export async function summarizePaper(params: SummarizePaperParams) {
  const { data, error } = await supabase.functions.invoke("openrouter-ai", {
    body: {
      type: "summary",
      paperText: params.paperText,
    },
  });

  if (error) throw new Error(error.message || "Failed to summarize paper");
  if (!data?.success) throw new Error(data?.error || "Failed to summarize paper");
  return data.content;
}
