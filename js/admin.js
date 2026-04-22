import { auth, db } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// ── Auth state ─────────────────────────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display  = 'block';
    loadProjects();
    loadTestimonials();
    checkSeedBanner();
  } else {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboard').style.display  = 'none';
  }
});

// ── Login ──────────────────────────────────────────────────────────────────
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  const err = document.getElementById('loginError');
  btn.disabled = true;
  btn.textContent = 'Signing in…';
  err.className = 'form-msg';

  try {
    await signInWithEmailAndPassword(
      auth,
      document.getElementById('loginEmail').value,
      document.getElementById('loginPassword').value
    );
  } catch (ex) {
    err.textContent = 'Invalid email or password.';
    err.className = 'form-msg err';
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
});

// ── Logout ─────────────────────────────────────────────────────────────────
document.getElementById('logoutBtn').addEventListener('click', () => signOut(auth));

// ── Tabs ───────────────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.getElementById('tab-projects').style.display     = tab === 'projects'     ? '' : 'none';
    document.getElementById('tab-testimonials').style.display = tab === 'testimonials' ? '' : 'none';
  });
});

// ── Seed banner ────────────────────────────────────────────────────────────
async function checkSeedBanner() {
  const snap = await getDocs(collection(db, 'projects'));
  if (snap.size > 0) {
    document.getElementById('seedBanner').style.display = 'none';
  }
}

document.getElementById('seedBtn').addEventListener('click', async () => {
  const btn = document.getElementById('seedBtn');
  btn.disabled = true;
  btn.textContent = 'Loading…';

  const projects = [
    { title: 'Meridian CRM',    category: 'Web Application', description: 'A full-featured CRM platform for mid-market sales teams, featuring real-time analytics, email automation, and pipeline management.', tags: 'Next.js,TypeScript,PostgreSQL,AWS', imageUrl: 'https://placehold.co/600x400/0d9488/ffffff?text=Meridian+CRM', href: '#', order: 0, published: true },
    { title: 'TrailSync',       category: 'Mobile App',       description: 'A social fitness app connecting hikers and trail runners with route discovery, live tracking, and community challenges.',              tags: 'React Native,Node.js,MongoDB,Maps API', imageUrl: 'https://placehold.co/600x400/0f766e/ffffff?text=TrailSync',    href: '#', order: 1, published: true },
    { title: 'LexiVault',       category: 'Web Application', description: 'Secure document management and e-signature platform for law firms, built with enterprise-grade compliance and audit trails.',          tags: 'React,Express,Redis,S3',              imageUrl: 'https://placehold.co/600x400/115e59/ffffff?text=LexiVault',   href: '#', order: 2, published: true },
    { title: 'NutriCoach',      category: 'Mobile App',       description: 'AI-powered nutrition and meal planning app with barcode scanning, macro tracking, and personalized dietary guidance.',                  tags: 'React Native,Python,TensorFlow,Firebase', imageUrl: 'https://placehold.co/600x400/134e4a/ffffff?text=NutriCoach', href: '#', order: 3, published: true },
  ];
  const testimonials = [
    { name: 'Sarah Chen',     role: 'CTO, Meridian Group',   avatar: 'SC', quote: 'ByteNest delivered our CRM platform on time and on budget. The code quality was exceptional — our internal team was impressed by the architecture. They felt like a true extension of our engineering org.', order: 0, published: true },
    { name: 'Marcus Williams', role: 'Founder, TrailSync',   avatar: 'MW', quote: 'From the first call to launch day, the ByteNest team was communicative, proactive, and genuinely passionate about our product. Our app launched to 5-star reviews and 10k downloads in the first week.',  order: 1, published: true },
    { name: 'Priya Nair',     role: 'Product Lead, LexiVault', avatar: 'PN', quote: "The level of attention to detail in both design and engineering is unmatched. ByteNest built us a compliance-ready platform that our legal clients trust completely. I can't recommend them enough.",       order: 2, published: true },
  ];

  try {
    for (const p of projects)     await addDoc(collection(db, 'projects'),     p);
    for (const t of testimonials) await addDoc(collection(db, 'testimonials'), t);
    document.getElementById('seedBanner').style.display = 'none';
    loadProjects();
    loadTestimonials();
  } catch (err) {
    console.error('Seed error:', err);
    btn.disabled = false;
    btn.textContent = 'Load Sample Data';
    alert('Failed to save data: ' + err.message + '\n\nMake sure your Firestore security rules allow writes. See the Rules tab in Firebase Console.');
  }
});

