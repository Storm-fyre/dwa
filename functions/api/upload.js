const SECRET_TOKEN = "dwa_secure_admin_2026";
function isAuthenticated(request) { return request.headers.get("Authorization") === `Bearer ${SECRET_TOKEN}`; }

export async function onRequestPost(context) {
  if (!isAuthenticated(context.request)) return new Response("Unauthorized", { status: 401 });
  try {
    const formData = await context.request.formData();
    const file = formData.get("image");
    
    if (!file) return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
    if (file.size > 5 * 1024 * 1024) return new Response(JSON.stringify({ error: "File exceeds 5MB limit" }), { status: 400 });

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    await context.env.BUCKET.put(filename, file);
    
    // Using the custom domain you set up in Cloudflare!
    const publicUrl = `https://images.dhanvantariwelfaretrust.in/${filename}`;
    
    return new Response(JSON.stringify({ url: publicUrl }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}