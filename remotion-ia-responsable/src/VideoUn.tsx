import React from "react";
import { AbsoluteFill } from "remotion";
import {
  TransitionSeries,
  linearTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";

// Polices reelles chargees via @remotion/google-fonts.
import { loadFont as loadTitle } from "@remotion/google-fonts/BricolageGrotesque";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";

import { SCENE_DURATIONS, TRANSITION } from "./timeline";
import { THEME } from "./theme";

import { Accroche } from "./scenes/Accroche";
import { BlocUE } from "./scenes/BlocUE";
import { BlocUSA } from "./scenes/BlocUSA";
import { BlocChine } from "./scenes/BlocChine";
import { EffetBruxelles } from "./scenes/EffetBruxelles";
import { Dilemme } from "./scenes/Dilemme";
import { Chute } from "./scenes/Chute";

// Chargement des familles (poids utilises dans le montage).
loadTitle("normal", { weights: ["700", "800"] });
loadBody("normal", { weights: ["400", "600", "700"] });

const crossfade = () =>
  linearTiming({ durationInFrames: TRANSITION });

export const VideoUn: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bgDeep }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.Accroche}>
          <Accroche />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={crossfade()}
        />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.BlocUE}>
          <BlocUE />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={crossfade()}
        />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.BlocUSA}>
          <BlocUSA />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={crossfade()}
        />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.BlocChine}>
          <BlocChine />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={crossfade()}
        />

        <TransitionSeries.Sequence
          durationInFrames={SCENE_DURATIONS.EffetBruxelles}
        >
          <EffetBruxelles />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={crossfade()}
        />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.Dilemme}>
          <Dilemme />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={crossfade()}
        />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.Chute}>
          <Chute />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
