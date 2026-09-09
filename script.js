/* ==========================================================================
   DR. A. V. PARAMKUSAM - PORTFOLIO INTERACTIVE CONTROLLER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initStatsCounter();
  initPublicationsEngine();
  initContactForm();
  initModals();
});

/* --------------------------------------------------------------------------
   1. Theme Switcher (Dark / Light Mode)
   -------------------------------------------------------------------------- */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  
  // Check local storage or system preference
  const savedTheme = localStorage.getItem('paramkusam_academic_theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  let currentTheme = savedTheme ? savedTheme : (systemPrefersDark ? 'dark' : 'light');
  
  applyTheme(currentTheme);
  
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(currentTheme);
      localStorage.setItem('paramkusam_academic_theme', currentTheme);
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeIcon) {
      themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }
}

/* --------------------------------------------------------------------------
   2. Sticky Navigation & ScrollSpy
   -------------------------------------------------------------------------- */
function initNavigation() {
  const navbar = document.getElementById('navbar');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Scroll handler for navbar shrink & shadow
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // ScrollSpy active link detection
    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });

  // Mobile menu toggle
  if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = mobileMenuToggle.querySelector('i');
      if (icon) {
        icon.className = navMenu.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
      }
    });

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = mobileMenuToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      });
    });
  }
}

/* --------------------------------------------------------------------------
   3. Animated Statistics Counters
   -------------------------------------------------------------------------- */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statNumbers.forEach(counter => {
          const target = parseInt(counter.getAttribute('data-target'), 10);
          const suffix = counter.getAttribute('data-suffix') || '';
          let count = 0;
          const duration = 1800; // ms
          const increment = Math.max(1, Math.ceil(target / (duration / 30)));
          
          const timer = setInterval(() => {
            count += increment;
            if (count >= target) {
              counter.innerText = target + suffix;
              clearInterval(timer);
            } else {
              counter.innerText = count + suffix;
            }
          }, 30);
        });
      }
    });
  }, { threshold: 0.2 });

  const statsSection = document.getElementById('experience');
  if (statsSection) observer.observe(statsSection);
}

/* --------------------------------------------------------------------------
   4. Research Publications Engine (Filter & Search)
   -------------------------------------------------------------------------- */
let activeCategory = 'all';
let searchQuery = '';
let showAllPublications = false;

function initPublicationsEngine() {
  const pubListContainer = document.getElementById('pub-list-container');
  const pubSearchInput = document.getElementById('pub-search-input');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const expandPubsBtn = document.getElementById('expand-pubs-btn');

  if (!pubListContainer || !window.PUBLICATIONS_DATA) return;

  renderPublications();
  updateCategoryCounts();

  // Search input handler
  if (pubSearchInput) {
    pubSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderPublications();
    });
  }

  // Filter button handlers
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-filter');
      renderPublications();
    });
  });

  // Expand all button handler
  if (expandPubsBtn) {
    expandPubsBtn.addEventListener('click', () => {
      showAllPublications = !showAllPublications;
      expandPubsBtn.innerHTML = showAllPublications ?
        '<i class="fas fa-compress-alt"></i> Show Featured Publications' :
        '<i class="fas fa-chevron-down"></i> View All 49 Publications';
      renderPublications();
    });
  }
}