// ══════════════════════════════════════════════════════════════════════════
// PROJECTS
// ══════════════════════════════════════════════════════════════════════════

async function loadProjects() {
  const container = document.getElementById('projectsList');
  const snap = await getDocs(collection(db, 'projects'));
  const items = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (items.length === 0) {
    container.innerHTML = '<p style="color:#64748b;font-size:.875rem">No projects yet. Use the form below to add one.</p>';
    return;
  }

  container.innerHTML = `
    <table class="data-table">
      <thead><tr>
        <th>Title</th><th>Category</th><th>Order</th><th>Status</th><th></th>
      </tr></thead>
      <tbody>
        ${items.map(p => `
          <tr>
            <td><strong>${p.title}</strong></td>
            <td style="color:#64748b">${p.category}</td>
            <td style="color:#64748b">${p.order ?? 0}</td>
            <td><span class="${p.published !== false ? 'badge-pub' : 'badge-draft'}">${p.published !== false ? 'Published' : 'Draft'}</span></td>
            <td>
              <button class="btn btn-ghost btn-sm" onclick="editProject('${p.id}')">Edit</button>
              <button class="btn btn-red btn-sm" onclick="deleteProject('${p.id}','${p.title.replace(/'/g,"\\'")}')">Delete</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

// Expose to inline onclick
window.editProject = async (id) => {
  const snap = await getDocs(collection(db, 'projects'));
  const p = snap.docs.find(d => d.id === id)?.data();
  if (!p) return;
  document.getElementById('projectId').value      = id;
  document.getElementById('pTitle').value         = p.title       || '';
  document.getElementById('pCategory').value      = p.category    || '';
  document.getElementById('pDescription').value   = p.description || '';
  document.getElementById('pTags').value          = p.tags        || '';
  document.getElementById('pImageUrl').value      = p.imageUrl    || '';
  document.getElementById('pHref').value          = p.href        || '#';
  document.getElementById('pOrder').value         = p.order       ?? 0;
  document.getElementById('pPublished').checked   = p.published   !== false;
  document.getElementById('projectFormTitle').textContent  = 'Edit Project';
  document.getElementById('projectSubmitBtn').textContent  = 'Save Changes';
  document.getElementById('projectCancelBtn').style.display = '';
  document.getElementById('projectForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.deleteProject = async (id, title) => {
  if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
  await deleteDoc(doc(db, 'projects', id));
  loadProjects();
};

document.getElementById('projectCancelBtn').addEventListener('click', resetProjectForm);

function resetProjectForm() {
  document.getElementById('projectId').value      = '';
  document.getElementById('projectForm').reset();
  document.getElementById('pPublished').checked   = true;
  document.getElementById('projectFormTitle').textContent  = 'Add New Project';
  document.getElementById('projectSubmitBtn').textContent  = 'Add Project';
  document.getElementById('projectCancelBtn').style.display = 'none';
  document.getElementById('projectMsg').className = 'form-msg full';
}

document.getElementById('projectForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('projectSubmitBtn');
  const msg = document.getElementById('projectMsg');
  btn.disabled = true;
  msg.className = 'form-msg full';

  const id = document.getElementById('projectId').value;
  const data = {
    title:       document.getElementById('pTitle').value.trim(),
    category:    document.getElementById('pCategory').value,
    description: document.getElementById('pDescription').value.trim(),
    tags:        document.getElementById('pTags').value.trim(),
    imageUrl:    document.getElementById('pImageUrl').value.trim(),
    href:        document.getElementById('pHref').value.trim() || '#',
    order:       Number(document.getElementById('pOrder').value),
    published:   document.getElementById('pPublished').checked,
  };

  try {
    if (id) {
      await updateDoc(doc(db, 'projects', id), data);
      msg.textContent = '✓ Project updated.';
    } else {
      await addDoc(collection(db, 'projects'), data);
      msg.textContent = '✓ Project added.';
    }
    msg.className = 'form-msg full ok';
    resetProjectForm();
    loadProjects();
  } catch (err) {
    msg.textContent = 'Error: ' + err.message;
    msg.className = 'form-msg full err';
  }
  btn.disabled = false;
});

