import React from 'react';

// Drapeaux 100% SVG — aucun asset externe, rendu fiable en headless.

const starPoints = (cx, cy, outer, inner, rotation = -Math.PI / 2) => {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = rotation + (i * Math.PI) / 5;
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return pts.join(' ');
};

const flagFrame = {
  borderRadius: 18,
  boxShadow: '0 12px 40px rgba(0,0,0,0.55), 0 0 0 3px rgba(255,255,255,0.18)',
  display: 'block',
};

export const EUFlag = ({width = 300}) => {
  const h = (width * 2) / 3;
  const cx = width / 2;
  const cy = h / 2;
  const ringR = h / 3;
  const starR = h / 18;
  const stars = [];
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6 - Math.PI / 2;
    stars.push(
      <polygon
        key={i}
        points={starPoints(
          cx + ringR * Math.cos(a),
          cy + ringR * Math.sin(a),
          starR,
          starR * 0.4
        )}
        fill="#ffcc00"
      />
    );
  }
  return (
    <svg width={width} height={h} style={flagFrame}>
      <rect width={width} height={h} fill="#003399" rx={14} />
      {stars}
    </svg>
  );
};

export const USFlag = ({width = 300}) => {
  const h = (width * 2) / 3;
  const stripeH = h / 13;
  const cantonW = width * 0.42;
  const cantonH = stripeH * 7;
  const stripes = [];
  for (let i = 0; i < 13; i++) {
    stripes.push(
      <rect
        key={i}
        y={i * stripeH}
        width={width}
        height={stripeH + 0.5}
        fill={i % 2 === 0 ? '#b22234' : '#ffffff'}
      />
    );
  }
  const stars = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 6; col++) {
      stars.push(
        <polygon
          key={`${row}-${col}`}
          points={starPoints(
            cantonW * 0.1 + col * cantonW * 0.16,
            cantonH * 0.14 + row * cantonH * 0.19,
            stripeH * 0.42,
            stripeH * 0.17
          )}
          fill="#ffffff"
        />
      );
    }
  }
  return (
    <svg width={width} height={h} style={flagFrame}>
      <defs>
        <clipPath id="us-clip">
          <rect width={width} height={h} rx={14} />
        </clipPath>
      </defs>
      <g clipPath="url(#us-clip)">
        {stripes}
        <rect width={cantonW} height={cantonH} fill="#3c3b6e" />
        {stars}
      </g>
    </svg>
  );
};

export const CNFlag = ({width = 300}) => {
  const h = (width * 2) / 3;
  const big = h / 5;
  const smallPos = [
    [width * 0.31, h * 0.1],
    [width * 0.37, h * 0.24],
    [width * 0.37, h * 0.42],
    [width * 0.31, h * 0.56],
  ];
  return (
    <svg width={width} height={h} style={flagFrame}>
      <rect width={width} height={h} fill="#de2910" rx={14} />
      <polygon
        points={starPoints(width * 0.155, h * 0.31, big, big * 0.4)}
        fill="#ffde00"
      />
      {smallPos.map(([x, y], i) => (
        <polygon
          key={i}
          points={starPoints(x, y, h / 15, h / 38)}
          fill="#ffde00"
        />
      ))}
    </svg>
  );
};
