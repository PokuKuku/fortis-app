const state = {
  bootstrap: null,
  sizePreset: 'portrait',
  concept: null,
  batchItems: [],
  selectedBatchIndex: null,
};

const canvasPresets = {
  portrait: { width: 1080, height: 1350, previewAspect: 1080 / 1350 },
  square: { width: 1080, height: 1080, previewAspect: 1 },
};

const TOP_SECTION_RATIO = 0.22;
const fontStacks = {
  impact: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
  arial_black: '"Arial Black", Arial, sans-serif',
  trebuchet: '"Trebuchet MS", "Segoe UI", sans-serif',
  verdana: 'Verdana, Geneva, sans-serif',
  georgia: 'Georgia, "Times New Roman", serif',
  times: '"Times New Roman", Times, serif',
};

const elements = {
  canvasSize: document.querySelector('#canvas-size'),
  layoutSelect: document.querySelector('#layout-select'),
  headlineInput: document.querySelector('#headline-input'),
  subtitleInput: document.querySelector('#subtitle-input'),
  headlineSizeInput: document.querySelector('#headline-size-input'),
  subtitleSizeInput: document.querySelector('#subtitle-size-input'),
  labelAInput: document.querySelector('#label-a-input'),
  labelBInput: document.querySelector('#label-b-input'),
  labelSizeInput: document.querySelector('#label-size-input'),
  labelBWrapper: document.querySelector('#label-b-wrapper'),
  genderASelect: document.querySelector('#gender-a-select'),
  genderBSelect: document.querySelector('#gender-b-select'),
  poseASelect: document.querySelector('#pose-a-select'),
  poseBSelect: document.querySelector('#pose-b-select'),
  genderBWrapper: document.querySelector('#gender-b-wrapper'),
  poseBWrapper: document.querySelector('#pose-b-wrapper'),
  bodyAContainer: document.querySelector('#body-a-muscles'),
  bodyBContainer: document.querySelector('#body-b-muscles'),
  bodyBSection: document.querySelector('#body-b-section'),
  previewImage: document.querySelector('#preview-image'),
  resetButton: document.querySelector('#reset-button'),
  downloadButton: document.querySelector('#download-button'),
  batchJsonInput: document.querySelector('#batch-json-input'),
  loadBatchButton: document.querySelector('#load-batch-button'),
  clearBatchButton: document.querySelector('#clear-batch-button'),
  downloadBatchButton: document.querySelector('#download-batch-button'),
  batchSummary: document.querySelector('#batch-summary'),
  batchGrid: document.querySelector('#batch-grid'),
  generatorBriefInput: document.querySelector('#generator-brief-input'),
  generatorAudienceInput: document.querySelector('#generator-audience-input'),
  generatorToneInput: document.querySelector('#generator-tone-input'),
  generatorAvoidInput: document.querySelector('#generator-avoid-input'),
  generatorGuidanceInput: document.querySelector('#generator-guidance-input'),
  generatorLayoutSelect: document.querySelector('#generator-layout-select'),
  generatorCountInput: document.querySelector('#generator-count-input'),
  generatorHeadlineSizeInput: document.querySelector('#generator-headline-size-input'),
  generatorSubtitleSizeInput: document.querySelector('#generator-subtitle-size-input'),
  generatorLabelSizeInput: document.querySelector('#generator-label-size-input'),
  generateConceptsButton: document.querySelector('#generate-concepts-button'),
  status: document.querySelector('#status'),
  muscleRowTemplate: document.querySelector('#muscle-row-template'),
};

function setStatus(message, tone = 'idle') {
  elements.status.textContent = message;
  elements.status.className = `status ${tone}`;
}

function titleizeMuscleKey(key) {
  return key
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function buildDefaultMuscleLevels(defaultTier = 1) {
  return Object.fromEntries(state.bootstrap.muscleKeys.map((key) => [key, defaultTier]));
}

function createBaseConcept(useSampleCopy = false, defaultTier = 1) {
  return {
    title: useSampleCopy ? 'Skipped leg day? Tell me more.' : '',
    subtitle: useSampleCopy ? 'Top-heavy since 18' : '',
    rationale: '',
    layout: 'single_body',
    labelA: '',
    labelB: '',
    typography: {
      headlineFont: 'impact',
      subtitleFont: 'impact',
      labelFont: 'impact',
      headlineSize: 50,
      subtitleSize: 36,
      labelSize: 26,
    },
    bodyA: {
      gender: 'male',
      pose: 'front',
      muscleLevels: buildDefaultMuscleLevels(defaultTier),
    },
    bodyB: {
      gender: 'male',
      pose: 'front',
      muscleLevels: buildDefaultMuscleLevels(defaultTier),
    },
  };
}

function createDefaultConcept() {
  return createBaseConcept(true, 1);
}

async function fetchBootstrap() {
  const response = await fetch('/api/bootstrap');
  if (!response.ok) {
    throw new Error('Could not load the Fortify heatmap assets.');
  }

  state.bootstrap = await response.json();
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function wrapText(text, maxCharsPerLine = 24) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxCharsPerLine || !current) {
      current = next;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 4);
}

