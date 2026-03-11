/**
 * Norte ou Sul (PT) — app.js
 * Verifica se uma localidade portuguesa está a norte ou sul de Coimbra.
 * Utiliza a API Nominatim (OpenStreetMap) com fallback offline.
 */

/* ── Constantes ─────────────────────────────────────────── */
const COIMBRA_LAT = 40.2056;       // Latitude de referência
const MAX_HISTORY = 5;             // Máx. entradas no histórico
const DEBOUNCE_MS = 300;           // Delay das sugestões
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

/* ── Dicionário offline ──────────────────────────────────── */
const OFFLINE_DB = {
  'lisboa':              38.7223,
  'porto':               41.1579,
  'coimbra':             40.2056,
  'braga':               41.5454,
  'aveiro':              40.6405,
  'faro':                37.0194,
  'setúbal':             38.5244,
  'setubal':             38.5244,
  'viseu':               40.6566,
  'vila real':           41.3006,
  'guarda':              40.5373,
  'évora':               38.5714,
  'evora':               38.5714,
  'leiria':              39.7436,
  'santarém':            39.2362,
  'santarem':            39.2362,
  'castelo branco':      39.8197,
  'bragança':            41.8062,
  'braganca':            41.8062,
  'viana do castelo':    41.6932,
  'funchal':             32.6669,
  'funchal (madeira)':   32.6669,
  'ponta delgada':       37.7412,
  'ponta delgada (açores)': 37.7412,
};

/* ── Elementos DOM ───────────────────────────────────────── */
const cityInput       = document.getElementById('cityInput');
const verifyBtn       = document.getElementById('verifyBtn');
const suggestionsList = document.getElementById('suggestionsList');
const stateEmpty      = document.getElementById('stateEmpty');
const stateLoading    = document.getElementById('stateLoading');
const stateError      = document.getElementById('stateError');
const stateResult     = document.getElementById('stateResult');
const errorMsg        = document.getElementById('errorMsg');
const resultBadge     = document.getElementById('resultBadge');
const pillLat         = document.getElementById('pillLat');
const pillSource      = document.getElementById('pillSource');
const historyList     = document.getElementById('historyList');
const historyEmpty    = document.getElementById('historyEmpty');
const clearHistory    = document.getElementById('clearHistory');
const offlineToggle   = document.getElementById('offlineToggle');

/* ── Estado da aplicação ─────────────────────────────────── */
let offlineMode       = false;
let debounceTimer     = null;
let currentSuggestions = [];        // Sugestões atuais para navegação por teclado
let selectedIndex     = -1;         // Índice selecionado no dropdown

/* ── Utilitários ─────────────────────────────────────────── */

/** Sanitiza input: trim + colapsa espaços múltiplos */
function sanitize(str) {
  return str.trim().replace(/\s+/g, ' ');
}

/** Debounce: atrasa execução da função fn por ms milissegundos */
function debounce(fn, ms) {
  return function(...args) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fn.apply(this, args), ms);
  };
}

/** Determina Norte/Sul com base na latitude */
function classifyLat(lat) {
  return lat > COIMBRA_LAT ? 'NORTE' : 'SUL';
}

/* ── Gestão de estados (loading / erro / resultado / vazio) ── */

/** Mostra apenas o estado desejado, esconde os restantes */
function showState(state) {
  [stateEmpty, stateLoading, stateError, stateResult].forEach(el => {
    el.hidden = el !== state;
  });
}

function showEmpty()   { showState(stateEmpty); }
function showLoading() { showState(stateLoading); }

function showError(msg) {
  errorMsg.textContent = msg;
  showState(stateError);
}

function showResult(name, lat, source) {
  const classification = classifyLat(lat);
  const isNorte = classification === 'NORTE';

  // Badge tipografia grande com classe de cor
  resultBadge.textContent = classification;
  resultBadge.className = 'result-badge ' + (isNorte ? 'norte' : 'sul');
  resultBadge.setAttribute('aria-label', `Este local é ${classification}`);

  // Pills de detalhe
  pillLat.textContent    = `${lat.toFixed(4)}°`;
  pillSource.textContent = source;

  showState(stateResult);

  // Adicionar ao histórico
  addToHistory(name, classification, lat);
}

/* ── API Nominatim ───────────────────────────────────────── */

/**
 * Busca sugestões de locais na API Nominatim enquanto o utilizador digita.
 * Retorna array de { name, lat } ou [] em caso de erro.
 */
async function fetchSuggestions(query) {
  if (offlineMode) return getOfflineSuggestions(query);
  try {
    const url = new URL(NOMINATIM_URL);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '5');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('countrycodes', 'pt');
    url.searchParams.set('q', query);

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'norte-ou-sul-pt/1.0 (educational project)'
      }
    });

    if (!response.ok) throw new Error('API indisponível');

    const data = await response.json();
    // Mapeia resultados para { name, lat }
    return data.map(item => ({
      name: item.display_name,
      lat:  parseFloat(item.lat)
    }));
  } catch {
    // Fallback silencioso: usa offline para sugestões
    return getOfflineSuggestions(query);
  }
}

