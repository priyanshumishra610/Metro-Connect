import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors, palette } from '@/constants/colors';

export interface CommuterCrowdIllustrationProps {
  width?: number;
  height?: number;
  /** Indices (into the fixed 9-figure grid) that should render highlighted instead of anonymous grey. */
  highlighted?: number[];
  /** Draw connecting lines between highlighted figures. */
  showConnections?: boolean;
}

const ACCENTS = [palette.blue, palette.cyan, palette.orange, palette.pink];

// Fixed 3x3 grid of stylized commuter silhouettes riding inside a train
// window frame — an original, authored scene (never a stock photo or a
// real transit operator's imagery) that carries screens 1–3 of onboarding.
const POSITIONS = [
  { x: 48, y: 92 }, { x: 116, y: 78 }, { x: 184, y: 96 },
  { x: 60, y: 150 }, { x: 130, y: 140 }, { x: 200, y: 154 },
  { x: 40, y: 206 }, { x: 118, y: 198 }, { x: 196, y: 210 },
];

export function CommuterCrowdIllustration({
  width = 240,
  height = 260,
  highlighted = [],
  showConnections = false,
}: CommuterCrowdIllustrationProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 240 260">
      <Rect x={4} y={4} width={232} height={252} rx={28} fill={colors.card} stroke={colors.border} strokeWidth={2} />

      {showConnections &&
        highlighted.slice(0, -1).map((idx, i) => {
          const a = POSITIONS[idx];
          const b = POSITIONS[highlighted[i + 1]];
          if (!a || !b) return null;
          return (
            <Path
              key={`link-${idx}`}
              d={`M${a.x} ${a.y - 10} L${b.x} ${b.y - 10}`}
              stroke={palette.cyan}
              strokeWidth={1.5}
              strokeDasharray="3 5"
              strokeLinecap="round"
              opacity={0.7}
            />
          );
        })}

      {POSITIONS.map((pos, i) => {
        const isHighlighted = highlighted.includes(i);
        const accent = ACCENTS[i % ACCENTS.length];
        const fill = isHighlighted ? accent : colors.border;
        return (
          <React.Fragment key={i}>
            <Circle cx={pos.x} cy={pos.y - 22} r={14} fill={fill} opacity={isHighlighted ? 1 : 0.55} />
            <Path
              d={`M${pos.x - 20} ${pos.y + 20} Q${pos.x} ${pos.y - 14} ${pos.x + 20} ${pos.y + 20} Z`}
              fill={fill}
              opacity={isHighlighted ? 1 : 0.55}
            />
          </React.Fragment>
        );
      })}
    </Svg>
  );
}
