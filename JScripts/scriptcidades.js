/**
 * Norte ou Sul (PT) — busca de localidades
 * Cidade, freguesia, distrito ou código postal (4xxx-xxx).
 * Seleccionar uma sugestão classifica imediatamente (sem Enter).
 */

const COIMBRA_LAT = 40.2056;
const MAX_HISTORY = 8;
const DEBOUNCE_MS = 280;
const SUGGEST_LIMIT = 10;
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_HEADERS = {
  Accept: 'application/json',
  'User-Agent': 'trivalor-norte-sul-pt/2.1 (internal tools)',
};

/** Prefixos / termos de equipamento social que o Nominatim muitas vezes não resolve como localidade */
const NOISE_PREFIXES = [
  'lar',
  'lares',
  'centro social',
  'centro de dia',
  'centro',
  'residencia',
  'residência',
  'hospital',
  'clinica',
  'clínica',
  'escola',
  'jardim de infancia',
  'jardim de infância',
  'creche',
  'ipss',
  'santa casa',
  'misericordia',
  'misericórdia',
  'casa de',
  'equipamento social',
  'equip social',
];

const ISLANDS_AZORES_KEYWORDS = [
  'acores', 'azores', 'ilha de sao miguel', 'sao miguel', 'ilha terceira', 'terceira',
  'ilha do faial', 'faial', 'ilha do pico', 'pico', 'ilha de santa maria', 'santa maria',
  'ilha de sao jorge', 'sao jorge', 'ilha graciosa', 'graciosa', 'ilha das flores',
  'flores', 'ilha do corvo', 'corvo', 'ponta delgada', 'ribeira grande', 'angra do heroismo',
  'cabouco',
];
const ISLANDS_MADEIRA_KEYWORDS = [
  'madeira', 'ilha da madeira', 'funchal', 'porto santo', 'ilha do porto santo',
  'machico', 'camara de lobos', 'santana', 'sao vicente',
];

const OFFLINE_DB = {
  lisboa: 38.7223,
  porto: 41.1579,
  coimbra: 40.2056,
  braga: 41.5454,
  aveiro: 40.6405,
  faro: 37.0194,
  setubal: 38.5244,
  'setúbal': 38.5244,
  viseu: 40.6566,
  'vila real': 41.3006,
  guarda: 40.5373,
  evora: 38.5714,
  'évora': 38.5714,
  leiria: 39.7436,
  santarem: 39.2362,
  'santarém': 39.2362,
  'castelo branco': 39.8197,
  braganca: 41.8062,
  'bragança': 41.8062,
  'viana do castelo': 41.6932,
  funchal: 32.6669,
  'ponta delgada': 37.7412,
  cabouco: 37.7833,
  acores: 37.7412,
  'açores': 37.7412,
  madeira: 32.6669,
  amadora: 38.7542,
  sintra: 38.7989,
  cascais: 38.6979,
  guimaraes: 41.4425,
  'guimarães': 41.4425,
  matosinhos: 41.1821,
  maia: 41.2357,
  'vila nova de gaia': 41.1239,
  almada: 38.6796,
  oeiras: 38.6921,
  gondomar: 41.1446,
  barcelos: 41.5388,
  famalicao: 41.4078,
  'famalicão': 41.4078,
  'santa maria da feira': 40.9255,
  'vila do conde': 41.3518,
  'póvoa de varzim': 41.3834,
  'povoa de varzim': 41.3834,
  beja: 38.0153,
  portalegre: 39.2968,
  'torres vedras': 39.0911,
  'caldas da rainha': 39.4031,
  penafiel: 41.2078,
  lousada: 41.2767,
  felgueiras: 41.3682,
  /** Freguesias / localidades pedidas com frequência (ex.: «Lar Alcaria») */
  alcaria: 40.1997,
  'alcaria fundao': 40.1997,
  'alcaria fundão': 40.1997,
  'lar alcaria': 40.1997,
};