/**
 * Geocodifica um local específico via API Nominatim.
 * Retorna { name, lat, source } ou lança erro.
 */
async function geocodeLocation(query) {
  const normalized = query.toLowerCase();

  // 1. Verificar dicionário offline primeiro
  if (OFFLINE_DB[normalized] !== undefined) {
    return {
      name:   query,
      lat:    OFFLINE_DB[normalized],
      source: 'Offline (dicionário)'
    };
  }

  // 2. Se modo offline ativado, não vai à API
  if (offlineMode) {
    // Tenta correspondência parcial no dicionário
    const match = findOfflineMatch(normalized);
    if (match) return { name: query, lat: match.lat, source: 'Offline (dicionário)' };
    throw new Error(`"${query}" não encontrado no modo offline. Tente: Lisboa, Porto, Braga…`);
  }

  // 3. Chamar API Nominatim
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('countrycodes', 'pt');
  url.searchParams.set('q', query);

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'norte-ou-sul-pt/1.0 (educational project)'
    }
  });

  if (!response.ok) {
    throw new Error('Erro de ligação à API. Verifique a sua ligação à internet.');
  }

  const data = await response.json();

  if (!data || data.length === 0) {
    throw new Error(`Não encontrei "${query}" em Portugal. Tente ser mais específico (ex: "Vila Real, Portugal").`);
  }

  const result = data[0];
  return {
    name:   result.display_name,
    lat:    parseFloat(result.lat),
    source: 'API Nominatim'
  };
}

/* ── Offline helpers ─────────────────────────────────────── */

/** Sugestões offline: filtra dicionário por query */
function getOfflineSuggestions(query) {
  const q = query.toLowerCase();
  return Object.entries(OFFLINE_DB)
    .filter(([key]) => key.includes(q))
    .slice(0, 5)
    .map(([key, lat]) => ({
      name: capitalize(key),
      lat
    }));
}

/** Correspondência parcial no dicionário offline */
function findOfflineMatch(query) {
  // Procura a key que contenha a query ou vice-versa
  for (const [key, lat] of Object.entries(OFFLINE_DB)) {
    if (key.includes(query) || query.includes(key)) return { lat };
  }
  return null;
}

/** Capitaliza cada palavra de uma string */
function capitalize(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

/* ── Renderização de sugestões (dropdown) ────────────────── */

function renderSuggestions(suggestions) {
  currentSuggestions = suggestions;
  selectedIndex = -1;

  if (!suggestions || suggestions.length === 0) {
    hideSuggestions();
    return;
  }

  suggestionsList.innerHTML = '';
  suggestions.forEach((item, idx) => {
    const li = document.createElement('li');
    li.role = 'option';
    li.id = `suggestion-${idx}`;
    li.setAttribute('aria-selected', 'false');
    li.className = 'suggestion-item';

    // Ícone pin SVG inline
    li.innerHTML = `
      <svg class="s-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M7 1C5.07 1 3.5 2.57 3.5 4.5c0 2.92 3.5 8.5 3.5 8.5s3.5-5.58 3.5-8.5C10.5 2.57 8.93 1 7 1z" fill="currentColor" fill-opacity="0.55"/>
        <circle cx="7" cy="4.5" r="1.5" fill="white"/>
      </svg>
      <span class="suggestion-name">${escapeHtml(truncate(item.name, 60))}</span>
    `;

    li.addEventListener('click', () => selectSuggestion(item));
    li.addEventListener('mouseenter', () => {
      selectedIndex = idx;
      updateSuggestionHighlight();
    });
    suggestionsList.appendChild(li);
  });

  suggestionsList.hidden = false;
  cityInput.setAttribute('aria-expanded', 'true');
}

function hideSuggestions() {
  suggestionsList.hidden = true;
  cityInput.setAttribute('aria-expanded', 'false');
  cityInput.removeAttribute('aria-activedescendant');
  currentSuggestions = [];
  selectedIndex = -1;
}

/** Atualiza highlight visual e aria-selected no dropdown */
function updateSuggestionHighlight() {
  const items = suggestionsList.querySelectorAll('.suggestion-item');
  items.forEach((item, idx) => {
    const active = idx === selectedIndex;
    item.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  if (selectedIndex >= 0) {
    cityInput.setAttribute('aria-activedescendant', `suggestion-${selectedIndex}`);
    // Scroll suave para item selecionado
    const activeEl = suggestionsList.querySelector(`#suggestion-${selectedIndex}`);
    if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
  }
}

/** Preenche input ao clicar/selecionar sugestão */
function selectSuggestion(item) {
  // Extrai nome curto (antes da primeira vírgula) para o input
  const shortName = item.name.split(',')[0].trim();
  cityInput.value = shortName;
  hideSuggestions();
  cityInput.focus();
  // Não dispara verificação automática — utilizador decide quando clicar
}

/* ── Verificar localização ───────────────────────────────── */

async function verifyLocation() {
  const raw   = cityInput.value;
  const query = sanitize(raw);

  if (!query) {
    showError('Por favor, introduza o nome de uma localidade.');
    return;
  }

  hideSuggestions();
  showLoading();

  try {
    const result = await geocodeLocation(query);
    showResult(result.name, result.lat, result.source);
  } catch (err) {
    showError(err.message || 'Ocorreu um erro inesperado. Tente novamente.');
  }
}

/* ── Histórico ───────────────────────────────────────────── */

/** Carrega histórico do localStorage */
function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem('nortesul_history') || '[]');
  } catch {
    return [];
  }
}

