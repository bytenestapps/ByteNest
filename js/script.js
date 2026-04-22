import { db } from './firebase-config.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// ── Navbar scroll effect ───────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// ── Mobile menu ────────────────────────────────────────────────────────────
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const iconMenu   = document.getElementById('iconMenu');
const iconClose  = document.getElementById('iconClose');

menuToggle.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  iconMenu.style.display  = open ? 'none'  : '';
  iconClose.style.display = open ? ''      : 'none';
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    iconMenu.style.display  = '';
    iconClose.style.display = 'none';
  });
});

// ── Scroll-triggered fade-in animations ───────────────────────────────────
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const siblings = entry.target.parentElement.querySelectorAll('.fade-in');
        let delay = 0;
        siblings.forEach((el, idx) => { if (el === entry.target) delay = idx * 80; });
        setTimeout(() => entry.target.classList.add('visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ── Footer year ────────────────────────────────────────────────────────────
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Contact form (Formspree) ───────────────────────────────────────────────
const form      = document.getElementById('contactForm');
const statusEl  = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Sending…';
    statusEl.className    = '';
    statusEl.textContent  = '';
    try {
      const res = await fetch(form.action, {
        method: 'POST', body: new FormData(form),
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) {
        statusEl.className   = 'success';
        statusEl.textContent = "✓ Message sent! We'll be in touch within 24 hours.";
        form.reset();
      } else {
        const data = await res.json();
        statusEl.className   = 'error';
        statusEl.textContent = data?.errors?.map(e => e.message).join(', ') || 'Something went wrong.';
      }
    } catch {
      statusEl.className   = 'error';
      statusEl.textContent = 'Network error. Please try again.';
    }
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Send Message →';
  });
}

// ── Firestore: helper to re-observe new cards ─────────────────────────────
function observeNew(container) {
  container.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ── Load Projects from Firestore ───────────────────────────────────────────
async function loadProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;
  try {
    const snap = await getDocs(collection(db, 'projects'));
    const items = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(p => p.published !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    if (items.length === 0) {
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#64748b;padding:3rem">No projects yet.</p>';
      return;
    }

    const arrowSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>`;

    grid.innerHTML = items.map(p => {
      const tags = (p.tags || '').split(',').map(t => t.trim()).filter(Boolean);
      return `
        <a href="${p.href || '#'}" class="project-card fade-in">
          <div class="project-img"><img src="${p.imageUrl}" alt="${p.title}" loading="lazy"/></div>
          <div class="project-body">
            <div class="project-meta">
              <span class="project-cat">${p.category}</span>${arrowSvg}
            </div>
            <h3>${p.title}</h3>
            <p>${p.description}</p>
            <div class="tags">${tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
          </div>
        </a>`;
    }).join('');

    observeNew(grid);
  } catch (err) {
    console.error('Failed to load projects:', err);
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#64748b;padding:3rem">Could not load projects.</p>';
  }
}

// ── Load Testimonials from Firestore ──────────────────────────────────────
async function loadTestimonials() {
  const grid = document.getElementById('testimonialsGrid');
  if (!grid) return;
  try {
    const snap = await getDocs(collection(db, 'testimonials'));
    const items = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(t => t.published !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    if (items.length === 0) {
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#64748b;padding:3rem">No testimonials yet.</p>';
      return;
    }

    grid.innerHTML = items.map(t => {
      const initials = (t.avatar || t.name || '??').slice(0, 2).toUpperCase();
      return `
        <div class="testimonial-card fade-in">
          <div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
          <p>&ldquo;${t.quote}&rdquo;</p>
          <div class="testimonial-author">
            <div class="avatar">${initials}</div>
            <div><strong>${t.name}</strong><span>${t.role}</span></div>
          </div>
        </div>`;
    }).join('');

    observeNew(grid);
  } catch (err) {
    console.error('Failed to load testimonials:', err);
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#64748b;padding:3rem">Could not load testimonials.</p>';
  }
}

loadProjects();
loadTestimonials();
