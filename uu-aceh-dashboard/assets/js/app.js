/* Minimal dashboard renderer for UU Pemerintahan Aceh */

/** @typedef {{
 *  metadata: { title: string; law_number: string; year: number };
 *  ringkasan: string;
 *  kewenangan_khusus: string[];
 *  kelembagaan: { nama: string; deskripsi: string }[];
 *  keuangan: { topik: string; uraian: string }[];
 *  qanun: { judul: string; nomor?: string; tahun?: number; ringkas?: string }[];
 *  timeline: { tahun: string; peristiwa: string }[];
 *  referensi: { label: string; url: string }[];
 * }} UUAcehData */

const state = {
  /** @type {UUAcehData|null} */
  data: null,
  /** @type {string} */
  activeSection: 'ringkasan',
  /** @type {HTMLElement|null} */
  contentRoot: null,
};

function createSectionHeader(titleText, subtitleText) {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex items-baseline justify-between';

  const title = document.createElement('h2');
  title.className = 'text-xl md:text-2xl font-semibold text-slate-900';
  title.textContent = titleText;
  wrapper.appendChild(title);

  if (subtitleText) {
    const subtitle = document.createElement('p');
    subtitle.className = 'text-slate-500 text-sm md:text-base';
    subtitle.textContent = subtitleText;
    wrapper.appendChild(subtitle);
  }

  return wrapper;
}

function createCard(titleText, bodyElement) {
  const card = document.createElement('section');
  card.className = 'bg-white border border-slate-200 rounded-lg p-4 md:p-6 shadow-sm';

  if (titleText) {
    const h3 = document.createElement('h3');
    h3.className = 'text-lg font-semibold mb-2';
    h3.textContent = titleText;
    card.appendChild(h3);
  }

  if (bodyElement) {
    card.appendChild(bodyElement);
  }

  return card;
}

function createList(items, itemClass = 'list-disc pl-5 space-y-1') {
  const ul = document.createElement('ul');
  ul.className = itemClass;
  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = item;
    ul.appendChild(li);
  }
  return ul;
}

function clearMain() {
  if (!state.contentRoot) return;
  state.contentRoot.innerHTML = '';
}

function setActiveNav(section) {
  document.querySelectorAll('.nav-link').forEach(a => {
    const isActive = a.getAttribute('href') === `#${section}`;
    a.classList.toggle('bg-slate-800', isActive);
  });
}

function renderRingkasan() {
  const frag = document.createDocumentFragment();
  frag.appendChild(createSectionHeader('Ringkasan', state.data?.metadata?.title || ''));

  const body = document.createElement('p');
  body.className = 'text-slate-700';
  body.textContent = state.data?.ringkasan || '';

  const card = createCard('Gambaran Umum', body);
  frag.appendChild(card);
  state.contentRoot.appendChild(frag);
}

function renderKewenangan() {
  const frag = document.createDocumentFragment();
  frag.appendChild(createSectionHeader('Kewenangan Khusus', 'Pokok-pokok kekhususan Aceh'));
  const list = createList(state.data?.kewenangan_khusus || []);
  const card = createCard('Daftar Kewenangan', list);
  frag.appendChild(card);
  state.contentRoot.appendChild(frag);
}

function renderKelembagaan() {
  const frag = document.createDocumentFragment();
  frag.appendChild(createSectionHeader('Kelembagaan', 'Lembaga daerah sesuai pengaturan'));

  const container = document.createElement('div');
  container.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';

  for (const org of state.data?.kelembagaan || []) {
    const body = document.createElement('p');
    body.className = 'text-slate-700';
    body.textContent = org.deskripsi;
    const card = createCard(org.nama, body);
    container.appendChild(card);
  }

  frag.appendChild(container);
  state.contentRoot.appendChild(frag);
}

function renderKeuangan() {
  const frag = document.createDocumentFragment();
  frag.appendChild(createSectionHeader('Keuangan', 'Pengaturan umum keuangan Aceh'));

  const container = document.createElement('div');
  container.className = 'space-y-4';

  for (const item of state.data?.keuangan || []) {
    const body = document.createElement('p');
    body.className = 'text-slate-700';
    body.textContent = item.uraian;
    const card = createCard(item.topik, body);
    container.appendChild(card);
  }

  frag.appendChild(container);
  state.contentRoot.appendChild(frag);
}

