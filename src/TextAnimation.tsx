import type {CSSProperties} from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';

const DROP_DISTANCE_PERCENT = 100;
const RANDOM_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*@!?';
const fontPresetOptions = ['モダンゴシック', 'シネマサンセリフ', 'サイバーモノ', 'クラシックセリフ'] as const;

const hexColor = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const textAnimationSchema = z.object({
  テキスト設定: z
    .object({
      本文: z
        .string()
        .min(1, '1文字以上入力してね')
        .max(32, '最大32文字までよ')
        .describe('表示テキスト'),
    })
    .describe('① テキスト設定'),
  ビジュアル調整: z
    .object({
      背景色: z
        .string()
        .regex(hexColor, 'HEXカラー (#RRGGBB) を入力してね')
        .describe('背景色'),
      文字色: z
        .string()
        .regex(hexColor, 'HEXカラー (#RRGGBB) を入力してね')
        .describe('文字色'),
      フォントサイズ: z
        .number()
        .min(24, '24px以上にしてね')
        .max(260, '260pxまでよ')
        .describe('フォントサイズ(px)'),
      フォントスタイル: z.enum(fontPresetOptions).describe('フォントプリセット'),
    })
    .describe('② ビジュアル調整'),
  アニメーション設定: z
    .object({
      出現スピード: z
        .number()
        .min(10, '10フレーム以上にしてね')
        .max(90, '90フレーム以内でお願いね')
        .describe('出現スピード（フレーム数）'),
      ずらしフレーム数: z
        .number()
        .min(1, '1フレーム以上にしてね')
        .max(24, '24フレーム以内でね')
        .describe('ずらしフレーム数'),
      震え幅: z
        .number()
        .min(0, '0以上にしてね')
        .max(40, '最大40pxまでよ')
        .describe('震え幅(px)'),
      震えスピード: z
        .number()
        .min(0, '0以上にしてね')
        .max(2, '最大2.0までよ')
        .describe('震えスピード(係数)'),
      スプリング質量: z
        .number()
        .min(0.1, '0.1以上にしてね')
        .max(5, '5までにしてね')
        .describe('スプリング質量'),
      スプリング減衰: z
        .number()
        .min(5, '5以上にしてね')
        .max(40, '40までにしてね')
        .describe('スプリング減衰'),
      スプリング剛性: z
        .number()
        .min(20, '20以上にしてね')
        .max(300, '300までにしてね')
        .describe('スプリング剛性'),
    })
    .describe('③ アニメーション設定'),
  エフェクト設定: z
    .object({
      デコードフレーム数: z
        .number()
        .min(0, '0以上にしてね')
        .max(30, '30フレームまでよ')
        .describe('デコード演出フレーム数'),
      ブラー強度: z
        .number()
        .min(0, '0以上にしてね')
        .max(40, '40pxまでよ')
        .describe('ブラー量(px)'),
      ブラー拡大率: z
        .number()
        .min(1, '1以上にしてね')
        .max(2, '2までにしてね')
        .describe('ブラー時の拡大率'),
      フリップ有効: z.boolean().describe('3DフリップON/OFF'),
      フリップ遅延: z
        .number()
        .min(0, '0以上にしてね')
        .max(20, '20フレームまでよ')
        .describe('フリップ追加遅延(フレーム)'),
    })
    .describe('④ エフェクト設定'),
});

export type TextAnimationProps = z.infer<typeof textAnimationSchema>;
type FontPreset = (typeof fontPresetOptions)[number];

const FONT_PRESETS: Record<FontPreset, string> = {
  モダンゴシック: '"Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
  シネマサンセリフ: '"Oswald", "Arial Narrow", "Noto Sans JP", sans-serif',
  サイバーモノ: '"Roboto Mono", "IBM Plex Mono", "SFMono-Regular", monospace',
  クラシックセリフ: '"Times New Roman", "Noto Serif JP", "Yu Mincho", serif',
};

export const textAnimationDefaultProps: TextAnimationProps = {
  テキスト設定: {
    本文: 'Crypto Ninja Coffee Time',
  },
  ビジュアル調整: {
    背景色: '#C48F00',
    文字色: '#FFFFFF',
    フォントサイズ: 110,
    フォントスタイル: 'モダンゴシック',
  },
  アニメーション設定: {
    出現スピード: 10,
    ずらしフレーム数: 3,
    震え幅: 0,
    震えスピード: 2,
    スプリング質量: 1,
    スプリング減衰: 5,
    スプリング剛性: 20,
  },
  エフェクト設定: {
    デコードフレーム数: 12,
    ブラー強度: 20,
    ブラー拡大率: 1.4,
    フリップ有効: true,
    フリップ遅延: 2,
  },
};

