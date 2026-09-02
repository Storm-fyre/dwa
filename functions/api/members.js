const SECRET_TOKEN = "dwa_secure_admin_2026";
function isAuthenticated(request) { return request.headers.get("Authorization") === `Bearer ${SECRET_TOKEN}`; }

export async function onRequestGet(context) {
  try {
    const { results } = await context.env.DB.prepare("SELECT * FROM members ORDER BY name ASC").all();
    return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 500 }); }
}

export async function onRequestPost(context) {
  if (!isAuthenticated(context.request)) return new Response("Unauthorized", { status: 401 });
  try {
    const data = await context.request.json();
    await context.env.DB.prepare("INSERT INTO members (name) VALUES (?)").bind(data.name).run();
    return new Response(JSON.stringify({ success: true }));
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 500 }); }
}

export async function onRequestDelete(context) {
  if (!isAuthenticated(context.request)) return new Response("Unauthorized", { status: 401 });
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');
    await context.env.DB.prepare("DELETE FROM members WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true }));
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 500 }); }
}