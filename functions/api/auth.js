export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const ADMIN_PASSWORD = context.env.ADMIN_PASSWORD || "DwaAdmin2026";
    const SECRET_TOKEN = "dwa_secure_admin_2026";

    if (data.password === ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ success: true, token: SECRET_TOKEN }), {
        headers: { "Content-Type": "application/json" }
      });
    } else {
      return new Response(JSON.stringify({ error: "Invalid password" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}