// ══════════════════════════════════════════════════════════════════════════
// TESTIMONIALS
// ══════════════════════════════════════════════════════════════════════════

async function loadTestimonials() {
  const container = document.getElementById('testimonialsList');
  const snap = await getDocs(collection(db, 'testimonials'));
  const items = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (items.length === 0) {
    container.innerHTML = '<p style="color:#64748b;font-size:.875rem">No testimonials yet. Use the form below to add one.</p>';
    return;
  }

  container.innerHTML = `
    <table class="data-table">
      <thead><tr>
        <th>Name</th><th>Role</th><th>Order</th><th>Status</th><th></th>
      </tr></thead>
      <tbody>
        ${items.map(t => `
          <tr>
            <td><strong>${t.name}</strong></td>
            <td style="color:#64748b">${t.role}</td>
            <td style="color:#64748b">${t.order ?? 0}</td>
            <td><span class="${t.published !== false ? 'badge-pub' : 'badge-draft'}">${t.published !== false ? 'Published' : 'Draft'}</span></td>
            <td>
              <button class="btn btn-ghost btn-sm" onclick="editTestimonial('${t.id}')">Edit</button>
              <button class="btn btn-red btn-sm" onclick="deleteTestimonial('${t.id}','${t.name.replace(/'/g,"\\'")}')">Delete</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

window.editTestimonial = async (id) => {
  const snap = await getDocs(collection(db, 'testimonials'));
  const t = snap.docs.find(d => d.id === id)?.data();
  if (!t) return;
  document.getElementById('testimonialId').value     = id;
  document.getElementById('tName').value             = t.name    || '';
  document.getElementById('tRole').value             = t.role    || '';
  document.getElementById('tAvatar').value           = t.avatar  || '';
  document.getElementById('tQuote').value            = t.quote   || '';
  document.getElementById('tOrder').value            = t.order   ?? 0;
  document.getElementById('tPublished').checked      = t.published !== false;
  document.getElementById('testimonialFormTitle').textContent  = 'Edit Testimonial';
  document.getElementById('testimonialSubmitBtn').textContent  = 'Save Changes';
  document.getElementById('testimonialCancelBtn').style.display = '';
  document.getElementById('testimonialForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.deleteTestimonial = async (id, name) => {
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
  await deleteDoc(doc(db, 'testimonials', id));
  loadTestimonials();
};

document.getElementById('testimonialCancelBtn').addEventListener('click', resetTestimonialForm);

function resetTestimonialForm() {
  document.getElementById('testimonialId').value     = '';
  document.getElementById('testimonialForm').reset();
  document.getElementById('tPublished').checked      = true;
  document.getElementById('testimonialFormTitle').textContent  = 'Add New Testimonial';
  document.getElementById('testimonialSubmitBtn').textContent  = 'Add Testimonial';
  document.getElementById('testimonialCancelBtn').style.display = 'none';
  document.getElementById('testimonialMsg').className = 'form-msg full';
}

document.getElementById('testimonialForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('testimonialSubmitBtn');
  const msg = document.getElementById('testimonialMsg');
  btn.disabled = true;
  msg.className = 'form-msg full';

  const id = document.getElementById('testimonialId').value;
  const name = document.getElementById('tName').value.trim();
  const data = {
    name,
    role:      document.getElementById('tRole').value.trim(),
    avatar:    document.getElementById('tAvatar').value.trim().toUpperCase() || name.slice(0, 2).toUpperCase(),
    quote:     document.getElementById('tQuote').value.trim(),
    order:     Number(document.getElementById('tOrder').value),
    published: document.getElementById('tPublished').checked,
  };

  try {
    if (id) {
      await updateDoc(doc(db, 'testimonials', id), data);
      msg.textContent = '✓ Testimonial updated.';
    } else {
      await addDoc(collection(db, 'testimonials'), data);
      msg.textContent = '✓ Testimonial added.';
    }
    msg.className = 'form-msg full ok';
    resetTestimonialForm();
    loadTestimonials();
  } catch (err) {
    msg.textContent = 'Error: ' + err.message;
    msg.className = 'form-msg full err';
  }
  btn.disabled = false;
});
