import './styles.css';

const APP_KEY = 'pk_KjV32GDuJNWrvF3k';
const CALLBACK_PATH = '/callback';
const STORAGE_KEY = 'pollinations_user_api_key';
const FIXED_OPTIONS = { model: 'wan', width: '1080', height: '1920', duration: '15', aspectRatio: '9:16', audio: 'true' };
const DEFAULT_SCENE = 'A confident young Pakistani businesswoman walking through a modern SRLINES digital marketing office, speaking naturally to the camera. While speaking she confidently gestures toward large digital displays showing social media analytics, engagement charts, Facebook, Instagram, YouTube, TikTok and LinkedIn branding, content calendars, designers editing reels, marketers collaborating, clients reviewing campaigns, and successful social media results. The office is modern, bright, premium and technology-focused with elegant SRLINES branding throughout. The presenter smiles confidently, maintains eye contact with the camera, walks naturally through the office, and ends with a friendly call-to-action gesture toward the viewer. Cinematic 9:16 vertical format, handheld camera movement, realistic office lighting, shallow depth of field, highly engaging commercial quality, premium corporate atmosphere, natural facial expressions, no text overlays, clean frame.';
const DEFAULT_VOICEOVER = 'روزانہ پوسٹس سے نتائج نہیں ملتے؟ SRLINES کے ساتھ ہر ہفتے 7 پروفیشنل پوسٹس، 2 شارٹ ریلز، مکمل سوشل میڈیا مینجمنٹ اور SEO فرینڈلی کنٹنٹ حاصل کریں۔ صرف 10 ہزار روپے ماہانہ۔ آج ہی رابطہ کریں اور اپنے کاروبار کے لیے ایسے ہی پروفیشنل ریلز، پوسٹس اور مکمل سوشل میڈیا مینجمنٹ حاصل کریں۔';

const $ = (id) => document.getElementById(id);
let apiKey = localStorage.getItem(STORAGE_KEY) || '';

function callbackUrl() { return `${window.location.origin}${CALLBACK_PATH}`; }
function buildPrompt(scene, voiceover) { return `${scene.trim()} The entire video, including the complete spoken dialogue, must fit within exactly 15 seconds. All spoken dialogue and voiceover must be entirely in Urdu language. She says this: "${voiceover.trim()}"`; }
function buildVideoUrl(scene, voiceover, key) { const prompt = encodeURIComponent(buildPrompt(scene, voiceover)); const params = new URLSearchParams({ ...FIXED_OPTIONS, key }); return `https://gen.pollinations.ai/video/${prompt}?${params}`; }
function authUrl() { const params = new URLSearchParams({ redirect_uri: callbackUrl(), client_id: APP_KEY, state: crypto.randomUUID?.() || String(Date.now()), scope: 'generate usage', models: FIXED_OPTIONS.model, expiry: '7', budget: '10' }); return `https://enter.pollinations.ai/authorize?${params}`; }
function showStatus(message) { $('status').textContent = message; $('status').hidden = !message; }
function renderAuth() { $('auth-title').textContent = apiKey ? 'Authenticated user key active' : 'User login required'; $('auth-copy').textContent = apiKey ? 'Key stored only in this browser.' : 'Redirects to Pollinations/GitHub consent.'; $('auth-action').innerHTML = apiKey ? '<button id="logout" class="secondary">↩ Log out</button>' : `<a class="button" href="${authUrl()}">↪ Login with Pollinations</a>`; $('logout')?.addEventListener('click', () => { localStorage.removeItem(STORAGE_KEY); apiKey = ''; $('result').hidden = true; renderAuth(); showStatus('Logged out. The local browser key was removed.'); }); }

function handleRedirect() { const hash = new URLSearchParams(window.location.hash.slice(1)); const returnedKey = hash.get('api_key'); const error = hash.get('error'); if (returnedKey) { apiKey = returnedKey; localStorage.setItem(STORAGE_KEY, returnedKey); window.history.replaceState({}, document.title, '/'); showStatus('Login successful. Your Pollinations key is saved locally in this browser.'); } else if (error) { window.history.replaceState({}, document.title, '/'); showStatus(`Login failed: ${error}`); } }

$('scene').value = DEFAULT_SCENE;
$('voiceover').value = DEFAULT_VOICEOVER;
$('fixed-grid').innerHTML = Object.entries(FIXED_OPTIONS).map(([key, value]) => `<div><span>${key}</span><strong>${value}</strong></div>`).join('');
$('generate').addEventListener('click', () => { if (!apiKey) return showStatus('Please log in with Pollinations first so the app can use your authorized API key.'); if (!$('scene').value.trim() || !$('voiceover').value.trim()) return showStatus('Please fill both required fields: video scene and voiceover.'); const url = buildVideoUrl($('scene').value, $('voiceover').value, apiKey); $('video').src = url; $('open').href = url; $('url').value = url; $('result').hidden = false; showStatus('Video request URL is ready. If generation is still processing, keep the preview open or retry in a few moments.'); });
$('copy').addEventListener('click', () => navigator.clipboard.writeText($('url').value));
handleRedirect();
renderAuth();
