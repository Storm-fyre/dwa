const SECRET_TOKEN = "dwa_secure_admin_2026";
function isAuthenticated(request) { 
  return request.headers.get("Authorization") === `Bearer ${SECRET_TOKEN}`; 
}

// GET all members sorted alphabetically
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

// CREATE new member
export async function onRequestPost(context) {
  if (!isAuthenticated(context.request)) return new Response("Unauthorized", { status: 401 });
  try {
    const data = await context.request.json();
    const paidAmount = parseInt(data.paid_amount, 10) || 0;
    const dueAmount = Math.max(0, 3000 - paidAmount);
    const phone = data.phone ? data.phone.trim() : "";

    await context.env.DB.prepare(
      "INSERT INTO members (name, phone, photo_url, paid_amount, due_amount) VALUES (?, ?, ?, ?, ?)"
    ).bind(data.name.trim(), phone, data.photo_url || "", paidAmount, dueAmount).run();

    return new Response(JSON.stringify({ success: true }));
  } catch (error) { 
    return new Response(JSON.stringify({ error: error.message }), { status: 500 }); 
  }
}

// UPDATE existing member
export async function onRequestPut(context) {
  if (!isAuthenticated(context.request)) return new Response("Unauthorized", { status: 401 });
  try {
    const data = await context.request.json();
    const id = data.id;
    if (!id) return new Response(JSON.stringify({ error: "Member ID required" }), { status: 400 });

    const paidAmount = parseInt(data.paid_amount, 10) || 0;
    const dueAmount = Math.max(0, 3000 - paidAmount);
    const phone = data.phone ? data.phone.trim() : "";

    // If photo was changed, optionally clean up old photo from R2
    const { results } = await context.env.DB.prepare("SELECT photo_url FROM members WHERE id = ?").bind(id).all();
    if (results.length > 0 && results[0].photo_url && data.photo_url && results[0].photo_url !== data.photo_url) {
      try {
        const urlObj = new URL(results[0].photo_url);
        const filename = urlObj.pathname.substring(1);
        if (filename) await context.env.BUCKET.delete(filename);
      } catch (e) {
        console.error("Failed to delete replaced photo from R2", e);
      }
    }

    await context.env.DB.prepare(
      "UPDATE members SET name = ?, phone = ?, photo_url = ?, paid_amount = ?, due_amount = ? WHERE id = ?"
    ).bind(data.name.trim(), phone, data.photo_url || "", paidAmount, dueAmount, id).run();

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// DELETE member
export async function onRequestDelete(context) {
  if (!isAuthenticated(context.request)) return new Response("Unauthorized", { status: 401 });
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');

    // Clean up photo from R2 if member had an image
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