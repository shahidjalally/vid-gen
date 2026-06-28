const APP_KEY = 'pk_KjV32GDuJNWRvF3k';
const CALLBACK_PATH = '/callback/';
const STORAGE_KEY = 'pollinations_user_api_key';
const FIXED_OPTIONS = { model: 'wan', width: '1080', height: '1920', aspectRatio: '9:16', audio: 'true' };
const DURATION_OPTIONS = ['5', '10', '15'];
const DEFAULT_DURATION = '15';
const DEFAULT_SCENE = 'A confident young Pakistani businesswoman walking through a modern SRLINES digital marketing office, speaking naturally to the camera. While speaking, she gestures toward large digital displays showing social media analytics, engagement charts, Facebook, Instagram, YouTube, TikTok, and LinkedIn branding, content calendars, designers editing reels, marketers collaborating, clients reviewing campaigns, and successful social media results. The office is modern, bright, premium, technology-focused, and includes elegant SRLINES branding throughout. The presenter smiles confidently, maintains eye contact with the camera, walks naturally through the office, and ends with a friendly call-to-action gesture toward the viewer. Cinematic 9:16 vertical format, handheld camera movement, realistic office lighting, shallow depth of field, highly engaging commercial quality, premium corporate atmosphere, natural facial expressions, no text overlays, clean frame.';
const DEFAULT_VOICEOVER = 'Are daily posts not bringing results? With SRLINES, get 7 professional posts every week, 2 short reels, complete social media management, and SEO-friendly content for only 10,000 rupees per month. Contact us today and get professional reels, posts, and complete social media management for your business.';

const $ = (id) => document.getElementById(id);
let apiKey = localStorage.getItem(STORAGE_KEY) || '';
let lastOpenedRequestSignature = '';

function callbackUrl() {
  return `${window.location.origin}${CALLBACK_PATH}`;
}

function selectedDuration() {
  return $('duration')?.value || DEFAULT_DURATION;
}

function generationOptions() {
  return { ...FIXED_OPTIONS, duration: selectedDuration() };
}

function requestSignature(scene, voiceover) {
  return JSON.stringify({ scene: scene.trim(), voiceover: voiceover.trim(), duration: selectedDuration(), options: generationOptions() });
}

function setGenerateDisabled(isDisabled) {
  const generate = $('generate');
  if (!generate) return;
  generate.disabled = isDisabled;
  generate.setAttribute('aria-disabled', String(isDisabled));
}

function resetSingleClickGuard() {
  lastOpenedRequestSignature = '';
  setGenerateDisabled(false);
}

function buildPrompt(scene, voiceover, duration) {
  return [
    scene.trim(),
    'The voiceover script below is written in English only as source meaning for the prompt.',
    'Translate and adapt the complete voiceover into natural spoken Urdu for the final audio.',
    'All spoken dialogue, narration, and voiceover in the generated video must be entirely in Urdu, with no English words spoken unless they are brand names.',
    `The full video and complete Urdu voiceover must fit smoothly within exactly ${duration} seconds.`,
    `English source voiceover script: "${voiceover.trim()}"`,
  ].join(' ');
}

function buildVideoUrl(scene, voiceover, key) {
  const duration = selectedDuration();
  const prompt = encodeURIComponent(buildPrompt(scene, voiceover, duration));
  const params = new URLSearchParams({ ...generationOptions(), key });
  return `https://gen.pollinations.ai/video/${prompt}?${params}`;
}

function authUrl() {
  const params = new URLSearchParams({
    redirect_uri: callbackUrl(),
    client_id: APP_KEY,
    state: crypto.randomUUID?.() || String(Date.now()),
    scope: 'generate usage',
    models: FIXED_OPTIONS.model,
    expiry: '7',
    budget: '10',
  });
  return `https://enter.pollinations.ai/authorize?${params}`;
}

function showStatus(message) {
  const status = $('status');
  if (!status) return;
  status.textContent = message;
  status.hidden = !message;
}

function renderAuth() {
  $('auth-title').textContent = apiKey ? 'Authenticated user key active' : 'User login required';
  $('auth-copy').textContent = apiKey
    ? 'Ready to generate. Your key is stored only in this browser.'
    : 'Tap login, approve the Pollinations/GitHub consent screen, then return here automatically.';
  $('auth-action').innerHTML = apiKey
    ? '<button id="logout" class="secondary" type="button">↩ Log out</button>'
    : `<a class="button" href="${authUrl()}">↪ Login with Pollinations</a>`;
  $('logout')?.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    apiKey = '';
    resetSingleClickGuard();
    renderAuth();
    showStatus('Logged out. The local browser key was removed.');
  });
}

function homePath() {
  return window.location.pathname.includes('/vid-gen/') ? '/vid-gen/' : '/';
}

function normalizeHomePath() {
  window.history.replaceState({}, document.title, homePath());
}

function returnHomeAfterCallback(messageKey, messageValue) {
  const params = new URLSearchParams({ [messageKey]: messageValue });
  window.location.replace(`${window.location.origin}${homePath()}#${params}`);
}

function handleRedirect() {
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const returnedKey = hash.get('api_key');
  const error = hash.get('error');
  const success = hash.get('login');
  const loginError = hash.get('login_error');

  if (returnedKey) {
    apiKey = returnedKey;
    localStorage.setItem(STORAGE_KEY, returnedKey);
    returnHomeAfterCallback('login', 'success');
    return true;
  }

  if (error) {
    returnHomeAfterCallback('login_error', error);
    return true;
  }

  if (success === 'success') {
    normalizeHomePath();
    showStatus('Login successful. Your Pollinations key is saved locally in this browser.');
  } else if (loginError) {
    normalizeHomePath();
    showStatus(`Login failed: ${loginError}`);
  }

  return false;
}

function initGenerator() {
  if (handleRedirect()) return;

  $('scene').value = DEFAULT_SCENE;
  $('voiceover').value = DEFAULT_VOICEOVER;

  const durationSelect = $('duration');
  if (durationSelect) {
    durationSelect.innerHTML = DURATION_OPTIONS
      .map((duration) => `<option value="${duration}"${duration === DEFAULT_DURATION ? ' selected' : ''}>${duration} seconds</option>`)
      .join('');
  }

  $('fixed-grid').innerHTML = Object.entries(FIXED_OPTIONS)
    .map(([key, value]) => `<div><span>${key}</span><strong>${value}</strong></div>`)
    .join('');

  ['scene', 'voiceover', 'duration'].forEach((fieldId) => {
    $(fieldId)?.addEventListener('input', resetSingleClickGuard);
    $(fieldId)?.addEventListener('change', resetSingleClickGuard);
  });

  $('generate').addEventListener('click', () => {
    const scene = $('scene').value;
    const voiceover = $('voiceover').value;

    if (!apiKey) return showStatus('Please log in with Pollinations first so the app can use your authorized API key.');
    if (!scene.trim() || !voiceover.trim()) return showStatus('Please fill both required fields: video scene and English voiceover script.');

    const signature = requestSignature(scene, voiceover);
    if (signature === lastOpenedRequestSignature) {
      setGenerateDisabled(true);
      return showStatus('This exact scene, voiceover, and duration already opened once. Edit an input before generating another paid request.');
    }

    lastOpenedRequestSignature = signature;
    setGenerateDisabled(true);
    window.open(buildVideoUrl(scene, voiceover, apiKey), '_blank', 'noopener,noreferrer');
    showStatus('Generate Video clicked once for this scene, voiceover, and duration. Edit an input to enable another request.');
  });

  renderAuth();
}

initGenerator();