function renderPublications() {
  const container = document.getElementById('pub-list-container');
  if (!container) return;

  const data = window.PUBLICATIONS_DATA;
  
  let filtered = data.filter(item => {
    // Category match
    const matchesCategory = (activeCategory === 'all') || item.categories.includes(activeCategory);
    
    // Search query match
    const matchesSearch = searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery) ||
      item.authors.toLowerCase().includes(searchQuery) ||
      item.journal.toLowerCase().includes(searchQuery) ||
      item.year.toString().includes(searchQuery);

    return matchesCategory && matchesSearch;
  });

  // If not expanded and no specific search/filter is active, limit to 8 items
  const itemsToDisplay = (showAllPublications || searchQuery !== '' || activeCategory !== 'all') ? filtered : filtered.slice(0, 8);

  if (itemsToDisplay.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
        <i class="fas fa-search" style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--border-color);"></i>
        <p>No publications found matching your filter or search query.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = itemsToDisplay.map(item => `
    <div class="pub-card">
      <div class="pub-header">
        <h4 class="pub-title">${item.title}</h4>
        <span class="pub-tag tag-year">${item.year}</span>
      </div>
      <div class="pub-authors"><i class="fas fa-users" style="margin-right: 0.35rem; color: var(--royal-blue);"></i> ${item.authors}</div>
      <div class="pub-venue">${item.journal} ${item.volume ? `• Vol. ${item.volume}` : ''} ${item.issue ? `(${item.issue})` : ''} ${item.pages ? `pp. ${item.pages}` : ''}</div>
      <div class="pub-tags">
        ${item.indexing.map(idx => `
          <span class="pub-tag ${idx.includes('SCI') ? 'tag-scie' : idx.includes('SCOPUS') ? 'tag-scopus' : 'tag-wos'}">${idx}</span>
        `).join('')}
      </div>
      <div class="pub-actions">
        <a href="https://doi.org/${item.doi}" target="_blank" rel="noopener noreferrer" class="pub-action-btn">
          <i class="fas fa-external-link-alt"></i> DOI Link
        </a>
        <button onclick="copyBibTeX(${item.id})" class="pub-action-btn">
          <i class="fas fa-quote-right"></i> BibTeX
        </button>
      </div>
    </div>
  `).join('');
}

function updateCategoryCounts() {
  const data = window.PUBLICATIONS_DATA;
  const filterButtons = document.querySelectorAll('.filter-btn');

  filterButtons.forEach(btn => {
    const cat = btn.getAttribute('data-filter');
    const countSpan = btn.querySelector('.filter-count');
    if (countSpan) {
      if (cat === 'all') {
        countSpan.innerText = data.length;
      } else {
        const count = data.filter(item => item.categories.includes(cat)).length;
        countSpan.innerText = count;
      }
    }
  });
}

// BibTeX Modal & Copy handler
window.copyBibTeX = function(pubId) {
  const item = window.PUBLICATIONS_DATA.find(p => p.id === pubId);
  if (!item) return;

  const modalBody = document.getElementById('modal-body-content');
  const modalTitle = document.getElementById('modal-title');
  const modalOverlay = document.getElementById('generic-modal');

  if (modalTitle) modalTitle.innerText = "BibTeX Citation";
  if (modalBody) {
    modalBody.innerHTML = `
      <p style="font-size: 0.9rem; margin-bottom: 1rem; color: var(--text-secondary);">
        Copy the BibTeX citation for <strong>"${item.title}"</strong>:
      </p>
      <pre style="background: var(--bg-secondary); padding: 1.25rem; border-radius: var(--radius-md); font-family: var(--font-code); font-size: 0.85rem; border: 1px solid var(--border-color); white-space: pre-wrap; word-break: break-all;" id="bibtex-text">${item.bibtex}</pre>
      <div style="margin-top: 1.25rem; text-align: right;">
        <button class="btn btn-primary" onclick="copyBibTeXToClipboard()">
          <i class="fas fa-copy"></i> Copy to Clipboard
        </button>
      </div>
    `;
  }

  if (modalOverlay) modalOverlay.classList.add('active');
};

window.copyBibTeXToClipboard = function() {
  const textElem = document.getElementById('bibtex-text');
  if (textElem) {
    navigator.clipboard.writeText(textElem.innerText).then(() => {
      showToast("BibTeX citation copied to clipboard!");
      closeModal();
    });
  }
};

/* --------------------------------------------------------------------------
   5. Modals & Notifications
   -------------------------------------------------------------------------- */
function initModals() {
  const modalOverlay = document.getElementById('generic-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  if (modalCloseBtn && modalOverlay) {
    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }
}

