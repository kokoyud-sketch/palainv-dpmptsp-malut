import type { Context, Config } from "@netlify/functions";
import { getDatabase } from "@netlify/database";

export default async (req: Request, context: Context) => {
  try {
    const db = getDatabase();
    if (req.method === "GET") {
      const rows = await db.sql`SELECT nama FROM custom_sektor ORDER BY nama ASC`;
      return new Response(JSON.stringify(rows.map((r: any) => r.nama)), { headers: { "Content-Type": "application/json" } });
    }
    if (req.method === "POST") {
      const { nama } = await req.json();
      await db.sql`INSERT INTO custom_sektor (nama) VALUES (${nama}) ON CONFLICT (nama) DO NOTHING`;
      return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  } catch (err) {
    console.error('[sektor function error]', err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

export const config: Config = {
  path: "/api/sektor"
};
