import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Background, SlamText} from '../components/UI.jsx';
import {EUFlag, USFlag, CNFlag} from '../components/Flags.jsx';
import {COLORS, FONT_TEXT} from '../theme.js';

// Scène 1 — Le hook (0 → 5s) : "3 régions. 3 façons de réguler l'IA."
export const Hook = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const flags = [
    {C: EUFlag, delay: 55},
    {C: USFlag, delay: 63},
    {C: CNFlag, delay: 71},
  ];

  const arrowS = spring({
    frame: frame - 100,
    fps,
    config: {damping: 10, stiffness: 180},
  });
  const bounce = Math.sin(frame / 4) * 12;

  return (
    <AbsoluteFill>
      <Background accent="#7b3bff" />
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 50,
          padding: '0 60px',
        }}
      >
        <SlamText delay={3} size={230} color={COLORS.yellow}>
          3
        </SlamText>
        <SlamText delay={10} size={120}>
          RÉGIONS
        </SlamText>
        <SlamText delay={28} size={78} style={{color: COLORS.muted}}>
          3 FAÇONS DE RÉGULER
        </SlamText>
        <SlamText delay={38} size={150} color={COLORS.yellow}>
          L'IA
        </SlamText>

        <div style={{display: 'flex', gap: 40, marginTop: 40}}>
          {flags.map(({C, delay}, i) => {
            const s = spring({
              frame: frame - delay,
              fps,
              config: {damping: 12, stiffness: 220, mass: 0.5},
            });
            return (
              <div
                key={i}
                style={{
                  transform: `scale(${s}) rotate(${(1 - s) * 15}deg)`,
                }}
              >
                <C width={230} />
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 30,
            opacity: arrowS,
            transform: `scale(${arrowS})`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              fontFamily: FONT_TEXT,
              fontWeight: 800,
              fontSize: 54,
              color: COLORS.white,
            }}
          >
            Voici le <span style={{color: COLORS.yellow}}>VRAI</span> classement
          </div>
          <svg
            width={70}
            height={70}
            viewBox="0 0 24 24"
            style={{transform: `translateY(${bounce}px)`}}
          >
            <path
              d="M12 4v13M5.5 11.5 12 18l6.5-6.5"
              stroke={COLORS.yellow}
              strokeWidth={3.2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </AbsoluteFill>

      {/* Flash blanc d'ouverture */}
      <AbsoluteFill
        style={{
          background: '#fff',
          opacity: interpolate(frame, [0, 6], [0.9, 0], {
            extrapolateRight: 'clamp',
          }),
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
