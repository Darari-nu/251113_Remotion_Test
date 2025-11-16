import { Composition } from "remotion";
import { GridCamera, gridCameraSchema } from "./GridCamera";
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
            フォントスタイル: "モダンゴシック",
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
        }}
      />
      <Composition
        id="GridCamera"
        component={GridCamera}
        durationInFrames={690}
        fps={30}
        width={1920}
        height={1080}
        schema={gridCameraSchema}
        defaultProps={{
          text: "Crypto Ninja Coffee Time",
          tileColor: "#1c1c1c",
          activeTileColor: "#ffc857",
          textColor: "#ffffff",
          columns: 3,
          tileSize: 200,
          gap: 30,
        }}
      />
    </>
  );
};
