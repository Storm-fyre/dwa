let token = localStorage.getItem('dwaAdminToken');
let loadedMembersList = [];

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
    if (event && event.target) event.target.classList.add('active');
};

function loadAllData() {
    loadMembers();
    loadContributors();
    loadEvents();
    loadSettings();
}

const headers = () => ({ 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' });

// ==========================================
// --- Member Photo 1:1 Cropping & Upload ---
// ==========================================
let memberCropper = null;
let cropTarget = 'new'; // 'new' or 'edit'
let croppedNewMemberFile = null;
let croppedEditMemberFile = null;

const memberPhotoInput = document.getElementById('member-photo-input');
const chooseMemberPhotoBtn = document.getElementById('btn-choose-member-photo');
const cropperModal = document.getElementById('cropper-modal');
const cropperModalImage = document.getElementById('cropper-modal-image');
const memberPhotoPreviewWrap = document.getElementById('member-photo-preview-wrap');
const memberPhotoPreview = document.getElementById('member-photo-preview');

chooseMemberPhotoBtn.addEventListener('click', () => {
    cropTarget = 'new';
    memberPhotoInput.click();
});

window.triggerEditPhotoUpload = function() {
    cropTarget = 'edit';
    memberPhotoInput.click();
};

memberPhotoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        cropperModalImage.src = event.target.result;
        cropperModal.style.display = 'flex'; // Opens in front with z-index: 10000

        if (memberCropper) {
            memberCropper.destroy();
        }

        // Initialize locked 1:1 square cropper
        memberCropper = new Cropper(cropperModalImage, {
            aspectRatio: 1,
            viewMode: 1,
            dragMode: 'move',
            autoCropArea: 0.85,
            restore: false,
            guides: true,
            center: true,
            highlight: false,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false,
        });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
});

window.cancelCrop = function() {
    if (memberCropper) {
        memberCropper.destroy();
        memberCropper = null;
    }
    cropperModal.style.display = 'none';
    cropperModalImage.src = '';
};

window.applyCrop = function() {
    if (!memberCropper) return;

    const canvas = memberCropper.getCroppedCanvas({
        width: 400,
        height: 400,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
    });

    canvas.toBlob((blob) => {
        new Compressor(blob, {
            quality: 0.75,
            maxWidth: 400,
            maxHeight: 400,
            mimeType: 'image/jpeg',
            success(result) {
                const readyFile = new File([result], `member_${Date.now()}.jpg`, { type: 'image/jpeg' });
                
                if (cropTarget === 'new') {
                    croppedNewMemberFile = readyFile;
                    memberPhotoPreview.src = URL.createObjectURL(result);
                    memberPhotoPreviewWrap.style.display = 'flex';
                } else {
                    croppedEditMemberFile = readyFile;
                    document.getElementById('edit-member-photo-preview').src = URL.createObjectURL(result);
                    const photoStatus = document.getElementById('edit-photo-status');
                    if (photoStatus) {
                        photoStatus.textContent = 'New Photo Ready';
                        photoStatus.style.color = '#27ae60';
                        photoStatus.style.fontWeight = 'bold';
                    }
                }
                
                cancelCrop(); // Closes cropper modal, smoothly revealing Edit modal underneath
            },
            error(err) {
                alert("Error optimizing photo: " + err.message);
                cancelCrop();
            }
        });
    }, 'image/jpeg', 0.9);
};

window.clearNewMemberPhoto = function() {
    croppedNewMemberFile = null;
    memberPhotoPreview.src = '';
    memberPhotoPreviewWrap.style.display = 'none';
};

