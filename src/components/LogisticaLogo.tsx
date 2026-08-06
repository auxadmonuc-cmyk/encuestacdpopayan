import React from 'react';

interface LogisticaLogoProps {
  className?: string;
  showText?: boolean;
}

export const LogisticaLogo: React.FC<LogisticaLogoProps> = ({ className = "h-12", showText = true }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* SVG Emblem replicating the LOGÍSTICA - CONECTAMOS MAZ PEOPLE emblem */}
      <svg
        viewBox="0 0 200 200"
        className="h-full w-auto flex-shrink-0 drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 3 People heads */}
        <circle cx="50" cy="38" r="16" fill="#2F5D73" />
        <circle cx="100" cy="24" r="18" fill="#4CB7A5" />
        <circle cx="150" cy="38" r="16" fill="#E3B23C" />

        {/* 3 People shoulder arches */}
        <path
          d="M 12 100 C 12 62 42 55 68 62 C 55 76 35 90 22 100 Z"
          fill="#2F5D73"
        />
        <path
          d="M 46 95 C 46 52 82 42 100 42 C 118 42 154 52 154 95 C 128 92 88 92 46 95 Z"
          fill="#4CB7A5"
        />
        <path
          d="M 132 62 C 158 55 188 62 188 100 C 175 90 155 76 142 62 Z"
          fill="#E3B23C"
        />

        {/* Dark Circle/Base (Petróleo #1F2A33) with horizon curve */}
        <path
          d="M 10 98 C 50 90 150 90 190 98 A 90 90 0 0 1 10 98 Z"
          fill="#1F2A33"
        />

        {/* Curved roads cut inside the dark base */}
        <path
          d="M 30 188 C 30 140 80 108 190 98 C 170 102 65 118 48 188 Z"
          fill="#FFFFFF"
        />
        <path
          d="M 78 188 C 75 145 120 115 190 101 C 175 106 100 126 98 188 Z"
          fill="#FFFFFF"
        />
        <path
          d="M 128 188 C 128 152 150 125 190 106 C 180 112 142 136 145 188 Z"
          fill="#FFFFFF"
        />
      </svg>

      {/* Typography side */}
      {showText && (
        <div className="flex flex-col justify-center leading-tight select-none">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans uppercase">
            LOGÍSTICA
          </span>
          <span className="text-[10px] sm:text-[11px] font-black tracking-[0.18em] text-mostaza uppercase -mt-0.5">
            CONECTAMOS MAZ
          </span>
          <span className="text-[9px] sm:text-[10px] font-extrabold tracking-[0.38em] text-turquesa uppercase -mt-0.5 text-right pr-0.5">
            PEOPLE
          </span>
        </div>
      )}
    </div>
  );
};
