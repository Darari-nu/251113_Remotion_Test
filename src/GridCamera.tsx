import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {useMemo} from 'react';
import {z} from 'zod';

export const gridCameraSchema = z.object({
  text: z.string().min(1, '1文字以上入力してね').describe('本文'),
  tileColor: z.string().default('#111').describe('タイル色'),
  activeTileColor: z.string().default('#000').describe('アクティブ色'),
  textColor: z.string().default('#000').describe('文字色'),
  columns: z.number().min(1).max(40).default(12).describe('1列あたりの最大文字数'),
  tileSize: z.number().min(20).max(260).default(140).describe('文字サイズ(px)'),
  gap: z.number().min(0).max(120).default(40).describe('文字間隔(px)'),
});

export type GridCameraProps = z.infer<typeof gridCameraSchema>;

const FRAMES_PER_CHAR = 20;
const CAMERA_SPRING = {damping: 16, stiffness: 210, mass: 0.8};

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const isKanji = (char: string) => /[\u4E00-\u9FFF]/.test(char);
const isHiragana = (char: string) => /[\u3040-\u309F]/.test(char);

export type CharData = {
  char: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
};

const layoutChars = (text: string, maxRows: number, size: number, gap: number) => {
  const chars = Array.from(text);
  const step = size + gap;
  const data: CharData[] = [];
  let column = 0;
  let row = 0;

  chars.forEach((char, index) => {
    if (char === '\n') {
      column += 1;
      row = 0;
      return;
    }
    const x = -column * step;
    const y = row * step;

    let scale = 1;
    if (isKanji(char)) scale = 1.8 + seededRandom(index + 1) * 0.7;
    else if (isHiragana(char)) scale = 0.7 + seededRandom(index + 13) * 0.2;
    else scale = 1 + seededRandom(index + 23) * 0.4;

    const rotation = (seededRandom(index + 37) - 0.5) * 10;
    data.push({char, x, y, rotation, scale});

    row += 1;
    if (row >= maxRows) {
      column += 1;
      row = 0;
    }
  });

  return data;
};

const NoiseLayer: React.FC<{count: number; spread: number; heightStep: number}> = ({
  count,
  spread,
  heightStep,
}) => {
  const bars = useMemo(
    () =>
      Array.from({length: count}).map((_, i) => ({
        x: (seededRandom(i + 101) - 0.5) * spread,
        y: seededRandom(i + 202) * spread * 0.8,
        width: 6 + seededRandom(i + 303) * 40,
        height: heightStep * (0.5 + seededRandom(i + 404) * 3),
        rotate: seededRandom(i + 505) * 180,
        opacity: 0.05 + seededRandom(i + 606) * 0.25,
      })),
    [count, spread, heightStep],
  );

  return (
    <div>
      {bars.map((bar, i) => (
        <div
          key={`noise-${i}`}
          style={{
            position: 'absolute',
            left: bar.x,
            top: bar.y,
            width: bar.width,
            height: bar.height,
            backgroundColor: 'rgba(0,0,0,0.15)',
            opacity: bar.opacity,
            transform: `rotate(${bar.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
};

export const GridCamera: React.FC<GridCameraProps> = ({
  text,
  tileColor,
  activeTileColor,
  textColor,
  columns,
  tileSize,
  gap,
}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const chars = useMemo(() => layoutChars(text, columns, tileSize, gap), [text, columns, tileSize, gap]);

  if (chars.length === 0) {
    return <AbsoluteFill style={{backgroundColor: '#fff'}} />;
  }

  const targetIndex = Math.min(chars.length - 1, Math.floor(frame / FRAMES_PER_CHAR));
  const targetChar = chars[targetIndex];
  const targetX = targetChar.x;
  const targetY = targetChar.y;

  const cameraX = spring({frame, fps, config: CAMERA_SPRING, to: targetX});
  const cameraY = spring({frame, fps, config: CAMERA_SPRING, to: targetY});

  const zoomTarget = targetChar.char.match(/[A-Z]/i) ? 1.6 : 1.1;
  const cameraZoom = spring({frame, fps, config: CAMERA_SPRING, to: zoomTarget});
  const cameraAngle = spring({frame, fps, config: CAMERA_SPRING, to: (Math.floor(targetIndex / 4) % 2 === 0 ? 15 : -15)});

  const transform = `translate(${width / 2}px, ${height / 2}px)
    rotate(${-cameraAngle}deg)
    scale(${cameraZoom})
    translate(${-cameraX}px, ${-cameraY}px)`;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#f4f4f4',
        fontFamily: '"Shippori Mincho", "Noto Serif JP", serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          transform,
          willChange: 'transform',
        }}
      >
        <NoiseLayer count={50} spread={Math.max(width, height) * 2} heightStep={tileSize + gap} />
        {chars.map((charData, idx) => {
          const isActive = idx === targetIndex;
          return (
            <div
              key={`${charData.char}-${idx}`}
              style={{
                position: 'absolute',
                left: charData.x,
                top: charData.y,
                transform: `translate(-50%, -50%) scale(${charData.scale}) rotate(${charData.rotation}deg)`,
                color: isActive ? activeTileColor : textColor,
                fontSize: tileSize,
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {charData.char}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const gridCameraDefaultProps: GridCameraProps = {
  text: 'Crypto\nNinja\nCoffee\nTime',
  tileColor: '#000',
  activeTileColor: '#000',
  textColor: '#000',
  columns: 10,
  tileSize: 140,
  gap: 60,
};
