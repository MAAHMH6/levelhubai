import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { extractSyllabus } from "@/lib/inngest/functions/extractSyllabus";

// Create an API that serves zero-config routing for Inngest
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    extractSyllabus,
  ],
});
