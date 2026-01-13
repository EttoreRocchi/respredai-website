/**
 * ResPredAI Website - Main JavaScript
 * Handles: AOS initialization, navigation, publications loading, and interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS (Animate On Scroll)
    initAOS();

    // Initialize navigation
    initNavigation();

    // Initialize header scroll effect
    initHeaderScroll();

    // Load publications from JSON
    loadPublications();

    // Initialize citation copy functionality
    initCitationCopy();

    // Initialize smooth scroll for anchor links
    initSmoothScroll();
});

/**
 * Initialize AOS (Animate On Scroll) library
 */
function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 50,
            disable: function() {
                // Disable on mobile if reduced motion is preferred
                return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            }
        });
    }
}

/**
 * Initialize mobile navigation toggle
 */
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

/**
 * Initialize header scroll effect (shrink on scroll)
 */
function initHeaderScroll() {
    const header = document.getElementById('header');
    let lastScrollY = 0;
    let ticking = false;

    function updateHeader() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        lastScrollY = window.scrollY;
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }
    });
}

/**
 * Load and render publications from JSON file
 */
async function loadPublications() {
    const container = document.getElementById('publications-container');
    const noPublicationsMsg = document.getElementById('no-publications');

    if (!container) return;

    try {
        const response = await fetch('data/publications.json');
        if (!response.ok) {
            throw new Error('Failed to load publications');
        }

        const data = await response.json();
        const citingPapers = data.citingPapers || [];

        if (citingPapers.length === 0) {
            // Show "no publications" message
            if (noPublicationsMsg) {
                noPublicationsMsg.style.display = 'block';
            }
            container.style.display = 'none';
            return;
        }

        // Hide "no publications" message
        if (noPublicationsMsg) {
            noPublicationsMsg.style.display = 'none';
        }
        container.style.display = 'grid';

        // Render publications
        const html = citingPapers.map(function(paper, index) {
            return createPublicationCard(paper, index);
        }).join('');

        container.innerHTML = html;

        // Re-initialize AOS for new elements
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }

    } catch (error) {
        console.error('Error loading publications:', error);
        // Show fallback message
        if (noPublicationsMsg) {
            noPublicationsMsg.style.display = 'block';
        }
        container.style.display = 'none';
    }
}

/**
 * Create HTML for a publication card
 */
function createPublicationCard(paper, index) {
    const delay = 100 + (index * 100);
    const doiUrl = paper.doi ? 'https://doi.org/' + paper.doi : paper.url || '#';

    return '\
        <article class="publication-card" data-aos="fade-up" data-aos-delay="' + delay + '">\
            <h4>' + escapeHtml(paper.title) + '</h4>\
            <p class="authors">' + escapeHtml(paper.authors) + '</p>\
            <p class="venue">' + escapeHtml(paper.journal) + ', ' + escapeHtml(paper.year) + '</p>\
            ' + (paper.doi ? '<a href="' + doiUrl + '" class="doi-link" target="_blank" rel="noopener">\
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">\
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>\
                    <polyline points="15 3 21 3 21 9"/>\
                    <line x1="10" y1="14" x2="21" y2="3"/>\
                </svg>\
                DOI: ' + escapeHtml(paper.doi) + '\
            </a>' : '') + '\
        </article>\
    ';
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Initialize citation copy functionality
 */
function initCitationCopy() {
    const citeButtons = document.querySelectorAll('.cite-btn');

    citeButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const citation = this.getAttribute('data-citation');
            if (citation) {
                copyToClipboard(citation);
            }
        });
    });
}

/**
 * Copy text to clipboard and show toast notification
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Citation copied to clipboard!');
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
            showToast('Citation copied to clipboard!');
        } catch (e) {
            showToast('Failed to copy citation');
        }

        document.body.removeChild(textArea);
    }
}

/**
 * Show toast notification
 */
function showToast(message) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create new toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(function() {
        toast.classList.add('show');
    }, 10);

    // Remove toast after delay
    setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() {
            toast.remove();
        }, 300);
    }, 3000);
}

/**
 * Initialize smooth scroll for anchor links
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(function(link) {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Skip if it's just "#"
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();

                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}