/** Primeiros 4 dígitos do CP → latitude aproximada (modo offline) */
const OFFLINE_POSTAL_PREFIX = {
  1000: 38.7223,
  1050: 38.7071,
  1100: 38.7223,
  1250: 38.7644,
  1300: 38.7071,
  1500: 38.7538,
  1600: 38.7921,
  1700: 38.7578,
  1800: 38.7542,
  1900: 38.7542,
  2000: 38.5244,
  2400: 39.7441,
  2500: 39.8222,
  2600: 38.9551,
  2700: 38.9933,
  2800: 38.6556,
  2900: 38.5244,
  3000: 40.2033,
  4000: 41.1579,
  4100: 41.1579,
  4200: 41.1579,
  4300: 41.1579,
  4400: 41.6932,
  4500: 41.1579,
  4600: 41.5518,
  4700: 41.5518,
  4800: 41.5454,
  4900: 41.5454,
  5000: 41.1579,
  5100: 41.1579,
  5200: 41.1579,
  5300: 41.1579,
  6000: 39.8222,
  6100: 39.8222,
  6200: 40.2111,
  6300: 40.2111,
  7000: 38.5714,
  8000: 37.0194,
  9000: 32.6669,
  9500: 37.7412,
};

const cityInput = document.getElementById('cityInput');
const verifyBtn = document.getElementById('verifyBtn');
const suggestionsList = document.getElementById('suggestionsList');
const stateEmpty = document.getElementById('stateEmpty');
const stateLoading = document.getElementById('stateLoading');
const stateError = document.getElementById('stateError');
const stateResult = document.getElementById('stateResult');
const errorMsg = document.getElementById('errorMsg');
const resultBadge = document.getElementById('resultBadge');
const pillLat = document.getElementById('pillLat');
const pillSource = document.getElementById('pillSource');
const pillLocality = document.getElementById('pillLocality');
const pillPostal = document.getElementById('pillPostal');
const historyList = document.getElementById('historyList');
const historyEmpty = document.getElementById('historyEmpty');
const clearHistory = document.getElementById('clearHistory');
const offlineToggle = document.getElementById('offlineToggle');
const errorPopup = document.getElementById('errorPopup');
const errorPopupMessage = document.getElementById('errorPopupMessage');
const closeErrorPopupBtn = document.getElementById('closeErrorPopup');

let offlineMode = false;
let debounceTimer = null;
let currentSuggestions = [];
let selectedIndex = -1;
let searchAbort = null;

function sanitize(str) {
  return str.trim().replace(/\s+/g, ' ');
}

function normalizeText(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function debounce(fn, ms) {
  return function (...args) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fn.apply(this, args), ms);
  };
}

function classifyLat(lat) {
  return lat > COIMBRA_LAT ? 'NORTE' : 'SUL';
}

/**
 * Excepções operacionais Norte/Sul (locais na fronteira de Coimbra
 * ou com regra de negócio própria — ex.: Lar Alcaria / Alcaria Fundão = NORTE).
 */
const CLASSIFICATION_OVERRIDES = [
  {
    force: 'NORTE',
    // «Lar Alcaria» e freguesia Alcaria (Fundão); CP 6230-xxx
    matchAny: [
      'lar alcaria',
      'alcaria fundao',
      'alcaria fundão',
      '6230-022',
      '6230-024',
    ],
    requireAll: null,
  },
  {
    force: 'NORTE',
    matchAny: ['alcaria'],
    requireAll: ['fundao'],
  },
];

function resolveClassification({ name, lat, queryUsed = '', locality = '', postalCode = '', district = '' }) {
  const archipelago = detectArchipelago(name, queryUsed);
  if (archipelago) {
    return archipelago === 'ILHAS' ? 'ILHAS' : `ILHAS (${archipelago})`;
  }

  const blob = normalizeText(
    [name, queryUsed, locality, postalCode, district].filter(Boolean).join(' ')
  );

  for (const rule of CLASSIFICATION_OVERRIDES) {
    const anyOk = (rule.matchAny || []).some((m) => blob.includes(normalizeText(m)));
    if (!anyOk) continue;
    if (rule.requireAll && rule.requireAll.length) {
      const allOk = rule.requireAll.every((m) => blob.includes(normalizeText(m)));
      if (!allOk) continue;
    }
    return rule.force;
  }

  // CP 6230 (Fundão / Alcaria) → NORTE na regra operacional
  if (postalCode && String(postalCode).replace(/\s/g, '').startsWith('6230')) {
    return 'NORTE';
  }

  return classifyLat(lat);
}

