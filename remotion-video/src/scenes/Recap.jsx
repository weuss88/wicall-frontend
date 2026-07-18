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
import {COLORS, FONT, FONT_TEXT} from '../theme.js';

const ROWS = [
  {
    Flag: EUFlag,
    name: 'EUROPE',
    verdict: 'La plus stricte',
    detail: 'AI Act · risques classés · usages interdits',
    color: '#ffcc00',
    delay: 35,
  },
  {
    Flag: CNFlag,
    name: 'CHINE',
    verdict: 'Contrôle ciblé',
    detail: 'Secteur par secteur · zéro transparence',
    color: '#ffd24d',
    delay: 55,
  },
  {
    Flag: USFlag,
    name: 'USA',
    verdict: 'La plus libre',
    detail: 'Dérégulation · vitesse maximale',
    color: '#ff3b30',
    delay: 75,
  },
];

// Scène 5 — Récap + CTA (13s)
export const Recap = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const ctaS = spring({
    frame: frame - 200,
    fps,
    config: {damping: 11, stiffness: 200},
  });
  const btnPulse = 1 + Math.sin(frame / 6) * 0.04;

  return (
    <AbsoluteFill>
      <Background accent="#7b3bff" />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 170}}>
        <SlamText delay={5} size={110} color={COLORS.yellow}>
          LE CLASSEMENT
        </SlamText>

        <div
          style={{
            marginTop: 70,
            display: 'flex',
            flexDirection: 'column',
            gap: 36,
          }}
        >
          {ROWS.map((row, i) => {
            const s = spring({
              frame: frame - row.delay,
              fps,
              config: {damping: 13, stiffness: 190, mass: 0.6},
            });
            return (
              <div
                key={row.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 34,
                  width: 920,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  borderRadius: 28,
                  padding: '28px 36px',
                  transform: `translateX(${(1 - s) * (i % 2 === 0 ? -700 : 700)}px)`,
                  opacity: s,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                }}
              >
                <div
                  style={{
                    fontFamily: FONT,
                    fontWeight: 900,
                    fontSize: 64,
                    color: row.color,
                    width: 70,
                  }}
                >
                  {i + 1}
                </div>
                <row.Flag width={170} />
                <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontWeight: 900,
                      fontSize: 50,
                      color: COLORS.white,
                    }}
                  >
                    {row.name}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontWeight: 900,
                      fontSize: 42,
                      color: row.color,
                    }}
                  >
                    {row.verdict}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_TEXT,
                      fontWeight: 700,
                      fontSize: 32,
                      color: COLORS.muted,
                    }}
                  >
                    {row.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA abonnement */}
        <div
          style={{
            marginTop: 90,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 30,
            transform: `scale(${ctaS})`,
            opacity: ctaS,
          }}
        >
          <div
            style={{
              fontFamily: FONT_TEXT,
              fontWeight: 800,
              fontSize: 50,
              color: COLORS.white,
              textAlign: 'center',
            }}
          >
            Tu veux la suite sur l'IA et la géopolitique ?
          </div>
          <div
            style={{
              background: '#fe2c55',
              color: '#fff',
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 56,
              padding: '24px 70px',
              borderRadius: 18,
              transform: `scale(${btnPulse})`,
              boxShadow: '0 0 50px rgba(254,44,85,0.55)',
              display: 'flex',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <svg width={52} height={52} viewBox="0 0 24 24">
              <path
                d="M12 5v14M5 12h14"
                stroke="#fff"
                strokeWidth={3.4}
                strokeLinecap="round"
              />
            </svg>
            ABONNE-TOI
          </div>
        </div>
      </AbsoluteFill>

      {/* Fondu final */}
      <AbsoluteFill
        style={{
          background: '#000',
          opacity: interpolate(frame, [372, 390], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