// ==========================================
// --- Members CRUD (Add, Edit, Delete) ---
// ==========================================
async function loadMembers() {
    const res = await fetch('/api/members');
    const data = await res.json();
    loadedMembersList = data || [];

    const tbody = document.getElementById('members-list');
    tbody.innerHTML = loadedMembersList.map((m, index) => {
        const photoHtml = m.photo_url 
            ? `<img src="${m.photo_url}" width="42" height="42" style="border-radius:50%; object-fit:cover; border:1px solid #D4AF37;">` 
            : `<div style="width:42px; height:42px; border-radius:50%; background:#eee; display:flex; align-items:center; justify-content:center; color:#888; font-size:1.1rem;">👤</div>`;
        
        const paidAmount = parseInt(m.paid_amount, 10) || 0;

        // Payment status badge in admin: Green if >= 3000, Red if < 3000
        const paymentBadge = (paidAmount >= 3000)
            ? `<span style="color: #27ae60; background: #eafaf1; font-weight: bold; padding: 3px 8px; border-radius: 4px; font-size: 0.85rem;">₹${paidAmount.toLocaleString('en-IN')}</span>`
            : `<span style="color: #c0392b; background: #fde8e8; font-weight: bold; padding: 3px 8px; border-radius: 4px; font-size: 0.85rem;">₹${paidAmount.toLocaleString('en-IN')}</span>`;

        return `
            <tr>
                <td>${photoHtml}</td>
                <td><strong>${m.name}</strong></td>
                <td>${m.phone ? `📞 ${m.phone}` : '<span style="color:#aaa;">-</span>'}</td>
                <td>${paymentBadge}</td>
                <td style="text-align: center;">
                    <button class="btn-edit" onclick="openEditMember(${index})">Edit</button>
                    <button class="btn-delete" onclick="deleteItem('/api/members', ${m.id}, loadMembers)">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Add New Member
window.addMember = async function() {
    const nameInput = document.getElementById('new-member-name');
    const phoneInput = document.getElementById('new-member-phone');
    const paidInput = document.getElementById('new-member-paid');
    const btn = document.getElementById('btn-add-member');
    const status = document.getElementById('member-upload-status');

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const paidAmount = parseInt(paidInput.value, 10) || 0;

    if (!name) return alert("Please enter the member's name");

    btn.disabled = true;
    status.style.display = 'block';

    let photoUrl = '';

    if (croppedNewMemberFile) {
        const formData = new FormData();
        formData.append('image', croppedNewMemberFile);
        try {
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const uploadData = await uploadRes.json();
            if (uploadData.url) {
                photoUrl = uploadData.url;
            }
        } catch (e) {
            alert("Photo upload failed. Member not added.");
            btn.disabled = false;
            status.style.display = 'none';
            return;
        }
    }

    await fetch('/api/members', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ name, phone, paid_amount: paidAmount, photo_url: photoUrl })
    });

    nameInput.value = '';
    phoneInput.value = '';
    paidInput.value = '';
    clearNewMemberPhoto();
    btn.disabled = false;
    status.style.display = 'none';
    loadMembers();
};

// Edit Member Modal Handlers
let editMemberExistingPhotoUrl = '';

window.openEditMember = function(index) {
    const member = loadedMembersList[index];
    if (!member) return;

    document.getElementById('edit-member-id').value = member.id;
    document.getElementById('edit-member-name').value = member.name || '';
    document.getElementById('edit-member-phone').value = member.phone || '';
    document.getElementById('edit-member-paid').value = member.paid_amount || 0;

    editMemberExistingPhotoUrl = member.photo_url || '';
    croppedEditMemberFile = null;

    const previewImg = document.getElementById('edit-member-photo-preview');
    previewImg.src = member.photo_url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"><text x="50%" y="50%" font-size="16" dominant-baseline="middle" text-anchor="middle" fill="%23aaa">👤</text></svg>';

    const photoStatus = document.getElementById('edit-photo-status');
    if (photoStatus) {
        photoStatus.textContent = member.photo_url ? 'Current Photo' : 'No Photo';
        photoStatus.style.color = '#666';
        photoStatus.style.fontWeight = 'normal';
    }

    document.getElementById('edit-upload-status').style.display = 'none';
    document.getElementById('edit-member-modal').style.display = 'flex';
};

window.closeEditModal = function() {
    document.getElementById('edit-member-modal').style.display = 'none';
    croppedEditMemberFile = null;
};

// Save Edited Member
window.updateMember = async function() {
    const id = document.getElementById('edit-member-id').value;
    const name = document.getElementById('edit-member-name').value.trim();
    const phone = document.getElementById('edit-member-phone').value.trim();
    const paidAmount = parseInt(document.getElementById('edit-member-paid').value, 10) || 0;
    const btn = document.getElementById('btn-save-member-edit');
    const status = document.getElementById('edit-upload-status');

    if (!name) return alert("Member name cannot be empty");

    btn.disabled = true;
    status.style.display = 'block';

    let finalPhotoUrl = editMemberExistingPhotoUrl;

    // If admin cropped a new photo for this member
    if (croppedEditMemberFile) {
        const formData = new FormData();
        formData.append('image', croppedEditMemberFile);
        try {
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const uploadData = await uploadRes.json();
            if (uploadData.url) {
                finalPhotoUrl = uploadData.url;
            }
        } catch (e) {
            alert("New photo upload failed.");
            btn.disabled = false;
            status.style.display = 'none';
            return;
        }
    }

    await fetch('/api/members', {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ id, name, phone, paid_amount: paidAmount, photo_url: finalPhotoUrl })
    });

    btn.disabled = false;
    status.style.display = 'none';
    closeEditModal();
    loadMembers();
};

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
};

// --- Events ---
let newEventPhotos = [];

document.getElementById('customUploadBtn').addEventListener('click', () => {
    document.getElementById('new-event-image').click();
});

document.getElementById('new-event-image').addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
        new Compressor(file, {
            quality: 0.6,
            maxWidth: 1920,
            maxHeight: 1920,
            mimeType: 'image/jpeg',
            success(result) {
                const compressedFile = new File([result], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                    type: 'image/jpeg',
                });
                newEventPhotos.push(compressedFile);
                renderEventPhotoQueue();
            },
            error(err) {
                alert("Error compressing image: " + err.message);
            },
        });
    });
    e.target.value = ''; 
});

function renderEventPhotoQueue() {
    const queue = document.getElementById('photo_queue');
    queue.innerHTML = '';
    
    newEventPhotos.forEach((file, i) => {
        const item = document.createElement('div');
        item.style.cssText = 'display: flex; align-items: center; justify-content: space-between; background: #f9f9f9; padding: 8px 12px; border-radius: 4px; border: 1px solid #ccc; font-size: 0.9rem;';
        
        let displayName = file.name;
        if (displayName.length > 25) displayName = displayName.substring(0, 25) + '...';

        item.innerHTML = `
            <div>
                <span style="display:inline-block; width:30px; text-align:center; margin-right:10px;">🖼️</span>
                <strong>${displayName}</strong> <span style="color: green; font-size: 0.8rem;">(Ready)</span>
            </div>
            <button type="button" onclick="removeNewEventPhoto(${i})" title="Remove photo" style="background: none; border: none; color: #e74c3c; font-size: 1.2rem; cursor: pointer; padding: 0 5px; font-weight: bold;">✖</button>
        `;
        queue.appendChild(item);
    });
}

window.removeNewEventPhoto = function(index) {
    newEventPhotos.splice(index, 1);
    renderEventPhotoQueue();
};

async function loadEvents() {
    const res = await fetch('/api/events');
    const data = await res.json();
    const tbody = document.getElementById('events-list');
    tbody.innerHTML = data.map(e => {
        const firstImgUrl = e.image_url ? e.image_url.split(',')[0].trim() : '';
        return `
            <tr>
                <td>${firstImgUrl ? `<img src="${firstImgUrl}" width="60" style="border-radius:4px;">` : 'No Image'}</td>
                <td><strong>${e.title}</strong><br><small>${e.description}</small></td>
                <td><button class="btn-delete" onclick="deleteItem('/api/events', ${e.id}, loadEvents)">Delete</button></td>
            </tr>
        `;
    }).join('');
}

window.addEvent = async function() {
    const title = document.getElementById('new-event-title').value;
    const desc = document.getElementById('new-event-desc').value;
    
    if(!title) return alert("Event title is required");

    const btn = document.getElementById('btn-add-event');
    const status = document.getElementById('event-upload-status');
    btn.disabled = true;
    status.style.display = 'block';

    let imageUrls = [];
    
    if (newEventPhotos.length > 0) {
        for (let i = 0; i < newEventPhotos.length; i++) {
            const formData = new FormData();
            formData.append('image', newEventPhotos[i]);
            
            try {
                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                const uploadData = await uploadRes.json();
                
                if (uploadData.url) {
                    imageUrls.push(uploadData.url);
                }
            } catch (e) {
                alert(`Upload failed for image ${i + 1}.`);
                btn.disabled = false; 
                status.style.display = 'none'; 
                return;
            }
        }
    }
    
    const finalImageUrlString = imageUrls.join(', ');

    await fetch('/api/events', { 
        method: 'POST', 
        headers: headers(), 
        body: JSON.stringify({ title, description: desc, image_url: finalImageUrlString }) 
    });

    document.getElementById('new-event-title').value = '';
    document.getElementById('new-event-desc').value = '';
    newEventPhotos = [];
    renderEventPhotoQueue();
    btn.disabled = false;
    status.style.display = 'none';
    loadEvents();
};

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
};

// --- Helper function for Deletes ---
window.deleteItem = async function(url, id, reloadFunction) {
    if(confirm("Are you sure you want to delete this?")) {
        await fetch(`${url}?id=${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        reloadFunction();
    }
};