function detectArchipelago(locationName, originalQuery = '') {
  const normalized = normalizeText(locationName || '');
  const normalizedQuery = normalizeText(originalQuery || '');
  if (normalizedQuery.includes('ilhas')) return 'ILHAS';
  if (ISLANDS_AZORES_KEYWORDS.some((k) => normalized.includes(k) || normalizedQuery.includes(k))) {
    return 'AÇORES';
  }
  if (ISLANDS_MADEIRA_KEYWORDS.some((k) => normalized.includes(k) || normalizedQuery.includes(k))) {
    return 'MADEIRA';
  }
  return null;
}

/** Código postal PT: 1234 ou 1234-567 */
function parsePostalCode(query) {
  const compact = String(query).replace(/\s/g, '');
  const m = compact.match(/^(\d{4})(?:-?(\d{3}))?$/);
  if (!m) return null;
  return m[2] ? `${m[1]}-${m[2]}` : m[1];
}

function isPostalCodeQuery(query) {
  return parsePostalCode(query) !== null;
}

function showState(state) {
  [stateEmpty, stateLoading, stateError, stateResult].forEach((el) => {
    if (el) el.hidden = el !== state;
  });
}

function showEmpty() {
  closePopupError();
  showState(stateEmpty);
}

function showLoading() {
  if (stateLoading) {
    stateLoading.hidden = false;
    stateLoading.className = 'loading-inline-state';
    stateLoading.innerHTML =
      '<p class="loading-inline-title">A localizar…</p><p class="loading-inline-text">A consultar Portugal (nome ou código postal).</p>';
  }
  showState(stateLoading);
}

function showError(msg) {
  if (errorMsg) errorMsg.textContent = msg;
  showState(stateError);
  showPopupError(msg);
}

function closePopupError() {
  if (errorPopup) errorPopup.hidden = true;
}

function showPopupError(msg) {
  if (!errorPopup) return;
  if (errorPopupMessage) errorPopupMessage.textContent = msg;
  errorPopup.hidden = false;
}

function showResult(details) {
  const {
    name,
    lat,
    source,
    queryUsed = '',
    locality = '',
    postalCode = '',
    district = '',
  } = details;

  const classification = resolveClassification({
    name,
    lat,
    queryUsed,
    locality,
    postalCode,
    district,
  });
  const isIlhas = String(classification).startsWith('ILHAS');
  const badgeClass = isIlhas ? 'ilhas' : classification === 'NORTE' ? 'norte' : 'sul';

  resultBadge.textContent = classification;
  resultBadge.className = 'result-badge ' + badgeClass;
  resultBadge.setAttribute('aria-label', `Este local é ${classification}`);

  pillLat.textContent = `${lat.toFixed(4)}°`;
  pillSource.textContent = source;
  if (pillLocality) {
    pillLocality.textContent = locality || name.split(',')[0].trim() || '—';
  }
  if (pillPostal) {
    pillPostal.textContent = postalCode || '—';
  }

  showState(stateResult);
  closePopupError();

  const shortName = locality || name.split(',')[0].trim();
  addToHistory(shortName, classification, lat, postalCode, district);
}

function formatPlaceType(item) {
  const t = item.addresstype || item.type || item.class || '';
  const map = {
    city: 'Cidade',
    town: 'Vila',
    village: 'Aldeia',
    municipality: 'Município',
    county: 'Concelho',
    suburb: 'Bairro',
    hamlet: 'Lugar',
    locality: 'Localidade',
    postcode: 'Código postal',
    neighbourhood: 'Bairro',
    quarter: 'Zona',
    island: 'Ilha',
    archipelago: 'Arquipélago',
    administrative: 'Administrativo',
    building: 'Edifício / equipamento',
    amenity: 'Equipamento',
    social_facility: 'Equipamento social',
    nursing_home: 'Lar',
    residential: 'Residencial',
  };
  return map[t] || (t ? capitalize(String(t)) : 'Local');
}

