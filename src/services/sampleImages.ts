/**
 * Realistic vector / SVG data URIs for academic prototype test verification
 */

// 1. Fresh Apple: Crisp vibrant red & green apple with natural sheen
export const SAMPLE_FRESH_APPLE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
  <defs>
    <radialGradient id="appleGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ff6b6b" />
      <stop offset="50%" stop-color="#e01e37" />
      <stop offset="85%" stop-color="#a71d2a" />
      <stop offset="100%" stop-color="#6f1d1b" />
    </radialGradient>
    <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#70e000" />
      <stop offset="100%" stop-color="#38b000" />
    </linearGradient>
  </defs>
  <rect width="300" height="300" fill="#f8fafc" />
  <!-- Stem -->
  <path d="M150,75 C155,50 170,40 180,38 C178,45 165,58 155,78 Z" fill="#582f0e" />
  <!-- Leaf -->
  <path d="M155,55 C180,45 200,60 195,75 C175,80 160,70 155,55 Z" fill="url(#leafGrad)" />
  <!-- Apple Body -->
  <path d="M150,90 C120,65 70,80 65,130 C60,185 100,245 140,250 C148,251 152,251 160,250 C200,245 240,185 235,130 C230,80 180,65 150,90 Z" fill="url(#appleGrad)" />
  <!-- Gloss highlight -->
  <ellipse cx="110" cy="125" rx="20" ry="35" transform="rotate(-30 110 125)" fill="#ffffff" opacity="0.35" />
</svg>
`)}`;

// 2. Rotten Apple: Decayed, brown, necrotic patches and dark mold spots
export const SAMPLE_ROTTEN_APPLE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
  <defs>
    <radialGradient id="rottenAppleGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#936639" />
      <stop offset="40%" stop-color="#6c584c" />
      <stop offset="75%" stop-color="#3d2c1d" />
      <stop offset="100%" stop-color="#281b11" />
    </radialGradient>
  </defs>
  <rect width="300" height="300" fill="#f8fafc" />
  <!-- Stem shriveled -->
  <path d="M150,80 C153,60 165,50 172,48 C170,55 160,65 153,82 Z" fill="#2b1a0e" />
  <!-- Apple Body decaying -->
  <path d="M150,95 C120,70 70,85 65,135 C60,190 100,245 140,250 C148,251 152,251 160,250 C200,245 235,185 230,135 C225,85 180,70 150,95 Z" fill="url(#rottenAppleGrad)" />
  <!-- Necrotic decay patches -->
  <circle cx="115" cy="140" r="30" fill="#24140a" opacity="0.85" />
  <circle cx="170" cy="165" r="35" fill="#1b0e06" opacity="0.9" />
  <circle cx="140" cy="205" r="28" fill="#352213" opacity="0.8" />
  <circle cx="95" cy="180" r="18" fill="#1b0e06" opacity="0.75" />
  <ellipse cx="120" cy="135" rx="14" ry="10" fill="#403d39" opacity="0.6" />
</svg>
`)}`;

// 3. Unclear / Blurry Apple: Low contrast, heavy gaussian blur effect
export const SAMPLE_UNCLEAR_APPLE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
  <filter id="blurFilter">
    <feGaussianBlur stdDeviation="14" />
  </filter>
  <rect width="300" height="300" fill="#f1f5f9" />
  <g filter="url(#blurFilter)">
    <circle cx="150" cy="160" r="75" fill="#c1121f" />
    <circle cx="170" cy="140" r="45" fill="#780000" />
    <circle cx="130" cy="180" r="50" fill="#936639" />
  </g>
</svg>
`)}`;

// 4. Unsupported Object: Random non-perishable hardware object (mechanical wrench/gadget)
export const SAMPLE_UNSUPPORTED_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
  <rect width="300" height="300" fill="#f8fafc" />
  <g transform="translate(50, 50)">
    <rect x="30" y="30" width="140" height="140" rx="16" fill="#64748b" />
    <circle cx="100" cy="100" r="40" fill="#334155" />
    <line x1="100" y1="40" x2="100" y2="160" stroke="#94a3b8" stroke-width="8" />
    <line x1="40" y1="100" x2="160" y2="100" stroke="#94a3b8" stroke-width="8" />
  </g>
</svg>
`)}`;