window.closeModal = function() {
  const modalOverlay = document.getElementById('generic-modal');
  if (modalOverlay) modalOverlay.classList.remove('active');
};

window.showToast = function(message) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fas fa-check-circle" style="color: #10B981;"></i> <span>${message}</span>`;
  toast.classList.add('active');
  setTimeout(() => {
    toast.classList.remove('active');
  }, 3500);
};

/* --------------------------------------------------------------------------
   6. Contact Form Handler
   -------------------------------------------------------------------------- */
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('form-name').value;
      const email = document.getElementById('form-email').value;
      const subject = document.getElementById('form-subject').value;
      const message = document.getElementById('form-message').value;

      if (!name || !email || !message) {
        showToast("Please fill in all required fields.");
        return;
      }

      // Simulate sending message
      showToast(`Thank you, ${name}! Your message has been sent successfully.`);
      contactForm.reset();
    });
  }
}

/* --------------------------------------------------------------------------
   7. Printable Academic CV Handler
   -------------------------------------------------------------------------- */
window.printCV = function() {
  showToast("Preparing Dr. A. V. Paramkusam's Academic CV for printing...");
  setTimeout(() => {
    window.print();
  }, 500);
};

/* --------------------------------------------------------------------------
   8. Research Journey Modal View
   -------------------------------------------------------------------------- */
window.openResearchJourneyModal = function() {
  const modalBody = document.getElementById('modal-body-content');
  const modalTitle = document.getElementById('modal-title');
  const modalOverlay = document.getElementById('generic-modal');

  if (modalTitle) modalTitle.innerText = "Research Journey & Evolution";
  if (modalBody) {
    modalBody.innerHTML = `
      <div style="line-height: 1.7; color: var(--text-secondary);">
        <h4 style="font-family: var(--font-heading); color: var(--text-primary); margin-bottom: 0.5rem; font-size: 1.15rem;">
          Phase 1: Foundations in Signal & Video Processing (1998 – 2010)
        </h4>
        <p style="margin-bottom: 1.25rem;">
          Initiated research during early teaching tenure focused on digital signal processing architectures, discrete transforms, and electronic instrumentation systems at MVGR and Aditya Institutions.
        </p>

        <h4 style="font-family: var(--font-heading); color: var(--text-primary); margin-bottom: 0.5rem; font-size: 1.15rem;">
          Phase 2: Doctoral Research & Motion Estimation Breakthroughs (2010 – 2016)
        </h4>
        <p style="margin-bottom: 1.25rem;">
          Completed Ph.D. at JNTU Hyderabad on <em>"Multi-layer Frame Reference Motion Estimation Algorithm for Video Coding"</em>. Pioneered transform-domain partial distortion matching algorithms that cut video compression search computations drastically, published in top journals like <em>Electronics Letters</em> and <em>Multimedia Tools and Applications</em>.
        </p>

        <h4 style="font-family: var(--font-heading); color: var(--text-primary); margin-bottom: 0.5rem; font-size: 1.15rem;">
          Phase 3: Digital Watermarking & Visual Security (2016 – 2022)
        </h4>
        <p style="margin-bottom: 1.25rem;">
          Expanded into robust digital image and video watermarking using hybrid DWT-SVD and fractional wavelet transforms for secure tele-diagnostics and media copyright protection.
        </p>

        <h4 style="font-family: var(--font-heading); color: var(--text-primary); margin-bottom: 0.5rem; font-size: 1.15rem;">
          Phase 4: AI, Deep Learning & Smart Healthcare (2022 – Present)
        </h4>
        <p>
          Currently advancing lightweight visual intelligence, machine learning, and medical image segmentation. Earned AICTE QIP PG Certification from IIT Dhanbad (CGPA: 9.22) and multiple NPTEL Gold Topper certifications.
        </p>
      </div>
    `;
  }

  if (modalOverlay) modalOverlay.classList.add('active');
};