/** Tokens úteis para matching (ignora stopwords curtas) */
function queryTokens(query) {
  return normalizeText(query)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 3 && !['para', 'com', 'dos', 'das', 'del', 'the', 'and'].includes(t));
}

/**
 * Gera variantes da pesquisa: query original, sem prefixos (Lar, Centro…),
 * e localidade isolada — ex. «LAR ALCARIA» → «Alcaria».
 */
function buildQueryVariants(query) {
  const raw = sanitize(query);
  const variants = [];
  const seen = new Set();

  function push(q) {
    const s = sanitize(q);
    if (!s || s.length < 2) return;
    const key = normalizeText(s);
    if (seen.has(key)) return;
    seen.add(key);
    variants.push(s);
  }

  push(raw);

  let stripped = normalizeText(raw);
  for (const prefix of NOISE_PREFIXES) {
    const p = normalizeText(prefix);
    if (stripped === p || stripped.startsWith(p + ' ')) {
      stripped = stripped.slice(p.length).trim();
      break;
    }
  }
  if (stripped && stripped !== normalizeText(raw)) {
    push(stripped);
  }

  const tokens = queryTokens(raw);
  if (tokens.length >= 2) {
    const significant = tokens.filter(
      (t) => !NOISE_PREFIXES.some((p) => normalizeText(p) === t || normalizeText(p).includes(t))
    );
    if (significant.length) {
      push(significant.join(' '));
      if (significant.length > 1) {
        push(significant[significant.length - 1]);
      }
    }
  } else if (tokens.length === 1 && tokens[0] !== normalizeText(raw)) {
    push(tokens[0]);
  }

  return variants;
}

function mapNominatimItem(item, queryUsed) {
  const addr = item.address || {};
  const city =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    addr.hamlet ||
    addr.city_district ||
    addr.suburb ||
    '';
  const postalCode = addr.postcode || '';
  const district = addr.state || addr.county || addr.region || '';
  const parish = addr.suburb || addr.neighbourhood || addr.quarter || addr.hamlet || '';
  const namedPlace = item.name || '';
  const locality =
    addr.village ||
    addr.hamlet ||
    city ||
    parish ||
    namedPlace ||
    item.display_name.split(',')[0].trim();
  const shortName = locality;
  const typeLabel = formatPlaceType(item);

  return {
    name: item.display_name,
    shortName,
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    postalCode,
    district,
    city,
    parish,
    typeLabel,
    source: 'API Nominatim',
    queryUsed,
    isPostal: item.class === 'place' && item.type === 'postcode' || item.addresstype === 'postcode',
  };
}

function isPlaceLike(item) {
  const cls = item.class || '';
  const type = item.type || '';
  const addresstype = item.addresstype || '';
  const allowed = new Set([
    'city', 'town', 'village', 'municipality', 'county', 'state', 'region',
    'suburb', 'hamlet', 'island', 'archipelago', 'locality', 'quarter',
    'postcode', 'neighbourhood', 'administrative',
    'building', 'amenity', 'social_facility', 'nursing_home', 'residential',
    'office', 'healthcare', 'community_centre', 'place_of_worship',
  ]);
  if (allowed.has(addresstype)) return true;
  if (cls === 'place' || cls === 'boundary' || cls === 'building' || cls === 'amenity') return true;
  if (
    type === 'administrative' ||
    type === 'island' ||
    type === 'archipelago' ||
    type === 'postcode' ||
    type === 'social_facility' ||
    type === 'nursing_home' ||
    type === 'service'
  ) {
    return true;
  }
  // Qualquer resultado em PT com coordenadas (fallback mais permissivo)
  return Number.isFinite(parseFloat(item.lat)) && Number.isFinite(parseFloat(item.lon));
}

