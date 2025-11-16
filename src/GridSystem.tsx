import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';

type TileData = {
  text: string;
  x: number;
  y: number;
  index: number;
  variation: 'zoom' | 'rotate' | null;
};

type GridSystemProps = {
  words: string[];
  columns?: number;
  tileSize?: number;
  gap?: number;
  wordHoldFrames?: number;
  variationIntensity?: number;
};

const layoutWords = (
  words: string[],
  columns: number,
  tileSize: number,
  gap: number,
): TileData[] => {
  const tiles: TileData[] = [];
  const cellWidth = tileSize + gap;
  const cellHeight = tileSize + gap;
  words.forEach((text, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = col * cellWidth;
    const y = row * cellHeight;
    let variation: TileData['variation'] = null;
    if (index % 3 === 0) {
      variation = 'zoom';
    } else if (index % 5 === 0) {
      variation = 'rotate';
    }
    tiles.push({text, x, y, index, variation});
  });
  return tiles;
};

export const GridSystem: React.FC<GridSystemProps> = ({
  words,
  columns = 3,
  tileSize = 140,
  gap = 60,
  wordHoldFrames = 30,
  variationIntensity = 0.15,
}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const tiles = layoutWords(words, columns, tileSize, gap);
  if (tiles.length === 0) {
    return <AbsoluteFill style={{backgroundColor: '#050505'}} />;
  }

  const activeIndex = Math.min(tiles.length - 1, Math.floor(frame / wordHoldFrames));
  const activeTile = tiles[activeIndex];
  const cameraTargetX = activeTile.x + tileSize / 2;
  const cameraTargetY = activeTile.y + tileSize / 2;

  const springConfig = {damping: 20, stiffness: 180, mass: 0.8};
  const cameraX = spring({frame, fps, config: springConfig, to: cameraTargetX});
  const cameraY = spring({frame, fps, config: springConfig, to: cameraTargetY});

  const viewOffsetX = cameraX - width / 2;
  const viewOffsetY = cameraY - height / 2;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#050505',
        overflow: 'hidden',
        fontFamily: '"Inter", "Noto Sans JP", sans-serif',
        color: '#fff',
      }}
    >
      <div
        style={{
          position: 'absolute',
          transform: `translate3d(${-viewOffsetX}px, ${-viewOffsetY}px, 0)`,
          transition: 'transform 0.2s',
        }}
      >
        {tiles.map((tile) => {
          const isActive = tile.index === activeIndex;
          const variationScale =
            tile.variation === 'zoom' ? 1 + variationIntensity : 1;
          const variationRotate =
            tile.variation === 'rotate' ? variationIntensity * 20 : 0;
          const accentScale = isActive ? 1.15 : variationScale;
          const accentOpacity = isActive ? 1 : 0.65;
          return (
            <div
              key={`${tile.text}-${tile.index}`}
              style={{
                position: 'absolute',
                left: tile.x,
                top: tile.y,
                width: tileSize,
                height: tileSize,
                borderRadius: 24,
                border: isActive ? '3px solid #ffef5c' : '2px solid rgba(255,255,255,0.25)',
                background: isActive
                  ? 'linear-gradient(145deg, #2d2d2d, #181818)'
                  : 'rgba(18,18,18,0.8)',
                boxShadow: isActive
                  ? '0 20px 50px rgba(0,0,0,0.45)'
                  : '0 10px 25px rgba(0,0,0,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: tileSize * 0.35,
                fontWeight: 700,
                textAlign: 'center',
                transform: `scale(${accentScale}) rotate(${variationRotate}deg)`,
                transition: 'transform 0.25s ease-out',
                opacity: accentOpacity,
              }}
            >
              {tile.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const layoutWordsForGrid = layoutWords;
