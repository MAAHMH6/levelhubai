/**
 * Tutor Response Types and Validation
 * Mirrors the structured JSON schema enforced in the ai-tutor Edge Function system prompt.
 *
 * Schema:
 *   answer       - Direct 1–3 sentence answer to the question
 *   explanation  - Deeper pedagogical explanation (4–8 sentences)
 *   key_points   - Array of 2–4 concise bullet strings the student must remember
 *   example      - Optional worked example (string or null)
 *   exam_tip     - Optional Cambridge Examiner Reports insight (string or null)
 *   formula      - Optional key formula / definition to memorise (string or null)
 */

export interface TutorResponse {
  answer: string;
  explanation: string;
  key_points: string[];
  example?: string | null;
  exam_tip?: string | null;
  formula?: string | null;
}

// ---------------------------------------------------------------------------
// Validator
// ---------------------------------------------------------------------------

/**
 * Validates and normalises raw parsed JSON into a confirmed TutorResponse object.
 * Also handles the legacy schema (direct_answer, steps, common_mistake…) gracefully.
 */
export function validateTutorResponse(data: any): TutorResponse | null {
  if (!data || typeof data !== 'object') return null;

  // --- New schema fields ---
  const answer =
    typeof data.answer === 'string' ? data.answer.trim() :
    // fallback to legacy field
    typeof data.direct_answer === 'string' ? data.direct_answer.trim() : '';

  const explanation =
    typeof data.explanation === 'string' ? data.explanation.trim() : '';

  if (!answer && !explanation) return null;

  // key_points: new array field, or derive from legacy steps
  let keyPoints: string[] = [];
  if (Array.isArray(data.key_points)) {
    keyPoints = data.key_points
      .map((k: any) => (typeof k === 'string' ? k.trim() : ''))
      .filter((k: string) => k.length > 0)
      .slice(0, 4);
  } else if (Array.isArray(data.steps) && data.steps.length > 0) {
    // Derive key_points from legacy steps.instruction
    keyPoints = data.steps
      .map((s: any) =>
        typeof s?.instruction === 'string'
          ? `Step ${s.step_number ?? ''}: ${s.instruction.trim()}`
          : ''
      )
      .filter((k: string) => k.length > 3)
      .slice(0, 4);
  }

  const example =
    typeof data.example === 'string' && data.example.trim()
      ? data.example.trim()
      : null;

  const examTip =
    typeof data.exam_tip === 'string' && data.exam_tip.trim()
      ? data.exam_tip.trim()
      : // fallback to legacy common_mistake
      typeof data.common_mistake === 'string' && data.common_mistake.trim()
      ? data.common_mistake.trim()
      : null;

  const formula =
    typeof data.formula === 'string' && data.formula.trim()
      ? data.formula.trim()
      : null;

  return {
    answer: answer || 'See explanation below.',
    explanation: explanation || 'Here is the Cambridge curriculum breakdown.',
    key_points: keyPoints,
    example,
    exam_tip: examTip,
    formula,
  };
}

// ---------------------------------------------------------------------------
// Formatter
// ---------------------------------------------------------------------------

/**
 * Converts a validated TutorResponse into clean, friendly markdown.
 * NEVER outputs raw JSON to students.
 */
export function formatTutorResponseAsHumanText(resp: TutorResponse): string {
  let md = '';

  // 1. Direct Answer (bold callout)
  if (resp.answer) {
    md += `### 💡 Answer\n**${resp.answer}**\n\n`;
  }

  // 2. Formula highlight (if present)
  if (resp.formula) {
    md += `> 📐 **Key Formula / Definition**\n> \`${resp.formula}\`\n\n`;
  }

  // 3. Explanation
  if (resp.explanation) {
    md += `${resp.explanation}\n\n`;
  }

  // 4. Key Points checklist
  if (resp.key_points && resp.key_points.length > 0) {
    md += `### 📌 Key Points to Remember\n`;
    resp.key_points.forEach((point) => {
      md += `- ${point}\n`;
    });
    md += '\n';
  }

  // 5. Worked Example
  if (resp.example) {
    md += `> **🔍 Worked Example:**\n> ${resp.example.replace(/\n/g, '\n> ')}\n\n`;
  }

  // 6. Cambridge Exam Tip
  if (resp.exam_tip) {
    md += `> ⚠️ **Cambridge Exam Tip:**\n> ${resp.exam_tip.replace(/\n/g, '\n> ')}\n\n`;
  }

  return md.trim();
}

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

/**
 * Tries to extract and parse a TutorResponse JSON block from raw model output.
 * Handles: raw JSON, ```json blocks, and bare { ... } objects.
 */
export function parseAndValidateTutorResponse(rawText: string): TutorResponse | null {
  if (!rawText) return null;

  // 1. Try direct JSON parse
  try {
    const direct = JSON.parse(rawText.trim());
    const validated = validateTutorResponse(direct);
    if (validated) return validated;
  } catch { /* fallthrough */ }

  // 2. Look for JSON code blocks
  const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch?.[1]) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1]);
      const validated = validateTutorResponse(parsed);
      if (validated) return validated;
    } catch { /* fallthrough */ }
  }

  // 3. Look for balanced curly braces containing a known key
  const firstBrace = rawText.indexOf('{');
  const lastBrace = rawText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      const candidate = rawText.substring(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(candidate);
      const validated = validateTutorResponse(parsed);
      if (validated) return validated;
    } catch { /* fallthrough */ }
  }

  return null;
}
