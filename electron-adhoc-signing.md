# Electron + electron-builder で ad-hoc署名済みアプリを配布する方法

## 背景

macOSでは署名・公証されていないアプリは「壊れている」「開発元を検証できない」等のエラーでブロックされる。Apple Developer Program（$99/年）に登録せずに配布するには **ad-hoc署名** を使う。

---

## ビルド

```bash
npm run dist
```

出力: `dist/mac-arm64/アプリ名.zip`

---

## 仕組み

- **ad-hoc署名（codesign -）** → Apple Siliconで「壊れている」エラーを回避
- **xattr -cr** → Quarantine属性を削除してGatekeeperをバイパス

---

## 正規署名との比較

**ad-hoc署名（無料）**: `xattr -cr` が必要、個人配布向け

**Apple Developer署名（$99/年）**: ダブルクリックでOK、一般公開向け
