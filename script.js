// Global variables
let editionsData = {};
let currentFilter = 'all';
let currentSearch = '';
let searchTimeout = null;
let focusTrap = null;

// Utility functions
function debounce(func, wait) {
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(searchTimeout);
            func(...args);
        };
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(later, wait);
    };
}

function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

function highlightText(text, searchTerm) {
    if (!searchTerm) return sanitizeHTML(text);

    const escapedSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearch})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// Focus trap for modals
function createFocusTrap(modalElement) {
    const focusableElements = modalElement.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    function trapFocus(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        }
    }

    modalElement.addEventListener('keydown', trapFocus);
    firstFocusable?.focus();

    return () => modalElement.removeEventListener('keydown', trapFocus);
}



// Load editions data
async function loadEditionsData() {
    let lastError = null;

    // Show loading state
    showLoadingState();

    try {
        const response = await fetch('data/redbull_editions.json');

        if (response.ok) {
            editionsData = await response.json();

            // Validate data structure
            if (editionsData && typeof editionsData === 'object') {
                populateEditionsList();
                populateCountriesGrid();
                updateEditionCount();

                return;
            }
        }
    } catch (error) {
        lastError = error;
        console.error('Error loading editions data:', error);
    }

    // If all sources failed, show error state
    showErrorState(lastError);
}

// Show loading state
function showLoadingState() {
    const editionsList = document.querySelector('.editions-list');
    const countriesGrid = document.querySelector('.countries-grid');

    if (editionsList) {
        editionsList.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <div class="loading-spinner"></div>
                <p style="margin-top: 20px; color: #666;">Loading editions...</p>
            </div>
        `;
    }

    if (countriesGrid) {
        countriesGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <div class="loading-spinner"></div>
            </div>
        `;
    }
}

// Show error state when data loading fails
function showErrorState(error) {
    const editionsList = document.querySelector('.editions-list');
    const countriesGrid = document.querySelector('.countries-grid');

    if (editionsList) {
        editionsList.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">
                <h3>⚠️ Unable to load editions data</h3>
                <p>Please check your internet connection and try again.</p>
                <button onclick="loadEditionsData()" style="margin-top: 15px; padding: 10px 20px; background: #FF69B4; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    Retry Loading
                </button>
            </div>
        `;
    }

    if (countriesGrid) {
        countriesGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">
                <p>Country data unavailable</p>
            </div>
        `;
    }
}