function renderQanun() {
  const frag = document.createDocumentFragment();
  frag.appendChild(createSectionHeader('Qanun', 'Contoh dan ringkasan singkat'));

  const table = document.createElement('table');
  table.className = 'min-w-full border border-slate-200 rounded overflow-hidden';
  table.innerHTML = `
    <thead class="bg-slate-100 text-left">
      <tr>
        <th class="px-3 py-2 border-b">Judul</th>
        <th class="px-3 py-2 border-b">Nomor</th>
        <th class="px-3 py-2 border-b">Tahun</th>
        <th class="px-3 py-2 border-b">Ringkas</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector('tbody');

  for (const q of state.data?.qanun || []) {
    const tr = document.createElement('tr');
    tr.className = 'odd:bg-white even:bg-slate-50';
    tr.innerHTML = `
      <td class="px-3 py-2 border-b">${q.judul || ''}</td>
      <td class="px-3 py-2 border-b">${q.nomor || '-'}</td>
      <td class="px-3 py-2 border-b">${q.tahun || '-'}</td>
      <td class="px-3 py-2 border-b">${q.ringkas || ''}</td>
    `;
    tbody.appendChild(tr);
  }

  const card = createCard('Daftar Qanun (contoh)', table);
  state.contentRoot.appendChild(card);
}

function renderTimeline() {
  const frag = document.createDocumentFragment();
  frag.appendChild(createSectionHeader('Timeline', 'Peristiwa penting terkait'));

  const container = document.createElement('ol');
  container.className = 'relative border-s border-slate-200 ml-3';

  for (const item of state.data?.timeline || []) {
    const li = document.createElement('li');
    li.className = 'mb-6 ml-4';
    li.innerHTML = `
      <div class="absolute w-2 h-2 bg-blue-500 rounded-full -left-1.5 mt-2"></div>
      <time class="text-sm text-slate-500">${item.tahun}</time>
      <p class="text-slate-800">${item.peristiwa}</p>
    `;
    container.appendChild(li);
  }

  const card = createCard('Linimasa', container);
  state.contentRoot.appendChild(card);
}

function renderReferensi() {
  const frag = document.createDocumentFragment();
  frag.appendChild(createSectionHeader('Referensi', 'Tautan sumber resmi dan bacaan'));

  const list = document.createElement('ul');
  list.className = 'list-disc pl-5 space-y-1';

  for (const ref of state.data?.referensi || []) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = ref.url;
    a.textContent = ref.label;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'text-blue-600 hover:underline';
    li.appendChild(a);
    list.appendChild(li);
  }

  const card = createCard('Daftar Referensi', list);
  state.contentRoot.appendChild(card);
}

function renderSearchResults(query) {
  const q = query.trim().toLowerCase();
  const results = [];
  if (!q || !state.data) return results;

  function pushIfMatch(title, text, section) {
    if (!text) return;
    const t = text.toLowerCase();
    if (t.includes(q)) {
      results.push({ title, excerpt: text.slice(0, 160) + (text.length > 160 ? '…' : ''), section });
    }
  }

  // ringkasan
  pushIfMatch('Ringkasan', state.data.ringkasan, 'ringkasan');

  // kewenangan
  for (const k of state.data.kewenangan_khusus) {
    pushIfMatch(`Kewenangan: ${k}`, k, 'kewenangan');
  }

  // kelembagaan
  for (const org of state.data.kelembagaan) {
    pushIfMatch(`Kelembagaan: ${org.nama}`, org.deskripsi, 'kelembagaan');
  }

  // keuangan
  for (const item of state.data.keuangan) {
    pushIfMatch(`Keuangan: ${item.topik}`, item.uraian, 'keuangan');
  }

  // qanun
  for (const qn of state.data.qanun) {
    const combo = `${qn.judul} ${qn.ringkas || ''}`.trim();
    pushIfMatch(`Qanun: ${qn.judul}`, combo, 'qanun');
  }

  // timeline
  for (const t of state.data.timeline) {
    pushIfMatch(`Timeline: ${t.tahun}`, t.peristiwa, 'timeline');
  }

  return results;
}

function renderSearchPage(query) {
  const frag = document.createDocumentFragment();
  frag.appendChild(createSectionHeader('Hasil Pencarian', `"${query}"`));

  const results = renderSearchResults(query);

  if (results.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'text-slate-600';
    empty.textContent = 'Tidak ada hasil.';
    state.contentRoot.appendChild(createCard('', empty));
    return;
  }

  const list = document.createElement('div');
  list.className = 'space-y-3';

  for (const r of results) {
    const item = document.createElement('div');
    item.className = 'p-3 rounded border border-slate-200 bg-white hover:bg-slate-50';
    item.innerHTML = `
      <div class="text-sm text-slate-500">${r.section}</div>
      <div class="font-medium">${r.title}</div>
      <div class="text-slate-700 text-sm">${r.excerpt}</div>
    `;
    list.appendChild(item);
  }

  state.contentRoot.appendChild(createCard('Hasil', list));
}

function render(section) {
  clearMain();
  setActiveNav(section);
  state.activeSection = section;

  switch (section) {
    case 'ringkasan':
      renderRingkasan();
      break;
    case 'kewenangan':
      renderKewenangan();
      break;
    case 'kelembagaan':
      renderKelembagaan();
      break;
    case 'keuangan':
      renderKeuangan();
      break;
    case 'qanun':
      renderQanun();
      break;
    case 'timeline':
      renderTimeline();
      break;
    case 'referensi':
      renderReferensi();
      break;
    default:
      renderRingkasan();
  }
}

async function bootstrap() {
  state.contentRoot = document.getElementById('content');

  try {
    const res = await fetch('/data/uu_aceh.json');
    state.data = await res.json();
  } catch (e) {
    console.error('Gagal memuat data', e);
  }

  const defaultSection = (location.hash || '#ringkasan').slice(1);
  render(defaultSection);

  window.addEventListener('hashchange', () => {
    const section = (location.hash || '#ringkasan').slice(1);
    if (section === 'search') return; // reserved
    render(section);
  });

  const searchInput = document.getElementById('searchInput');
  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = /** @type {HTMLInputElement} */(e.target).value;
      clearMain();
      setActiveNav('');
      renderSearchPage(q);
    }
  });
}

document.addEventListener('DOMContentLoaded', bootstrap);