/** Guarda histórico no localStorage */
function saveHistory(history) {
  try {
    localStorage.setItem('nortesul_history', JSON.stringify(history));
  } catch {
    // localStorage indisponível — silencia
  }
}

/** Adiciona entrada ao histórico (deduplicação pelo nome) */
function addToHistory(name, classification, lat) {
  let history = loadHistory();

  // Remove entrada duplicada se já existir
  const shortName = name.split(',')[0].trim();
  history = history.filter(item => item.name !== shortName);

  // Adiciona no início
  history.unshift({ name: shortName, classification, lat });

  // Limita a MAX_HISTORY entradas
  history = history.slice(0, MAX_HISTORY);

  saveHistory(history);
  renderHistory();
}

/** Renderiza o histórico na UI */
function renderHistory() {
  const history = loadHistory();
  historyList.innerHTML = '';

  if (history.length === 0) {
    historyList.appendChild(historyEmpty.cloneNode(true));
    historyEmpty.hidden = false;
    clearHistory.hidden = true;
    return;
  }

  historyEmpty.hidden = true;
  clearHistory.hidden = false;

  history.forEach((item, idx) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.tabIndex = 0;
    li.role = 'listitem';
    li.setAttribute('aria-label', `${item.name}: ${item.classification}. Clique para repetir pesquisa.`);
    li.style.animationDelay = `${idx * 0.05}s`;

    const dotClass = item.classification === 'NORTE' ? 'norte'
                   : item.classification === 'SUL'   ? 'sul'
                   : 'unknown';

    li.innerHTML = `
      <span class="history-dot ${dotClass}" aria-hidden="true"></span>
      <span class="history-name">${escapeHtml(item.name)}</span>
      <span class="history-result">${item.classification}</span>
    `;

    // Clique ou Enter repete a pesquisa
    li.addEventListener('click', () => repeatSearch(item.name));
    li.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        repeatSearch(item.name);
      }
    });

    historyList.appendChild(li);
  });
}

/** Repete uma pesquisa a partir do histórico */
function repeatSearch(name) {
  cityInput.value = name;
  verifyLocation();
  // Scroll suave para o topo do card
  cityInput.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Helpers ─────────────────────────────────────────────── */

/** Escapa HTML para prevenir XSS nas sugestões */
function escapeHtml(str) {
  const map = { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' };
  return str.replace(/[&<>"']/g, c => map[c]);
}

/** Trunca string a maxLen caracteres */
function truncate(str, maxLen) {
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}

/* ── Event Listeners ─────────────────────────────────────── */

// Botão Verificar
verifyBtn.addEventListener('click', verifyLocation);

// Enter no input dispara verificação
cityInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    if (selectedIndex >= 0 && currentSuggestions[selectedIndex]) {
      // Se há item selecionado no dropdown, seleciona-o
      selectSuggestion(currentSuggestions[selectedIndex]);
    } else {
      verifyLocation();
    }
    return;
  }

  // Navegação por teclado no dropdown
  if (!suggestionsList.hidden) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, currentSuggestions.length - 1);
      updateSuggestionHighlight();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
      updateSuggestionHighlight();
    } else if (e.key === 'Escape') {
      hideSuggestions();
    }
  }
});

// Input com debounce para sugestões
const debouncedSuggest = debounce(async (value) => {
  const query = sanitize(value);
  if (query.length < 2) {
    hideSuggestions();
    return;
  }
  const suggestions = await fetchSuggestions(query);
  renderSuggestions(suggestions);
}, DEBOUNCE_MS);

cityInput.addEventListener('input', e => {
  debouncedSuggest(e.target.value);
  // Se campo ficou vazio, mostra estado vazio
  if (!e.target.value.trim()) showEmpty();
});

// Fechar sugestões ao clicar fora
document.addEventListener('click', e => {
  if (!e.target.closest('.search-wrapper')) {
    hideSuggestions();
  }
});

// Limpar histórico
clearHistory.addEventListener('click', () => {
  if (confirm('Tem a certeza que quer limpar o histórico?')) {
    saveHistory([]);
    renderHistory();
  }
});

// Toggle modo offline
offlineToggle.addEventListener('click', () => {
  offlineMode = !offlineMode;
  offlineToggle.setAttribute('aria-checked', offlineMode ? 'true' : 'false');
  // Feedback visual opcional: toast ou log
  console.info(`Modo offline: ${offlineMode ? 'Ativado' : 'Desativado'}`);
});

/* ── Inicialização ───────────────────────────────────────── */
function init() {
  showEmpty();
  renderHistory();
  cityInput.focus();
}

init();