/** Preferir localidades / freguesias sobre edifícios genéricos */
function placeRankBoost(item) {
  const t = item.addresstype || item.type || '';
  const cls = item.class || '';
  if (['city', 'town', 'village', 'municipality', 'hamlet', 'locality'].includes(t)) return 40;
  if (cls === 'boundary' || t === 'administrative') return 30;
  if (t === 'postcode') return 25;
  if (['suburb', 'neighbourhood', 'quarter'].includes(t)) return 18;
  if (cls === 'amenity' || t === 'social_facility' || t === 'nursing_home') return 12;
  if (cls === 'building') return 6;
  return 0;
}

function scoreSuggestion(item, originalQuery) {
  const hay = normalizeText(
    [item.name, item.shortName, item.city, item.parish, item.district, item.postalCode]
      .filter(Boolean)
      .join(' ')
  );
  const allTokens = queryTokens(originalQuery);
  const noiseSet = new Set(
    NOISE_PREFIXES.flatMap((p) => normalizeText(p).split(/\s+/)).filter((t) => t.length >= 3)
  );
  const tokens = allTokens.filter((t) => !noiseSet.has(t));
  const scoreTokens = tokens.length ? tokens : allTokens;
  let score = placeRankBoost(item);

  if (!scoreTokens.length) return score;

  let matched = 0;
  for (const tok of scoreTokens) {
    if (hay.includes(tok)) matched += 1;
  }
  score += matched * 22;

  const short = normalizeText(item.shortName || '');
  const lastTok = scoreTokens[scoreTokens.length - 1];
  if (short === lastTok) score += 35;
  else if (short.includes(lastTok)) score += 18;

  if (matched === 0) score -= 40;

  const importance = typeof item._importance === 'number' ? item._importance : 0;
  score += importance * 8;

  return score;
}

