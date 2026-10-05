const SECRET_TOKEN = "dwa_secure_admin_2026";
function isAuthenticated(request) { 
  return request.headers.get("Authorization") === `Bearer ${SECRET_TOKEN}`; 
}

export async function onRequestGet(context) {
  try {
    const { results } = await context.env.DB.prepare("SELECT * FROM members ORDER BY name ASC").all();
    return new Response(JSON.stringify(results), { 
      headers: { "Content-Type": "application/json" } 
    });
  } catch (error) { 
    return new Response(JSON.stringify({ error: error.message }), { status: 500 }); 
  }
}

export async function onRequestPost(context) {
  if (!isAuthenticated(context.request)) return new Response("Unauthorized", { status: 401 });
  try {
    const data = await context.request.json();
    const dueAmount = parseInt(data.due_amount, 10) || 0;
    
    await context.env.DB.prepare(
      "INSERT INTO members (name, photo_url, due_amount) VALUES (?, ?, ?)"
    ).bind(data.name, data.photo_url || "", dueAmount).run();

    return new Response(JSON.stringify({ success: true }));
  } catch (error) { 
    return new Response(JSON.stringify({ error: error.message }), { status: 500 }); 
  }
}

export async function onRequestDelete(context) {
  if (!isAuthenticated(context.request)) return new Response("Unauthorized", { status: 401 });
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');

    // Clean up photo from R2 if member has an image
    const { results } = await context.env.DB.prepare("SELECT photo_url FROM members WHERE id = ?").bind(id).all();
    if (results.length > 0 && results[0].photo_url) {
      try {
        const urlObj = new URL(results[0].photo_url);
        const filename = urlObj.pathname.substring(1);
        if (filename) await context.env.BUCKET.delete(filename);
      } catch (e) { 
        console.error("Failed to delete member photo from R2", e); 
      }
    }

    await context.env.DB.prepare("DELETE FROM members WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true }));
  } catch (error) { 
    return new Response(JSON.stringify({ error: error.message }), { status: 500 }); 
  }
}