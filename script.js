  // ═══════════════════════════════════════════
  //  LIVE BACKGROUND ENGINE
  // ═══════════════════════════════════════════
  (function() {
    const canvas = document.getElementById('bg-canvas');
    const ctx    = canvas.getContext('2d');

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', () => { resize(); initColumns(); });

    function isLight() {
      return document.documentElement.getAttribute('data-theme') === 'light';
    }

    const FONT_SIZE  = 13;
    const CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ+-=<>{}[]∑∫∂√∞≈≠∀∃∈∉⊂⊃⊆⊇';
    let columns = [];

    function initColumns() {
      const cols = Math.floor(canvas.width / FONT_SIZE);
      const prev = columns.slice();
      columns = [];
      for (let i = 0; i < cols; i++) {
        columns.push(prev[i] || {
          y:      Math.random() * -canvas.height,
          speed:  0.4 + Math.random() * 1.2,
          chars:  [],
          len:    Math.floor(8 + Math.random() * 20),
          bright: Math.random() > 0.92
        });
      }
    }
    initColumns();

    const PARTICLE_COUNT = 55;
    const particles = [];

    function makeParticle() {
      return {
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        r:     0.8 + Math.random() * 2.2,
        vx:    (Math.random() - 0.5) * 0.35,
        vy:    (Math.random() - 0.5) * 0.35,
        alpha: 0.15 + Math.random() * 0.55,
        pulse: Math.random() * Math.PI * 2,
        speed: 0.008 + Math.random() * 0.018
      };
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(makeParticle());

    const rings = [];
    function spawnRing() {
      rings.push({
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        r:     0,
        maxR:  120 + Math.random() * 160,
        alpha: 0.18 + Math.random() * 0.1,
        speed: 0.6 + Math.random() * 0.8
      });
    }
    for (let i = 0; i < 3; i++) spawnRing();
    setInterval(() => { if (rings.length < 8) spawnRing(); }, 2200);

    let scanY = 0;
    const SCAN_SPEED = 0.4;

    function draw() {
      requestAnimationFrame(draw);
      const W = canvas.width;
      const H = canvas.height;
      const light = isLight();

      ctx.fillStyle = light ? 'rgba(238,242,247, 0.18)' : 'rgba(10,12,16, 0.18)';
      ctx.fillRect(0, 0, W, H);

      ctx.font = `${FONT_SIZE}px 'Share Tech Mono', monospace`;
      columns.forEach((col, i) => {
        const x = i * FONT_SIZE;
        const len = col.len;
        for (let k = 0; k < len; k++) {
          const charY = col.y - k * FONT_SIZE;
          if (charY < -FONT_SIZE || charY > H + FONT_SIZE) continue;
          const ratio  = 1 - k / len;
          const alphaK = light ? ratio * 0.22 : (col.bright ? ratio * 0.85 : ratio * 0.45);
          if (k === 0) {
            ctx.fillStyle = light ? `rgba(0,100,180,${alphaK * 1.8})` : `rgba(220,255,250,${Math.min(alphaK * 2.5, 0.95)})`;
          } else {
            const [r,g,b] = light ? [0,100,180] : [0,255,224];
            ctx.fillStyle = `rgba(${r},${g},${b},${alphaK})`;
          }
          const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
          ctx.fillText(ch, x, charY);
        }
        col.y += col.speed;
        if (col.y - col.len * FONT_SIZE > H) {
          col.y     = -FONT_SIZE * Math.floor(Math.random() * 10);
          col.speed = 0.4 + Math.random() * 1.2;
          col.len   = Math.floor(8 + Math.random() * 20);
          col.bright= Math.random() > 0.92;
        }
      });

      const [rR,rG,rB] = light ? [0,100,180] : [0,255,224];
      for (let ri = rings.length - 1; ri >= 0; ri--) {
        const ring = rings[ri];
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rR},${rG},${rB},${ring.alpha * (1 - ring.r / ring.maxR)})`;
        ctx.lineWidth   = 1.2;
        ctx.stroke();
        ring.r += ring.speed;
        if (ring.r >= ring.maxR) rings.splice(ri, 1);
      }

      const [pR,pG,pB] = light ? [0,100,180] : [0,255,224];
      particles.forEach(p => {
        p.pulse += p.speed;
        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pR},${pG},${pB},${a})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      });

      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx   = particles[a].x - particles[b].x;
          const dy   = particles[a].y - particles[b].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            const lineAlpha = (light ? 0.06 : 0.12) * (1 - dist / 110);
            ctx.strokeStyle = `rgba(${pR},${pG},${pB},${lineAlpha})`;
            ctx.lineWidth   = 0.5;
            ctx.stroke();
          }
        }
      }

      if (!light) {
        const grad = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
        grad.addColorStop(0,   'rgba(0,255,224,0)');
        grad.addColorStop(0.5, 'rgba(0,255,224,0.025)');
        grad.addColorStop(1,   'rgba(0,255,224,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, scanY - 40, W, 80);
        ctx.beginPath();
        ctx.moveTo(0, scanY); ctx.lineTo(W, scanY);
        ctx.strokeStyle = 'rgba(0,255,224,0.06)';
        ctx.lineWidth   = 1; ctx.stroke();
        scanY += SCAN_SPEED;
        if (scanY > H) scanY = 0;
      }

      if (!light) {
        const vig = ctx.createRadialGradient(W/2, H/2, H*0.3, W/2, H/2, H*0.85);
        vig.addColorStop(0, 'rgba(10,12,16,0)');
        vig.addColorStop(1, 'rgba(10,12,16,0.55)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, W, H);
      }
    }

    draw();
  })();


  // ═══════════════════════════════════════════
  //  STATE
  // ═══════════════════════════════════════════
  let array        = [];
  let isSorting    = false;
  let isPaused     = false;
  let animTimeout  = null;
  let comparisons  = 0;
  let swaps        = 0;
  let totalSteps   = 0;
  let currentStep  = 0;
  let soundEnabled = true;

  let allSteps  = [];
  let snapshots = [];
  let stepMode = false;

  // ═══════════════════════════════════════════
  //  CODE SNIPPETS
  // ═══════════════════════════════════════════
  const codeSnippets = {
    insertion: [
      'for (i = 1; i < n; i++) {',
      '  key = arr[i];',
      '  j = i - 1;',
      '  while (j >= 0 && arr[j] > key) {',
      '    arr[j+1] = arr[j];',
      '    j--;',
      '  }',
      '  arr[j+1] = key;',
      '}'
    ],
    quick: [
      'pivot = arr[high];',
      'i = low - 1;',
      'for (j = low; j < high; j++) {',
      '  if (arr[j] <= pivot) {',
      '    i++; swap(arr[i], arr[j]);',
      '  }',
      '}',
      'swap(arr[i+1], arr[high]);',
      'return i + 1;'
    ],
    merge: [
      'split into L and R;',
      'mergeSort(L); mergeSort(R);',
      'i = 0; j = 0; k = left;',
      'while (i<L.len && j<R.len) {',
      '  if (L[i] <= R[j]) arr[k]=L[i++];',
      '  else arr[k] = R[j++];',
      '  k++;',
      '}',
      'copy remaining elements;'
    ]
  };

  // ═══════════════════════════════════════════
  //  DOM REFS
  // ═══════════════════════════════════════════
  const container   = document.getElementById('bar-container');
  const algoSelect  = document.getElementById('algoSelect');
  const sizeSlider  = document.getElementById('sizeSlider');
  const speedSlider = document.getElementById('speedSlider');
  const sizeVal     = document.getElementById('sizeVal');
  const speedVal    = document.getElementById('speedVal');
  const customInput = document.getElementById('customInput');
  const btnLoad     = document.getElementById('btnLoad');
  const btnGen      = document.getElementById('btnGen');
  const btnPause    = document.getElementById('btnPause');
  const btnStepBack = document.getElementById('btnStepBack');
  const btnStepFwd  = document.getElementById('btnStepFwd');
  const btnStart    = document.getElementById('btnStart');
  const btnReset    = document.getElementById('btnReset');
  const btnTheme    = document.getElementById('btnTheme');
  const btnSound    = document.getElementById('btnSound');
  const statComp    = document.getElementById('statComp');
  const statSwap    = document.getElementById('statSwap');
  const statSize    = document.getElementById('statSize');
  const statStep    = document.getElementById('statStep');
  const statStatus  = document.getElementById('statStatus');
  const stepProgress = document.getElementById('stepProgress');
  const barTooltip  = document.getElementById('barTooltip');
  const themeIcon   = document.getElementById('themeIcon');
  const codeDisplay = document.getElementById('code-display');

  // ═══════════════════════════════════════════
  //  SOUND ENGINE
  // ═══════════════════════════════════════════
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  function playTone(freq, type = 'sine', duration = 0.08, volume = 0.1) {
    if (!soundEnabled) return;
    try {
      const osc  = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, audioCtx.currentTime + duration);
      gain.gain.setValueAtTime(volume, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + duration);
    } catch(e) {}
  }

  function soundCompare(val) { playTone(200 + val * 3, 'sine',     0.07, 0.08); }
  function soundSwap(val)    { playTone(300 + val * 4, 'triangle', 0.09, 0.12); }
  function playSortedFanfare(bars) {
    if (!soundEnabled) return;
    bars.forEach((_, i) => setTimeout(() => playTone(200 + i * 16, 'sine', 0.1, 0.08), i * 16));
  }

  // ═══════════════════════════════════════════
  //  THEME / SOUND TOGGLES
  // ═══════════════════════════════════════════
  let isDark = true;
  btnTheme.addEventListener('click', () => {
    isDark = !isDark;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    themeIcon.textContent = isDark ? '☀️' : '🌙';
  });

  btnSound.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    soundEnabled = !soundEnabled;
    btnSound.textContent = soundEnabled ? '🔊 ON' : '🔇 OFF';
    btnSound.classList.toggle('on',  soundEnabled);
    btnSound.classList.toggle('off', !soundEnabled);
  });

  // ═══════════════════════════════════════════
  //  TOOLTIP
  // ═══════════════════════════════════════════
  container.addEventListener('mousemove', (e) => {
    const bar = e.target.closest('.bar');
    if (!bar) { barTooltip.classList.remove('visible'); return; }
    const val = bar.dataset.value;
    if (!val) return;
    barTooltip.textContent = `Value: ${val}`;
    barTooltip.classList.add('visible');
    barTooltip.style.left = (e.clientX + 14) + 'px';
    barTooltip.style.top  = (e.clientY - 28) + 'px';
  });
  container.addEventListener('mouseleave', () => barTooltip.classList.remove('visible'));

  // ═══════════════════════════════════════════
  //  CODE TRACER
  // ═══════════════════════════════════════════
  function updateTracerUI(algo) {
    codeDisplay.innerHTML = '';
    codeSnippets[algo].forEach((line, i) => {
      const div = document.createElement('div');
      div.id = `line-${i + 1}`;
      div.textContent = line;
      codeDisplay.appendChild(div);
    });
  }

  function highlightCodeLine(lineNum) {
    document.querySelectorAll('#code-display div').forEach(el => el.classList.remove('code-line-active'));
    const el = document.getElementById(`line-${lineNum}`);
    if (el) el.classList.add('code-line-active');
  }

  function clearCodeHighlight() {
    document.querySelectorAll('#code-display div').forEach(el => el.classList.remove('code-line-active'));
  }

  // ═══════════════════════════════════════════
  //  HELPERS
  // ═══════════════════════════════════════════
  function getDelay() {
    return Math.max(10, 310 - parseInt(speedSlider.value) * 30);
  }

  function generateArray() {
    if (isSorting) return;
    const n = parseInt(sizeSlider.value);
    array = Array.from({length: n}, () => Math.floor(Math.random() * 88) + 8);
    renderBars(array);
    resetStats();
    highlightRow(algoSelect.value);
  }

  function renderBars(arr) {
    container.innerHTML = '';
    const max = Math.max(...arr);
    arr.forEach((val) => {
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.height = ((val / max) * 90) + '%';
      bar.dataset.value = val;
      if (arr.length <= 30) bar.textContent = val;
      container.appendChild(bar);
    });
  }

  function resetStats() {
    comparisons = 0; swaps = 0; currentStep = 0; totalSteps = 0;
    allSteps = []; snapshots = []; stepMode = false;
    statComp.textContent   = '0';
    statSwap.textContent   = '0';
    statSize.textContent   = array.length;
    statStep.textContent   = '0 / 0';
    statStatus.textContent = 'READY';
    statStatus.style.color = 'var(--text-dim)';
    stepProgress.style.width = '0%';
    btnStepBack.disabled = true;
    btnStepFwd.disabled  = true;
  }

  function highlightRow(algo) {
    ['insertion','quick','merge'].forEach(a =>
      document.getElementById('row-' + a).classList.remove('active-row')
    );
    document.getElementById('row-' + algo).classList.add('active-row');
  }

  function updateStepUI(i, total) {
    statStep.textContent = `${i} / ${total}`;
    stepProgress.style.width = total > 0 ? (i / total * 100) + '%' : '0%';
  }

  function updateStepBtns() {
    btnStepBack.disabled = currentStep <= 0;
    btnStepFwd.disabled  = currentStep >= totalSteps;
  }

  // ═══════════════════════════════════════════
  //  SNAPSHOT ENGINE
  // ═══════════════════════════════════════════
  function captureSnapshot() {
    const bars = [...container.querySelectorAll('.bar')];
    return {
      heights:    bars.map(b => b.style.height),
      values:     bars.map(b => b.dataset.value),
      texts:      bars.map(b => b.textContent),
      classes:    bars.map(b => {
        for (const c of ['sorted','comparing','swapping','pivot'])
          if (b.classList.contains(c)) return c;
        return '';
      }),
      comparisons,
      swaps
    };
  }

  function applySnapshot(snap) {
    const bars = [...container.querySelectorAll('.bar')];
    bars.forEach((bar, i) => {
      bar.style.height  = snap.heights[i];
      bar.dataset.value = snap.values[i];
      bar.textContent   = snap.texts[i];
      bar.className     = 'bar' + (snap.classes[i] ? ' ' + snap.classes[i] : '');
    });
    comparisons          = snap.comparisons;
    swaps                = snap.swaps;
    statComp.textContent = comparisons;
    statSwap.textContent = swaps;
  }

  // ═══════════════════════════════════════════
  //  APPLY ONE STEP
  //
  //  Every Quick Sort step carries an optional `pivotIdx` field.
  //  After applying any step, if pivotIdx is set, we re-stamp
  //  that bar as 'pivot' (yellow) — UNLESS it just became 'sorted'.
  //  This keeps the pivot yellow throughout the entire partition,
  //  even while compare/swap steps are painting other bars.
  // ═══════════════════════════════════════════
  function applyStep(s, silent) {
    const bars = [...container.querySelectorAll('.bar')];

    // Clear transient highlights — but PRESERVE 'sorted' and existing 'pivot'
    bars.forEach(b => b.classList.remove('comparing', 'swapping'));
    // Only clear pivot if this step is NOT a pivot-set step and NOT carrying a pivotIdx
    if (s.type !== 'pivot') {
      bars.forEach(b => b.classList.remove('pivot'));
    }

    if (s.line) highlightCodeLine(s.line);

    if (s.type === 'compare') {
      if (!silent) { comparisons++; statComp.textContent = comparisons; }
      s.indices?.forEach(idx => {
        if (bars[idx] && !bars[idx].classList.contains('sorted')) {
          bars[idx].classList.add('comparing');
          if (!silent) soundCompare(parseInt(bars[idx].dataset.value) || 50);
        }
      });
    }
    else if (s.type === 'swap') {
      if (!silent) { swaps++; statSwap.textContent = swaps; }
      const [a, b] = s.indices;
      if (bars[a] && bars[b]) {
        // Mark both as swapping (red)
        bars[a].classList.add('swapping');
        bars[b].classList.add('swapping');
        if (!silent) soundSwap(parseInt(bars[a].dataset.value) || 50);
        // Swap heights, texts, values
        const tmpH = bars[a].style.height;  bars[a].style.height  = bars[b].style.height;  bars[b].style.height  = tmpH;
        const tmpT = bars[a].textContent;   bars[a].textContent   = bars[b].textContent;   bars[b].textContent   = tmpT;
        const tmpV = bars[a].dataset.value; bars[a].dataset.value = bars[b].dataset.value; bars[b].dataset.value = tmpV;
      }
    }
    else if (s.type === 'overwrite') {
      const { idx, val } = s;
      const maxV = Math.max(...array);
      if (bars[idx]) {
        bars[idx].classList.add('swapping');
        bars[idx].style.height  = ((val / maxV) * 90) + '%';
        bars[idx].dataset.value = val;
        if (array.length <= 30) bars[idx].textContent = val;
        if (!silent) soundSwap(val);
      }
    }
    else if (s.type === 'pivot') {
      // Fresh pivot declaration — clear old pivots first, then set new one
      bars.forEach(b => b.classList.remove('pivot'));
      if (bars[s.idx]) bars[s.idx].classList.add('pivot');
    }
    else if (s.type === 'sorted') {
      s.indices?.forEach(idx => {
        if (bars[idx]) bars[idx].className = 'bar sorted';
      });
    }
    else if (s.type === 'merge_active') {
      s.indices?.forEach(idx => {
        if (bars[idx] && !bars[idx].classList.contains('sorted'))
          bars[idx].classList.add('comparing');
      });
    }

    // ── RE-STAMP PIVOT ──
    // If this step happens inside a partition (pivotIdx is set),
    // make sure the pivot bar stays yellow — unless it just became sorted.
    if (s.pivotIdx !== undefined) {
      const pb = bars[s.pivotIdx];
      if (pb && !pb.classList.contains('sorted')) {
        pb.classList.remove('comparing', 'swapping');
        pb.classList.add('pivot');
      }
    }
  }

  // ═══════════════════════════════════════════
  //  FINISH SORT
  // ═══════════════════════════════════════════
  function finishSort() {
    [...container.querySelectorAll('.bar')].forEach(b => {
      b.classList.remove('comparing','swapping','pivot');
      b.classList.add('sorted');
    });
    if (!snapshots[totalSteps]) snapshots[totalSteps] = captureSnapshot();
    playSortedFanfare([...container.querySelectorAll('.bar')]);
    clearCodeHighlight();
    isSorting = false;
    stepMode  = false;
    btnStart.disabled  = false;
    btnPause.textContent = '⏸ Pause';
    btnPause.classList.remove('resumed');
    statStatus.textContent = 'SORTED ✓';
    statStatus.style.color = 'var(--accent)';
    currentStep = totalSteps;
    updateStepUI(totalSteps, totalSteps);
    updateStepBtns();
  }

  // ═══════════════════════════════════════════
  //  ANIMATION TICK
  // ═══════════════════════════════════════════
  function scheduleTick() {
    animTimeout = setTimeout(tick, getDelay());
  }

  function tick() {
    if (stepMode) return;
    if (!isSorting) return;
    if (isPaused) { animTimeout = setTimeout(tick, 80); return; }
    if (currentStep >= allSteps.length) { finishSort(); return; }

    if (!snapshots[currentStep]) snapshots[currentStep] = captureSnapshot();

    applyStep(allSteps[currentStep], false);
    currentStep++;

    snapshots[currentStep] = captureSnapshot();

    updateStepUI(currentStep, totalSteps);
    updateStepBtns();

    scheduleTick();
  }

  // ═══════════════════════════════════════════
  //  PLAY ANIMATIONS
  // ═══════════════════════════════════════════
  function playAnimations(steps) {
    allSteps    = steps;
    totalSteps  = steps.length;
    currentStep = 0;
    snapshots   = new Array(steps.length + 1);
    stepMode    = false;

    snapshots[0] = captureSnapshot();

    scheduleTick();
  }

  // ═══════════════════════════════════════════
  //  PAUSE BUTTON
  // ═══════════════════════════════════════════
  btnPause.addEventListener('click', () => {
    if (!isSorting) return;

    if (isPaused) {
      isPaused = false;
      stepMode = false;
      btnPause.textContent = '⏸ Pause';
      btnPause.classList.remove('resumed');
      statStatus.textContent = 'SORTING...';
      statStatus.style.color = 'var(--compare)';
      if (animTimeout) clearTimeout(animTimeout);
      scheduleTick();
    } else {
      isPaused = true;
      if (animTimeout) clearTimeout(animTimeout);
      btnPause.textContent = '▶ Resume';
      btnPause.classList.add('resumed');
      statStatus.textContent = 'PAUSED';
      statStatus.style.color = 'var(--accent3)';
    }
  });

  // ═══════════════════════════════════════════
  //  STEP BACK
  // ═══════════════════════════════════════════
  btnStepBack.addEventListener('click', () => {
    if (allSteps.length === 0 || currentStep <= 0) return;

    if (animTimeout) { clearTimeout(animTimeout); animTimeout = null; }
    isPaused = true;
    stepMode = true;
    btnPause.textContent = '▶ Resume';
    btnPause.classList.add('resumed');

    currentStep--;

    const snap = snapshots[currentStep];
    if (snap) applySnapshot(snap);

    const s = allSteps[currentStep];
    if (s && s.line) highlightCodeLine(s.line);
    else clearCodeHighlight();

    statStatus.textContent = 'PAUSED';
    statStatus.style.color = 'var(--accent3)';

    if (!isSorting && currentStep < totalSteps) {
      isSorting = true;
      btnStart.disabled = true;
    }

    updateStepUI(currentStep, totalSteps);
    updateStepBtns();
  });

  // ═══════════════════════════════════════════
  //  STEP FORWARD
  // ═══════════════════════════════════════════
  btnStepFwd.addEventListener('click', () => {
    if (allSteps.length === 0 || currentStep >= totalSteps) return;

    if (animTimeout) { clearTimeout(animTimeout); animTimeout = null; }
    isPaused = true;
    stepMode = true;
    btnPause.textContent = '▶ Resume';
    btnPause.classList.add('resumed');

    if (snapshots[currentStep]) applySnapshot(snapshots[currentStep]);

    applyStep(allSteps[currentStep], false);
    currentStep++;

    if (!snapshots[currentStep]) snapshots[currentStep] = captureSnapshot();

    const s = allSteps[currentStep - 1];
    if (s && s.line) highlightCodeLine(s.line);

    if (currentStep >= totalSteps) {
      finishSort();
      return;
    }

    statStatus.textContent = 'PAUSED';
    statStatus.style.color = 'var(--accent3)';
    isSorting = true;
    btnStart.disabled = true;

    updateStepUI(currentStep, totalSteps);
    updateStepBtns();
  });

  // ═══════════════════════════════════════════
  //  SORTING ALGORITHMS
  // ═══════════════════════════════════════════
  function insertionSortSteps(arr) {
    const a = [...arr], steps = [];
    const maxVal = Math.max(...arr);
    for (let i = 1; i < a.length; i++) {
      steps.push({ type: 'compare', indices: [i], line: 1 });
      let key = a[i];
      let j = i - 1;
      steps.push({ type: 'compare', indices: [j < 0 ? 0 : j], line: 3 });
      while (j >= 0 && a[j] > key) {
        steps.push({ type: 'compare', indices: [j, j+1], line: 4 });
        a[j+1] = a[j];
        steps.push({ type: 'overwrite', idx: j+1, val: a[j+1], maxVal, line: 5 });
        j--;
        steps.push({ type: 'compare', indices: [j < 0 ? 0 : j], line: 6 });
      }
      a[j+1] = key;
      steps.push({ type: 'overwrite', idx: j+1, val: key, maxVal, line: 8 });
      steps.push({ type: 'sorted', indices: Array.from({length: i+1}, (_, k) => k) });
    }
    steps.push({ type: 'sorted', indices: a.map((_, k) => k) });
    return steps;
  }

  // ═══════════════════════════════════════════
  //  QUICK SORT — FIXED COLORING
  //
  //  Every step inside a partition carries `pivotIdx: high` so
  //  applyStep() re-stamps the pivot bar yellow after painting
  //  compare/swap colours. Colour meaning:
  //
  //    🟡 Yellow  = current pivot (arr[high]) — stays yellow until placed
  //    🟠 Orange  = j pointer scanning (compared with pivot boundary i)
  //    🔴 Red     = i and j being swapped (both flash red simultaneously)
  //    🔴 Red     = final pivot placement swap
  //    🩵 Cyan    = element placed in final sorted position
  // ═══════════════════════════════════════════
  function quickSortSteps(arr) {
    const a = [...arr], steps = [];

    // push a step that carries the active pivot index
    function push(step, pivotIdx) {
      steps.push(pivotIdx !== undefined ? { ...step, pivotIdx } : step);
    }

    function partition(low, high) {
      // Declare pivot (yellow)
      push({ type: 'pivot', idx: high, line: 1 });

      const pivot = a[high];
      let i = low - 1;

      // Show starting state — pivot highlighted, i boundary shown
      push({ type: 'compare', indices: [high], line: 2 }, high);

      for (let j = low; j < high; j++) {
        // Show j scanning + i boundary (so user sees both pointers)
        const iShow = i < low ? low : i;
        push({ type: 'compare', indices: [j, iShow], line: 4 }, high);

        if (a[j] <= pivot) {
          i++;
          if (i !== j) {
            // Both i and j flash red; pivot stays yellow via pivotIdx
            push({ type: 'swap', indices: [i, j], line: 5 }, high);
            [a[i], a[j]] = [a[j], a[i]];
          }
          // Show updated i boundary
          push({ type: 'compare', indices: [i], line: 5 }, high);
        }
      }

      // Final pivot placement swap
      if (i + 1 !== high) {
        push({ type: 'compare', indices: [i + 1, high], line: 8 }, high);
        push({ type: 'swap', indices: [i + 1, high], line: 8 }, high);
        [a[i + 1], a[high]] = [a[high], a[i + 1]];
      }

      // Pivot is now in final sorted position
      push({ type: 'sorted', indices: [i + 1] });
      return i + 1;
    }

    function qs(low, high) {
      if (low < high) {
        const pi = partition(low, high);
        qs(low, pi - 1);
        qs(pi + 1, high);
      } else if (low === high) {
        push({ type: 'sorted', indices: [low] });
      }
    }

    qs(0, a.length - 1);
    return steps;
  }

  // ═══════════════════════════════════════════
  //  MERGE SORT — FIXED COLORING
  //
  //  The core problem with the old version:
  //  It emitted { type: 'sorted' } after every sub-merge, even though
  //  those elements would be touched again in parent merges.
  //  Example: merging [19,41] marks them cyan, but the next merge
  //  of [9,19,41,52] overwrites them — they were never "done".
  //
  //  Fix:
  //  - NEVER emit 'sorted' during sub-merges.
  //  - During each merge, highlight the ACTIVE RANGE being merged
  //    with 'merge_active' (orange tint) so the user sees what's happening.
  //  - When an element is written via overwrite, it flashes red (swapping).
  //  - Only emit 'sorted' for the ENTIRE array at the very end,
  //    which is then replaced by finishSort()'s full-array cyan sweep.
  //
  //  This means colours now mean exactly:
  //    Blue    = untouched / default
  //    Orange  = being compared / active merge window
  //    Red     = being written (overwrite in progress)
  //    Cyan    = truly in final sorted position (only at the end)
  // ═══════════════════════════════════════════
  function mergeSortSteps(arr) {
    const a = [...arr];
    const steps = [];
    const maxVal = Math.max(...arr);
    const n = arr.length;

    function merge(left, mid, right) {
      // Show the entire sub-range being merged as "comparing" (orange)
      const rangeIndices = Array.from({ length: right - left + 1 }, (_, x) => left + x);
      steps.push({ type: 'merge_active', indices: rangeIndices, line: 1 });

      const L = a.slice(left, mid + 1);
      const R = a.slice(mid + 1, right + 1);

      let i = 0, j = 0, k = left;

      steps.push({ type: 'compare', indices: [left, right], line: 3 });

      while (i < L.length && j < R.length) {
        // Compare the two current candidates
        steps.push({ type: 'compare', indices: [left + i, mid + 1 + j], line: 4 });

        if (L[i] <= R[j]) {
          a[k] = L[i++];
          // Write chosen element — red flash
          steps.push({ type: 'overwrite', idx: k, val: a[k], maxVal, line: 5 });
        } else {
          a[k] = R[j++];
          steps.push({ type: 'overwrite', idx: k, val: a[k], maxVal, line: 6 });
        }
        k++;
      }

      // Copy remaining left elements
      while (i < L.length) {
        a[k] = L[i++];
        steps.push({ type: 'overwrite', idx: k, val: a[k], maxVal, line: 9 });
        k++;
      }

      // Copy remaining right elements
      while (j < R.length) {
        a[k] = R[j++];
        steps.push({ type: 'overwrite', idx: k, val: a[k], maxVal, line: 9 });
        k++;
      }

      // ── KEY FIX ──
      // Only mark as sorted when the ENTIRE array has been merged (top-level call).
      // Sub-range merges do NOT emit 'sorted' — those bars will be touched again.
      if (left === 0 && right === n - 1) {
        steps.push({ type: 'sorted', indices: Array.from({ length: n }, (_, x) => x) });
      }
      // For sub-ranges: leave bars as default (blue) so the next merge
      // correctly shows them as unsorted until they reach their final position.
    }

    function ms(left, right) {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        // Show the split visually — highlight left half and right half
        steps.push({ type: 'compare', indices: [left, right], line: 1 });
        ms(left, mid);
        ms(mid + 1, right);
        merge(left, mid, right);
      }
      // single element — already "in place" within its sub-problem,
      // but NOT marked sorted yet since it will be merged upward
    }

    ms(0, a.length - 1);
    return steps;
  }

  // ═══════════════════════════════════════════
  //  EVENT LISTENERS
  // ═══════════════════════════════════════════
  sizeSlider.addEventListener('input', () => {
    sizeVal.textContent = sizeSlider.value;
    if (!isSorting) generateArray();
  });

  speedSlider.addEventListener('input', () => {
    speedVal.textContent = speedSlider.value;
  });

  algoSelect.addEventListener('change', () => {
    updateTracerUI(algoSelect.value);
    highlightRow(algoSelect.value);
    if (!isSorting) generateArray();
  });

  btnGen.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    generateArray();
  });

  btnReset.addEventListener('click', () => {
    if (animTimeout) clearTimeout(animTimeout);
    isSorting = false;
    stepMode  = false;
    isPaused  = false;
    allSteps  = []; snapshots = [];
    btnPause.textContent = '⏸ Pause';
    btnPause.classList.remove('resumed');
    btnStart.disabled = false;
    clearCodeHighlight();
    generateArray();
  });

  btnStart.addEventListener('click', () => {
    if (isSorting) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    isSorting = true;
    stepMode  = false;
    isPaused  = false;
    btnStart.disabled = true;
    btnPause.textContent = '⏸ Pause';
    btnPause.classList.remove('resumed');
    statStatus.textContent = 'SORTING...';
    statStatus.style.color = 'var(--compare)';
    comparisons = 0; swaps = 0;
    statComp.textContent = '0';
    statSwap.textContent = '0';

    const algo = algoSelect.value;
    let steps = [];
    if      (algo === 'insertion') steps = insertionSortSteps(array);
    else if (algo === 'quick')     steps = quickSortSteps(array);
    else if (algo === 'merge')     steps = mergeSortSteps(array);

    playAnimations(steps);
  });

  btnLoad.addEventListener('click', () => {
    if (isSorting) {
      if (animTimeout) clearTimeout(animTimeout);
      isSorting = false;
      stepMode  = false;
      isPaused  = false;
      btnPause.textContent = '⏸ Pause';
      btnPause.classList.remove('resumed');
      btnStart.disabled = false;
    }
    const parsed = customInput.value
      .split(/[\s,]+/)
      .map(v => parseInt(v.trim(), 10))
      .filter(v => !isNaN(v) && v > 0);

    if (parsed.length === 0) { alert('Enter some numbers! e.g. 10 45 2 80'); return; }
    if (parsed.length > 40)  { alert('Max 40 numbers for best display.'); return; }

    array = parsed;
    renderBars(array);
    resetStats();
    sizeSlider.value    = array.length;
    sizeVal.textContent = array.length;
  });

  // ═══════════════════════════════════════════
  //  INIT
  // ═══════════════════════════════════════════
  updateTracerUI('insertion');
  highlightRow('insertion');
  generateArray();