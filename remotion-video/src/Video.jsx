import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Hook} from './scenes/Hook.jsx';
import {Europe} from './scenes/Europe.jsx';
import {USA} from './scenes/USA.jsx';
import {China} from './scenes/China.jsx';
import {Recap} from './scenes/Recap.jsx';
import {ProgressBar, Watermark} from './components/UI.jsx';

export const FPS = 30;

// Timeline (en frames, 30 fps) — total 58s
const HOOK = 150; //  5s
const EUROPE = 420; // 14s
const USA_D = 390; // 13s
const CHINA = 390; // 13s
const RECAP = 390; // 13s

export const TOTAL_DURATION = HOOK + EUROPE + USA_D + CHINA + RECAP;

export const Main = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#07090f'}}>
      <Sequence durationInFrames={HOOK}>
        <Hook />
      </Sequence>
      <Sequence from={HOOK} durationInFrames={EUROPE}>
        <Europe />
      </Sequence>
      <Sequence from={HOOK + EUROPE} durationInFrames={USA_D}>
        <USA />
      </Sequence>
      <Sequence from={HOOK + EUROPE + USA_D} durationInFrames={CHINA}>
        <China />
      </Sequence>
      <Sequence from={HOOK + EUROPE + USA_D + CHINA} durationInFrames={RECAP}>
        <Recap />
      </Sequence>

      <ProgressBar />
      <Watermark />
    </AbsoluteFill>
  );
};
