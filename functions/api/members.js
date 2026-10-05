const SECRET_TOKEN = "dwa_secure_admin_2026";
function isAuthenticated(request) { 
  return request.headers.get("Authorization") === `Bearer ${SECRET_TOKEN}`; 
}

// GET all members strictly sorted by Member ID (First stays first)
export async function onRequestGet(context) {
  try {
    const { results } = await context.env.DB.prepare(
      "SELECT * FROM members ORDER BY CAST(membership_no AS INTEGER) ASC, id ASC"
    ).all();
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
    
    // Auto-calculate next Membership Number if not provided
    let memberNo = parseInt(data.membership_no, 10);
    if (!memberNo || memberNo <= 0) {
      const { results } = await context.env.DB.prepare(
        "SELECT MAX(CAST(membership_no AS INTEGER)) as max_no FROM members"
      ).all();
      const currentMax = results[0]?.max_no || 0;
      memberNo = currentMax >= 20230001 ? currentMax + 1 : 20230001;
    }

    const paidAmount = parseInt(data.paid_amount, 10) || 0;
    const dueAmount = Math.max(0, 3000 - paidAmount);
    const phone = data.phone ? data.phone.trim() : "";
    const notes = data.notes ? data.notes.trim() : "";

    await context.env.DB.prepare(
      `INSERT INTO members (membership_no, name, phone, photo_url, notes, paid_amount, due_amount) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(memberNo, data.name.trim(), phone, data.photo_url || "", notes, paidAmount, dueAmount).run();

    return new Response(JSON.stringify({ success: true, membership_no: memberNo }));
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

    const memberNo = parseInt(data.membership_no, 10) || 20230001;
    const paidAmount = parseInt(data.paid_amount, 10) || 0;
    const dueAmount = Math.max(0, 3000 - paidAmount);
    const phone = data.phone ? data.phone.trim() : "";
    const notes = data.notes ? data.notes.trim() : "";

    // Clean up replaced photo from R2 if new photo was uploaded
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
      `UPDATE members 
       SET membership_no = ?, name = ?, phone = ?, photo_url = ?, notes = ?, paid_amount = ?, due_amount = ? 
       WHERE id = ?`
    ).bind(memberNo, data.name.trim(), phone, data.photo_url || "", notes, paidAmount, dueAmount, id).run();

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