// Update edition count
function updateEditionCount() {
    const editionCountElement = document.getElementById('editionCount');
    if (!editionCountElement) return;

    const allEditions = [];

    // Collect all editions from all countries
    Object.entries(editionsData).forEach(([countryKey, country]) => {
        country.editions.forEach(edition => {
            allEditions.push({
                ...edition,
                country: countryKey.charAt(0).toUpperCase() + countryKey.slice(1),
                countryFlag: country.flag,
                countryCode: countryKey.toUpperCase()
            });
        });
    });

    // Filter editions based on current filter and search
    const filteredEditions = allEditions.filter(edition => {
        // Filter by type
        let matchesFilter = true;
        if (currentFilter === 'sugarfree') matchesFilter = edition.sugarfree;
        if (currentFilter === 'regular') matchesFilter = !edition.sugarfree;

        // Filter by search
        const matchesSearch = currentSearch === '' ||
            edition.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
            edition.flavor.toLowerCase().includes(currentSearch.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    // Remove duplicates based on name and flavor
    const uniqueEditions = filteredEditions.filter((edition, index, self) =>
        index === self.findIndex(e => e.name === edition.name && e.flavor === edition.flavor)
    );

    editionCountElement.textContent = uniqueEditions.length;
}

// Populate editions list
function populateEditionsList() {
    const editionsList = document.getElementById('editionsList');
    if (!editionsList) return;

    editionsList.innerHTML = '';

    const allEditions = [];

    // Collect all editions from all countries
    Object.entries(editionsData).forEach(([countryKey, country]) => {
        country.editions.forEach(edition => {
            allEditions.push({
                ...edition,
                country: countryKey.charAt(0).toUpperCase() + countryKey.slice(1),
                countryFlag: country.flag,
                countryCode: countryKey.toUpperCase()
            });
        });
    });

    // Filter editions based on current filter and search
    const filteredEditions = allEditions.filter(edition => {
        // Filter by type
        let matchesFilter = true;
        if (currentFilter === 'sugarfree') matchesFilter = edition.sugarfree;
        if (currentFilter === 'regular') matchesFilter = !edition.sugarfree;

        // Filter by search
        const matchesSearch = currentSearch === '' ||
            edition.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
            edition.flavor.toLowerCase().includes(currentSearch.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    // Remove duplicates based on name and flavor
    const uniqueEditions = filteredEditions.filter((edition, index, self) =>
        index === self.findIndex(e => e.name === edition.name && e.flavor === edition.flavor)
    );

    // Show "no results" message if empty
    if (uniqueEditions.length === 0) {
        editionsList.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #666;">
                <h3 style="margin-bottom: 10px;">No editions found</h3>
                <p>Try adjusting your search or filter criteria</p>
                ${currentSearch ? `<p style="margin-top: 10px;">Search term: "${sanitizeHTML(currentSearch)}"</p>` : ''}
            </div>
        `;
    } else {
        uniqueEditions.forEach(edition => {
            const editionCard = createEditionCard(edition);
            editionsList.appendChild(editionCard);
        });
    }
}

// Create edition card with tooltip support
function createEditionCard(edition) {
    const card = document.createElement('div');
    card.className = 'edition-card';

    const tags = [];
    if (edition.sugarfree) {
        tags.push('<span class="tag tag-sugarfree">Sugarfree</span>');
    } else {
        tags.push('<span class="tag tag-regular">Regular</span>');
    }

    // Get all countries that have this edition
    const availableCountries = Object.entries(editionsData)
        .filter(([countryKey, country]) => country.editions.some(e => e.name === edition.name && e.flavor === edition.flavor))
        .map(([countryKey, country]) => country.flag);

    // Create flag elements with tooltips
    const flagElements = availableCountries.join(' ');

    // Find the best product URL (prioritize native English-speaking countries)
    const preferredCountries = ['united states', 'united kingdom', 'australia', 'canada', 'international'];
    let bestProductUrl = null;

    // First try to find URL from preferred countries
    for (const preferredCountry of preferredCountries) {
        if (editionsData[preferredCountry]) {
            const preferredEdition = editionsData[preferredCountry].editions.find(e =>
                e.name === edition.name
            );
            if (preferredEdition && preferredEdition.product_url) {
                bestProductUrl = preferredEdition.product_url;
                break;
            }
        }
    }

    // If no preferred country has this edition, use the first available URL
    if (!bestProductUrl) {
        for (const [countryKey, country] of Object.entries(editionsData)) {
            const foundEdition = country.editions.find(e =>
                e.name === edition.name
            );
            if (foundEdition && foundEdition.product_url) {
                bestProductUrl = foundEdition.product_url;
                break;
            }
        }
    }

    const highlightedName = highlightText(edition.name, currentSearch);
    const highlightedFlavor = highlightText(edition.flavor, currentSearch);

    card.innerHTML = `
        <div class="edition-header">
            <div class="edition-can">
                <img src="${getBestImageUrl(edition.name, edition.flavor)}"
                     alt="${edition.alt_text || edition.name}"
                     class="edition-can-image"
                     loading="lazy">
            </div>
            <div class="edition-info">
                <h4>${highlightedName}</h4>
                <p>${highlightedFlavor}</p>
                ${edition.flavor_description ? `<p class="flavor-description">${highlightText(edition.flavor_description, currentSearch)}</p>` : ''}
                <p style="font-size: 12px; color: #999; margin-bottom: 5px;">${flagElements}</p>
            </div>
        </div>
        <div class="edition-tags">
            ${tags.join('')}
        </div>
        ${bestProductUrl ? `<button class="product-link-btn" onclick="openProductPage('${bestProductUrl}', '${edition.name}')">View Product</button>` : ''}
    `;

    // Add tooltip functionality
    const flagTooltipElements = card.querySelectorAll('.flag-tooltip');
    flagTooltipElements.forEach(flag => {
        flag.addEventListener('mouseenter', showTooltip);
        flag.addEventListener('mouseleave', hideTooltip);
    });

    return card;
}

// Show tooltip with country name
function showTooltip(event) {
    const countryName = event.target.getAttribute('data-country');
    if (!countryName) return;

    // Remove existing tooltip
    const existingTooltip = document.querySelector('.country-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }

    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'country-tooltip';
    tooltip.textContent = countryName;
    document.body.appendChild(tooltip);

    // Position tooltip
    const rect = event.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';

    // Show tooltip
    setTimeout(() => {
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateY(-5px)';
    }, 10);
}

// Hide tooltip
function hideTooltip() {
    const tooltip = document.querySelector('.country-tooltip');
    if (tooltip) {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateY(0)';
        setTimeout(() => {
            tooltip.remove();
        }, 200);
    }
}

// Populate countries grid
function populateCountriesGrid() {
    const countriesGrid = document.getElementById('countriesGrid');
    if (!countriesGrid) return;

    countriesGrid.innerHTML = '';

    Object.entries(editionsData).forEach(([countryKey, country]) => {
        const countryCard = createCountryCard(countryKey, country);
        countriesGrid.appendChild(countryCard);
    });
}

// Create country card element
function createCountryCard(countryKey, country) {
    const card = document.createElement('div');
    card.className = 'country-card';

    // Use flag_url if available, otherwise use emoji flag
    const flagDisplay = country.flag_url ?
        `<img src="${country.flag_url}" alt="${countryKey} flag" class="country-flag-img">` :
        `<div class="country-flag">${country.flag}</div>`;

    const editionNames = country.editions.map(edition => edition.name);
    const uniqueEditions = [...new Set(editionNames)];

    const editionsList = uniqueEditions.slice(0, 5).map(edition => {
        const editionData = country.editions.find(e => e.name === edition);
        return `<span class="edition-mini" style="background: ${editionData.color}">${edition}</span>`;
    }).join('');

    const countryName = countryKey.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    card.innerHTML = `
        <div class="country-header">
            ${flagDisplay}
            <span class="country-name">${countryName}</span>
        </div>
        <div class="country-editions">
            ${country.editions.length} Editions Available
        </div>
        <div class="country-editions-list">
            ${editionsList}
            ${uniqueEditions.length > 5 ? `<span class="edition-mini" style="background: #666">+${uniqueEditions.length - 5}</span>` : ''}
        </div>
    `;

    card.addEventListener('click', () => {
        showCountryEditions(countryKey, country);
    });

    return card;
}

// Show country editions in modal
function showCountryEditions(countryKey, country) {
    try {
        const modal = document.getElementById('countryModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalEditionsGrid = document.getElementById('modalEditionsGrid');

        if (!modal || !modalTitle || !modalEditionsGrid) return;

        if (!editionsData || Object.keys(editionsData).length === 0) return;

        // Use flag_url if available, otherwise use emoji flag
        const flagDisplay = country.flag_url ?
            `<img src="${country.flag_url}" alt="${countryKey} flag" class="modal-flag-img">` :
            country.flag;

        const countryName = countryKey.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        modalTitle.innerHTML = `${flagDisplay} ${countryName} - All Editions`;
        modalEditionsGrid.innerHTML = '';

        country.editions.forEach(edition => {
            const modalEditionCard = createModalEditionCard(edition);
            modalEditionsGrid.appendChild(modalEditionCard);
        });

        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');

        // Setup focus trap
        focusTrap = createFocusTrap(modal);

        // Lock body scroll when modal is open
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error showing country editions:', error);
    }
}

// Create modal edition card with product link
function createModalEditionCard(edition) {
    const card = document.createElement('div');
    card.className = 'modal-edition-card';

    const tags = [];
    if (edition.sugarfree) {
        tags.push('<span class="tag tag-sugarfree">Sugarfree</span>');
    } else {
        tags.push('<span class="tag tag-regular">Regular</span>');
    }

    card.innerHTML = `
        <div class="modal-edition-can">
            <img src="${edition.image_url || getCanImage(edition)}"
                 alt="${edition.alt_text || edition.name}"
                 class="modal-edition-can-image"
                 loading="lazy">
        </div>
        <div class="modal-edition-info">
            <h4>${edition.name}</h4>
            <p>${edition.flavor}</p>
            ${edition.flavor_description ? `<p class="flavor-description">${edition.flavor_description}</p>` : ''}
            <div class="edition-tags">
                ${tags.join('')}
            </div>
            ${edition.product_url ? `<button class="product-link-btn" onclick="openProductPage('${edition.product_url}', '${edition.name}')">View Product</button>` : ''}
        </div>
    `;

    return card;
}

// Open product page in iframe modal
function openProductPage(url, productName) {
    try {
        // Validate URL before opening
        if (!url || !isValidUrl(url)) {
            console.error('Invalid URL provided:', url);
            alert('Unable to open product page - invalid URL');
            return;
        }

        const iframeModal = document.getElementById('iframeModal');
        const iframeTitle = document.getElementById('iframeTitle');
        const iframeContent = document.getElementById('iframeContent');
        const closeIframeModal = document.getElementById('closeIframeModal');

        if (!iframeModal || !iframeTitle || !iframeContent) return;

        // Sanitize product name
        iframeTitle.textContent = productName;

        // Show loading state
        iframeContent.style.display = 'none';

        // Add loading indicator properly without destroying existing DOM
        const existingLoading = iframeModal.querySelector('.iframe-loading');
        if (existingLoading) existingLoading.remove();

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'iframe-loading';
        loadingDiv.textContent = 'Loading product page...';
        const iframeContainer = iframeModal.querySelector('.iframe-container');
        if (iframeContainer) {
            iframeContainer.appendChild(loadingDiv);
        }

        iframeContent.src = url;
        iframeModal.style.display = 'flex';
        iframeModal.setAttribute('aria-hidden', 'false');

        // Setup focus trap
        focusTrap = createFocusTrap(iframeModal);

        // Lock body scroll when iframe modal is open
        document.body.style.overflow = 'hidden';

        // Remove loading state when iframe loads
        iframeContent.onload = () => {
            const loadingEl = iframeModal.querySelector('.iframe-loading');
            if (loadingEl) loadingEl.remove();
            iframeContent.style.display = 'block';
        };
    } catch (error) {
        console.error('Error opening product page:', error);
        alert('An error occurred while opening the product page');
    }
}

// Setup modal functionality
function setupModal() {
    const modal = document.getElementById('countryModal');
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            // Clean up focus trap
            if (focusTrap) {
                focusTrap();
                focusTrap = null;
            }
            // Unlock body scroll when modal is closed
            document.body.style.overflow = '';
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                modal.setAttribute('aria-hidden', 'true');
                // Clean up focus trap
                if (focusTrap) {
                    focusTrap();
                    focusTrap = null;
                }
                // Unlock body scroll when modal is closed
                document.body.style.overflow = '';
            }
        });
    }
}

// Setup iframe modal functionality
function setupIframeModal() {
    const iframeModal = document.getElementById('iframeModal');
    const closeIframeModal = document.getElementById('closeIframeModal');

    if (closeIframeModal) {
        closeIframeModal.addEventListener('click', () => {
            iframeModal.style.display = 'none';
            iframeModal.setAttribute('aria-hidden', 'true');
            // Clean up focus trap
            if (focusTrap) {
                focusTrap();
                focusTrap = null;
            }
            // Unlock body scroll when iframe modal is closed
            document.body.style.overflow = '';
            // Clear iframe src to stop loading
            const iframeContent = document.getElementById('iframeContent');
            if (iframeContent) {
                iframeContent.src = '';
            }
        });
    }

    if (iframeModal) {
        iframeModal.addEventListener('click', (e) => {
            if (e.target === iframeModal) {
                iframeModal.style.display = 'none';
                iframeModal.setAttribute('aria-hidden', 'true');
                // Clean up focus trap
                if (focusTrap) {
                    focusTrap();
                    focusTrap = null;
                }
                // Unlock body scroll when iframe modal is closed
                document.body.style.overflow = '';
                // Clear iframe src to stop loading
                const iframeContent = document.getElementById('iframeContent');
                if (iframeContent) {
                    iframeContent.src = '';
                }
            }
        });
    }
}

// Get can image URL from edition data
function getCanImage(edition) {
    // Use the image_url from the edition data
    if (edition.image_url) {
        return edition.image_url;
    }

    // Fallback to default image if no image URL is provided
    return 'https://www.redbull.com/energydrink/v1/resources/storyblok/images/f/287059/870x2200/9153a98907/de_ed_250ml_energy-drink_country_rgb_initi5-311_cold_closed_front_com_25.png/m/310x0';
}

// Get best image URL for an edition (prioritize native English-speaking countries)
function getBestImageUrl(editionName, editionFlavor) {
const preferredCountries = ['united states', 'united kingdom', 'australia', 'canada', 'international'];

    // First try to find image from preferred countries
    for (const preferredCountry of preferredCountries) {
        const matchingKey = Object.keys(editionsData).find(key => key.toLowerCase() === preferredCountry);

        if (matchingKey) {
            const preferredEdition = editionsData[matchingKey].editions.find(e =>
                e.name === editionName && e.flavor === editionFlavor
            );
            if (preferredEdition && preferredEdition.image_url) {
                return preferredEdition.image_url;
            }
        }
    }

    // If no preferred country has this edition, use the first available image
    for (const [countryKey, country] of Object.entries(editionsData)) {
        const foundEdition = country.editions.find(e =>
            e.name === editionName && e.flavor === editionFlavor
        );
        if (foundEdition && foundEdition.image_url) {
            return foundEdition.image_url;
        }
    }

    // Fallback to default image
    return 'https://www.redbull.com/energydrink/v1/resources/storyblok/images/f/287059/870x2200/9153a98907/de_ed_250ml_energy-drink_country_rgb_initi5-311_cold_closed_front_com_25.png/m/310x0';
}

// Handle filter button clicks
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class and update aria-pressed for all buttons
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });

            // Add active class and update aria-pressed for clicked button
            button.classList.add('active');
            button.setAttribute('aria-pressed', 'true');

            // Update current filter
            currentFilter = button.dataset.filter;

            // Repopulate editions list
            populateEditionsList();
            updateEditionCount(); // Update count after filter change
        });
    });
}

// Handle search input with debouncing
function setupSearchInput() {
    const searchInput = document.getElementById('editionSearch');
    if (!searchInput) return;

    // Create debounced search function
    const debouncedSearch = debounce((value) => {
        currentSearch = sanitizeHTML(value);
        populateEditionsList();
        updateEditionCount();
    }, 250);

    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });
}

// Handle keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const countryModal = document.getElementById('countryModal');
            if (countryModal && countryModal.style.display === 'flex') {
                countryModal.style.display = 'none';
                countryModal.setAttribute('aria-hidden', 'true');
                // Clean up focus trap
                if (focusTrap) {
                    focusTrap();
                    focusTrap = null;
                }
                // Unlock body scroll when modal is closed
                document.body.style.overflow = '';
            }

            const iframeModal = document.getElementById('iframeModal');
            if (iframeModal && iframeModal.style.display === 'flex') {
                iframeModal.style.display = 'none';
                iframeModal.setAttribute('aria-hidden', 'true');
                // Clean up focus trap
                if (focusTrap) {
                    focusTrap();
                    focusTrap = null;
                }
                // Unlock body scroll when iframe modal is closed
                document.body.style.overflow = '';
                // Clear iframe src to stop loading
                const iframeContent = document.getElementById('iframeContent');
                if (iframeContent) {
                    iframeContent.src = '';
                }
            }
        }
    });
}

// Initialize the application
function init() {
    loadEditionsData();
    setupFilterButtons();
    setupSearchInput(); // Setup search input
    setupModal();
    setupIframeModal();
    setupKeyboardShortcuts();
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
