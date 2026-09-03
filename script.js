// script.js
document.addEventListener('DOMContentLoaded', function() {
    
    // =========================================================
    // NEW: TRIPLE-TAP SECRET ADMIN ACCESS
    // =========================================================
    let tapCount = 0;
    let tapTimer = null;
    const secretTrigger = document.getElementById('secret-admin-trigger');
    if (secretTrigger) {
        secretTrigger.addEventListener('click', () => {
            tapCount++;
            if (tapCount === 1) { tapTimer = setTimeout(() => { tapCount = 0; }, 1500); }
            if (tapCount === 3) {
                clearTimeout(tapTimer);
                tapCount = 0; 
                window.location.href = "admin.html"; // Takes you to the secret portal
            }
        });
    }

    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('a.nav-link, .desktop-navigation a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    closeAllMobilePanels();
                }
            }
        });
    });
    
    // Mobile Panel Logic
    const menuButton = document.getElementById('menuButton');
    const mobileMenuPanel = document.getElementById('mobileMenuPanel');
    const closePanelButtons = document.querySelectorAll('.close-panel-btn');

    function closeAllMobilePanels() {
        if (mobileMenuPanel) mobileMenuPanel.classList.remove('active');
    }

    if (menuButton && mobileMenuPanel) {
        menuButton.addEventListener('click', () => {
            mobileMenuPanel.classList.toggle('active');
        });
    }

    closePanelButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetPanelId = this.getAttribute('data-target');
            const panelToClose = document.getElementById(targetPanelId);
            if (panelToClose) panelToClose.classList.remove('active');
        });
    });

    document.addEventListener('click', function(event) {
        if (mobileMenuPanel && mobileMenuPanel.classList.contains('active') && !mobileMenuPanel.contains(event.target) && event.target !== menuButton) {
            let el = event.target;
            let isButtonChild = false;
            while (el) {
                if (el === menuButton) { isButtonChild = true; break; }
                el = el.parentElement;
            }
            if (!isButtonChild) mobileMenuPanel.classList.remove('active');
        }
    });

    // Executive Members Toggle (Mobile)
    const showExecButton = document.getElementById('showExecButton');
    const executiveSection = document.getElementById('executiveSection');

    if (showExecButton && executiveSection) {
        showExecButton.addEventListener('click', function() {
            if (executiveSection.style.display === 'none') {
                executiveSection.style.display = 'block';
                showExecButton.textContent = 'Hide Executive Members';
            } else {
                executiveSection.style.display = 'none';
                showExecButton.textContent = 'Show Executive Members';
            }
        });
    }

    // =========================================================
    // LOAD LEADERS (Remains static from local JSON - very fast)
    // =========================================================
    loadLeaders();
    async function loadLeaders() {
        try {
            const response = await fetch('leaders.json');
            if (!response.ok) throw new Error('Failed to load leaders data');
            const data = await response.json();
            populateMobileLeaders(data);
            populateDesktopLeaders(data);
        } catch (error) { console.error('Error loading leaders:', error); }
    }

    function populateMobileLeaders(data) {
        const mobileDirectorsSection = document.querySelector('.directors-section-mobile');
        if (mobileDirectorsSection && data.directors) {
            mobileDirectorsSection.innerHTML = '';
            Object.entries(data.directors).forEach(([name, details]) => {
                const leaderDiv = document.createElement('div');
                leaderDiv.className = 'leader-entry';
                leaderDiv.innerHTML = `<p class="leader-name-phone">${name} | ${details[1]}</p><p class="leader-designation">${details[0]}</p>`;
                mobileDirectorsSection.appendChild(leaderDiv);
            });
        }
        const mobileExecutiveSection = document.querySelector('.executive-members-section-mobile');
        if (mobileExecutiveSection && data.executive_members) {
            const heading = mobileExecutiveSection.querySelector('h3');
            mobileExecutiveSection.innerHTML = '';
            if (heading) mobileExecutiveSection.appendChild(heading);
            Object.entries(data.executive_members).forEach(([name, phone]) => {
                const leaderDiv = document.createElement('div');
                leaderDiv.className = 'leader-entry';
                leaderDiv.innerHTML = `<p class="leader-name-phone">${name} | ${phone}</p>`;
                mobileExecutiveSection.appendChild(leaderDiv);
            });
        }
    }

    function populateDesktopLeaders(data) {
        const desktopDirectorsSection = document.querySelector('.left-sidebar .directors-section');
        if (desktopDirectorsSection && data.directors) {
            const heading = desktopDirectorsSection.querySelector('h2');
            desktopDirectorsSection.innerHTML = '';
            if (heading) desktopDirectorsSection.appendChild(heading);
            Object.entries(data.directors).forEach(([name, details]) => {
                const leaderDiv = document.createElement('div');
                leaderDiv.className = 'leader-entry';
                leaderDiv.innerHTML = `<p class="leader-name-phone">${name} | ${details[1]}</p><p class="leader-designation">${details[0]}</p>`;
                desktopDirectorsSection.appendChild(leaderDiv);
            });
        }
        const desktopExecutiveSection = document.querySelector('.left-sidebar .executive-members-section');
        if (desktopExecutiveSection && data.executive_members) {
            const heading = desktopExecutiveSection.querySelector('h2');
            desktopExecutiveSection.innerHTML = '';
            if (heading) desktopExecutiveSection.appendChild(heading);
            Object.entries(data.executive_members).forEach(([name, phone]) => {
                const leaderDiv = document.createElement('div');
                leaderDiv.className = 'leader-entry';
                leaderDiv.innerHTML = `<p class="leader-name-phone">${name} | ${phone}</p>`;
                desktopExecutiveSection.appendChild(leaderDiv);
            });
        }
    }

    // =========================================================
    // LIVE DATABASE API LOADS
    // =========================================================
    
    // Load Events from Database API
    loadEvents();
    async function loadEvents() {
        const eventsContainer = document.getElementById('eventsContainer');
        if (!eventsContainer) return;

        try {
            const response = await fetch('/api/events'); 
            if (!response.ok) throw new Error('Failed to load events data');
            const data = await response.json();
            
            if (data && data.length > 0) {
                eventsContainer.innerHTML = '';
                data.forEach(event => {
                    const eventDiv = document.createElement('div');
                    eventDiv.className = 'event-item';
                    
                    let htmlContent = `<h3>${event.title}</h3>`;
                    
                    if (event.image_url) {
                        const urls = event.image_url.split(',').map(u => u.trim()).filter(u => u);
                        
                        if (urls.length === 1) {
                            htmlContent += `<img src="${urls[0]}" alt="${event.title}" style="width: 100%; height: auto; margin-bottom: 10px; border-radius: 4px;">`;
                        } else if (urls.length > 1) {
                            htmlContent += `<div class="event-gallery">`;
                            urls.forEach(url => {
                                htmlContent += `<img src="${url}" alt="${event.title}">`;
                            });
                            htmlContent += `</div>`;
                        }
                    }
                    
                    if (event.description) {
                        htmlContent += `<p>${event.description}</p>`;
                    }
                    
                    eventDiv.innerHTML = htmlContent;
                    eventsContainer.appendChild(eventDiv);
                });
            } else {
                eventsContainer.innerHTML = '<p>No events available at the moment.</p>';
            }
        } catch (error) {
            eventsContainer.innerHTML = '<p>Unable to load events. Please try again later.</p>';
        }
    }

    // Members Directory Logic (Connected to API)
    let allMembers = [];
    let filteredMembers = [];
    let displayedCount = 0;
    const CHUNK_SIZE = 50;
    
    const membersContainer = document.getElementById('membersContainer');
    const memberSearch = document.getElementById('memberSearch');

    loadMembers();
    async function loadMembers() {
        if (!membersContainer) return;
        try {
            const response = await fetch('/api/members');
            if (!response.ok) throw new Error('Failed to load members data');
            const data = await response.json();
            
            if (data && data.length > 0) {
                // Map the array of DB objects into a clean array of strings, then sort
                allMembers = data.map(m => m.name).sort((a, b) => a.localeCompare(b, 'te')); 
                filteredMembers = [...allMembers];
                
                renderMemberChunk(true);

                membersContainer.addEventListener('scroll', () => {
                    if (membersContainer.scrollTop + membersContainer.clientHeight >= membersContainer.scrollHeight - 10) {
                        if (displayedCount < filteredMembers.length) {
                            renderMemberChunk(false); 
                        }
                    }
                });

                if (memberSearch) {
                    memberSearch.addEventListener('input', (e) => {
                        const query = e.target.value.toLowerCase().trim();
                        filteredMembers = allMembers.filter(name => name.toLowerCase().includes(query));
                        renderMemberChunk(true);
                    });
                }
            } else {
                membersContainer.innerHTML = '<p style="padding: 10px;">No members available at the moment.</p>';
            }
        } catch (error) {
            membersContainer.innerHTML = '<p style="padding: 10px;">Unable to load members.</p>';
        }
    }

    function renderMemberChunk(reset = false) {
        if (reset) {
            membersContainer.innerHTML = '';
            displayedCount = 0;
            membersContainer.scrollTop = 0; 
        }

        const chunk = filteredMembers.slice(displayedCount, displayedCount + CHUNK_SIZE);
        
        if (chunk.length === 0 && reset) {
            membersContainer.innerHTML = '<p style="padding: 10px; color: #777;">No matching members found.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        chunk.forEach(name => {
            const memberDiv = document.createElement('div');
            memberDiv.className = 'contributor-entry';
            memberDiv.innerHTML = `<p>${name}</p>`;
            fragment.appendChild(memberDiv);
        });

        membersContainer.appendChild(fragment);
        displayedCount += chunk.length;
    }

    // Load Contributors from Database API
    loadContributors();
    async function loadContributors() {
        const contributorsContainer = document.getElementById('contributorsContainer');
        if (!contributorsContainer) return;

        try {
            const response = await fetch('/api/contributors'); 
            if (!response.ok) throw new Error('Failed to load contributors data');
            const data = await response.json();

            if (data && data.length > 0) {
                contributorsContainer.innerHTML = '';
                data.forEach(contributor => {
                    const div = document.createElement('div');
                    div.className = 'contributor-entry';
                    div.innerHTML = `<p>${contributor.name}<span class="contributor-amount">— ₹${contributor.amount}</span></p>`;
                    contributorsContainer.appendChild(div);
                });
            } else {
                contributorsContainer.innerHTML = '<p>No contributions available at the moment.</p>';
            }
        } catch (error) {
            contributorsContainer.innerHTML = '<p>Unable to load contributions.</p>';
        }
    }

    // Load Dynamic Month Settings from Database API
    loadSettings();
    async function loadSettings() {
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                const data = await response.json();
                const monthSetting = data.find(s => s.key === 'contribution_month');
                if (monthSetting && monthSetting.value) {
                    const monthHeading = document.getElementById('contribution-month-heading');
                    if (monthHeading) {
                        monthHeading.innerText = `CONTRIBUTIONS IN ${monthSetting.value.toUpperCase()}`;
                    }
                }
            }
        } catch (error) { console.error('Error loading settings:', error); }
    }

    // Modal behavior (Retained for future generic use if needed)
    const fileModal = document.getElementById('fileModal');
    const pdfViewer = document.getElementById('filePdfViewer');
    const imgViewer = document.getElementById('fileImageViewer');
    const fileClose = document.querySelector('.pdf-close');

    function closeFileModal() {
        fileModal.style.display = 'none';
        pdfViewer.style.display = 'none';
        pdfViewer.src = '';
        imgViewer.style.display = 'none';
        imgViewer.src = '';
        document.body.style.overflow = 'auto'; 
    }

    if (fileClose) fileClose.addEventListener('click', closeFileModal);
    window.addEventListener('click', function(event) { if (event.target === fileModal) closeFileModal(); });

    window.openFileInModal = function(filePath, type) {
        if (window.innerWidth < 768) {
            window.open(filePath, '_blank');
            return;
        }
        if (type === 'pdf') {
            pdfViewer.src = filePath + '#toolbar=1&navpanes=1&scrollbar=1';
            pdfViewer.style.display = 'block';
            imgViewer.style.display = 'none';
        } else {
            imgViewer.src = filePath;
            imgViewer.style.display = 'block';
            pdfViewer.style.display = 'none';
        }
        fileModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    window.closeFileModal = closeFileModal;
});