const SECRET_TOKEN = "dwa_secure_admin_2026";
function isAuthenticated(request) { return request.headers.get("Authorization") === `Bearer ${SECRET_TOKEN}`; }

export async function onRequestGet(context) {
  try {
    const { results } = await context.env.DB.prepare("SELECT * FROM site_settings").all();
    return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 500 }); }
}

export async function onRequestPut(context) {
  if (!isAuthenticated(context.request)) return new Response("Unauthorized", { status: 401 });
  try {
    const data = await context.request.json();
    await context.env.DB.prepare("UPDATE site_settings SET value = ? WHERE key = ?")
      .bind(data.value, data.key).run();
    return new Response(JSON.stringify({ success: true }));
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 500 }); }
}