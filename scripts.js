/* ======================================
   scripts.js — microinteractions & features
   - mobile nav toggle
   - ripple click effect
   - reveal-on-scroll (IntersectionObserver)
   - scroll progress bar
   - contact form microfeedback + validation
   - dive planner logic & localStorage save (advanced feature)
   ====================================== */

/* Helper: make NodeList -> Array for Safari */
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* -------------------------
   MOBILE NAV TOGGLE
   Simple, accessible hamburger behavior
   ------------------------- */
function setupMobileNav() {
  const toggles = $$('.mobile-toggle');
  toggles.forEach(t => {
    t.addEventListener('click', () => {
      const nav = document.getElementById('main-nav');
      const expanded = t.getAttribute('aria-expanded') === 'true';
      t.setAttribute('aria-expanded', String(!expanded));
      if (nav) {
        if (nav.style.display === 'flex') {
          nav.style.display = '';
        } else {
          nav.style.display = 'flex';
          nav.style.flexDirection = 'column';
          nav.style.gap = '10px';
        }
      }
    });
  });
}

/* -------------------------
   RIPPLE EFFECT
   Adds a quick visual 'tap' feedback on clickable items with .ripple
   ------------------------- */
function setupRipples() {
  document.addEventListener('pointerdown', (e) => {
    const el = e.target.closest('.ripple');
    if (!el) return;

    // create ink element
    const ink = document.createElement('span');
    ink.className = 'ripple-ink';
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 0.9;
    ink.style.width = ink.style.height = size + 'px';
    ink.style.left = (e.clientX - rect.left - size/2) + 'px';
    ink.style.top = (e.clientY - rect.top - size/2) + 'px';
    el.appendChild(ink);

    // remove after animation
    ink.addEventListener('animationend', () => ink.remove(), {once:true});
  });
}

/* -------------------------
   REVEAL ON SCROLL
   Uses IntersectionObserver for performance
   ------------------------- */
function setupRevealOnScroll() {
  const items = $$('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    // fallback: reveal immediately
    items.forEach(it => it.classList.add('revealed'));
    return;
  }

  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.12});

  items.forEach(it => obs.observe(it));
}

/* -------------------------
   SCROLL PROGRESS BAR
   Tiny line at top to indicate how far down page you are
   ------------------------- */
function setupScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  function update() {
    const doc = document.documentElement;
    const scrollTop = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
    const height = doc.scrollHeight - doc.clientHeight;
    const pct = (height > 0) ? Math.min(100, Math.round((scrollTop / height) * 100)) : 0;
    bar.style.width = pct + '%';
  }

  window.addEventListener('scroll', update, {passive:true});
  window.addEventListener('resize', update);
  update();
}

/* -------------------------
   ACTIVE NAV LINK (highlights corresponding nav)
   Note: simple page-level active detection by pathname
   ------------------------- */
function highlightActiveNav() {
  const links = $$('a.nav-link');
  const path = location.pathname.split('/').pop() || 'index.html';
  links.forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    if (href === path) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });
}

/* -------------------------
   CONTACT FORM HANDLING (microfeedback)
   This is demo client-side only — shows inline feedback
   ------------------------- */
function setupContactForms() {
  const forms = $$('form');
  forms.forEach(form => {
    if (form.id === 'contactForm') {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const name = formData.get('name') || 'friend';
        const feedback = document.getElementById('formFeedback') || document.getElementById('form-status');

        if (feedback) {
          feedback.textContent = `Thanks ${String(name).split(' ')[0]} — message queued (demo).`;
          feedback.style.color = '#0a5';
        }
        form.reset();
      });
    }
  });
}

/* -------------------------
   DIVE PLANNER (ADVANCED FEATURE)
   Simple client-side suggestion engine + localStorage saver
   - form: #divePlanner
   - result container: #plannerResult
   - save button: #savePlan
   - saved plans list: #savedPlans
   ------------------------- */
function setupDivePlanner() {
  const form = document.getElementById('divePlanner');
  const result = document.getElementById('plannerResult');
  const saveBtn = document.getElementById('savePlan');
  const savedList = document.getElementById('savedPlans');

  function recommend(data) {
    // mild safety rules demo-only
    const depth = Number(data.depth) || 10;
    const level = data.level || 'beginner';

    let recommendedMax = 18; // default
    let notes = [];

    if (level === 'beginner') {
      recommendedMax = Math.min(12, depth);
      notes.push('Keep it shallow and comfortable.');
      notes.push('Buddy up with one of our instructors.');
    } else if (level === 'intermediate') {
      recommendedMax = Math.min(24, depth);
      notes.push('Great visibility dives for reef exploration.');
    } else {
      recommendedMax = Math.min(40, depth);
      notes.push('Advanced techniques recommended.');
    }

    // add safety note if user requested too deep for level
    if (level === 'beginner' && depth > 12) {
      notes.push('Warning: requested depth is deeper than recommended for beginners.');
    }

    return {
      recommendedMax,
      notes
    };
  }

  // show saved plans
  function renderSaved() {
    if (!savedList) return;
    savedList.innerHTML = '';
    const plans = JSON.parse(localStorage.getItem('diverPlans') || '[]');
    plans.forEach((p, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${p.date || 'No date'}</strong> — ${p.level} — ${p.depth}m
        <button data-index="${i}" class="btn subtle tiny ripple remove-plan" aria-label="Remove plan">Remove</button>`;
      savedList.appendChild(li);
    });

    // attach remove handlers
    $$('.remove-plan', savedList).forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = Number(btn.getAttribute('data-index'));
        const arr = JSON.parse(localStorage.getItem('diverPlans') || '[]');
        arr.splice(idx,1);
        localStorage.setItem('diverPlans', JSON.stringify(arr));
        renderSaved();
      });
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const rec = recommend(data);

      if (result) {
        result.innerHTML = `<strong>Recommended maximum depth:</strong> ${rec.recommendedMax}m
          <br><strong>Notes:</strong><ul>${rec.notes.map(n => `<li>${n}</li>`).join('')}</ul>`;
        result.scrollIntoView({behavior:'smooth', block:'center'});
      }
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      if (!form) return;
      const data = Object.fromEntries(new FormData(form).entries());
      const store = JSON.parse(localStorage.getItem('diverPlans') || '[]');
      store.unshift({level:data.level, depth:data.depth, date:data.date || new Date().toISOString().split('T')[0]});
      localStorage.setItem('diverPlans', JSON.stringify(store));
      // gentle microfeedback
      saveBtn.textContent = 'Saved ✓';
      setTimeout(()=> saveBtn.textContent = 'Save plan', 1200);
      renderSaved();
    });
  }

  renderSaved();
}

/* -------------------------
   INITIALIZE
   ------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();
  setupRipples();
  setupRevealOnScroll();
  setupScrollProgress();
  highlightActiveNav();
  setupContactForms();
  setupDivePlanner();

  // small accessibility: keyboard nav for ripple elements
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const el = document.activeElement;
      if (el && el.classList.contains('ripple')) {
        el.click();
      }
    }
  });
});
