import type { Context, Config } from "@netlify/functions";
import { getDatabase } from "@netlify/database";

export default async (req: Request, context: Context) => {
  const db = getDatabase();
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  try {
    if (req.method === "GET") {
      const rows = await db.sql`SELECT * FROM potensi ORDER BY updated_at DESC`;
      return new Response(JSON.stringify(rows), { headers: { "Content-Type": "application/json" } });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const {
        id: newId, nama, kabupaten, sektor, luas, staf, deskripsi,
        tanggal, lat, lng, alamat, checklist, uploadedDocs
      } = body;

      const existing = await db.sql`SELECT id FROM potensi WHERE id = ${newId}`;

      if (existing.length > 0) {
        const [row] = await db.sql`
          UPDATE potensi SET
            nama = ${nama}, kabupaten = ${kabupaten}, sektor = ${sektor},
            luas = ${luas}, staf = ${staf}, deskripsi = ${deskripsi},
            tanggal = ${tanggal}, lat = ${lat}, lng = ${lng}, alamat = ${alamat},
            checklist = ${JSON.stringify(checklist || {})}::jsonb,
            uploaded_docs = ${JSON.stringify(uploadedDocs || {})}::jsonb,
            updated_at = NOW()
          WHERE id = ${newId}
          RETURNING *
        `;
        return new Response(JSON.stringify(row), { headers: { "Content-Type": "application/json" } });
      } else {
        const [row] = await db.sql`
          INSERT INTO potensi (id, nama, kabupaten, sektor, luas, staf, deskripsi, tanggal, lat, lng, alamat, checklist, uploaded_docs)
          VALUES (${newId}, ${nama}, ${kabupaten}, ${sektor}, ${luas}, ${staf}, ${deskripsi}, ${tanggal}, ${lat}, ${lng}, ${alamat},
                  ${JSON.stringify(checklist || {})}::jsonb, ${JSON.stringify(uploadedDocs || {})}::jsonb)
          RETURNING *
        `;
        return new Response(JSON.stringify(row), { headers: { "Content-Type": "application/json" } });
      }
    }

    if (req.method === "DELETE") {
      if (!id) return new Response(JSON.stringify({ error: "id required" }), { status: 400 });
      await db.sql`DELETE FROM potensi WHERE id = ${id}`;
      await db.sql`DELETE FROM nota WHERE potensi_id = ${id}`;
      return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
};

export const config: Config = {
  path: "/api/potensi"
};
