import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Background, Caption, Hl, RegionHeader} from '../components/UI.jsx';
import {CNFlag} from '../components/Flags.jsx';
import {COLORS, FONT, FONT_TEXT} from '../theme.js';

const SECTORS = [
  {label: 'Algorithmes de reco', delay: 60},
  {label: 'Deepfakes', delay: 78},
  {label: 'IA générative', delay: 96},
  {label: 'Reco. faciale', delay: 114},
];

const Check = ({size = 40}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx={12} cy={12} r={11} fill="#2ee66b" />
    <path
      d="M7 12.5 10.5 16 17 8.5"
      stroke="#000"
      strokeWidth={2.6}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Barre de mesure (contrôle fort / transparence faible)
const Meter = ({label, pct, color, delay, frame, fps}) => {
  const s = spring({
    frame: frame - delay,
    fps,
    config: {damping: 14, stiffness: 120},
  });
  return (
    <div style={{width: 760, opacity: s < 0.02 ? 0 : 1}}>
      <div
        style={{
          fontFamily: FONT_TEXT,
          fontWeight: 800,
          fontSize: 42,
          color: COLORS.white,
          marginBottom: 12,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>{label}</span>
        <span style={{color}}>{pct >= 60 ? 'FORT' : 'FAIBLE'}</span>
      </div>
      <div
        style={{
          height: 34,
          background: 'rgba(255,255,255,0.14)',
          borderRadius: 17,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct * s}%`,
            height: '100%',
            background: color,
            borderRadius: 17,
            boxShadow: `0 0 25px ${color}88`,
          }}
        />
      </div>
    </div>
  );
};

// Scène 4 — Chine (13s) : régulation secteur par secteur, contrôle étatique
export const China = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background accent={COLORS.cnRed} />
      <RegionHeader
        flag={<CNFlag width={300} />}
        name="CHINE"
        badge="Contrôle étatique"
        badgeColor={COLORS.cnGold}
      />

      {/* Chips secteurs régulés un par un */}
      <div
        style={{
          position: 'absolute',
          top: 660,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 54,
            color: COLORS.white,
            marginBottom: 6,
            letterSpacing: 2,
            opacity: interpolate(frame, [40, 55], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          SECTEUR PAR SECTEUR
        </div>
        {SECTORS.map((sec) => {
          const s = spring({
            frame: frame - sec.delay,
            fps,
            config: {damping: 12, stiffness: 210, mass: 0.5},
          });
          const checkS = spring({
            frame: frame - sec.delay - 10,
            fps,
            config: {damping: 9, stiffness: 300, mass: 0.4},
          });
          return (
            <div
              key={sec.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 26,
                background: 'rgba(255,45,45,0.16)',
                border: '2px solid rgba(255,210,77,0.45)',
                borderRadius: 22,
                padding: '18px 44px',
                width: 720,
                justifyContent: 'space-between',
                transform: `translateX(${(1 - s) * 500}px)`,
                opacity: s,
              }}
            >
              <span
                style={{
                  fontFamily: FONT_TEXT,
                  fontWeight: 800,
                  fontSize: 44,
                  color: COLORS.white,
                }}
              >
                {sec.label}
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  transform: `scale(${checkS})`,
                }}
              >
                <span
                  style={{
                    fontFamily: FONT_TEXT,
                    fontWeight: 800,
                    fontSize: 34,
                    color: '#2ee66b',
                  }}
                >
                  régulé
                </span>
                <Check />
              </div>
            </div>
          );
        })}
      </div>

      {/* Jauges contrôle vs transparence */}
      <div
        style={{
          position: 'absolute',
          top: 1270,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 34,
        }}
      >
        <Meter
          label="Contrôle de l'État"
          pct={92}
          color={COLORS.cnGold}
          delay={170}
          frame={frame}
          fps={fps}
        />
        <Meter
          label="Transparence publique"
          pct={18}
          color={COLORS.red}
          delay={195}
          frame={frame}
          fps={fps}
        />
      </div>

      <Caption from={20} to={150}>
        La Chine régule <Hl color={COLORS.cnGold}>secteur par secteur</Hl>, de
        façon centralisée
      </Caption>
      <Caption from={155} to={270}>
        Un contrôle étatique <Hl color={COLORS.cnGold}>très fort</Hl>…
      </Caption>
      <Caption from={275} to={385}>
        … mais très peu de <Hl color={COLORS.red}>transparence publique</Hl>
      </Caption>

      <AbsoluteFill
        style={{
          background: '#000',
          opacity: interpolate(frame, [378, 390], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
