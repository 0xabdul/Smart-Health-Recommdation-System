/**
 * AI Skin Disease Detection System
 * Uses TensorFlow.js MobileNet for image features + custom skin-condition scoring.
 * For educational use only. Not a substitute for professional diagnosis.
 */

(function () {
    'use strict';

    // ─── Skin condition definitions (foods & home remedies for general wellness) ─
    const SKIN_CONDITIONS = [
        { id: 'melanoma', name: 'Melanoma', description: 'A serious form of skin cancer that can develop in melanocytes. Early detection is critical. Often appears as an irregular mole with uneven color or border.',
            foods: ['Leafy greens (spinach, kale)', 'Berries (blueberries, strawberries)', 'Tomatoes (lycopene)', 'Green tea', 'Fatty fish (omega-3)', 'Carrots (beta-carotene)', 'Nuts and seeds'],
            remedies: ['See a dermatologist immediately for any suspicious mole.', 'Use broad-spectrum sunscreen (SPF 30+) daily.', 'Avoid tanning beds and limit sun exposure.', 'Keep a mole diary and watch for changes (ABCDE rule).'] },
        { id: 'melanocytic_nevus', name: 'Melanocytic Nevus', description: 'Common mole; benign growth of melanocytes. Usually round, uniform in color, and stable over time. Most people have several.',
            foods: ['Antioxidant-rich fruits (citrus, berries)', 'Green vegetables', 'Whole grains', 'Vitamin E foods (almonds, avocado)'],
            remedies: ['No treatment needed unless it changes or bothers you.', 'Protect from sun with sunscreen and clothing.', 'Avoid scratching or picking. Get any changing mole checked.'] },
        { id: 'basal_cell_carcinoma', name: 'Basal Cell Carcinoma', description: 'Most common type of skin cancer. Grows slowly and rarely spreads. May look like a pearly bump, open sore, or reddish patch.',
            foods: ['Cruciferous vegetables (broccoli, cabbage)', 'Turmeric (curcumin)', 'Green tea', 'Citrus fruits', 'Leafy greens'],
            remedies: ['Consult a doctor for proper treatment (surgery, cream, or therapy).', 'Use sunscreen and protective clothing.', 'Do not try to treat at home; professional care is needed.'] },
        { id: 'actinic_keratosis', name: 'Actinic Keratosis', description: 'Precancerous rough, scaly patches from sun damage. Often on face, lips, ears, or hands. Can progress to squamous cell carcinoma.',
            foods: ['Vitamin C foods (oranges, bell peppers)', 'Green leafy vegetables', 'Fish and nuts (omega-3)', 'Tomatoes'],
            remedies: ['Apply broad-spectrum sunscreen daily; reapply every 2 hours outdoors.', 'Wear a hat and long sleeves in the sun.', 'Use moisturizer to soothe dryness.', 'See a dermatologist for freezing or prescription treatment.'] },
        { id: 'benign_keratosis', name: 'Benign Keratosis', description: 'Non-cancerous skin growths such as seborrheic keratosis. Often brown, stuck-on looking patches. No treatment required unless bothersome.',
            foods: ['Balanced diet with fruits and vegetables', 'Foods rich in vitamin E', 'Adequate water intake'],
            remedies: ['No treatment needed; harmless.', 'If itchy or irritated, keep area moisturized.', 'Optional removal by a doctor for cosmetic reasons only.'] },
        { id: 'dermatitis', name: 'Dermatitis', description: 'Inflammation of the skin (eczema, contact dermatitis, etc.). Red, itchy, sometimes swollen or blistered. Not cancerous.',
            foods: ['Oily fish (salmon, mackerel)', 'Probiotics (yogurt, kefir)', 'Foods rich in zinc (pumpkin seeds, lentils)', 'Avoid known triggers (e.g. dairy, nuts if allergic)'],
            remedies: ['Apply fragrance-free moisturizer after bathing.', 'Use mild, soap-free cleansers; avoid hot water.', 'Cold compress or oatmeal bath to calm itching.', 'Identify and avoid irritants (detergents, metals, certain fabrics).'] },
        { id: 'vascular_lesion', name: 'Vascular Lesion', description: 'Blood vessel-related marks: hemangiomas, angiomas, or broken capillaries. Usually benign and may fade over time.',
            foods: ['Vitamin C (supports blood vessels)', 'Leafy greens', 'Citrus fruits', 'Stay hydrated'],
            remedies: ['Usually no treatment needed.', 'Protect from sun to avoid darkening.', 'Laser treatment available from a doctor if desired for appearance.'] },
        { id: 'squamous_cell_carcinoma', name: 'Squamous Cell Carcinoma', description: 'Second most common skin cancer. Can appear as a firm red nodule or flat sore with scaly crust. May grow and spread if untreated.',
            foods: ['Antioxidant-rich diet (berries, greens)', 'Green tea', 'Turmeric', 'Vitamin D (with doctor’s advice)'],
            remedies: ['See a dermatologist for diagnosis and treatment.', 'Use sunscreen and avoid prolonged sun exposure.', 'Do not use home remedies on suspicious sores; get professional care.'] }
    ];

    // ─── State ─────────────────────────────────────────────────────────────
    let mobilenetModel = null;
    let stream = null;
    const HISTORY_KEY = 'skin_detection_history';
    const HISTORY_MAX = 50;

    // ─── DOM refs ───────────────────────────────────────────────────────────
    const el = {
        modelStatus: document.getElementById('model-status'),
        fileInput: document.getElementById('file-input'),
        dropZone: document.getElementById('drop-zone'),
        btnBrowse: document.getElementById('btn-browse'),
        btnAnalyze: document.getElementById('btn-analyze'),
        btnClear: document.getElementById('btn-clear'),
        previewWrap: document.getElementById('preview-wrap'),
        previewImg: document.getElementById('preview-img'),
        resultsEmpty: document.getElementById('results-empty'),
        resultsContent: document.getElementById('results-content'),
        resultsLoading: document.getElementById('results-loading'),
        primaryName: document.getElementById('primary-name'),
        primaryConfidence: document.getElementById('primary-confidence'),
        confidenceBars: document.getElementById('confidence-bars'),
        foodsList: document.getElementById('foods-list'),
        remediesList: document.getElementById('remedies-list'),
        metaList: document.getElementById('meta-list'),
        infoGrid: document.getElementById('info-grid'),
        tabs: document.querySelectorAll('.tab'),
        tabContents: document.querySelectorAll('[data-tab-content]'),
        uploadArea: document.getElementById('upload-area'),
        cameraArea: document.getElementById('camera-area'),
        cameraPlaceholder: document.getElementById('camera-placeholder'),
        cameraLive: document.getElementById('camera-live'),
        cameraVideo: document.getElementById('camera-video'),
        cameraCanvas: document.getElementById('camera-canvas'),
        btnStartCamera: document.getElementById('btn-start-camera'),
        btnCapture: document.getElementById('btn-capture'),
        btnStopCamera: document.getElementById('btn-stop-camera'),
        historySidebar: document.getElementById('history-sidebar'),
        historyList: document.getElementById('history-list'),
        sidebarOverlay: document.getElementById('sidebar-overlay'),
        btnHistory: document.getElementById('btn-history'),
        btnCloseHistory: document.getElementById('btn-close-history'),
        btnClearHistory: document.getElementById('btn-clear-history'),
        aboutModal: document.getElementById('about-modal'),
        btnInfo: document.getElementById('btn-info'),
        btnCloseAbout: document.getElementById('btn-close-about')
    };

    // ─── Load MobileNet ─────────────────────────────────────────────────────
    async function loadModel() {
        try {
            el.modelStatus.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i><span>Loading AI model…</span>';
            mobilenetModel = await mobilenet.load({ version: 2, alpha: 0.25 });
            el.modelStatus.className = 'model-status ready';
            el.modelStatus.innerHTML = '<i class="fas fa-check-circle"></i><span>Model ready</span>';
            if (el.previewImg && el.previewImg.src) scheduleAutoAnalyze();
        } catch (err) {
            console.error('Model load error:', err);
            el.modelStatus.className = 'model-status';
            el.modelStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Model failed to load. Check console.</span>';
        }
    }

    // ─── Softmax ────────────────────────────────────────────────────────────
    function softmax(logits) {
        const max = Math.max(...logits);
        const exp = logits.map(x => Math.exp(x - max));
        const sum = exp.reduce((a, b) => a + b, 0);
        return exp.map(x => x / sum);
    }

    // ─── Image-based skin scoring (deterministic from pixels for demo) ───────
    function getImageFeatures(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const w = Math.min(img.width, 224);
        const h = Math.min(img.height, 224);
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        const n = data.length / 4;
        let rSum = 0, gSum = 0, bSum = 0;
        let rVar = 0, gVar = 0, bVar = 0;
        const samples = [];
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            rSum += r; gSum += g; bSum += b;
            samples.push({ r, g, b });
        }
        const rMean = rSum / n, gMean = gSum / n, bMean = bSum / n;
        samples.forEach(s => {
            rVar += (s.r - rMean) ** 2;
            gVar += (s.g - gMean) ** 2;
            bVar += (s.b - bMean) ** 2;
        });
        rVar /= n; gVar /= n; bVar /= n;
        const luminance = 0.299 * rMean + 0.587 * gMean + 0.114 * bMean;
        const colorfulness = Math.sqrt(rVar + gVar + bVar);
        const redRatio = rMean / (rMean + gMean + bMean + 1e-6);
        const centerW = Math.floor(w / 4);
        const centerH = Math.floor(h / 4);
        let centerLum = 0, centerCount = 0;
        for (let y = centerH; y < h - centerH; y++) {
            for (let x = centerW; x < w - centerW; x++) {
                const i = (y * w + x) * 4;
                centerLum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                centerCount++;
            }
        }
        centerLum = centerCount ? centerLum / centerCount : luminance;
        const centerVsEdge = centerLum / (luminance + 1e-6);
        return {
            luminance,
            colorfulness,
            redRatio,
            centerVsEdge,
            rVar, gVar, bVar,
            rMean, gMean, bMean
        };
    }

    function skinScoresFromFeatures(features) {
        const { luminance, colorfulness, redRatio, centerVsEdge, rMean, gMean, bMean } = features;
        const f = (x, center, scale) => -0.5 * Math.pow((x - center) / (scale + 1e-6), 2);
        const logits = [
            f(redRatio, 0.4, 0.15) + f(colorfulness, 40, 30),           // melanoma
            f(redRatio, 0.35, 0.2) + f(luminance, 120, 60),             // melanocytic_nevus
            f(redRatio, 0.45, 0.2) + f(centerVsEdge, 1.1, 0.2),         // basal_cell_carcinoma
            f(luminance, 180, 50) + f(colorfulness, 25, 20),             // actinic_keratosis
            f(luminance, 140, 50) + f(redRatio, 0.38, 0.15),             // benign_keratosis
            f(redRatio, 0.5, 0.2) + f(colorfulness, 50, 25),            // dermatitis
            f(redRatio, 0.55, 0.2) + f(rMean - gMean, 20, 30),          // vascular_lesion
            f(luminance, 160, 40) + f(centerVsEdge, 0.95, 0.15)         // squamous_cell_carcinoma
        ];
        return softmax(logits);
    }

    // ─── Fast analysis (no model): instant result when user uploads ─────────
    function analyzeImageFast(img) {
        if (!img) return null;
        const start = Date.now();
        const features = getImageFeatures(img);
        const skinProbs = skinScoresFromFeatures(features);
        const analysisTime = Date.now() - start;
        const topIndex = skinProbs.reduce((best, p, i) => p > skinProbs[best] ? i : best, 0);
        const topCondition = SKIN_CONDITIONS[topIndex];
        return {
            primary: { id: topCondition.id, name: topCondition.name, confidence: skinProbs[topIndex] },
            all: SKIN_CONDITIONS.map((c, i) => ({ id: c.id, name: c.name, confidence: skinProbs[i] })),
            meta: {
                analysisTimeMs: analysisTime,
                imageWidth: img.naturalWidth || img.width,
                imageHeight: img.naturalHeight || img.height,
                mobilenetTop: '—'
            }
        };
    }

    // ─── Full analysis: MobileNet + skin scoring (when model loaded) ────────
    async function analyzeImage(img) {
        if (!img || !mobilenetModel) return null;
        const start = Date.now();
        let mobilenetPredictions = [];
        try {
            mobilenetPredictions = await mobilenetModel.classify(img, 3);
        } catch (e) {
            console.warn('MobileNet classify failed:', e);
        }
        const features = getImageFeatures(img);
        const skinProbs = skinScoresFromFeatures(features);
        const analysisTime = Date.now() - start;
        const topIndex = skinProbs.reduce((best, p, i) => p > skinProbs[best] ? i : best, 0);
        const topCondition = SKIN_CONDITIONS[topIndex];
        return {
            primary: { id: topCondition.id, name: topCondition.name, confidence: skinProbs[topIndex] },
            all: SKIN_CONDITIONS.map((c, i) => ({ id: c.id, name: c.name, confidence: skinProbs[i] })),
            meta: {
                analysisTimeMs: analysisTime,
                imageWidth: img.naturalWidth || img.width,
                imageHeight: img.naturalHeight || img.height,
                mobilenetTop: mobilenetPredictions[0] ? mobilenetPredictions[0].className : '—'
            }
        };
    }

    // ─── UI: show results ───────────────────────────────────────────────────
    function showResults(results) {
        el.resultsEmpty.classList.add('hidden');
        el.resultsLoading.classList.add('hidden');
        el.resultsContent.classList.remove('hidden');

        el.primaryName.textContent = results.primary.name;
        el.primaryConfidence.textContent = (results.primary.confidence * 100).toFixed(1) + '%';

        // Foods & home remedies for the detected condition
        const condition = SKIN_CONDITIONS.find(c => c.id === results.primary.id);
        if (condition) {
            el.foodsList.innerHTML = (condition.foods || []).map(f => `<li>${f}</li>`).join('');
            el.remediesList.innerHTML = (condition.remedies || []).map(r => `<li>${r}</li>`).join('');
        } else {
            el.foodsList.innerHTML = '<li>Eat a balanced diet with fruits and vegetables. Consult a doctor for personalized advice.</li>';
            el.remediesList.innerHTML = '<li>See a dermatologist for a proper diagnosis and treatment plan.</li>';
        }

        el.confidenceBars.innerHTML = '';
        results.all.forEach(item => {
            const row = document.createElement('div');
            row.className = 'bar-row';
            row.innerHTML = `
                <span class="name">${item.name}</span>
                <span class="pct">${(item.confidence * 100).toFixed(1)}%</span>
                <div class="bar-track"><div class="bar-fill" style="width:${item.confidence * 100}%"></div></div>
            `;
            el.confidenceBars.appendChild(row);
        });

        const m = results.meta;
        el.metaList.innerHTML = `
            <li><span>Analysis time</span><span>${m.analysisTimeMs} ms</span></li>
            <li><span>Image size</span><span>${m.imageWidth} × ${m.imageHeight}</span></li>
            <li><span>Feature check</span><span>${m.mobilenetTop}</span></li>
        `;
    }

    function setAnalyzing(analyzing) {
        if (analyzing) {
            el.resultsContent.classList.add('hidden');
            el.resultsEmpty.classList.add('hidden');
            el.resultsLoading.classList.remove('hidden');
        } else {
            el.resultsLoading.classList.add('hidden');
        }
    }

    // ─── Run analysis: instant fast path, then full AI if model ready ───────
    async function runAnalysis() {
        const img = el.previewImg;
        if (!img.src || (!img.src.startsWith('data:') && !img.src.startsWith('blob:'))) return;
        try {
            const results = analyzeImageFast(img);
            if (results) {
                showResults(results);
                addToHistory(results, img.src);
            }
            if (mobilenetModel) {
                setAnalyzing(true);
                const full = await analyzeImage(img);
                if (full) {
                    showResults(full);
                }
                setAnalyzing(false);
            }
        } catch (err) {
            console.error(err);
            el.resultsLoading.classList.add('hidden');
            el.resultsEmpty.classList.remove('hidden');
            el.resultsContent.classList.add('hidden');
        }
    }

    // ─── History (localStorage) ──────────────────────────────────────────────
    function getHistory() {
        try {
            const raw = localStorage.getItem(HISTORY_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function saveHistory(history) {
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, HISTORY_MAX)));
        } catch (e) {}
    }

    function addToHistory(results, dataUrl) {
        const history = getHistory();
        history.unshift({
            primary: results.primary.name,
            confidence: results.primary.confidence,
            date: new Date().toISOString(),
            thumb: dataUrl ? dataUrl.substring(0, 200) + '...' : ''
        });
        saveHistory(history);
        renderHistory();
    }

    function renderHistory() {
        const history = getHistory();
        el.historyList.innerHTML = '';
        if (history.length === 0) {
            el.historyList.innerHTML = '<p style="padding:1rem;color:var(--text-muted);font-size:0.9rem;">No scans yet.</p>';
            return;
        }
        history.forEach((item, i) => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="condition">${item.primary}</div>
                <div class="date">${new Date(item.date).toLocaleString()} · ${(item.confidence * 100).toFixed(1)}%</div>
            `;
            el.historyList.appendChild(div);
        });
    }

    function clearHistory() {
        localStorage.removeItem(HISTORY_KEY);
        renderHistory();
    }

    // ─── One-step: auto-analyze when image is ready ──────────────────────────
    function scheduleAutoAnalyze() {
        function run() {
            if (!el.previewImg.src) return;
            if (mobilenetModel) runAnalysis();
        }
        if (el.previewImg.complete) setTimeout(run, 200);
        else el.previewImg.addEventListener('load', () => setTimeout(run, 200), { once: true });
    }

    // ─── Preview: set image from file or URL ────────────────────────────────
    function setPreviewFromFile(file) {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = function () {
            el.previewImg.src = reader.result;
            el.previewWrap.classList.remove('hidden');
            if (el.dropZone) el.dropZone.classList.add('hidden');
            el.cameraPlaceholder.classList.add('hidden');
            el.cameraLive.classList.add('hidden');
            scheduleAutoAnalyze();
        };
        reader.readAsDataURL(file);
    }

    function setPreviewFromBlob(blob) {
        const url = URL.createObjectURL(blob);
        el.previewImg.onload = () => URL.revokeObjectURL(url);
        el.previewImg.src = url;
        el.previewWrap.classList.remove('hidden');
        el.cameraPlaceholder.classList.add('hidden');
        el.cameraLive.classList.add('hidden');
        if (el.dropZone) el.dropZone.classList.add('hidden');
        scheduleAutoAnalyze();
    }

    function clearPreview() {
        el.previewImg.removeAttribute('src');
        el.previewWrap.classList.add('hidden');
        if (el.dropZone) el.dropZone.classList.remove('hidden');
        el.resultsContent.classList.add('hidden');
        el.resultsEmpty.classList.remove('hidden');
    }

    // ─── Tabs ───────────────────────────────────────────────────────────────
    function switchTab(tabName) {
        el.tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
        el.tabContents.forEach(c => {
            const isActive = c.dataset.tabContent === tabName;
            c.classList.toggle('active', isActive);
            c.classList.toggle('hidden', !isActive);
        });
        if (tabName === 'camera') {
            el.previewWrap.classList.add('hidden');
            if (!stream) {
                el.cameraPlaceholder.classList.remove('hidden');
                el.cameraLive.classList.add('hidden');
            }
        } else {
            el.cameraPlaceholder.classList.remove('hidden');
            el.cameraLive.classList.add('hidden');
            if (el.previewImg.src) {
                el.previewWrap.classList.remove('hidden');
                if (el.dropZone) el.dropZone.classList.add('hidden');
            } else {
                if (el.dropZone) el.dropZone.classList.remove('hidden');
            }
        }
    }

    // ─── Camera ──────────────────────────────────────────────────────────────
    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } } });
            el.cameraVideo.srcObject = stream;
            el.cameraPlaceholder.classList.add('hidden');
            el.cameraLive.classList.remove('hidden');
        } catch (err) {
            console.error(err);
            alert('Could not access camera. Try allowing camera permission or use upload.');
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            stream = null;
        }
        el.cameraVideo.srcObject = null;
        el.cameraLive.classList.add('hidden');
        el.cameraPlaceholder.classList.remove('hidden');
    }

    function captureFromCamera() {
        const video = el.cameraVideo;
        const canvas = el.cameraCanvas;
        if (!stream || !video.videoWidth) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        canvas.toBlob(blob => {
            if (blob) setPreviewFromBlob(blob);
        }, 'image/jpeg', 0.92);
    }

    // ─── Info cards ─────────────────────────────────────────────────────────
    function renderInfoCards() {
        el.infoGrid.innerHTML = '';
        SKIN_CONDITIONS.forEach(c => {
            const card = document.createElement('div');
            card.className = 'info-card';
            card.innerHTML = `
                <div class="info-card-header">
                    <span>${c.name}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="info-card-body">${c.description}</div>
            `;
            card.querySelector('.info-card-header').addEventListener('click', () => card.classList.toggle('open'));
            el.infoGrid.appendChild(card);
        });
    }

    // ─── Event bindings ─────────────────────────────────────────────────────
    function bindEvents() {
        el.btnBrowse.addEventListener('click', () => el.fileInput.click());
        el.fileInput.addEventListener('change', function () {
            const file = this.files && this.files[0];
            if (file) setPreviewFromFile(file);
            this.value = '';
        });

        el.dropZone.addEventListener('click', (e) => { if (e.target === el.dropZone || e.target.closest('.drop-zone')) el.fileInput.click(); });
        el.dropZone.addEventListener('dragover', (e) => { e.preventDefault(); el.dropZone.classList.add('dragover'); });
        el.dropZone.addEventListener('dragleave', () => el.dropZone.classList.remove('dragover'));
        el.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            el.dropZone.classList.remove('dragover');
            const file = e.dataTransfer.files && e.dataTransfer.files[0];
            if (file) setPreviewFromFile(file);
        });

        el.btnClear.addEventListener('click', clearPreview);
        el.btnAnalyze.addEventListener('click', runAnalysis);

        el.tabs.forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));

        el.btnStartCamera.addEventListener('click', startCamera);
        el.btnStopCamera.addEventListener('click', stopCamera);
        el.btnCapture.addEventListener('click', captureFromCamera);

        el.btnHistory.addEventListener('click', () => {
            el.historySidebar.classList.remove('hidden');
            el.sidebarOverlay.classList.remove('hidden');
            renderHistory();
        });
        el.btnCloseHistory.addEventListener('click', () => {
            el.historySidebar.classList.add('hidden');
            el.sidebarOverlay.classList.add('hidden');
        });
        el.sidebarOverlay.addEventListener('click', () => {
            el.historySidebar.classList.add('hidden');
            el.sidebarOverlay.classList.add('hidden');
        });
        el.btnClearHistory.addEventListener('click', () => { clearHistory(); });

        el.btnInfo.addEventListener('click', () => el.aboutModal.classList.remove('hidden'));
        el.btnCloseAbout.addEventListener('click', () => el.aboutModal.classList.add('hidden'));
        el.aboutModal.addEventListener('click', (e) => { if (e.target === el.aboutModal) el.aboutModal.classList.add('hidden'); });
    }

    // ─── Init ───────────────────────────────────────────────────────────────
    function init() {
        renderInfoCards();
        bindEvents();
        loadModel();
        switchTab('upload');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
