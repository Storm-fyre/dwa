let token = localStorage.getItem('dwaAdminToken');

// --- Authentication ---
document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        showDashboard();
    }
});

document.getElementById('login-btn').addEventListener('click', async () => {
    const password = document.getElementById('admin-password').value;
    const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    });
    if (res.ok) {
        const data = await res.json();
        token = data.token;
        localStorage.setItem('dwaAdminToken', token);
        showDashboard();
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
});

function logout() {
    localStorage.removeItem('dwaAdminToken');
    location.reload();
}

function showDashboard() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard-screen').style.display = 'block';
    loadAllData();
}

// --- Tabs ---
window.switchTab = function(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');
    event.target.classList.add('active');
};

function loadAllData() {
    loadMembers();
    loadContributors();
    loadEvents();
    loadSettings();
}

const headers = () => ({ 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' });

// --- Members ---
async function loadMembers() {
    const res = await fetch('/api/members');
    const data = await res.json();
    const tbody = document.getElementById('members-list');
    tbody.innerHTML = data.map(m => `
        <tr>
            <td>${m.name}</td>
            <td><button class="btn-delete" onclick="deleteItem('/api/members', ${m.id}, loadMembers)">Delete</button></td>
        </tr>
    `).join('');
}
window.addMember = async function() {
    const name = document.getElementById('new-member-name').value;
    if(!name) return alert("Enter a name");
    await fetch('/api/members', { method: 'POST', headers: headers(), body: JSON.stringify({ name }) });
    document.getElementById('new-member-name').value = '';
    loadMembers();
}

// --- Contributors ---
async function loadContributors() {
    const res = await fetch('/api/contributors');
    const data = await res.json();
    const tbody = document.getElementById('contributors-list');
    tbody.innerHTML = data.map(c => `
        <tr>
            <td>${c.name}</td>
            <td>₹${c.amount}</td>
            <td><button class="btn-delete" onclick="deleteItem('/api/contributors', ${c.id}, loadContributors)">Delete</button></td>
        </tr>
    `).join('');
}
window.addContributor = async function() {
    const name = document.getElementById('new-contributor-name').value;
    const amount = document.getElementById('new-contributor-amount').value;
    if(!name || !amount) return alert("Enter name and amount");
    await fetch('/api/contributors', { method: 'POST', headers: headers(), body: JSON.stringify({ name, amount }) });
    document.getElementById('new-contributor-name').value = '';
    document.getElementById('new-contributor-amount').value = '';
    loadContributors();
}

// --- Events & Image Upload ---
async function loadEvents() {
    const res = await fetch('/api/events');
    const data = await res.json();
    const tbody = document.getElementById('events-list');
    tbody.innerHTML = data.map(e => `
        <tr>
            <td>${e.image_url ? `<img src="${e.image_url}" width="60" style="border-radius:4px;">` : 'No Image'}</td>
            <td><strong>${e.title}</strong><br><small>${e.description}</small></td>
            <td><button class="btn-delete" onclick="deleteItem('/api/events', ${e.id}, loadEvents)">Delete</button></td>
        </tr>
    `).join('');
}
window.addEvent = async function() {
    const title = document.getElementById('new-event-title').value;
    const desc = document.getElementById('new-event-desc').value;
    const fileInput = document.getElementById('new-event-image');
    
    if(!title) return alert("Event title is required");

    const btn = document.getElementById('btn-add-event');
    const status = document.getElementById('event-upload-status');
    btn.disabled = true;
    status.style.display = 'block';

    let imageUrl = '';
    if (fileInput.files.length > 0) {
        const formData = new FormData();
        formData.append('image', fileInput.files[0]);
        try {
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const uploadData = await uploadRes.json();
            imageUrl = uploadData.url;
        } catch (e) {
            alert("Image upload failed!");
            btn.disabled = false; status.style.display = 'none'; return;
        }
    }

    await fetch('/api/events', { 
        method: 'POST', 
        headers: headers(), 
        body: JSON.stringify({ title, description: desc, image_url: imageUrl }) 
    });

    document.getElementById('new-event-title').value = '';
    document.getElementById('new-event-desc').value = '';
    fileInput.value = '';
    btn.disabled = false;
    status.style.display = 'none';
    loadEvents();
}

// --- Settings (Month) ---
async function loadSettings() {
    const res = await fetch('/api/settings');
    const data = await res.json();
    const monthSetting = data.find(s => s.key === 'contribution_month');
    if (monthSetting) {
        document.getElementById('setting-month').value = monthSetting.value;
    }
}
window.updateMonth = async function() {
    const value = document.getElementById('setting-month').value;
    if(!value) return alert("Enter a month");
    await fetch('/api/settings', { 
        method: 'PUT', 
        headers: headers(), 
        body: JSON.stringify({ key: 'contribution_month', value }) 
    });
    alert("Month updated successfully! The main site will now display this.");
}

// --- Helper function for Deletes ---
window.deleteItem = async function(url, id, reloadFunction) {
    if(confirm("Are you sure you want to delete this?")) {
        await fetch(`${url}?id=${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        reloadFunction();
    }
}