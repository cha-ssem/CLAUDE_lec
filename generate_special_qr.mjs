import QRCode from 'qrcode';
import sharp from 'sharp';
import fs from 'fs';

const targetUrl = 'https://cha-ssem.github.io/CLAUDE_lec/';

// Error Correction Level H (30% 손상 복원 보장)
const qr = QRCode.create(targetUrl, { errorCorrectionLevel: 'H' });
const matrix = qr.modules;
const size = matrix.size; // 37
const data = matrix.data;

console.log(`QR Matrix Size: ${size}x${size}`);

/**
 * 7x7 파인더 패턴 및 주변 1셀 분리 영역 (총 8x8 영역) 판별
 */
function isFinderPatternZone(r, c, size) {
  // 좌상단
  if (r < 8 && c < 8) return true;
  // 우상단
  if (r < 8 && c >= size - 8) return true;
  // 좌하단
  if (r >= size - 8 && c < 8) return true;
  return false;
}

/**
 * 중앙 로고 영역 판별 (중앙 7x7 영역)
 */
function isCenterLogoArea(r, c, size) {
  const center = Math.floor(size / 2);
  const radius = 3;
  return (r >= center - radius && r <= center + radius && c >= center - radius && c <= center + radius);
}

function generateSpecialQRSvg(theme = 'claude') {
  const cellSize = 16;
  const margin = 48;
  const qrPixelSize = size * cellSize;
  const totalWidth = qrPixelSize + margin * 2;
  const totalHeight = totalWidth;

  let bodyElements = '';

  // 1. 일반 데이터 도트 (둥근 스쿼클 / 서클 모듈)
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const isDark = data[r * size + c] === 1;
      if (!isDark) continue;

      if (isFinderPatternZone(r, c, size)) continue;
      if (isCenterLogoArea(r, c, size)) continue;

      const x = margin + c * cellSize;
      const y = margin + r * cellSize;
      const dotRadius = cellSize * 0.44; // 선명한 인식률을 위한 최적 반지름
      const cx = x + cellSize / 2;
      const cy = y + cellSize / 2;

      bodyElements += `<circle cx="${cx}" cy="${cy}" r="${dotRadius}" fill="url(#qrGradient)" />\n`;
    }
  }

  // 2. 모서리 3대 코너 파인더 패턴 (1:1:3:1:1 공식 규격의 유려한 라운드 스타일)
  const finderPositions = [
    { r: 0, c: 0 },
    { r: 0, c: size - 7 },
    { r: size - 7, c: 0 }
  ];

  let finderElements = '';
  finderPositions.forEach(({ r, c }) => {
    const x = margin + c * cellSize;
    const y = margin + r * cellSize;
    const boxSize = 7 * cellSize;

    // 외곽 7x7 둥근 테두리 (두께 1 모듈)
    // 안쪽 5x5 흰색 여백 (두께 1 모듈)
    // 중심 3x3 둥근 코어 (크기 3 모듈)
    const strokeWidth = cellSize;
    const outerRectX = x + strokeWidth / 2;
    const outerRectY = y + strokeWidth / 2;
    const outerRectSize = boxSize - strokeWidth;
    const outerRadius = cellSize * 1.6;

    const coreX = x + 2 * cellSize;
    const coreY = y + 2 * cellSize;
    const coreSize = 3 * cellSize;
    const coreRadius = cellSize * 1.1;

    finderElements += `
      <!-- Finder Pattern Outer Ring -->
      <rect x="${outerRectX}" y="${outerRectY}" width="${outerRectSize}" height="${outerRectSize}" rx="${outerRadius}" ry="${outerRadius}" fill="none" stroke="url(#finderGradient)" stroke-width="${strokeWidth}" />
      <!-- Finder Pattern Center Core -->
      <rect x="${coreX}" y="${coreY}" width="${coreSize}" height="${coreSize}" rx="${coreRadius}" ry="${coreRadius}" fill="url(#finderGradient)" />
    `;
  });

  // 3. 중앙 로고 (Claude AI 심볼 뱃지)
  const center = Math.floor(size / 2);
  const logoCenterPx = margin + center * cellSize + cellSize / 2;
  const logoRadius = 3.6 * cellSize;

  const centerLogoSvg = `
    <!-- Center Badge Background with Glow -->
    <circle cx="${logoCenterPx}" cy="${logoCenterPx}" r="${logoRadius + 3}" fill="#FFFFFF" filter="url(#badgeShadow)" />
    <circle cx="${logoCenterPx}" cy="${logoCenterPx}" r="${logoRadius}" fill="url(#logoBadgeBg)" stroke="#FFFFFF" stroke-width="3" />
    
    <!-- Claude / AI Stylized Spark Symbol -->
    <g transform="translate(${logoCenterPx - 22}, ${logoCenterPx - 22})">
      <path d="M22 2 C22 2 23.5 12.5 28 17 C32.5 21.5 43 23 43 23 C43 23 32.5 24.5 28 29 C23.5 33.5 22 44 22 44 C22 44 20.5 33.5 16 29 C11.5 24.5 1 23 1 23 C1 23 11.5 21.5 16 17 C20.5 12.5 22 2 22 2 Z" fill="#FFFFFF" filter="url(#sparkShadow)" />
      <circle cx="22" cy="23" r="3.5" fill="url(#sparkCenterGrad)" />
    </g>
  `;

  // 테마별 색상 설정
  let defs = '';
  if (theme === 'claude') {
    defs = `
      <linearGradient id="qrGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#9A3412" />
        <stop offset="35%" stop-color="#C2410C" />
        <stop offset="70%" stop-color="#EA580C" />
        <stop offset="100%" stop-color="#D97706" />
      </linearGradient>
      <linearGradient id="finderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#7C2D12" />
        <stop offset="50%" stop-color="#C2410C" />
        <stop offset="100%" stop-color="#EA580C" />
      </linearGradient>
      <linearGradient id="logoBadgeBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#EA580C" />
        <stop offset="100%" stop-color="#C2410C" />
      </linearGradient>
      <linearGradient id="sparkCenterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FEF3C7" />
        <stop offset="100%" stop-color="#F59E0B" />
      </linearGradient>
      <filter id="badgeShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#7C2D12" flood-opacity="0.25" />
      </filter>
      <filter id="sparkShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#431407" flood-opacity="0.3" />
      </filter>
      <filter id="cardShadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#000000" flood-opacity="0.08" />
      </filter>
    `;
  } else if (theme === 'dark_gold') {
    defs = `
      <linearGradient id="qrGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1E293B" />
        <stop offset="50%" stop-color="#0F172A" />
        <stop offset="100%" stop-color="#D97706" />
      </linearGradient>
      <linearGradient id="finderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#D97706" />
        <stop offset="100%" stop-color="#B45309" />
      </linearGradient>
      <linearGradient id="logoBadgeBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0F172A" />
        <stop offset="100%" stop-color="#1E293B" />
      </linearGradient>
      <linearGradient id="sparkCenterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FBBF24" />
        <stop offset="100%" stop-color="#D97706" />
      </linearGradient>
      <filter id="badgeShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.3" />
      </filter>
      <filter id="sparkShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000000" flood-opacity="0.4" />
      </filter>
      <filter id="cardShadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#000000" flood-opacity="0.08" />
      </filter>
    `;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}">
  <defs>
    ${defs}
  </defs>
  <!-- Main Card Canvas -->
  <rect x="8" y="8" width="${totalWidth - 16}" height="${totalHeight - 16}" rx="32" ry="32" fill="#FFFFFF" filter="url(#cardShadow)" />
  
  <!-- Subtle Header & Footer Branding Accents -->
  <g opacity="0.8">
    <circle cx="28" cy="28" r="3.5" fill="#E5E7EB" />
    <circle cx="${totalWidth - 28}" cy="28" r="3.5" fill="#E5E7EB" />
    <circle cx="28" cy="${totalHeight - 28}" r="3.5" fill="#E5E7EB" />
    <circle cx="${totalWidth - 28}" cy="${totalHeight - 28}" r="3.5" fill="#E5E7EB" />
  </g>

  <!-- Data Modules -->
  <g id="modules">
    ${bodyElements}
  </g>

  <!-- Precision Finder Patterns -->
  <g id="finders">
    ${finderElements}
  </g>

  <!-- Center Emblem -->
  ${centerLogoSvg}
