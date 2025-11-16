import { Composition } from "remotion";
import { TextAnimation, textAnimationSchema } from "./TextAnimation";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TextAnimation"
        component={TextAnimation}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        schema={textAnimationSchema}
        defaultProps={{
          テキスト設定: { 本文: "Crypto Ninja Coffee Time" },
          ビジュアル調整: {
            背景色: "#C48F00",
            文字色: "#FFFFFF",
            フォントサイズ: 110,
            フォントスタイル: "クラシックセリフ" as const,
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
        }}
      />
    </>
  );
};
