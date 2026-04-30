// hooks/useOCRVerification.js
// -------------------------------------------------------------------
// Sends document image(s) to the Anthropic API and returns structured
// OCR extraction results with per-field confidence scores.
// -------------------------------------------------------------------

import { useState, useCallback } from "react";

// Field definitions per document type
export const DOCUMENT_CONFIGS = {
  Passport: {
    icon: "🛂",
    required: true,
    fields: [
      "Full name",
      "Passport number",
      "Date of birth",
      "Nationality",
      "Issue date",
      "Expiry date",
      "Gender",
      "Place of birth",
      "MRZ line 1",
      "MRZ line 2",
    ],
    prompt:
      "This is a passport. Extract all personal data fields including MRZ lines. Flag if expired or data seems inconsistent.",
  },
  "Academic Transcripts": {
    icon: "🎓",
    required: true,
    fields: [
      "Student full name",
      "Student ID",
      "University / Institution",
      "Degree program",
      "GPA / CGPA",
      "Overall percentage",
      "Graduation / expected date",
      "Subjects and grades",
      "Institution stamp detected",
    ],
    prompt:
      "This is an academic transcript. Extract student details, all grades, and verify institutional authenticity markers like stamps/seals.",
  },
  "Statement of Purpose": {
    icon: "📄",
    required: true,
    fields: [
      "Applicant name",
      "Target university",
      "Program applied for",
      "Approximate word count",
      "Signature detected",
      "Date on document",
    ],
    prompt:
      "This is a statement of purpose. Extract applicant details, target program, and check for signature and date.",
  },
  "Letter of Recommendation": {
    icon: "✉️",
    required: true,
    fields: [
      "Applicant name",
      "Recommender full name",
      "Recommender designation / title",
      "Recommender institution",
      "Date of letter",
      "Letterhead detected",
      "Signature detected",
      "Official stamp detected",
    ],
    prompt:
      "This is a letter of recommendation. Extract all parties' names, institutional details, and verify authenticity markers.",
  },
  "Evidence of Funds": {
    icon: "🏦",
    required: true,
    fields: [
      "Account holder name",
      "Bank name",
      "Account number (last 4 digits)",
      "Available balance",
      "Currency",
      "Statement date",
      "Bank branch / IFSC",
      "Bank stamp detected",
      "Bank signature detected",
    ],
    prompt:
      "This is a bank statement or financial document. Extract account and balance details. Flag if balance seems insufficient or statement is outdated.",
  },
  "GMAT / GRE Scores": {
    icon: "📊",
    required: false,
    fields: [
      "Candidate full name",
      "Test type (GMAT / GRE)",
      "Total score",
      "Verbal score",
      "Quantitative score",
      "Analytical writing score",
      "Test date",
      "Registration / candidate ID",
      "Score validity",
    ],
    prompt:
      "This is a GMAT or GRE score report. Extract all section scores and validate test date for recency.",
  },
  "CV / RESUME / ESSAY": {
    icon: "📋",
    required: true,
    fields: [
      "Full name",
      "Email address",
      "Phone number",
      "LinkedIn / website",
      "Highest education",
      "Number of work experiences",
      "Key skills listed",
      "Document type (CV / Resume / Essay)",
    ],
    prompt:
      "This is a CV, resume, or personal essay. Extract contact details, education, work history count, and key skills.",
  },
  "English Proficiency": {
    icon: "🌐",
    required: true,
    fields: [
      "Candidate full name",
      "Test type (TOEFL / IELTS / PTE)",
      "Overall score / band",
      "Listening score",
      "Reading score",
      "Writing score",
      "Speaking score",
      "Test date",
      "Registration number",
      "Valid until",
    ],
    prompt:
      "This is an English proficiency test report. Extract all band/section scores and check if the test is still valid (within 2 years).",
  },
  "ACT / SAT / LSAT": {
    icon: "📝",
    required: false,
    fields: [
      "Candidate full name",
      "Test type (ACT / SAT / LSAT)",
      "Composite / total score",
      "Section scores",
      "Test date",
      "Registration ID",
      "Score validity",
    ],
    prompt:
      "This is an ACT, SAT, or LSAT score report. Extract all scores with dates and validate.",
  },
};

// Convert a File object to base64 string
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Build the system prompt for a given document type
function buildSystemPrompt(docTitle, config) {
  return `You are an expert AI OCR engine for international student visa and university application document verification.

Your job: analyze the uploaded document image(s), extract all fields with maximum accuracy, and return a structured JSON verification report.

Document type: ${docTitle}
Fields to extract: ${config.fields.join(", ")}
Additional context: ${config.prompt}

Return ONLY a valid JSON object with this exact structure — no markdown, no explanation, no preamble:
{
  "status": "verified" | "review" | "error",
  "overallConfidence": <integer 0-100>,
  "summary": "<2-3 sentence plain-English summary of document validity, any issues, and recommended action>",
  "flags": ["<issue 1>", "<issue 2>"],
  "fields": [
    {
      "label": "<field name from the list above>",
      "value": "<extracted text value, or null if not found>",
      "confidence": <integer 0-100>,
      "note": "<optional short note if there is an issue with this specific field>"
    }
  ]
}

Status rules:
- "verified"  → all required fields detected clearly, document appears authentic and valid
- "review"    → one or more fields unclear, expired, low confidence, or minor inconsistency detected
- "error"     → document appears invalid, tampered, wrong document type, or critical fields missing

Be strict and accurate. Do not hallucinate values. If a field is not visible, set value to null and confidence to 0.`;
}

// ─── Main hook ────────────────────────────────────────────────────────────────

export function useOCRVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);

  const verify = useCallback(async (docTitle, files) => {
    const config = DOCUMENT_CONFIGS[docTitle];
    if (!config || !files || files.length === 0) return null;

    setIsVerifying(true);
    setError(null);

    try {
      // Convert all uploaded files to base64 image content blocks
      const imageBlocks = await Promise.all(
        files.map(async (file) => {
          const base64 = await fileToBase64(file);
          const mediaType = file.type || "image/jpeg";
          return {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64 },
          };
        }),
      );

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: buildSystemPrompt(docTitle, config),
          messages: [
            {
              role: "user",
              content: [
                ...imageBlocks,
                {
                  type: "text",
                  text: `Please extract and verify all fields from this ${docTitle} document. Return the JSON report only.`,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(
          errBody?.error?.message || `API error: ${response.status}`,
        );
      }

      const data = await response.json();
      const rawText = (data.content || [])
        .map((block) => block.text || "")
        .join("");

      // Parse JSON — strip any accidental markdown fences
      const cleaned = rawText.replace(/```json|```/gi, "").trim();
      const parsed = JSON.parse(cleaned);

      return {
        ...parsed,
        fileCount: files.length,
        processedAt: new Date().toISOString(),
        rawResponse: rawText,
      };
    } catch (err) {
      const msg =
        err instanceof SyntaxError
          ? "AI returned an unexpected format. Please retry."
          : err.message;
      setError(msg);
      return {
        status: "error",
        overallConfidence: 0,
        summary: msg,
        flags: [msg],
        fields: (config.fields || []).map((f) => ({
          label: f,
          value: null,
          confidence: 0,
        })),
        fileCount: files.length,
        processedAt: new Date().toISOString(),
        rawResponse: "",
      };
    } finally {
      setIsVerifying(false);
    }
  }, []);

  return { verify, isVerifying, error };
}
