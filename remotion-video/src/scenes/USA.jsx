import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Background, Caption, Hl, RegionHeader} from '../components/UI.jsx';
import {USFlag} from '../components/Flags.jsx';
import {COLORS, FONT, FONT_TEXT} from '../theme.js';

// Scène 3 — États-Unis (13s) : dérégulation, vitesse avant tout
export const USA = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const docS = spring({
    frame: frame - 50,
    fps,
    config: {damping: 13, stiffness: 180},
  });
  const stampS = spring({
    frame: frame - 110,
    fps,
    config: {damping: 8, stiffness: 320, mass: 0.5},
  });
  const shake =
    frame > 110 && frame < 122 ? Math.sin(frame * 3.5) * (122 - frame) : 0;

  const speedS = spring({
    frame: frame - 200,
    fps,
    config: {damping: 12, stiffness: 160},
  });
  const needle = interpolate(
    spring({frame: frame - 210, fps, config: {damping: 14, stiffness: 60}}),
    [0, 1],
    [-80, 78]
  );

  return (
    <AbsoluteFill>
      <Background accent={COLORS.usRed} />
      <RegionHeader
        flag={<USFlag width={300} />}
        name="ÉTATS-UNIS"
        badge="Dérégulation totale"
        badgeColor={COLORS.usRed}
      />

      {/* Document "cadre fédéral" + tampon SUPPRIMÉ */}
      <div
        style={{
          position: 'absolute',
          top: 660,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          transform: `translateX(${shake}px)`,
        }}
      >
        <div
          style={{
            width: 520,
            background: '#f4f1e8',
            borderRadius: 18,
            padding: '36px 40px',
            transform: `scale(${docS}) rotate(${(1 - docS) * 8 - 2}deg)`,
            opacity: docS,
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            position: 'relative',
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 40,
              color: '#222',
              textAlign: 'center',
              marginBottom: 22,
            }}
          >
            CADRE FÉDÉRAL IA
          </div>
          {[0.95, 0.8, 0.9, 0.6, 0.85, 0.7].map((w, i) => (
            <div
              key={i}
              style={{
                height: 14,
                width: `${w * 100}%`,
                background: '#c9c4b4',
                borderRadius: 7,
                marginBottom: 14,
              }}
            />
          ))}
          {/* Tampon */}
          <div
            style={{
              position: 'absolute',
              top: '38%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(-14deg) scale(${stampS * 1.15})`,
              border: '8px solid #c1121f',
              color: '#c1121f',
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 66,
              padding: '10px 30px',
              borderRadius: 12,
              letterSpacing: 3,
              opacity: stampS,
              background: 'rgba(255,255,255,0.6)',
            }}
          >
            SUPPRIMÉ
          </div>
        </div>
      </div>

      {/* Compteur de vitesse */}
      <div
        style={{
          position: 'absolute',
          top: 1120,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          transform: `scale(${speedS})`,
          opacity: speedS,
        }}
      >
        <svg width={420} height={240} viewBox="0 0 420 240">
          <path
            d="M40 220 A170 170 0 0 1 380 220"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={26}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M40 220 A170 170 0 0 1 380 220"
            stroke="url(#speedGrad)"
            strokeWidth={26}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={534}
            strokeDashoffset={interpolate(needle, [-80, 78], [534, 40])}
          />
          <defs>
            <linearGradient id="speedGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="100%" stopColor="#ff3b30" />
            </linearGradient>
          </defs>
          <g transform={`rotate(${needle} 210 220)`}>
            <rect x={206} y={80} width={8} height={140} rx={4} fill="#fff" />
          </g>
          <circle cx={210} cy={220} r={20} fill="#fff" />
        </svg>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 64,
            color: COLORS.white,
            letterSpacing: 2,
          }}
        >
          PRIORITÉ : <span style={{color: COLORS.usRed}}>VITESSE</span>
        </div>
        <div
          style={{
            fontFamily: FONT_TEXT,
            fontWeight: 700,
            fontSize: 38,
            color: COLORS.muted,
          }}
        >
          Innover d'abord, encadrer (peut-être) ensuite
        </div>
      </div>

      <Caption from={20} to={140}>
        Les USA ont <Hl color={COLORS.usRed}>supprimé</Hl> leur précédent cadre
        fédéral
      </Caption>
      <Caption from={145} to={270}>
        Le pari : une <Hl color={COLORS.usRed}>dérégulation quasi totale</Hl>
      </Caption>
      <Caption from={275} to={385}>
        Objectif : aller <Hl color={COLORS.yellow}>plus vite</Hl> que tout le
        monde
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
