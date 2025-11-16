import type {CSSProperties} from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {GridSystem} from './GridSystem';
import {z} from 'zod';

const DROP_DISTANCE_PERCENT = 160;
const RANDOM_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*@!?';
const fontPresetOptions = ['モダンゴシック', 'シネマサンセリフ', 'サイバーモノ', 'クラシックセリフ'] as const;

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

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
      デコード: z
        .object({
          有効: z.boolean().describe('デコードON/OFF'),
          フレーム数: z
            .number()
            .min(0, '0以上にしてね')
            .max(30, '30フレームまでよ')
            .describe('デコード演出フレーム数'),
        })
        .describe('④-1 デコード（解読エフェクト）'),
      ブラーイン: z
        .object({
          有効: z.boolean().describe('ブラーインON/OFF'),
          強度: z
            .number()
            .min(0, '0以上にしてね')
            .max(40, '40pxまでよ')
            .describe('ブラー量(px)'),
          拡大率: z
            .number()
            .min(1, '1以上にしてね')
            .max(2, '2までにしてね')
            .describe('ブラー時の拡大率'),
        })
        .describe('④-2 ブラーイン（ぼかし着地）'),
      フリップ: z
        .object({
          有効: z.boolean().describe('3DフリップON/OFF'),
          追加遅延: z
            .number()
            .min(0, '0以上にしてね')
            .max(20, '20フレームまでよ')
            .describe('フリップ追加遅延(フレーム)'),
        })
        .describe('④-3 フリップ（3D起き上がり）'),
      スイング: z
        .object({
          有効: z.boolean().describe('ぶらさがりON/OFF'),
          初期高さ: z
            .number()
            .min(50, '50px以上にしてね')
            .max(400, '400pxまでよ')
            .describe('開始高さ(px)'),
          横揺れ幅: z
            .number()
            .min(0, '0以上にしてね')
            .max(20, '20pxまでよ')
            .describe('横揺れ幅(px)'),
          縦揺れ幅: z
            .number()
            .min(0, '0以上にしてね')
            .max(40, '40pxまでよ')
            .describe('縦揺れ幅(px)'),
          揺れ減衰: z
            .number()
            .min(5, '5以上にしてね')
            .max(60, '60までよ')
            .describe('揺れ減衰（大きいほどゆっくり）'),
          質量: z
            .number()
            .min(0.5, '0.5以上にしてね')
            .max(3, '3までにしてね')
            .describe('スプリング質量'),
          減衰: z
            .number()
            .min(4, '4以上にしてね')
            .max(15, '15までにしてね')
            .describe('スプリング減衰'),
          剛性: z
            .number()
            .min(15, '15以上にしてね')
            .max(60, '60までにしてね')
            .describe('スプリング剛性'),
          配置ランダム幅: z
            .number()
            .min(0, '0以上にしてね')
            .max(200, '200pxまでよ')
            .describe('縦位置ランダム幅(px)'),
        })
        .describe('④-4 スイング（糸で吊られる動き）'),
      グリッド演出: z
        .object({
          有効: z.boolean().describe('グリッド演出ON/OFF'),
          単語リスト: z
            .array(z.string().min(1))
            .min(1, '1単語以上必要よ')
            .describe('表示する単語配列'),
          列数: z
            .number()
            .min(1, '1列以上にしてね')
            .max(8, '8列までよ')
            .describe('列数'),
          タイルサイズ: z
            .number()
            .min(60, '60px以上にしてね')
            .max(240, '240pxまでよ')
            .describe('タイルサイズ(px)'),
          タイル間隔: z
            .number()
            .min(0, '0以上にしてね')
            .max(200, '200pxまでよ')
            .describe('タイル間隔(px)'),
          表示フレーム: z
            .number()
            .min(5, '5フレーム以上にしてね')
            .max(180, '180フレームまでよ')
            .describe('単語1つを追うフレーム数'),
          バリエーション強度: z
            .number()
            .min(0, '0以上にしてね')
            .max(0.5, '0.5までよ')
            .describe('ズーム/回転の強さ'),
        })
        .describe('④-5 グリッド演出（TextAlive風）'),
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
    デコード: {
      有効: true,
      フレーム数: 12,
    },
    ブラーイン: {
      有効: true,
      強度: 20,
      拡大率: 1.4,
    },
    フリップ: {
      有効: true,
      追加遅延: 2,
    },
    スイング: {
      有効: true,
      初期高さ: 220,
      横揺れ幅: 5,
      縦揺れ幅: 18,
      揺れ減衰: 22,
      質量: 1.2,
      減衰: 7,
      剛性: 32,
      配置ランダム幅: 60,
    },
    グリッド演出: {
      有効: false,
      単語リスト: ['風', 'に', 'さら', 'わ', 'れ', '夜', 'を', '裂く'],
      列数: 3,
      タイルサイズ: 150,
      タイル間隔: 60,
      表示フレーム: 24,
      バリエーション強度: 0.18,
    },
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
  const {fps, height: videoHeight} = useVideoConfig();
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
  const decodeEffect = effect.デコード;
  const blurEffect = effect.ブラーイン;
  const flipEffect = effect.フリップ;
  const swingEffect = effect.スイング;
  const scrambleFrames = decodeEffect?.有効 ? decodeEffect.フレーム数 : 0;
  const blurStrength = blurEffect?.有効 ? blurEffect.強度 : 0;
  const blurScale = blurEffect?.有効 ? blurEffect.拡大率 : 1;
  const flipEnabled = flipEffect?.有効 ?? false;
  const flipDelay = flipEffect?.追加遅延 ?? 0;
  const swingEnabled = swingEffect?.有効 ?? false;
  const swingVariance = swingEnabled ? swingEffect?.配置ランダム幅 ?? 0 : 0;
  const gridEffect = effect.グリッド演出;
  if (gridEffect?.有効 && (gridEffect.単語リスト?.length ?? 0) > 0) {
    return (
      <GridSystem
        words={gridEffect.単語リスト}
        columns={gridEffect.列数}
        tileSize={gridEffect.タイルサイズ}
        gap={gridEffect.タイル間隔}
        wordHoldFrames={gridEffect.表示フレーム}
        variationIntensity={gridEffect.バリエーション強度}
      />
    );
  }

  const characters = Array.from(text).map((char, index) => ({
    char,
    variance:
      swingVariance > 0
        ? (seededRandom(index + 1) - 0.5) * 2 * swingVariance
        : 0,
  }));
  const verticalOffset = swingEnabled ? videoHeight * 0.2 : 0;

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
        justifyContent: swingEnabled ? 'flex-start' : 'center',
        alignItems: 'center',
        paddingTop: swingEnabled ? videoHeight * 0.05 : 0,
      }}
    >
      <div
        style={{
          ...textWrapperStyle(fontSize, fontColor, fontFamily),
          perspective: 1000,
          transformStyle: 'preserve-3d',
          transform: swingEnabled ? `translateY(${-verticalOffset}px)` : undefined,
        }}
      >
        {characters.map(({char, variance}, index) => {
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

          let translateYPx: number;
          let dropDistance = videoHeight / 2 + fontSize * 1.5;
          let swingXOffset = 0;
          let swingOpacity = 1;
          if (swingEnabled) {
            const dropSpringRaw = spring({
              frame,
              fps,
              config: {
                damping: swingEffect.減衰,
                stiffness: swingEffect.剛性,
                mass: swingEffect.質量,
              },
              durationInFrames: Math.max(
                entryDuration * 2,
                Math.floor(swingEffect.揺れ減衰 / 2),
              ),
              delay: charDelay,
            });
            const dropSpring = Math.min(Math.max(dropSpringRaw, 0), 1);
            const screenOffset = videoHeight / 2 + fontSize;
            dropDistance = Math.max(swingEffect.初期高さ, screenOffset);
            const dropPosition = -dropDistance + dropSpring * dropDistance;
            const hangFrames = Math.max(0, frame - (charDelay + entryDuration));
            const decay = Math.exp(-hangFrames / swingEffect.揺れ減衰);
            const swingYOffset = swingEffect.縦揺れ幅 * decay * Math.sin((frame + index * 4) * 0.12);
            swingXOffset = swingEffect.横揺れ幅 * decay * Math.sin((frame + index * 6) * 0.1);
            translateYPx = dropPosition + swingYOffset;
            swingOpacity = Math.min(1, dropSpring + 0.3);
          } else {
            const fallbackDistance = dropDistance;
            translateYPx = -fallbackDistance + progress * fallbackDistance;
          }
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
          const opacity = (blurStrength > 0 ? progress : 1) * swingOpacity;
          const baseDrop = dropDistance + translateYPx;
          const offsetY = baseDrop + variance;
          const displayChar = getScrambledChar(char, frame, charDelay);
          const totalX = shake + swingXOffset;

          if (swingEnabled) {
            const ropeLength = Math.max(0, dropDistance + translateYPx);
            return (
              <span
                key={`${char}-${index}`}
                style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  height: 'auto',
                  verticalAlign: 'baseline',
                }}
              >
                <span
                  style={{
                    width: 3,
                    height: Math.max(0, offsetY),
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0.2))',
                    borderRadius: 999,
                    display: 'inline-block',
                    boxShadow: '0 0 6px rgba(0,0,0,0.2)',
                  }}
                />
                <span
                  style={{
                    display: 'inline-block',
                    transform: `translate(${totalX}px, ${translateYPx}px) scale(${scaleValue}) rotateX(${rotateX}deg)`,
                    transformOrigin: 'bottom',
                    lineHeight: 1.3,
                    filter: `blur(${blurValue}px)`,
                    opacity,
                    fontFamily:
                      blurStrength > 0
                        ? `${fontFamily}, "Roboto Mono", monospace`
                        : fontFamily,
                  }}
                >
                  {displayChar}
                </span>
              </span>
            );
          }

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
                  transform: `translate(${totalX}px, ${translateYPx + variance}px) scale(${scaleValue}) rotateX(${rotateX}deg)`,
                  transformOrigin: 'bottom',
                  lineHeight: 1.3,
                  filter: `blur(${blurValue}px)`,
                  opacity,
                  fontFamily:
                    blurStrength > 0
                      ? `${fontFamily}, "Roboto Mono", monospace`
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
