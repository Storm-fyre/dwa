const SECRET_TOKEN = "dwa_secure_admin_2026";
function isAuthenticated(request) { return request.headers.get("Authorization") === `Bearer ${SECRET_TOKEN}`; }

export async function onRequestGet(context) {
  try {
    const { results } = await context.env.DB.prepare("SELECT * FROM events ORDER BY created_at DESC").all();
    return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 500 }); }
}

export async function onRequestPost(context) {
  if (!isAuthenticated(context.request)) return new Response("Unauthorized", { status: 401 });
  try {
    const data = await context.request.json();
    await context.env.DB.prepare("INSERT INTO events (title, description, image_url) VALUES (?, ?, ?)")
      .bind(data.title, data.description || "", data.image_url || "").run();
    return new Response(JSON.stringify({ success: true }));
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 500 }); }
}

export async function onRequestDelete(context) {
  if (!isAuthenticated(context.request)) return new Response("Unauthorized", { status: 401 });
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');
    
    // Check if there is an image to delete from R2
    const { results } = await context.env.DB.prepare("SELECT image_url FROM events WHERE id = ?").bind(id).all();
    if (results.length > 0 && results[0].image_url) {
      try {
        const urlObj = new URL(results[0].image_url);
        const filename = urlObj.pathname.substring(1);
        if (filename) await context.env.BUCKET.delete(filename);
      } catch (e) { console.error("Failed to delete image from R2"); }
    }

    await context.env.DB.prepare("DELETE FROM events WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true }));
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 500 }); }
}