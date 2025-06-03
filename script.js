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

    // File Modal Logic (for PDF or image)
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

    // Helper to open either PDF (in iframe) or image (in <img>) in the modal
    function openFileInModal(filePath, type) {
        // If on mobile (< 768px), open in a new tab/window instead
        if (window.innerWidth < 768) {
            window.open(filePath, '_blank');
            return;
        }

        // Desktop: display modal
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

    // Load Events from JSON
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
                
                data.events.forEach(event => {
                    createEventItem(event, eventsContainer);
                });
            } else {
                eventsContainer.innerHTML = '<p>No events available at the moment.</p>';
            }
        } catch (error) {
            console.error('Error loading events:', error);
            eventsContainer.innerHTML = '<p>Unable to load events. Please try again later.</p>';
        }
    }

    function createEventItem(event, container) {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event-item';
        
        let eventHTML = `
            <h3>${event.title}</h3>
            <p>${event.description}</p>
        `;
        
        // Add "More Details" button if enabled
        if (event.hasMoreDetails) {
            eventHTML += `
                <button class="event-more-details-btn" data-event-id="${event.id}">More Details</button>
            `;
        }
        
        eventDiv.innerHTML = eventHTML;
        
        // If "More Details" is enabled, set up click handler
        if (event.hasMoreDetails) {
            const moreDetailsBtn = eventDiv.querySelector('.event-more-details-btn');
            moreDetailsBtn.addEventListener('click', function() {
                const eventId = this.getAttribute('data-event-id');
                attemptToOpenFile(eventId);
            });
        }
        
        container.appendChild(eventDiv);
    }

    async function attemptToOpenFile(eventId) {
        // Try in this order: pdf → jpg → jpeg → png
        const extensions = ['pdf', 'jpg', 'jpeg', 'png'];
        for (let ext of extensions) {
            const filePath = `Our Events/${eventId}.${ext}`;
            try {
                // Use HEAD to check if the file exists
                const response = await fetch(filePath, { method: 'HEAD' });
                if (response.ok) {
                    // Found the file; open in modal
                    if (ext === 'pdf') {
                        openFileInModal(filePath, 'pdf');
                    } else {
                        openFileInModal(filePath, 'image');
                    }
                    return;
                }
            } catch (err) {
                // If fetch itself fails (network error), skip to next extension
                console.warn(`Could not find ${filePath}`, err);
                continue;
            }
        }
        // If no matching file found, alert the user
        alert('No details file found for this event.');
    }

    // Load Contributors from JSON
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

                // Convert to array of [name, amount]
                const entries = Object.entries(data.contributors);

                // Extract all amounts, get unique and sort descending
                const amounts = entries.map(e => e[1]);
                const uniqueAmounts = Array.from(new Set(amounts)).sort((a, b) => b - a);
                const topAmounts = uniqueAmounts.slice(0, 3); // top 3 levels

                // Filter top contributors (anyone whose amount is in topAmounts)
                const topContributors = entries
                    .filter(([name, amount]) => topAmounts.includes(amount))
                    .sort((a, b) => b[1] - a[1]); // sort descending by amount

                const topNamesSet = new Set(topContributors.map(([name]) => name));

                // Create a container with a red border for top contributors
                const topContainer = document.createElement('div');
                topContainer.className = 'top-contributors';

                // Optional heading inside that border
                const topHeading = document.createElement('h3');
                topHeading.textContent = 'Top Contributors';
                topContainer.appendChild(topHeading);

                // List each top contributor with name and contribution
                topContributors.forEach(([name, amount]) => {
                    const entryDiv = document.createElement('div');
                    entryDiv.className = 'top-contributor-entry';
                    entryDiv.innerHTML = `
                        <p>${name}<span class="top-contributor-amount">— ₹${amount}</span></p>
                    `;
                    topContainer.appendChild(entryDiv);
                });

                // Append the bordered “Top Contributors” block first
                contributorsContainer.appendChild(topContainer);

                // Now append the remaining contributors (in the original JSON order), skipping those already shown
                entries.forEach(([name, amount]) => {
                    if (!topNamesSet.has(name)) {
                        createContributorItem({ name, amount }, contributorsContainer);
                    }
                });
            } else {
                contributorsContainer.innerHTML = '<p>No contributors available at the moment.</p>';
            }
        } catch (error) {
            console.error('Error loading contributors:', error);
            contributorsContainer.innerHTML = '<p>Unable to load contributors. Please try again later.</p>';
        }
    }

    function createContributorItem(contributor, container) {
        const contributorDiv = document.createElement('div');
        contributorDiv.className = 'contributor-entry';
        contributorDiv.innerHTML = `<p>${contributor.name}</p>`;
        container.appendChild(contributorDiv);
    }

    // Expose openFileInModal in case of external calls
    window.openFileInModal = openFileInModal;
    window.closeFileModal = closeFileModal;
});
