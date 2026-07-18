import React from 'react';
import {Composition} from 'remotion';
import {Main, TOTAL_DURATION, FPS} from './Video.jsx';

export const RemotionRoot = () => {
  return (
    <Composition
      id="RegulationIA"
      component={Main}
      durationInFrames={TOTAL_DURATION}
      fps={FPS}
      width={1080}
      height={1920}
    />
  );
};