</svg>`;
}

async function run() {
  // 1. Claude 시그니처 웜 오렌지 QR (대표)
  const claudeSvg = generateSpecialQRSvg('claude');
  fs.writeFileSync('images/special_qr_claude.svg', claudeSvg);
  
  await sharp(Buffer.from(claudeSvg))
    .resize(900, 900)
    .jpeg({ quality: 96 })
    .toFile('images/special_qr_claude.jpg');

  await sharp(Buffer.from(claudeSvg))
    .resize(900, 900)
    .png()
    .toFile('images/special_qr_claude.png');

  // 기본 대표 이미지도 이 고품질 버전으로 동기화
  await sharp(Buffer.from(claudeSvg))
    .resize(900, 900)
    .jpeg({ quality: 96 })
    .toFile('images/lecture_site_qr.jpg');

  await sharp(Buffer.from(claudeSvg))
    .resize(900, 900)
    .png()
    .toFile('images/lecture_site_qr.png');

  // 2. 다크 & 골드 에디션 (고급 비즈니스 프레젠테이션용)
  const darkGoldSvg = generateSpecialQRSvg('dark_gold');
  fs.writeFileSync('images/special_qr_gold.svg', darkGoldSvg);
  await sharp(Buffer.from(darkGoldSvg))
    .resize(900, 900)
    .jpeg({ quality: 96 })
    .toFile('images/special_qr_gold.jpg');
    
  console.log('✨ 특별한 모양의 QR코드 정밀 생성 완료!');
}

run().catch(console.error);
