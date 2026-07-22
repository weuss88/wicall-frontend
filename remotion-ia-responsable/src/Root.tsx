import React from "react";
import { Composition } from "remotion";
import { VideoUn } from "./VideoUn";
import { FPS, WIDTH, HEIGHT, TOTAL_DURATION } from "./timeline";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoUn"
        component={VideoUn}
        durationInFrames={TOTAL_DURATION} // 2100 = 70 s
        fps={FPS}
        width={WIDTH} // 1080
        height={HEIGHT} // 1920 (vertical)
      />
    </>
  );
};
