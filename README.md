# gas-original-survey-form

Google Apps Script 製のアンケートフォームアプリです。
Google Forms の代替として、**Googleログイン不要**で写真付き回答ができるフォームを提供します。

## 特徴

- **ログイン不要**: 回答者にGoogleアカウントを要求しない
- **写真アップロード対応**: 最大3枚まで画像を添付可能（Google Driveに自動保存）
- **スプレッドシート連携**: 回答データがGoogle スプレッドシートに自動記録される
- **日時の範囲指定**: 単日・期間どちらの報告にも対応
- **レスポンシブ対応**: スマートフォンからも利用可能
- **設定ファイル駆動**: `FormConfig.gs` を編集するだけでフォーム項目を変更可能
- **完全無料**: Google Workspace / GASの無料枠で運用可能

## アーキテクチャ

```
[ブラウザ]
  │  google.script.run.submitForm(payload)
  ↓
[Code.gs] ── メイン処理・ルーティング
  ├→ [DriveService.gs]  画像を Base64 → Blob 変換し Google Drive にアップロード
  └→ [SheetService.gs]  回答データ + 画像URL をスプレッドシートに1行追記
```

### データフロー

1. ユーザーがブラウザでフォームに入力・画像を選択
2. クライアントJS が画像を Base64 エンコードし、フォームデータとともにサーバーへ送信
3. `Code.gs` がバリデーション後、`DriveService.gs` で画像を Google Drive にアップロード
4. `SheetService.gs` で回答データと画像URLをスプレッドシートに追記
5. 結果をクライアントに返却し、成功/エラーメッセージを表示

## ファイル構成

| ファイル | 役割 |
|---|---|
| `Code.gs` | メイン処理（doGet, submitForm, バリデーション） |
| `FormConfig.gs` | フォーム定義（項目の追加・変更はここだけ） |
| `DriveService.gs` | Google Drive への画像アップロード処理 |
| `SheetService.gs` | Google スプレッドシートへの書き込み処理 |
| `index.html` | フォーム画面のHTMLテンプレート |
| `css.html` | スタイルシート |
| `js.html` | クライアント側JavaScript（動的フォーム生成・ファイル処理） |
| `appsscript.json` | GASプロジェクト設定（タイムゾーン・デプロイ設定） |

## デフォルトのフォーム項目

| 項目 | 入力形式 | 必須 |
|---|---|---|
| 氏名 | テキスト | Yes |
| 部屋番号 | テキスト | Yes |
| 意見・感想 | テキストエリア | No |
| 日時（開始） | カレンダー選択 | No |
| 日時（終了） | カレンダー選択 | No |
| 写真（最大3枚） | 画像アップロード | No |

## セットアップ手順

### 前提条件

- Google アカウント（Google Workspace 推奨）
- Node.js（clasp を使用する場合）

### 1. Google Drive / スプレッドシートの準備

1. Google Drive に**画像保存用フォルダ**を作成
2. Google スプレッドシートを新規作成
3. それぞれのIDをメモする

```
フォルダURL:  https://drive.google.com/drive/folders/【フォルダID】
シートURL:   https://docs.google.com/spreadsheets/d/【シートID】/edit
```

### 2. GASプロジェクトの作成

#### 方法A: clasp を使う（推奨）

```bash
# clasp インストール
npm install -g @google/clasp

# GAS API を有効化（初回のみ）
# https://script.google.com/home/usersettings で API をオン

# ログイン
clasp login

# リポジトリをクローン
git clone https://github.com/keganokami/gas-original-survey-form.git
cd gas-original-survey-form

# GASプロジェクトを作成
clasp create --title "アンケートフォーム" --type standalone

# コードをプッシュ
clasp push --force
```

#### 方法B: GASエディタに直接コピー

1. [script.google.com](https://script.google.com) で新規プロジェクト作成
2. 各 `.gs` ファイルの内容をスクリプトエディタにコピー
3. HTML ファイルは「ファイルを追加 > HTML」で作成してコピー

### 3. スクリプトプロパティの設定

GASエディタで以下を設定します。

1. 左の歯車アイコン「**プロジェクトの設定**」を開く
2. 「**スクリプト プロパティ**」セクションで以下を追加:

| プロパティ | 値 |
|---|---|
| `DRIVE_FOLDER_ID` | 手順1でメモしたフォルダID |
| `SHEET_ID` | 手順1でメモしたスプレッドシートID |

### 4. デプロイ

#### clasp の場合

```bash
clasp deploy
```

#### GASエディタの場合

1. 「デプロイ」>「新しいデプロイ」
2. 種類: **ウェブアプリ**
3. 実行ユーザー: **自分**
4. アクセス権: **全員**（ログイン不要にする場合）
5. 「デプロイ」をクリック

### 5. 初回認証

デプロイURLに初めてアクセスすると権限の承認画面が表示されます。

1. 「Review Permissions」をクリック
2. Googleアカウントを選択
3. 「詳細」>「(アプリ名)に移動」をクリック
4. 「許可」をクリック

これはDrive/Sheetsへのアクセス権限の付与で、回答者側には表示されません。

## カスタマイズ

### フォーム項目の変更

`FormConfig.gs` の `fields` 配列を編集します。

```javascript
// テキスト入力を追加
{
  id: "company",
  type: "text",
  label: "会社名",
  placeholder: "株式会社〇〇",
  required: false,
},

// セレクトボックスを追加
{
  id: "category",
  type: "select",
  label: "カテゴリ",
  options: ["設備", "清掃", "騒音", "その他"],
  required: true,
},

// 画像の最大枚数を変更
{
  id: "photo",
  type: "file",
  label: "写真",
  accept: "image/*",
  required: false,
  maxFiles: 5,  // 最大5枚に変更
},
```

変更後は `clasp push --force` と `clasp deploy -i <デプロイID>` で反映してください。

### スプレッドシートのヘッダー

フォーム項目を変更した場合、スプレッドシートのヘッダー行も更新が必要です。
既存データを退避してシートの内容を空にすると、次回送信時にヘッダーが自動再生成されます。

## 技術的な制約

| 項目 | 制限 |
|---|---|
| 画像サイズ | 1枚あたり10MB以下 |
| GASリクエスト上限 | 50MB |
| 実行時間 | 6分（Google Workspace は30分） |
| 日次実行回数 | 無料アカウント: 90分/日、Workspace: 6時間/日 |

## ライセンス

MIT
