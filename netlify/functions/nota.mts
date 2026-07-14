import type { Context, Config } from "@netlify/functions";
import { getDatabase } from "@netlify/database";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const potensiId = url.searchParams.get("potensiId");

  try {
    const db = getDatabase();
    if (req.method === "GET") {
      if (!potensiId) return new Response(JSON.stringify({ error: "potensiId required" }), { status: 400 });
      const rows = await db.sql`SELECT item_id, catatan FROM nota WHERE potensi_id = ${potensiId}`;
      const result: Record<string, string> = {};
      rows.forEach((r: any) => { result[r.item_id] = r.catatan; });
      return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { potensiId: pid, itemId, catatan } = body;
      if (catatan && catatan.trim()) {
        await db.sql`
          INSERT INTO nota (potensi_id, item_id, catatan, updated_at)
          VALUES (${pid}, ${itemId}, ${catatan}, NOW())
          ON CONFLICT (potensi_id, item_id) DO UPDATE SET catatan = ${catatan}, updated_at = NOW()
        `;
      } else {
        await db.sql`DELETE FROM nota WHERE potensi_id = ${pid} AND item_id = ${itemId}`;
      }
      return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  } catch (err) {
    console.error('[nota function error]', err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

export const config: Config = {
  path: "/api/nota"
};