function getFontFamily(key) {
  return fontStacks[key] || fontStacks.trebuchet;
}

function clampNumber(value, min, max, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function coerceLayout(value) {
  return value === 'dual_body' ? 'dual_body' : 'single_body';
}

function coercePose(value, fallback = 'front') {
  return value === 'back' ? 'back' : fallback;
}

function coerceGender(value, fallback = 'male') {
  return value === 'female' ? 'female' : fallback;
}

function coerceSizePreset(value) {
  return value === 'square' ? 'square' : 'portrait';
}

function slugifyFilename(value, index) {
  const cleaned = String(value || '')
    .replace(/\.(png|jpg|jpeg|webp)$/i, '')
    .trim();

  const slug = cleaned
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  return slug || `fortify-meme-${String(index + 1).padStart(2, '0')}`;
}

function normalizeMuscleLevels(muscleLevels = {}, defaults = buildDefaultMuscleLevels(6)) {
  const source = muscleLevels && typeof muscleLevels === 'object' ? muscleLevels : {};
  const normalized = {};

  state.bootstrap.muscleKeys.forEach((key) => {
    normalized[key] = clampNumber(source[key], 1, 6, defaults[key] ?? 1);
  });

  return normalized;
}

function normalizeBody(bodyInput = {}, fallbackBody) {
  const input = bodyInput && typeof bodyInput === 'object' ? bodyInput : {};
  const muscleLevels = input.muscleLevels ?? input.tiers ?? input.muscles ?? {};

  return {
    gender: coerceGender(input.gender, fallbackBody.gender),
    pose: coercePose(input.pose, fallbackBody.pose),
    muscleLevels: normalizeMuscleLevels(muscleLevels, fallbackBody.muscleLevels),
  };
}

function normalizeTypography(typographyInput = {}, fallbackTypography) {
  const input = typographyInput && typeof typographyInput === 'object' ? typographyInput : {};

  return {
    headlineFont: 'impact',
    subtitleFont: 'impact',
    labelFont: 'impact',
    headlineSize: clampNumber(
      input.headlineSize ?? input.titleSize,
      24,
      96,
      fallbackTypography.headlineSize
    ),
    subtitleSize: clampNumber(
      input.subtitleSize ?? input.subheadlineSize,
      18,
      72,
      fallbackTypography.subtitleSize
    ),
    labelSize: clampNumber(input.labelSize, 16, 56, fallbackTypography.labelSize),
  };
}

function mergeBatchDefaults(defaults = {}, meme = {}) {
  const merged = {
    ...defaults,
    ...meme,
    typography: {
      ...(defaults.typography || {}),
      ...(meme.typography || {}),
    },
  };

  if (defaults.bodyA || meme.bodyA) {
    merged.bodyA = {
      ...(defaults.bodyA || {}),
      ...(meme.bodyA || {}),
      muscleLevels: {
        ...((defaults.bodyA && defaults.bodyA.muscleLevels) || {}),
        ...((meme.bodyA && meme.bodyA.muscleLevels) || {}),
      },
    };
  }

  if (defaults.bodyB || meme.bodyB) {
    merged.bodyB = {
      ...(defaults.bodyB || {}),
      ...(meme.bodyB || {}),
      muscleLevels: {
        ...((defaults.bodyB && defaults.bodyB.muscleLevels) || {}),
        ...((meme.bodyB && meme.bodyB.muscleLevels) || {}),
      },
    };
  }

  return merged;
}

function resolveMuscleLevelInput(...candidates) {
  for (const candidate of candidates) {
    if (candidate && typeof candidate === 'object' && Object.keys(candidate).length > 0) {
      return candidate;
    }
  }

  return {};
}

function normalizeConcept(input = {}, index = 0) {
  const source = input && typeof input === 'object' ? input : {};
  const concept = createBaseConcept(false, 6);
  const layout = coerceLayout(source.layout);
  const bodyAInput = source.bodyA ?? source.left ?? {};
  const bodyBInput = source.bodyB ?? source.right ?? {};

  concept.layout = layout;
  concept.title = String(source.title ?? source.headline ?? concept.title);
  concept.subtitle = String(source.subtitle ?? source.subheadline ?? concept.subtitle);
  concept.rationale = String(source.rationale ?? '');
  concept.labelA = String(source.labelA ?? source.leftLabel ?? source.bodyALabel ?? '');
  concept.labelB = String(source.labelB ?? source.rightLabel ?? source.bodyBLabel ?? '');
  concept.typography = normalizeTypography(source.typography, concept.typography);
  concept.bodyA = normalizeBody(
    {
      ...bodyAInput,
      gender: source.genderA ?? bodyAInput.gender,
      pose: source.poseA ?? bodyAInput.pose,
      muscleLevels: resolveMuscleLevelInput(
        bodyAInput.muscleLevels,
        bodyAInput.tiers,
        bodyAInput.muscles,
        source.bodyATiers
      ),
    },
    concept.bodyA
  );
  concept.bodyB = normalizeBody(
    {
      ...bodyBInput,
      gender: source.genderB ?? bodyBInput.gender,
      pose: source.poseB ?? bodyBInput.pose,
      muscleLevels: resolveMuscleLevelInput(
        bodyBInput.muscleLevels,
        bodyBInput.tiers,
        bodyBInput.muscles,
        source.bodyBTiers
      ),
    },
    concept.bodyB
  );

  return {
    concept,
    sizePreset: coerceSizePreset(source.canvas ?? source.sizePreset ?? source.size),
    filename: slugifyFilename(source.filename ?? source.slug ?? source.title ?? source.headline, index),
  };
}

function getEffectiveBodyScale(body, baseScale) {
  if (body.gender === 'male') return baseScale * 1.18;
  if (body.gender === 'female') return baseScale * 1.18;
  return baseScale;
}

function getDualBodyScale(body, baseScale) {
  if (body.gender === 'male') return baseScale * 1.18;
  if (body.gender === 'female') return baseScale * 1.0;
  return baseScale;
}

function getSingleBodyScale(body, baseScale) {
  return body.gender === 'female' ? baseScale * 0.96 : getEffectiveBodyScale(body, baseScale);
}

function getSingleBodyVisualYOffset(body) {
  return body.gender === 'female' ? 58 : 0;
}

function getSingleBodyVisualXOffset(body) {
  return body.gender === 'female' ? 22 : 0;
}

function getDualBodyVisualYOffset(body) {
  return 0;
}

function renderBodySvg(body, x, y, scale, label = '', labelFont = 'impact', labelSize = 26) {
  const { bodyAssets, heatmapRegions, tierColors } = state.bootstrap;
  const sourceKey = `${body.gender}${body.pose === 'front' ? 'Front' : 'Back'}`;
  const source = bodyAssets[sourceKey];
  const slugLevels = {};

  Object.entries(body.muscleLevels || {}).forEach(([muscleKey, level]) => {
    const regions = heatmapRegions[muscleKey] || [];
    regions.forEach((region) => {
      if (region.side && region.side !== 'both' && region.side !== body.pose) {
        return;
      }
      const nextLevel = clampNumber(level, 1, 6, 6);
      slugLevels[region.slug] = slugLevels[region.slug]
        ? Math.min(slugLevels[region.slug], nextLevel)
        : nextLevel;
    });
  });

  const viewBox = body.pose === 'front' ? '0 0 724 1448' : '724 0 724 1448';
  const paths = source.map((part) => {
    const fill = tierColors[slugLevels[part.slug] || 6] || tierColors[6];
    const allPaths = [
      ...(part.path?.common || []),
      ...(part.path?.left || []),
      ...(part.path?.right || []),
    ];
    return allPaths.map((d, index) => `<path d="${d}" fill="${fill}" data-slug="${part.slug}-${index}" />`).join('');
  }).join('');

  const labelMarkup = label
    ? `<text x="${x + (200 * scale) / 2}" y="${y - 24}" text-anchor="middle" fill="#f6f6f7" font-size="${labelSize}" font-weight="700" font-family="${escapeHtml(getFontFamily(labelFont))}">${escapeHtml(label)}</text>`
    : '';

  return `
    ${labelMarkup}
    <g transform="translate(${x}, ${y}) scale(${scale})">
      <svg width="200" height="400" viewBox="${viewBox}" overflow="visible">
        ${paths}
      </svg>
    </g>
  `;
}

function getTopSectionHeight(height) {
  return Math.round(height * TOP_SECTION_RATIO);
}

function renderTopText(concept, width, topSectionHeight) {
  const titleLines = wrapText(concept.title, 28);
  const subtitleLines = wrapText(concept.subtitle, 30);
  const titleY = Math.max(82, topSectionHeight * 0.24);
  const headlineSize = clampNumber(concept.typography?.headlineSize, 24, 96, 50);
  const subtitleSize = clampNumber(concept.typography?.subtitleSize, 18, 72, 36);
  const lineHeight = Math.min(headlineSize + 4, topSectionHeight * 0.18);
  const subtitleStart = titleY + titleLines.length * lineHeight + 8;
  const headlineFontFamily = escapeHtml(getFontFamily(concept.typography?.headlineFont));
  const subtitleFontFamily = escapeHtml(getFontFamily(concept.typography?.subtitleFont));

  return `
    <rect x="0" y="0" width="${width}" height="${topSectionHeight}" fill="#ffffff" />
    ${titleLines.map((line, index) => `
      <text
        x="${width / 2}"
        y="${titleY + index * lineHeight}"
        text-anchor="middle"
        fill="#111111"
        font-size="${headlineSize}"
        font-weight="700"
        font-family="${headlineFontFamily}"
      >${escapeHtml(line)}</text>
    `).join('')}
    ${subtitleLines.map((line, index) => `
      <text
        x="${width / 2}"
        y="${subtitleStart + index * (subtitleSize + 6)}"
        text-anchor="middle"
        fill="#202020"
        font-size="${subtitleSize}"
        font-weight="600"
        font-family="${subtitleFontFamily}"
      >${escapeHtml(line)}</text>
    `).join('')}
  `;
}

function renderHeatmapStage(concept, width, height) {
  const stageY = getTopSectionHeight(height);
  const stageHeight = height - stageY;
  const brandTopPadding = -58;
  const brandBottomGap = 4;
  const logoBadgeWidth = 1380;
  const logoBadgeHeight = (238 / 980) * logoBadgeWidth;
  const brandBlockY = stageY + brandTopPadding;
  const logoBadgeX = (width - logoBadgeWidth) / 2;
  const { brandAssets, tierLabels } = state.bootstrap;
  const bodiesY = brandBlockY + logoBadgeHeight + brandBottomGap;
  const singleBodyBaseScale = 1.68;
  const dualBodyBaseScale = 1.34;
  const dualBodyCenterGap = 150;
  const legendWidth = 92;
  const legendHeight = 70;
  const legendX = 28;
  let legendReferenceScale = singleBodyBaseScale;

  const bodyA = {
    ...concept.bodyA,
    pose: concept.bodyA.pose,
  };

  let bodiesMarkup = '';
  if (concept.layout === 'dual_body') {
    const bodyB = {
      ...concept.bodyB,
      pose: concept.bodyB.pose,
    };
    const bodyAScale = getDualBodyScale(bodyA, dualBodyBaseScale);
    const bodyBScale = getDualBodyScale(bodyB, dualBodyBaseScale);
    const bodyAWidth = 200 * bodyAScale;
    const bodyBWidth = 200 * bodyBScale;
    const dualLeftX = (width / 2) - (dualBodyCenterGap / 2) - bodyAWidth;
    const dualRightX = (width / 2) + (dualBodyCenterGap / 2);
    legendReferenceScale = Math.max(bodyAScale, bodyBScale);
    const dualBaselineY = bodiesY + (400 * legendReferenceScale);
    const bodyAY = dualBaselineY - (400 * bodyAScale) + getDualBodyVisualYOffset(bodyA);
    const bodyBY = dualBaselineY - (400 * bodyBScale) + getDualBodyVisualYOffset(bodyB);

    bodiesMarkup = `
      ${renderBodySvg(bodyA, dualLeftX, bodyAY, bodyAScale, concept.labelA || '', concept.typography?.labelFont, clampNumber(concept.typography?.labelSize, 16, 56, 26))}
      ${renderBodySvg(bodyB, dualRightX, bodyBY, bodyBScale, concept.labelB || '', concept.typography?.labelFont, clampNumber(concept.typography?.labelSize, 16, 56, 26))}
    `;
  } else {
    const singleBodyScale = getSingleBodyScale(bodyA, singleBodyBaseScale);
    const singleBodyWidth = 200 * singleBodyScale;
    legendReferenceScale = getEffectiveBodyScale({ gender: 'male' }, singleBodyBaseScale);
    bodiesMarkup = renderBodySvg(
      bodyA,
      (width - singleBodyWidth) / 2 + getSingleBodyVisualXOffset(bodyA),
      bodiesY - 10 + getSingleBodyVisualYOffset(bodyA),
      singleBodyScale,
      concept.labelA || '',
      concept.typography?.labelFont,
      clampNumber(concept.typography?.labelSize, 16, 56, 26)
    );
  }

  const bodyHeight = 400 * legendReferenceScale;
  const legendY = bodiesY;
  const legendGap = Math.max(2, (bodyHeight - legendHeight * tierLabels.length) / (tierLabels.length - 1) - 12);

  const legendMarkup = tierLabels.map((tier, index) => {
    const y = legendY + index * (legendHeight + legendGap);
    return `
      <g>
        <rect x="${legendX}" y="${y}" width="${legendWidth}" height="${legendHeight}" rx="12" fill="${tier.color}" />
        <text
          x="${legendX + legendWidth / 2}"
          y="${y + 48}"
          text-anchor="middle"
          fill="#171717"
          font-size="38"
          font-weight="700"
          font-family="${escapeHtml(getFontFamily('impact'))}"
        >${escapeHtml(tier.label.charAt(0))}</text>
      </g>
    `;
  }).join('');

  return `
    <rect x="0" y="${stageY}" width="${width}" height="${stageHeight}" fill="#111115" />
    <image href="${brandAssets.logoBadge}" x="${logoBadgeX}" y="${brandBlockY}" width="${logoBadgeWidth}" height="${logoBadgeHeight}" preserveAspectRatio="xMidYMid meet" opacity="0.98" />
    ${bodiesMarkup}
    ${legendMarkup}
  `;
}

function renderMemeSvg(concept = state.concept, sizePreset = state.sizePreset) {
  const preset = canvasPresets[sizePreset];
  const { width, height } = preset;
  const topSectionHeight = getTopSectionHeight(height);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="#ffffff" />
      ${renderTopText(concept, width, topSectionHeight)}
      ${renderHeatmapStage(concept, width, height)}
    </svg>
  `;
}

function svgToDataUrl(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function renderPreview() {
  const svg = renderMemeSvg(state.concept, state.sizePreset);
  elements.previewImage.src = svgToDataUrl(svg);
  elements.previewImage.style.aspectRatio = String(canvasPresets[state.sizePreset].previewAspect);
}

function renderBatchGrid() {
  elements.batchSummary.textContent = state.batchItems.length
    ? `${state.batchItems.length} meme${state.batchItems.length === 1 ? '' : 's'} loaded`
    : 'No batch loaded';

  if (!state.batchItems.length) {
    elements.batchGrid.innerHTML = '<p class="batch-empty">Paste a JSON array to preview memes in bulk.</p>';
    elements.downloadBatchButton.disabled = true;
    return;
  }

  elements.downloadBatchButton.disabled = false;
  elements.batchGrid.innerHTML = state.batchItems.map((item, index) => {
    const previewSrc = svgToDataUrl(renderMemeSvg(item.concept, item.sizePreset));
    const title = escapeHtml(item.concept.title || `Meme ${index + 1}`);
    const meta = item.concept.layout === 'dual_body' ? 'Dual body' : 'Single body';
    const rationale = item.concept.rationale
      ? `<p class="batch-card-rationale">${escapeHtml(item.concept.rationale)}</p>`
      : '';
    const selectedClass = index === state.selectedBatchIndex ? ' selected' : '';

    return `
      <article class="batch-card${selectedClass}" data-batch-index="${index}">
        <img class="batch-card-image" src="${previewSrc}" alt="${title}" />
        <div class="batch-card-meta">
          <strong>${title}</strong>
          <span>${meta} · ${item.sizePreset === 'square' ? '1080 x 1080' : '1080 x 1350'}</span>
          ${rationale}
        </div>
        <div class="batch-card-actions">
          <button type="button" class="secondary batch-action-button" data-action="load" data-index="${index}">Load Into Editor</button>
          <button type="button" class="batch-action-button" data-action="download" data-index="${index}">PNG</button>
        </div>
      </article>
    `;
  }).join('');
}

function syncControlsFromState() {
  const concept = state.concept;
  elements.canvasSize.value = state.sizePreset;
  elements.layoutSelect.value = concept.layout;
  elements.headlineInput.value = concept.title;
  elements.subtitleInput.value = concept.subtitle;
  elements.headlineSizeInput.value = String(concept.typography.headlineSize);
  elements.subtitleSizeInput.value = String(concept.typography.subtitleSize);
  elements.labelAInput.value = concept.labelA;
  elements.labelBInput.value = concept.labelB;
  elements.labelSizeInput.value = String(concept.typography.labelSize);
  elements.genderASelect.value = concept.bodyA.gender;
  elements.genderBSelect.value = concept.bodyB.gender;
  elements.poseASelect.value = concept.bodyA.pose;
  elements.poseBSelect.value = concept.bodyB.pose;

  const dualVisible = concept.layout === 'dual_body';
  elements.labelBWrapper.style.display = dualVisible ? 'block' : 'none';
  elements.genderBWrapper.style.display = dualVisible ? 'block' : 'none';
  elements.poseBWrapper.style.display = dualVisible ? 'block' : 'none';
  elements.bodyBSection.style.display = dualVisible ? 'grid' : 'none';
}

function updateConcept(mutator) {
  state.concept = mutator(structuredClone(state.concept));
  syncControlsFromState();
  renderPreview();
}

function createMuscleEditor(container, bodyKey) {
  container.innerHTML = '';

  state.bootstrap.muscleKeys.forEach((muscleKey) => {
    const fragment = elements.muscleRowTemplate.content.cloneNode(true);
    const label = fragment.querySelector('.muscle-label');
    const select = fragment.querySelector('.muscle-select');

    label.textContent = titleizeMuscleKey(muscleKey);
    select.value = String(state.concept[bodyKey].muscleLevels[muscleKey]);
    select.addEventListener('change', (event) => {
      updateConcept((current) => {
        current[bodyKey].muscleLevels[muscleKey] = Number.parseInt(event.target.value, 10);
        return current;
      });
    });

    container.appendChild(fragment);
  });
}

function rerenderMuscleEditors() {
  createMuscleEditor(elements.bodyAContainer, 'bodyA');
  createMuscleEditor(elements.bodyBContainer, 'bodyB');
}

async function renderPngBlob(concept, sizePreset) {
  const svg = renderMemeSvg(concept, sizePreset);
  const preset = canvasPresets[sizePreset];
  const image = new Image();
  image.decoding = 'async';

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = svgToDataUrl(svg);
  });

  const canvas = document.createElement('canvas');
  canvas.width = preset.width;
  canvas.height = preset.height;
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

async function downloadPng(concept = state.concept, sizePreset = state.sizePreset, filename = 'fortify-meme') {
  const blob = await renderPngBlob(concept, sizePreset);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${filename}.png`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function loadBatchItemIntoEditor(index) {
  const item = state.batchItems[index];
  if (!item) return;

  state.selectedBatchIndex = index;
  state.sizePreset = item.sizePreset;
  state.concept = structuredClone(item.concept);
  syncControlsFromState();
  rerenderMuscleEditors();
  renderPreview();
  renderBatchGrid();
  setStatus(`Loaded batch item ${index + 1} into the editor.`);
}

function sanitizeBatchJsonText(rawText) {
  let text = String(rawText || '').trim();

  text = text
    .replace(/^\uFEFF/, '')
    .replace(/```json/gi, '```')
    .replace(/```/g, '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");

  const firstBrace = text.search(/[\[{]/);
  const lastBrace = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));

  if (firstBrace > 0 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }

  return text.trim();
}

function parseBatchInput(rawText) {
  const sanitizedText = sanitizeBatchJsonText(rawText);
  let parsed;

  try {
    parsed = JSON.parse(sanitizedText);
  } catch (error) {
    throw new Error(`Could not parse batch JSON after cleanup: ${error.message}`);
  }

  if (Array.isArray(parsed)) {
    return { defaults: {}, memes: parsed, sanitizedText };
  }

  if (parsed && typeof parsed === 'object' && Array.isArray(parsed.memes)) {
    return { defaults: parsed.defaults || {}, memes: parsed.memes, sanitizedText };
  }

  if (parsed && typeof parsed === 'object') {
    return { defaults: {}, memes: [parsed], sanitizedText };
  }

  throw new Error('Batch JSON must be an object, an array, or { "memes": [...] }.');
}

function loadBatchFromTextarea() {
  const rawText = elements.batchJsonInput.value.trim();
  if (!rawText) {
    throw new Error('Paste a JSON array or object first.');
  }

  const { defaults, memes, sanitizedText } = parseBatchInput(rawText);
  if (!memes.length) {
    throw new Error('The batch JSON did not include any memes.');
  }

  state.batchItems = memes.map((meme, index) => normalizeConcept(mergeBatchDefaults(defaults, meme), index));
  state.selectedBatchIndex = state.batchItems.length ? 0 : null;
  elements.batchJsonInput.value = sanitizedText;
  renderBatchGrid();
}

function getRequestedLayouts() {
  if (elements.generatorLayoutSelect.value === 'single_body') {
    return ['single_body'];
  }

  if (elements.generatorLayoutSelect.value === 'dual_body') {
    return ['dual_body'];
  }

  return ['single_body', 'dual_body'];
}

function buildGeneratorPayload() {
  return {
    brief: elements.generatorBriefInput.value.trim(),
    audience: elements.generatorAudienceInput.value.trim(),
    tone: elements.generatorToneInput.value.trim(),
    avoid: elements.generatorAvoidInput.value.trim(),
    guidance: elements.generatorGuidanceInput.value.trim(),
    layouts: getRequestedLayouts(),
    count: clampNumber(elements.generatorCountInput.value, 1, 12, 6),
  };
}

function getGeneratorTypographyDefaults() {
  return {
    headlineFont: 'impact',
    subtitleFont: 'impact',
    labelFont: 'impact',
    headlineSize: clampNumber(elements.generatorHeadlineSizeInput.value, 24, 96, 50),
    subtitleSize: clampNumber(elements.generatorSubtitleSizeInput.value, 18, 72, 36),
    labelSize: clampNumber(elements.generatorLabelSizeInput.value, 16, 56, 26),
  };
}

function applyGenerationDefaultsToConcepts(concepts) {
  const typography = getGeneratorTypographyDefaults();

  return concepts.map((concept) => ({
    ...concept,
    typography: {
      ...typography,
      ...(concept.typography || {}),
    },
  }));
}

function conceptsToBatchJson(concepts) {
  return JSON.stringify(
    concepts.map((concept) => ({
      title: concept.title,
      subtitle: concept.subtitle,
      rationale: concept.rationale,
      layout: concept.layout,
      labelA: concept.labelA,
      labelB: concept.labelB,
      bodyA: concept.bodyA,
      bodyB: concept.bodyB,
    })),
    null,
    2
  );
}

async function generateConceptBatch() {
  const payload = buildGeneratorPayload();
  const response = await fetch('/api/generate-concepts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Could not generate concepts.');
  }

  const concepts = Array.isArray(data.concepts) ? data.concepts : [];
  if (!concepts.length) {
    throw new Error('The generator returned no concepts.');
  }

  const conceptsWithDefaults = applyGenerationDefaultsToConcepts(concepts);

  state.batchItems = conceptsWithDefaults.map((concept, index) => normalizeConcept(concept, index));
  state.selectedBatchIndex = 0;
  elements.batchJsonInput.value = conceptsToBatchJson(conceptsWithDefaults);
  renderBatchGrid();
  loadBatchItemIntoEditor(0);
}

async function downloadBatchPngs() {
  for (const item of state.batchItems) {
    await downloadPng(item.concept, item.sizePreset, item.filename);
    await new Promise((resolve) => window.setTimeout(resolve, 80));
  }
}

function clearBatch() {
  state.batchItems = [];
  state.selectedBatchIndex = null;
  renderBatchGrid();
}

function bindEvents() {
  elements.canvasSize.addEventListener('change', (event) => {
    state.sizePreset = event.target.value;
    renderPreview();
  });

  elements.layoutSelect.addEventListener('change', (event) => {
    updateConcept((current) => {
      current.layout = event.target.value;
      return current;
    });
  });

  elements.headlineInput.addEventListener('input', (event) => {
    updateConcept((current) => {
      current.title = event.target.value;
      return current;
    });
  });

  elements.subtitleInput.addEventListener('input', (event) => {
    updateConcept((current) => {
      current.subtitle = event.target.value;
      return current;
    });
  });

  elements.headlineSizeInput.addEventListener('input', (event) => {
    updateConcept((current) => {
      current.typography.headlineSize = clampNumber(event.target.value, 24, 96, current.typography.headlineSize);
      return current;
    });
  });

  elements.subtitleSizeInput.addEventListener('input', (event) => {
    updateConcept((current) => {
      current.typography.subtitleSize = clampNumber(event.target.value, 18, 72, current.typography.subtitleSize);
      return current;
    });
  });

  elements.labelAInput.addEventListener('input', (event) => {
    updateConcept((current) => {
      current.labelA = event.target.value;
      return current;
    });
  });

  elements.labelBInput.addEventListener('input', (event) => {
    updateConcept((current) => {
      current.labelB = event.target.value;
      return current;
    });
  });

  elements.labelSizeInput.addEventListener('input', (event) => {
    updateConcept((current) => {
      current.typography.labelSize = clampNumber(event.target.value, 16, 56, current.typography.labelSize);
      return current;
    });
  });

  elements.genderASelect.addEventListener('change', (event) => {
    updateConcept((current) => {
      current.bodyA.gender = event.target.value;
      return current;
    });
  });

  elements.genderBSelect.addEventListener('change', (event) => {
    updateConcept((current) => {
      current.bodyB.gender = event.target.value;
      return current;
    });
  });

  elements.poseASelect.addEventListener('change', (event) => {
    updateConcept((current) => {
      current.bodyA.pose = event.target.value;
      return current;
    });
  });

  elements.poseBSelect.addEventListener('change', (event) => {
    updateConcept((current) => {
      current.bodyB.pose = event.target.value;
      return current;
    });
  });

  elements.resetButton.addEventListener('click', () => {
    state.concept = createDefaultConcept();
    syncControlsFromState();
    rerenderMuscleEditors();
    renderPreview();
    setStatus('Reset editor.');
  });

  elements.downloadButton.addEventListener('click', async () => {
    elements.downloadButton.disabled = true;
    setStatus('Rendering PNG...', 'busy');
    try {
      await downloadPng(state.concept, state.sizePreset, 'fortify-meme');
      setStatus('PNG downloaded.');
    } catch (error) {
      setStatus(error.message, 'error');
    } finally {
      elements.downloadButton.disabled = false;
    }
  });

  elements.loadBatchButton.addEventListener('click', () => {
    try {
      loadBatchFromTextarea();
      setStatus(`Loaded ${state.batchItems.length} meme${state.batchItems.length === 1 ? '' : 's'} from JSON.`);
    } catch (error) {
      setStatus(error.message, 'error');
    }
  });

  elements.clearBatchButton.addEventListener('click', () => {
    clearBatch();
    setStatus('Cleared batch previews.');
  });

  elements.downloadBatchButton.addEventListener('click', async () => {
    if (!state.batchItems.length) return;
    elements.downloadBatchButton.disabled = true;
    setStatus(`Downloading ${state.batchItems.length} PNGs...`, 'busy');
    try {
      await downloadBatchPngs();
      setStatus(`Downloaded ${state.batchItems.length} PNGs.`);
    } catch (error) {
      setStatus(error.message, 'error');
    } finally {
      elements.downloadBatchButton.disabled = false;
      renderBatchGrid();
    }
  });

  elements.batchGrid.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const index = Number.parseInt(button.dataset.index, 10);
    if (Number.isNaN(index)) return;

    if (button.dataset.action === 'load') {
      loadBatchItemIntoEditor(index);
      return;
    }

    if (button.dataset.action === 'download') {
      const item = state.batchItems[index];
      if (!item) return;
      setStatus(`Rendering batch item ${index + 1}...`, 'busy');
      try {
        await downloadPng(item.concept, item.sizePreset, item.filename);
        setStatus(`Downloaded batch item ${index + 1}.`);
      } catch (error) {
        setStatus(error.message, 'error');
      }
    }
  });

  elements.generateConceptsButton.addEventListener('click', async () => {
    elements.generateConceptsButton.disabled = true;
    setStatus('Generating concepts...', 'busy');
    try {
      await generateConceptBatch();
      setStatus(`Generated ${state.batchItems.length} concept${state.batchItems.length === 1 ? '' : 's'} and loaded the first one.`);
    } catch (error) {
      setStatus(error.message, 'error');
    } finally {
      elements.generateConceptsButton.disabled = false;
    }
  });
}

await fetchBootstrap();
state.concept = createDefaultConcept();
bindEvents();
syncControlsFromState();
rerenderMuscleEditors();
renderPreview();
renderBatchGrid();
setStatus('Ready.');
