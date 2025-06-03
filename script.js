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
                    // If on mobile and a menu panel is open, close it
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
        if (mobileMenuPanel && mobileMenuPanel.classList.contains('active') &&
            !mobileMenuPanel.contains(event.target) && event.target !== menuButton) {
            let el = event.target;
            let isButtonChild = false;
            while(el) {
                if (el === menuButton) {
                    isButtonChild = true;
                    break;
                }
                el = el.parentElement;
            }
            if (!isButtonChild) mobileMenuPanel.classList.remove('active');
        }
    });

    // Executive Members Toggle
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

    // Load Leaders from JSON
    loadLeaders();

    async function loadLeaders() {
        try {
            const response = await fetch('leaders.json');
            if (!response.ok) {
                throw new Error('Failed to load leaders data');
            }
            
            const data = await response.json();
            
            // Populate mobile leaders section
            populateMobileLeaders(data);
            
            // Populate desktop leaders section
            populateDesktopLeaders(data);
            
        } catch (error) {
            console.error('Error loading leaders:', error);
        }
    }

    function populateMobileLeaders(data) {
        // Mobile Directors Section
        const mobileDirectorsSection = document.querySelector('.directors-section-mobile');
        if (mobileDirectorsSection && data.directors) {
            mobileDirectorsSection.innerHTML = '';
            
            Object.entries(data.directors).forEach(([name, details]) => {
                const leaderDiv = document.createElement('div');
                leaderDiv.className = 'leader-entry';
                leaderDiv.innerHTML = `
                    <p class="leader-name-phone">${name} | ${details[1]}</p>
                    <p class="leader-designation">${details[0]}</p>
                `;
                mobileDirectorsSection.appendChild(leaderDiv);
            });
        }

        // Mobile Executive Members Section
        const mobileExecutiveSection = document.querySelector('.executive-members-section-mobile');
        if (mobileExecutiveSection && data.executive_members) {
            const executiveMembersContainer = mobileExecutiveSection.querySelector('div') || mobileExecutiveSection;
            
            // Clear existing content except the heading
            const heading = executiveMembersContainer.querySelector('h3');
            executiveMembersContainer.innerHTML = '';
            if (heading) {
                executiveMembersContainer.appendChild(heading);
            }
            
            Object.entries(data.executive_members).forEach(([name, phone]) => {
                const leaderDiv = document.createElement('div');
                leaderDiv.className = 'leader-entry';
                leaderDiv.innerHTML = `
                    <p class="leader-name-phone">${name} | ${phone}</p>
                `;
                executiveMembersContainer.appendChild(leaderDiv);
            });
        }
    }

    function populateDesktopLeaders(data) {
        // Desktop Directors Section
        const desktopDirectorsSection = document.querySelector('.left-sidebar .directors-section');
        if (desktopDirectorsSection && data.directors) {
            // Clear existing content except the heading
            const heading = desktopDirectorsSection.querySelector('h2');
            desktopDirectorsSection.innerHTML = '';
            if (heading) {
                desktopDirectorsSection.appendChild(heading);
            }
            
            Object.entries(data.directors).forEach(([name, details]) => {
                const leaderDiv = document.createElement('div');
                leaderDiv.className = 'leader-entry';
                leaderDiv.innerHTML = `
                    <p class="leader-name-phone">${name} | ${details[1]}</p>
                    <p class="leader-designation">${details[0]}</p>
                `;
                desktopDirectorsSection.appendChild(leaderDiv);
            });
        }

        // Desktop Executive Members Section
        const desktopExecutiveSection = document.querySelector('.left-sidebar .executive-members-section');
        if (desktopExecutiveSection && data.executive_members) {
            // Clear existing content except the heading
            const heading = desktopExecutiveSection.querySelector('h2');
            desktopExecutiveSection.innerHTML = '';
            if (heading) {
                desktopExecutiveSection.appendChild(heading);
            }
            
            Object.entries(data.executive_members).forEach(([name, phone]) => {
                const leaderDiv = document.createElement('div');
                leaderDiv.className = 'leader-entry';
                leaderDiv.innerHTML = `
                    <p class="leader-name-phone">${name} | ${phone}</p>
                `;
                desktopExecutiveSection.appendChild(leaderDiv);
            });
        }
    }

    // Load Events from JSON (now displays heading → image (if any) → description)
    loadEvents();

    async function loadEvents() {
        const eventsContainer = document.getElementById('eventsContainer');
        if (!eventsContainer) return;

        try {
            const response = await fetch('Our Events/edits.json');
            if (!response.ok) {
                throw new Error('Failed to load events data');
            }
            
            const data = await response.json();
            
            if (data.events && data.events.length > 0) {
                eventsContainer.innerHTML = ''; // Clear existing content
                
                // Use a for...of loop so we can await each createEventItem
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

    // Create a single event block with: [Heading] → [Image if exists] → [Description]
    async function createEventItem(event, container) {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event-item';

        // 1) Title (Heading) first
        const titleEl = document.createElement('h3');
        titleEl.textContent = event.title;
        eventDiv.appendChild(titleEl);

        // 2) Attempt to find an image for this event (check .jpg, .jpeg, .png)
        const extensions = ['jpg', 'jpeg', 'png'];
        for (let ext of extensions) {
            const filePath = `Our Events/${event.id}.${ext}`;
            try {
                // Use a HEAD request to check existence
                const response = await fetch(filePath, { method: 'HEAD' });
                if (response.ok) {
                    // Found an image → Insert it after the heading
                    const img = document.createElement('img');
                    img.src = filePath;
                    img.alt = event.title;
                    img.style.width = '100%';
                    img.style.height = 'auto';
                    img.style.marginBottom = '10px';

                    // Insert img directly after the <h3>
                    eventDiv.appendChild(img);
                    break; // Stop checking other extensions once found
                }
            } catch (err) {
                // If HEAD request fails, move on to next extension
                console.warn(`Could not find ${filePath}`, err);
                continue;
            }
        }

        // 3) Description (always last)
        const descEl = document.createElement('p');
        descEl.textContent = event.description;
        eventDiv.appendChild(descEl);

        // Finally, append this complete block to the container
        container.appendChild(eventDiv);
    }

    // Load Members from members.json
    loadMembers();

    async function loadMembers() {
        const membersContainer = document.getElementById('membersContainer');
        if (!membersContainer) return;

        try {
            const response = await fetch('members.json');
            if (!response.ok) {
                throw new Error('Failed to load members data');
            }
            
            const data = await response.json();
            
            if (data.members && data.members.length > 0) {
                membersContainer.innerHTML = ''; // Clear existing content

                data.members.forEach(name => {
                    createMemberItem(name, membersContainer);
                });
            } else {
                membersContainer.innerHTML = '<p>No members available at the moment.</p>';
            }
        } catch (error) {
            console.error('Error loading members:', error);
            membersContainer.innerHTML = '<p>Unable to load members. Please try again later.</p>';
        }
    }

    function createMemberItem(name, container) {
        const memberDiv = document.createElement('div');
        memberDiv.className = 'contributor-entry';
        memberDiv.innerHTML = `<p>${name}</p>`;
        container.appendChild(memberDiv);
    }

    // Load Contributors from contributors.json (names + amounts)
    loadContributors();

    async function loadContributors() {
        const contributorsContainer = document.getElementById('contributorsContainer');
        if (!contributorsContainer) return;

        try {
            const response = await fetch('contributors.json');
            if (!response.ok) {
                throw new Error('Failed to load contributors data');
            }
            
            const data = await response.json();

            if (data.contributors && Object.keys(data.contributors).length > 0) {
                contributorsContainer.innerHTML = ''; // Clear existing content

                Object.entries(data.contributors).forEach(([name, amount]) => {
                    createContributionItem({ name, amount }, contributorsContainer);
                });
            } else {
                contributorsContainer.innerHTML = '<p>No contributions available at the moment.</p>';
            }
        } catch (error) {
            console.error('Error loading contributors:', error);
            contributorsContainer.innerHTML = '<p>Unable to load contributions. Please try again later.</p>';
        }
    }

    function createContributionItem(contributor, container) {
        const div = document.createElement('div');
        div.className = 'contributor-entry';
        div.innerHTML = `<p>${contributor.name}<span class="contributor-amount">— ₹${contributor.amount}</span></p>`;
        container.appendChild(div);
    }

    // We leave the modal code in place, but since no "More Details" button is ever rendered, it won't be triggered.
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
        document.body.style.overflow = 'auto'; // Restore scrolling
    }

    if (fileClose) {
        fileClose.addEventListener('click', function() {
            closeFileModal();
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === fileModal) {
            closeFileModal();
        }
    });

    // Dummy stub (unused now) for compatibility
    function openFileInModal(filePath, type) {
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
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    window.openFileInModal = openFileInModal;
    window.closeFileModal = closeFileModal;
});
