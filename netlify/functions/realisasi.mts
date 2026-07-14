import type { Context, Config } from "@netlify/functions";
import { getDatabase } from "@netlify/database";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const tahun = url.searchParams.get("tahun");

  try {
    const db = getDatabase();
    if (req.method === "GET") {
      const rows = await db.sql`SELECT * FROM realisasi ORDER BY tahun ASC`;
      return new Response(JSON.stringify(rows), { headers: { "Content-Type": "application/json" } });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { tahun: t, total, catatan, sektors } = body;
      const [row] = await db.sql`
        INSERT INTO realisasi (tahun, total, catatan, sektors)
        VALUES (${t}, ${total}, ${catatan}, ${JSON.stringify(sektors || {})}::jsonb)
        ON CONFLICT (tahun) DO UPDATE SET total = ${total}, catatan = ${catatan}, sektors = ${JSON.stringify(sektors || {})}::jsonb
        RETURNING *
      `;
      return new Response(JSON.stringify(row), { headers: { "Content-Type": "application/json" } });
    }

    if (req.method === "DELETE") {
      if (!tahun) return new Response(JSON.stringify({ error: "tahun required" }), { status: 400 });
      await db.sql`DELETE FROM realisasi WHERE tahun = ${Number(tahun)}`;
      return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  } catch (err) {
    console.error('[realisasi function error]', err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

export const config: Config = {
  path: "/api/realisasi"
};
