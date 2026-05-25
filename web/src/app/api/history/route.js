import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const rows = await sql`
      SELECT id, original_text, enhanced_text, detected_context, tone, subject_line, explanation, created_at
      FROM enhancement_history
      ORDER BY created_at DESC
      LIMIT 50
    `;
    return Response.json(rows);
  } catch (error) {
    console.error("History fetch error:", error);
    return Response.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (id) {
      await sql`DELETE FROM enhancement_history WHERE id = ${id}`;
    } else {
      await sql`DELETE FROM enhancement_history`;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("History delete error:", error);
    return Response.json(
      { error: "Failed to delete history" },
      { status: 500 },
    );
  }
}
