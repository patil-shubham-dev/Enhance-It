import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { text, tone } = await request.json();

    if (!text || text.trim().length === 0) {
      return Response.json({ error: "Text is required" }, { status: 400 });
    }

    // Enforce 2000 char limit
    const trimmedText = text.substring(0, 2000);

    const toneInstructions = {
      auto: "automatically select the most appropriate tone based on the detected context — choose from: casual, professional, concise, detailed, or creative",
      casual: "casual, warm, and conversational — like texting a close friend",
      professional: "professional, formal, and polished",
      concise:
        "concise and to the point — cut all fluff, keep only the essential information",
      detailed:
        "detailed, comprehensive, and thorough — expand with context and clarity",
      creative: "creative, expressive, and engaging",
    };

    const toneDesc = toneInstructions[tone] || toneInstructions.auto;
    const isAuto = !tone || tone === "auto";

    const systemPrompt = `You are Enhance It — a world-class AI text enhancement engine.

Your job:
1. Detect the context of the text
2. Enhance it using the requested tone
3. Return ONLY valid raw JSON — no markdown, no code fences, no extra text

CONTEXT DETECTION RULES:
- MESSAGE: Short casual text, chats, messages to people. Informal. Usually under 300 chars, few line breaks.
- EMAIL: Needs structured format with Subject, greeting, body, and sign-off. Look for "hi,", "dear", "regards", "@" mentions, professional requests, follow-ups.
- AI_PROMPT: Instructions to an AI system. Look for "you are", "act as", "generate", "create", "write me", "explain", imperative commands to an AI.
- GENERAL: Blog posts, notes, long-form writing, anything else.

REQUESTED TONE: ${toneDesc}

ENHANCEMENT RULES BY CONTEXT:

MESSAGE:
- Keep it natural and human. Fix grammar and clarity. Do not make it robotic or formal.
- Preserve the sender's voice and intent.

EMAIL:
- Generate a compelling, relevant Subject line.
- Add proper greeting (based on context — formal or semi-formal).
- Structure the body with clear paragraphs.
- Add a professional sign-off (Best regards, Thanks, etc.).
- Output the full email body in enhancedText. Subject line separately in "subject".

AI_PROMPT:
- Rewrite as a high-quality engineer-grade prompt.
- Add: role assignment, specific constraints, output format instructions, examples if helpful.
- Make it detailed, specific, and effective.

GENERAL:
- Improve clarity, flow, grammar, and impact. Restructure if needed.

OUTPUT FORMAT (STRICT — raw JSON only, no other text before or after):
{
  "detectedContext": "MESSAGE | EMAIL | AI_PROMPT | GENERAL",
  "enhancedText": "the full enhanced text here",
  "subject": "Email subject line — ONLY include this key if detectedContext is EMAIL, omit this key entirely otherwise",
  "toneApplied": "${isAuto ? "the tone you chose — one of: casual, professional, concise, detailed, creative" : tone}",
  "explanation": "One concise sentence: what was the single biggest improvement made"
}`;

    const response = await fetch("/integrations/google-gemini-2-5-flash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Enhance this text:\n\n${trimmedText}` },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("AI service unavailable");
    }

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;

    let result;
    try {
      result = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid AI response format");
      }
    }

    // Validate and sanitize
    const validContexts = ["MESSAGE", "EMAIL", "AI_PROMPT", "GENERAL"];
    if (!validContexts.includes(result.detectedContext)) {
      result.detectedContext = "GENERAL";
    }

    const validTones = [
      "casual",
      "professional",
      "concise",
      "detailed",
      "creative",
    ];
    if (!validTones.includes(result.toneApplied)) {
      result.toneApplied = isAuto ? "professional" : tone;
    }

    // Save to history
    try {
      await sql`
        INSERT INTO enhancement_history (original_text, enhanced_text, detected_context, tone, subject_line, explanation)
        VALUES (
          ${trimmedText.substring(0, 5000)},
          ${result.enhancedText.substring(0, 5000)},
          ${result.detectedContext},
          ${result.toneApplied || tone || "auto"},
          ${result.subject || null},
          ${result.explanation || null}
        )
      `;
    } catch (dbErr) {
      console.error("Failed to save to history:", dbErr);
    }

    return Response.json(result);
  } catch (error) {
    console.error("Enhancement error:", error);
    return Response.json(
      { error: "Enhancement failed. Please try again." },
      { status: 500 },
    );
  }
}