function dedupeSuggestions(list) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const key = `${item.lat.toFixed(3)}|${normalizeText(item.shortName)}|${item.postalCode || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function rankSuggestions(list, originalQuery) {
  return dedupeSuggestions(list)
    .map((item) => ({ ...item, _score: scoreSuggestion(item, originalQuery) }))
    .sort((a, b) => b._score - a._score)
    .slice(0, SUGGEST_LIMIT);
}

async function nominatimFetch(params, sharedAbort) {
  if (!sharedAbort) {
    if (searchAbort) searchAbort.abort();
    searchAbort = new AbortController();
  }
  const controller = sharedAbort || searchAbort;

  const url = new URL(NOMINATIM_URL);
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') url.searchParams.set(k, String(v));
  });

  const response = await fetch(url.toString(), {
    headers: NOMINATIM_HEADERS,
    signal: controller.signal,
  });

  if (!response.ok) throw new Error('API indisponível');
  return response.json();
}

async function nominatimSearchQuery(q, sharedAbort) {
  return nominatimFetch(
    {
      format: 'json',
      limit: SUGGEST_LIMIT,
      addressdetails: 1,
      countrycodes: 'pt',
      q: /portugal/i.test(q) ? q : `${q}, Portugal`,
    },
    sharedAbort
  ).catch(() => []);
}

async function fetchSuggestions(query) {
  const postal = parsePostalCode(query);
  if (offlineMode) {
    return getOfflineSuggestions(query, postal);
  }

  try {
    if (searchAbort) searchAbort.abort();
    searchAbort = new AbortController();
    const batchAbort = searchAbort;

    let items = [];

    if (postal) {
      const [byCode, byQuery] = await Promise.all([
        nominatimFetch(
          {
            format: 'json',
            limit: SUGGEST_LIMIT,
            addressdetails: 1,
            countrycodes: 'pt',
            postalcode: postal,
          },
          batchAbort
        ).catch(() => []),
        nominatimSearchQuery(postal, batchAbort),
      ]);
      items = [...(byCode || []), ...(byQuery || [])];
    } else {
      const variants = buildQueryVariants(query);
      const primary = await nominatimSearchQuery(variants[0], batchAbort);
      items = primary || [];

      if (items.length < 3 && variants.length > 1) {
        const rest = await Promise.all(
          variants.slice(1).map((v) => nominatimSearchQuery(v, batchAbort))
        );
        for (const batch of rest) {
          items = items.concat(batch || []);
        }
      }
    }

    const mapped = (items || [])
      .filter(isPlaceLike)
      .map((item) => {
        const mappedItem = mapNominatimItem(item, query);
        mappedItem._importance = typeof item.importance === 'number' ? item.importance : 0;
        return mappedItem;
      });

    const ranked = rankSuggestions(mapped, query);
    if (ranked.length) return ranked;

    return getOfflineSuggestions(query, postal);
  } catch (err) {
    if (err.name === 'AbortError') return [];
    return getOfflineSuggestions(query, postal);
  }
}

async function geocodeLocation(query) {
  const normalized = normalizeText(query);
  const postal = parsePostalCode(query);

  if (postal && OFFLINE_POSTAL_PREFIX[parseInt(postal.slice(0, 4), 10)] != null) {
    const prefix = parseInt(postal.slice(0, 4), 10);
    const lat = OFFLINE_POSTAL_PREFIX[prefix];
    return {
      name: `Código postal ${postal}`,
      shortName: postal,
      lat,
      postalCode: postal,
      locality: 'Portugal (aprox.)',
      district: '',
      source: 'Offline (código postal)',
      queryUsed: query,
    };
  }

  if (OFFLINE_DB[normalized] !== undefined) {
    const lat = OFFLINE_DB[normalized];
    return {
      name: capitalize(query),
      shortName: capitalize(query),
      lat,
      source: 'Offline (dicionário)',
      queryUsed: query,
    };
  }

  if (offlineMode) {
    const match = findOfflineMatch(normalized);
    if (match) {
      return {
        name: capitalize(query),
        shortName: capitalize(query),
        lat: match.lat,
        source: 'Offline (dicionário)',
        queryUsed: query,
      };
    }
    throw new Error(`"${query}" não encontrado no modo offline. Tente cidade ou código postal (ex: 4000-001).`);
  }

  const suggestions = await fetchSuggestions(query);
  if (suggestions.length > 0) {
    return { ...suggestions[0], source: 'API Nominatim' };
  }

  if (postal) {
    throw new Error(`Código postal "${postal}" não encontrado. Verifique os dígitos (ex: 4000-001).`);
  }
  throw new Error(
    `Não encontrei "${query}" em Portugal. Tente a localidade (ex.: Alcaria), freguesia, concelho ou código postal (ex.: 6230-022).`
  );
}

function getOfflineSuggestions(query, postal) {
  const variants = buildQueryVariants(query);
  const keysTried = new Set(variants.map((v) => normalizeText(v)));
  const out = [];

  if (postal) {
    const prefix = parseInt(postal.slice(0, 4), 10);
    const lat = OFFLINE_POSTAL_PREFIX[prefix];
    if (lat != null) {
      out.push({
        name: `Código postal ${postal}, Portugal`,
        shortName: postal,
        lat,
        postalCode: postal,
        district: 'Offline',
        typeLabel: 'Código postal',
        source: 'Offline (código postal)',
        queryUsed: query,
      });
    }
  }

  Object.entries(OFFLINE_DB).forEach(([key, lat]) => {
    const hit = [...keysTried].some(
      (q) => key.includes(q) || q.includes(key) || key === q
    );
    if (!hit) return;
    out.push({
      name: `${capitalize(key)}, Portugal`,
      shortName: capitalize(key),
      lat,
      postalCode: '',
      district: '',
      typeLabel: 'Cidade',
      source: 'Offline (dicionário)',
      queryUsed: query,
    });
  });

  return rankSuggestions(out, query);
}

function findOfflineMatch(query) {
  const variants = buildQueryVariants(query);
  for (const variant of variants) {
    const q = normalizeText(variant);
    if (OFFLINE_DB[q] !== undefined) return { lat: OFFLINE_DB[q] };
    for (const [key, lat] of Object.entries(OFFLINE_DB)) {
      if (key.includes(q) || q.includes(key)) return { lat };
    }
  }
  const postal = parsePostalCode(query);
  if (postal) {
    const lat = OFFLINE_POSTAL_PREFIX[parseInt(postal.slice(0, 4), 10)];
    if (lat != null) return { lat };
  }
  return null;
}

function capitalize(str) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildSuggestionMeta(item) {
  const parts = [];
  if (item.typeLabel) parts.push(item.typeLabel);
  if (item.postalCode) parts.push(`CP ${item.postalCode}`);
  if (item.district) parts.push(item.district);
  return parts.join(' · ') || 'Portugal';
}

function renderSuggestions(suggestions) {
  currentSuggestions = suggestions;
  selectedIndex = suggestions.length ? 0 : -1;

  if (!suggestions || suggestions.length === 0) {
    hideSuggestions();
    return;
  }

  suggestionsList.innerHTML = '';
  suggestions.forEach((item, idx) => {
    const li = document.createElement('li');
    li.role = 'option';
    li.id = `suggestion-${idx}`;
    li.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
    li.className = 'suggestion-item';
    li.dataset.index = String(idx);

    const meta = buildSuggestionMeta(item);
    const title = item.shortName || item.name.split(',')[0].trim();
    const subtitle = truncate(item.name, 72);

    li.innerHTML = `
      <svg class="s-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M7 1C5.07 1 3.5 2.57 3.5 4.5c0 2.92 3.5 8.5 3.5 8.5s3.5-5.58 3.5-8.5C10.5 2.57 8.93 1 7 1z" fill="currentColor" fill-opacity="0.55"/>
        <circle cx="7" cy="4.5" r="1.5" fill="white"/>
      </svg>
      <div class="suggestion-body">
        <span class="suggestion-name">${escapeHtml(title)}</span>
        <span class="suggestion-meta">${escapeHtml(meta)}</span>
        <span class="suggestion-sub">${escapeHtml(subtitle)}</span>
      </div>
    `;

    li.addEventListener('click', () => applySuggestion(item));
    li.addEventListener('mouseenter', () => {
      selectedIndex = idx;
      updateSuggestionHighlight();
    });
    suggestionsList.appendChild(li);
  });

  suggestionsList.hidden = false;
  cityInput.setAttribute('aria-expanded', 'true');
  updateSuggestionHighlight();
}

function hideSuggestions() {
  suggestionsList.hidden = true;
  cityInput.setAttribute('aria-expanded', 'false');
  cityInput.removeAttribute('aria-activedescendant');
  currentSuggestions = [];
  selectedIndex = -1;
}

function updateSuggestionHighlight() {
  const items = suggestionsList.querySelectorAll('.suggestion-item');
  items.forEach((item, idx) => {
    const active = idx === selectedIndex;
    item.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  if (selectedIndex >= 0) {
    cityInput.setAttribute('aria-activedescendant', `suggestion-${selectedIndex}`);
    const activeEl = document.getElementById(`suggestion-${selectedIndex}`);
    if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
  }
}

/** Seleccionar sugestão → resultado imediato (sem Enter) */
function applySuggestion(item) {
  if (!item || !Number.isFinite(item.lat)) return;
  const shortName = item.shortName || item.name.split(',')[0].trim();
  const q = sanitize(cityInput.value);
  cityInput.value =
    item.postalCode && (isPostalCodeQuery(q) || isPostalCodeQuery(shortName))
      ? item.postalCode
      : shortName;
  hideSuggestions();
  showResult({
    name: item.name,
    lat: item.lat,
    source: item.source || 'Seleção',
    queryUsed: item.queryUsed || cityInput.value,
    locality: item.city || item.shortName || shortName,
    postalCode: item.postalCode || '',
    district: item.district || '',
  });
}

async function verifyLocation() {
  const query = sanitize(cityInput.value);
  if (!query) {
    showError('Introduza uma cidade, localidade ou código postal.');
    return;
  }

  hideSuggestions();
  showLoading();

  try {
    const result = await geocodeLocation(query);
    showResult({
      name: result.name,
      lat: result.lat,
      source: result.source,
      queryUsed: query,
      locality: result.city || result.shortName || query,
      postalCode: result.postalCode || (parsePostalCode(query) || ''),
      district: result.district || '',
    });
  } catch (err) {
    showError(err.message || 'Ocorreu um erro inesperado. Tente novamente.');
  }
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem('nortesul_history') || '[]');
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem('nortesul_history', JSON.stringify(history));
  } catch {
    /* ignore */
  }
}

function addToHistory(name, classification, lat, postalCode = '', district = '') {
  let history = loadHistory();
  history = history.filter((item) => item.name !== name);
  history.unshift({ name, classification, lat, postalCode, district });
  history = history.slice(0, MAX_HISTORY);
  saveHistory(history);
  renderHistory();
}

function renderHistory() {
  const history = loadHistory();
  historyList.innerHTML = '';

  if (history.length === 0) {
    const empty = historyEmpty.cloneNode(true);
    historyList.appendChild(empty);
    clearHistory.hidden = true;
    return;
  }

  clearHistory.hidden = false;

  history.forEach((item, idx) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.tabIndex = 0;
    li.role = 'listitem';
    li.setAttribute(
      'aria-label',
      `${item.name}: ${item.classification}. Clique para repetir.`
    );
    li.style.animationDelay = `${idx * 0.05}s`;

    const dotClass =
      item.classification === 'NORTE'
        ? 'norte'
        : item.classification === 'SUL'
          ? 'sul'
          : String(item.classification).startsWith('ILHAS')
            ? 'ilhas'
            : 'unknown';

    const extra = item.postalCode ? ` · ${item.postalCode}` : '';

    li.innerHTML = `
      <span class="history-dot ${dotClass}" aria-hidden="true"></span>
      <span class="history-name">${escapeHtml(item.name)}${escapeHtml(extra)}</span>
      <span class="history-result">${item.classification}</span>
    `;

    li.addEventListener('click', () => repeatSearch(item.name));
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        repeatSearch(item.name);
      }
    });

    historyList.appendChild(li);
  });
}

function repeatSearch(name) {
  cityInput.value = name;
  verifyLocation();
  cityInput.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(str).replace(/[&<>"']/g, (c) => map[c]);
}

function truncate(str, maxLen) {
  return str.length > maxLen ? `${str.slice(0, maxLen)}…` : str;
}

function minQueryLength(query) {
  const postal = parsePostalCode(query);
  if (postal) return postal.length >= 4;
  return query.length >= 2;
}

verifyBtn.addEventListener('click', verifyLocation);

cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    if (!suggestionsList.hidden && currentSuggestions.length) {
      const idx = selectedIndex >= 0 ? selectedIndex : 0;
      applySuggestion(currentSuggestions[idx]);
    } else {
      verifyLocation();
    }
    return;
  }

  if (!suggestionsList.hidden) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, currentSuggestions.length - 1);
      updateSuggestionHighlight();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      updateSuggestionHighlight();
    } else if (e.key === 'Escape') {
      hideSuggestions();
    }
  }
});

const debouncedSuggest = debounce(async (value) => {
  const query = sanitize(value);
  if (!minQueryLength(query)) {
    hideSuggestions();
    return;
  }
  const suggestions = await fetchSuggestions(query);
  renderSuggestions(suggestions);
}, DEBOUNCE_MS);

cityInput.addEventListener('input', (e) => {
  debouncedSuggest(e.target.value);
  if (!e.target.value.trim()) {
    hideSuggestions();
    closePopupError();
    showEmpty();
  }
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-wrapper')) {
    hideSuggestions();
  }
});

clearHistory.addEventListener('click', () => {
  if (confirm('Tem a certeza que quer limpar o histórico?')) {
    saveHistory([]);
    renderHistory();
  }
});

offlineToggle.addEventListener('click', () => {
  offlineMode = !offlineMode;
  offlineToggle.setAttribute('aria-checked', offlineMode ? 'true' : 'false');
  offlineToggle.setAttribute('aria-label', offlineMode ? 'Desactivar modo offline' : 'Activar modo offline');
  const q = sanitize(cityInput.value);
  if (q.length >= 2) debouncedSuggest(q);
});

if (closeErrorPopupBtn) {
  closeErrorPopupBtn.addEventListener('click', closePopupError);
}
if (errorPopup) {
  errorPopup.querySelector('.error-popup-backdrop')?.addEventListener('click', closePopupError);
}

function init() {
  showEmpty();
  renderHistory();
  cityInput.focus();
}

init();
