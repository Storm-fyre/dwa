// script.js
document.addEventListener('DOMContentLoaded', function() {
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
            if (panelToClose) {
                panelToClose.classList.remove('active');
            }
        });
    });

    // Close panels if user clicks outside of them
    document.addEventListener('click', function(event) {
        if (
            mobileMenuPanel &&
            mobileMenuPanel.classList.contains('active') &&
            !mobileMenuPanel.contains(event.target) &&
            event.target !== menuButton
        ) {
            let el = event.target;
            let isButtonChild = false;
            while (el) {
                if (el === menuButton) {
                    isButtonChild = true;
                    break;
                }
                el = el.parentElement;
            }
            if (!isButtonChild) mobileMenuPanel.classList.remove('active');
        }
    });

    // Executive Members & Advisors Toggle (Mobile)
    const showExecButton = document.getElementById('showExecButton');
    const executiveSection = document.getElementById('executiveSection');
    const advisorsSection = document.getElementById('advisorsSection');

    if (showExecButton && executiveSection) {
        showExecButton.addEventListener('click', function() {
            if (executiveSection.style.display === 'none') {
                executiveSection.style.display = 'block';
                if (advisorsSection) advisorsSection.style.display = 'block';
                showExecButton.textContent = 'Hide Executive Members and Advisors';
            } else {
                executiveSection.style.display = 'none';
                if (advisorsSection) advisorsSection.style.display = 'none';
                showExecButton.textContent = 'Show Executive Members and Advisors';
            }
        });
    }

    // Load Leaders from JSON
    loadLeaders();

    async function loadLeaders() {
        try {
            const response = await fetch('leaders.json');
            if (!response.ok) throw new Error('Failed to load leaders data');
            const data = await response.json();
            
            populateMobileLeaders(data);
            populateDesktopLeaders(data);
        } catch (error) {
            console.error('Error loading leaders:', error);
        }
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

        const mobileAdvisorsSection = document.querySelector('.advisors-section-mobile');
        if (mobileAdvisorsSection && data.advisors) {
            const heading = mobileAdvisorsSection.querySelector('h3');
            mobileAdvisorsSection.innerHTML = '';
            if (heading) mobileAdvisorsSection.appendChild(heading);
            data.advisors.forEach(name => {
                const leaderDiv = document.createElement('div');
                leaderDiv.className = 'leader-entry';
                leaderDiv.innerHTML = `<p class="leader-name-phone">${name}</p>`;
                mobileAdvisorsSection.appendChild(leaderDiv);
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

        const desktopAdvisorsSection = document.querySelector('.left-sidebar .advisors-section');
        if (desktopAdvisorsSection && data.advisors) {
            const heading = desktopAdvisorsSection.querySelector('h2');
            desktopAdvisorsSection.innerHTML = '';
            if (heading) desktopAdvisorsSection.appendChild(heading);
            data.advisors.forEach(name => {
                const leaderDiv = document.createElement('div');
                leaderDiv.className = 'leader-entry';
                leaderDiv.innerHTML = `<p class="leader-name-phone">${name}</p>`;
                desktopAdvisorsSection.appendChild(leaderDiv);
            });
        }
    }

    // Load Events from JSON
    loadEvents();
    async function loadEvents() {
        const eventsContainer = document.getElementById('eventsContainer');
        if (!eventsContainer) return;

        try {
            const response = await fetch('Our Events/edits.json');
            if (!response.ok) throw new Error('Failed to load events data');
            const data = await response.json();
            
            if (data.events && data.events.length > 0) {
                eventsContainer.innerHTML = '';
                for (const event of data.events) {
                    await createEventItem(event, eventsContainer);
                }
            } else {
                eventsContainer.innerHTML = '<p>No events available at the moment.</p>';
            }
        } catch (error) {
            console.error('Error loading events:', error);
            eventsContainer.innerHTML = '<p>Unable to load events. Please try again later.</p>';
        }
    }

    async function createEventItem(event, container) {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event-item';
        const titleEl = document.createElement('h3');
        titleEl.textContent = event.title;
        eventDiv.appendChild(titleEl);

        const extensions = ['jpg', 'jpeg', 'png'];
        for (let ext of extensions) {
            const filePath = `Our Events/${event.id}.${ext}`;
            try {
                const response = await fetch(filePath, { method: 'HEAD' });
                if (response.ok) {
                    const img = document.createElement('img');
                    img.src = filePath;
                    img.alt = event.title;
                    img.style.width = '100%';
                    img.style.height = 'auto';
                    img.style.marginBottom = '10px';
                    eventDiv.appendChild(img);
                    break; 
                }
            } catch (err) {
                continue;
            }
        }

        const descEl = document.createElement('p');
        descEl.textContent = event.description;
        eventDiv.appendChild(descEl);
        container.appendChild(eventDiv);
    }

    // =========================================================================
    // NEW: Load Members with Search, Sort & Infinite Scroll Logic
    // =========================================================================
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
            const response = await fetch('members.json');
            if (!response.ok) throw new Error('Failed to load members data');
            
            const data = await response.json();
            
            if (data.members && data.members.length > 0) {
                // 1. Sort Alphabetically (Handles both English and Telugu)
                allMembers = data.members.sort((a, b) => a.localeCompare(b, 'te')); 
                filteredMembers = [...allMembers];
                
                // 2. Render first chunk of 50
                renderMemberChunk(true);

                // 3. Infinite Scroll Event Listener
                membersContainer.addEventListener('scroll', () => {
                    // Check if user has scrolled near the bottom (within 10 pixels)
                    if (membersContainer.scrollTop + membersContainer.clientHeight >= membersContainer.scrollHeight - 10) {
                        if (displayedCount < filteredMembers.length) {
                            renderMemberChunk(false); // Load next chunk
                        }
                    }
                });

                // 4. Live Search Event Listener
                if (memberSearch) {
                    memberSearch.addEventListener('input', (e) => {
                        const query = e.target.value.toLowerCase().trim();
                        // Filter the master list
                        filteredMembers = allMembers.filter(name => name.toLowerCase().includes(query));
                        // Re-render from the top
                        renderMemberChunk(true);
                    });
                }
            } else {
                membersContainer.innerHTML = '<p style="padding: 10px;">No members available at the moment.</p>';
            }
        } catch (error) {
            console.error('Error loading members:', error);
            membersContainer.innerHTML = '<p style="padding: 10px;">Unable to load members. Please try again later.</p>';
        }
    }

    // High Performance DOM rendering for chunks
    function renderMemberChunk(reset = false) {
        if (reset) {
            membersContainer.innerHTML = '';
            displayedCount = 0;
            // Scroll back to top if they typed in the search bar
            membersContainer.scrollTop = 0; 
        }

        const chunk = filteredMembers.slice(displayedCount, displayedCount + CHUNK_SIZE);
        
        if (chunk.length === 0 && reset) {
            membersContainer.innerHTML = '<p style="padding: 10px; color: #777;">No matching members found.</p>';
            return;
        }

        // Using DocumentFragment stops the browser from redrawing 50 times
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
    // =========================================================================

    // Load Contributors from contributors.json
    loadContributors();

    async function loadContributors() {
        const contributorsContainer = document.getElementById('contributorsContainer');
        if (!contributorsContainer) return;

        try {
            const response = await fetch('contributors.json');
            if (!response.ok) throw new Error('Failed to load contributors data');
            const data = await response.json();

            if (data.contributors && Object.keys(data.contributors).length > 0) {
                contributorsContainer.innerHTML = '';
                Object.entries(data.contributors).forEach(([name, amount]) => {
                    const div = document.createElement('div');
                    div.className = 'contributor-entry';
                    div.innerHTML = `<p>${name}<span class="contributor-amount">— ₹${amount}</span></p>`;
                    contributorsContainer.appendChild(div);
                });
            } else {
                contributorsContainer.innerHTML = '<p>No contributions available at the moment.</p>';
            }
        } catch (error) {
            console.error('Error loading contributors:', error);
            contributorsContainer.innerHTML = '<p>Unable to load contributions. Please try again later.</p>';
        }
    }

    // Modal behavior
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

    if (fileClose) {
        fileClose.addEventListener('click', closeFileModal);
    }

    window.addEventListener('click', function(event) {
        if (event.target === fileModal) {
            closeFileModal();
        }
    });

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