const textWrapperStyle = (
  fontSize: number,
  fontColor: string,
  fontFamily: string,
): CSSProperties => ({
  display: 'inline-flex',
  gap: Math.round(fontSize * 0.08),
  fontFamily,
  fontWeight: 800,
  fontSize,
  color: fontColor,
  textTransform: 'none',
  letterSpacing: Math.round(fontSize * 0.025),
  textShadow: '0 14px 24px rgba(0,0,0,0.35)',
  lineHeight: 1.3,
  overflow: 'visible',
  paddingBottom: Math.round(fontSize * 0.08),
  verticalAlign: 'baseline',
  fontVariantLigatures: 'none',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
});

export const TextAnimation: React.FC<TextAnimationProps> = (props) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const textSetting = props['テキスト設定'];
  const appearance = props['ビジュアル調整'];
  const animation = props['アニメーション設定'];
  const effect = props['エフェクト設定'];
  const text = textSetting.本文;
  const backgroundColor = appearance.背景色;
  const fontColor = appearance.文字色;
  const fontSize = appearance.フォントサイズ;
  const fontPreset = appearance.フォントスタイル;
  const fontFamily = FONT_PRESETS[fontPreset] ?? FONT_PRESETS['モダンゴシック'];
  const entryDuration = animation.出現スピード;
  const staggerFrames = animation.ずらしフレーム数;
  const shakeAmplitude = animation.震え幅;
  const shakeFrequency = animation.震えスピード;
  const springMass = animation.スプリング質量;
  const springDamping = animation.スプリング減衰;
  const springStiffness = animation.スプリング剛性;
  const scrambleFrames = effect.デコードフレーム数;
  const blurStrength = effect.ブラー強度;
  const blurScale = effect.ブラー拡大率;
  const flipEnabled = effect.フリップ有効;
  const flipDelay = effect.フリップ遅延;
  const characters = Array.from(text);

  const getScrambledChar = (original: string, currentFrame: number, startFrame: number) => {
    if (scrambleFrames <= 0) {
      return original;
    }
    if (currentFrame < startFrame) {
      return ' ';
    }
    if (currentFrame - startFrame >= scrambleFrames) {
      return original;
    }
    const seed =
      Math.sin((currentFrame - startFrame + 1) * 17.23 + startFrame * 131 + original.charCodeAt(0)) *
      10000;
    const index = Math.abs(Math.floor(seed)) % RANDOM_CHARSET.length;
    return RANDOM_CHARSET.charAt(index);
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          ...textWrapperStyle(fontSize, fontColor, fontFamily),
          perspective: 1000,
          transformStyle: 'preserve-3d',
        }}
      >
        {characters.map((char, index) => {
          if (char === ' ') {
            return (
              <span
                key={`space-${index}`}
                style={{
                  display: 'inline-block',
                  width: Math.max(fontSize * 0.2, 10),
                  lineHeight: 1.3,
                  paddingBottom: Math.max(fontSize * 0.08, 6),
                }}
              />
            );
          }
          const charDelay = index * staggerFrames;
          const progress = spring({
            frame,
            fps,
            config: {
              damping: springDamping,
              stiffness: springStiffness,
              mass: springMass,
            },
            durationInFrames: entryDuration,
            delay: charDelay,
          });

          const translateY = (1 - progress) * DROP_DISTANCE_PERCENT;
          const shake =
            shakeAmplitude *
            Math.sin((frame + index * 4) * (Math.PI / 15) * shakeFrequency);
          const flipProgress = flipEnabled
            ? spring({
                frame,
                fps,
                config: {
                  damping: springDamping + 5,
                  stiffness: springStiffness + 40,
                  mass: springMass,
                },
                durationInFrames: entryDuration,
                delay: charDelay + flipDelay,
              })
            : 1;
          const rotateX = flipEnabled ? (1 - flipProgress) * 90 : 0;
          const blurValue = blurStrength > 0 ? blurStrength * (1 - progress) : 0;
          const scaleValue = blurStrength > 0 ? blurScale - (blurScale - 1) * progress : 1;
          const opacity = blurStrength > 0 ? progress : 1;
          const displayChar = getScrambledChar(char, frame, charDelay);

          return (
            <span
              key={`${char}-${index}`}
              style={{
                display: 'inline-flex',
                overflow: 'hidden',
                height: '1.25em',
                lineHeight: 1.3,
                paddingBottom: Math.max(fontSize * 0.08, 6),
                verticalAlign: 'baseline',
              }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    transform: `translate(${shake}px, ${translateY}%) scale(${scaleValue}) rotateX(${rotateX}deg)`,
                    transformOrigin: 'bottom',
                    lineHeight: 1.3,
                    filter: `blur(${blurValue}px)`,
                    opacity,
                    fontFamily:
                      blurStrength > 0
                        ? '"Roboto Mono", "Noto Sans JP", monospace'
                        : fontFamily,
                  }}
                >
                  {displayChar}
                </span>
              </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
