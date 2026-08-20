function Windows({
  x,
  y,
  cols,
  rows,
  gapX = 18,
  gapY = 22,
}: {
  x: number;
  y: number;
  cols: number;
  rows: number;
  gapX?: number;
  gapY?: number;
}) {
  const cells = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      cells.push(
        <rect
          key={`${x}-${y}-${row}-${col}`}
          x={x + col * gapX}
          y={y + row * gapY}
          width="9"
          height="12"
          rx="1"
          fill="#e7e0d2"
          stroke="currentColor"
          strokeWidth="1"
        />,
      );
    }
  }
  return <g>{cells}</g>;
}

export function MadridCornice({ className = "w-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 520 236" fill="none" className={className} aria-hidden>
      <path d="M8 214h504" stroke="currentColor" strokeOpacity="0.22" />
      <path d="M8 218h504" stroke="currentColor" strokeOpacity="0.08" />

      <g stroke="currentColor" strokeWidth="1.4">
        <rect x="18" y="92" width="90" height="122" fill="#f4efe4" />
        <path d="M18 92h90v8H18z" fill="#c4a36a" fillOpacity="0.35" />
        <path d="M14 92h98l-8-14H22z" fill="#e7e0d2" />
        <Windows x={32} y={114} cols={3} rows={4} />
      </g>

      <g stroke="currentColor" strokeWidth="1.4">
        <rect x="108" y="58" width="118" height="156" fill="#f4efe4" />
        <path d="M108 58h118v10H108z" fill="#8f1d2c" fillOpacity="0.12" />
        <path d="M102 58h130l-10-16H112z" fill="#e7e0d2" />
        <Windows x={124} y={82} cols={4} rows={3} gapX={22} />
        <path d="M148 214v-38a18 18 0 0 1 36 0v38" fill="#8f1d2c" />
        <rect x="156" y="154" width="20" height="10" rx="1" fill="#c4a36a" stroke="none" />
        <text x="166" y="162" textAnchor="middle" fill="#1c1712" fontSize="8" fontFamily="Georgia, serif" stroke="none">
          41
        </text>
        <circle cx="164" cy="188" r="1.2" fill="#c4a36a" stroke="none" />
      </g>

      <g stroke="currentColor" strokeWidth="1.4">
        <rect x="226" y="78" width="96" height="136" fill="#f4efe4" />
        <path d="M226 78h96v8H226z" fill="#3f5e54" fillOpacity="0.16" />
        <path d="M220 78h108l-9-12H229z" fill="#e7e0d2" />
        <Windows x={242} y={100} cols={3} rows={4} />
        <path d="M240 132h20v3h-20zm32 0h20v3h-20zm32 0h20v3h-20z" fill="#c4a36a" stroke="none" />
      </g>

      <g stroke="currentColor" strokeWidth="1.4">
        <rect x="322" y="70" width="100" height="144" fill="#f4efe4" />
        <path d="M322 94h100" />
        <path d="M316 70h112l-50-22z" fill="#e7e0d2" />
        <rect x="364" y="52" width="16" height="14" fill="#8f1d2c" fillOpacity="0.35" />
        <Windows x={340} y={108} cols={3} rows={4} />
      </g>

      <g stroke="currentColor" strokeWidth="1.4">
        <rect x="422" y="96" width="82" height="118" fill="#f4efe4" />
        <path d="M418 96h90l-8-12h-74z" fill="#e7e0d2" />
        <Windows x={436} y={116} cols={2} rows={3} gapX={24} />
        <rect x="448" y="186" width="22" height="28" fill="#1c1712" fillOpacity="0.08" />
      </g>
    </svg>
  );
}

export function CadastralStamp({ className = "w-40" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" className={className} aria-hidden>
      <rect x="10" y="10" width="140" height="140" rx="18" stroke="currentColor" strokeWidth="3" />
      <rect
        x="22"
        y="22"
        width="116"
        height="116"
        rx="12"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="4 3"
        opacity="0.55"
      />
      <path d="M46 70h68v52H46z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M80 70v52M46 96h68" stroke="currentColor" strokeWidth="1.2" />
      <path d="M46 70 80 48l34 22" stroke="currentColor" strokeWidth="1.4" />
      <rect x="44" y="28" width="72" height="14" rx="2" fill="#c4a36a" fillOpacity="0.35" />
      <text
        x="80"
        y="38.5"
        textAnchor="middle"
        fill="currentColor"
        fontSize="8"
        fontFamily="Georgia, serif"
        letterSpacing="1.6"
      >
        CATASTRO
      </text>
    </svg>
  );
}

export function NotebookMark({ className = "w-40" }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 140" fill="none" className={className} aria-hidden>
      <path d="M22 18h64a8 8 0 0 1 8 8v92H30a8 8 0 0 1-8-8V18z" fill="#f4efe4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M94 18h64a8 8 0 0 1 8 8v84a8 8 0 0 1-8 8H94V18z" fill="#e7e0d2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M94 18v100" stroke="currentColor" strokeWidth="1.5" />
      <path d="M36 42h42M36 56h42M36 70h30M108 42h38M108 56h38M108 70h24" stroke="currentColor" strokeOpacity="0.35" />
      <path d="M90 18v100" stroke="#8f1d2c" strokeWidth="4" />
      <circle cx="90" cy="40" r="3" fill="#c4a36a" />
      <circle cx="90" cy="70" r="3" fill="#c4a36a" />
      <circle cx="90" cy="100" r="3" fill="#c4a36a" />
    </svg>
  );
}

export function EmptyStamp({ className = "w-28" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden>
      <circle cx="60" cy="60" r="46" stroke="currentColor" strokeWidth="1.6" strokeDasharray="5 4" opacity="0.5" />
      <path
        d="M38 78V52l22-16 22 16v26H38z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="#f4efe4"
      />
      <path d="M54 78v-16h12v16" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
