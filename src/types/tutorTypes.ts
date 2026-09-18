/**
 * Tutor Response Types and Validation
 * Mirrors the Python Pydantic TutorResponse model.
 */

export interface TutorStep {
  step_number: number;
  instruction: string;
  working?: string | null;
}

export interface TutorResponse {
  direct_answer: string;
  explanation: string;
  steps: TutorStep[];
  example?: string | null;
  common_mistake?: string | null;
  quick_check?: string | null;
  next_step?: string | null;
}

/**
 * Validates and normalizes raw parsed JSON into a confirmed TutorResponse object.
 */
export function validateTutorResponse(data: any): TutorResponse | null {
  if (!data || typeof data !== 'object') return null;

  // direct_answer and explanation are essential
  const directAnswer = typeof data.direct_answer === 'string' ? data.direct_answer.trim() : '';
  const explanation = typeof data.explanation === 'string' ? data.explanation.trim() : '';

  if (!directAnswer && !explanation) return null;

  const rawSteps = Array.isArray(data.steps) ? data.steps : [];
  const steps: TutorStep[] = rawSteps.map((s: any, idx: number) => ({
    step_number: typeof s?.step_number === 'number' ? s.step_number : idx + 1,
    instruction: typeof s?.instruction === 'string' ? s.instruction : (typeof s === 'string' ? s : ''),
    working: typeof s?.working === 'string' ? s.working : null,
  })).filter(s => s.instruction.length > 0);

  return {
    direct_answer: directAnswer || 'See step-by-step solution below.',
    explanation: explanation || 'Here is the step-by-step breakdown according to the Cambridge curriculum.',
    steps,
    example: typeof data.example === 'string' && data.example.trim() ? data.example.trim() : null,
    common_mistake: typeof data.common_mistake === 'string' && data.common_mistake.trim() ? data.common_mistake.trim() : null,
    quick_check: typeof data.quick_check === 'string' && data.quick_check.trim() ? data.quick_check.trim() : null,
    next_step: typeof data.next_step === 'string' && data.next_step.trim() ? data.next_step.trim() : null,
  };
}

/**
 * Converts a structured TutorResponse into natural, friendly, human-readable markdown.
 * NEVER outputs raw JSON to students.
 */
export function formatTutorResponseAsHumanText(resp: TutorResponse): string {
  let md = "";

  // 1. Direct Answer Highlight
  if (resp.direct_answer) {
    md += `### 💡 Answer\n**${resp.direct_answer}**\n\n`;
  }

  // 2. Explanation
  if (resp.explanation) {
    md += `${resp.explanation}\n\n`;
  }

  // 3. Step-by-Step Breakdown
  if (resp.steps && resp.steps.length > 0) {
    md += `### 📝 Step-by-Step Solution\n\n`;
    resp.steps.forEach(step => {
      md += `**Step ${step.step_number}:** ${step.instruction}\n`;
      if (step.working) {
        md += `> \`${step.working}\`\n`;
      }
      md += `\n`;
    });
  }

  // 4. Worked Example
  if (resp.example) {
    md += `> **🔍 Worked Example:**\n> ${resp.example.replace(/\n/g, '\n> ')}\n\n`;
  }

  // 5. Common Mistake / Examiner Note
  if (resp.common_mistake) {
    md += `> ⚠️ **Common Cambridge Mistake to Avoid:**\n> ${resp.common_mistake.replace(/\n/g, '\n> ')}\n\n`;
  }

  // 6. Interactive Quick Check
  if (resp.quick_check) {
    md += `### 🎯 Quick Check\n${resp.quick_check}\n*(Try answering this in your next message!)*\n\n`;
  }

  // 7. Next Step Recommendation
  if (resp.next_step) {
    md += `*👉 Next Step:* ${resp.next_step}\n`;
  }

  return md.trim();
}

/**
 * Tries to extract and parse a TutorResponse JSON block from raw model output.
 */
export function parseAndValidateTutorResponse(rawText: string): TutorResponse | null {
  if (!rawText) return null;

  // 1. Try direct JSON parse
  try {
    const direct = JSON.parse(rawText.trim());
    const validated = validateTutorResponse(direct);
    if (validated) return validated;
  } catch {}

  // 2. Look for JSON code blocks
  const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1]);
      const validated = validateTutorResponse(parsed);
      if (validated) return validated;
    } catch {}
  }

  // 3. Look for balanced curly braces containing "direct_answer"
  const firstBrace = rawText.indexOf('{');
  const lastBrace = rawText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      const candidate = rawText.substring(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(candidate);
      const validated = validateTutorResponse(parsed);
      if (validated) return validated;
    } catch {}
  }

  return null;
}
