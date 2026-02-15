/**
 * フォーム設定
 * 質問項目を変更したい場合はこのファイルのみ編集してください
 */

const FORM_CONFIG = {
  title: "アンケートフォーム",
  description: "ご回答ありがとうございます。以下の項目にご記入ください。",

  // Google Drive のフォルダID（画像保存先）
  // スクリプトプロパティ「DRIVE_FOLDER_ID」から取得
  driveFolderId: PropertiesService.getScriptProperties().getProperty("DRIVE_FOLDER_ID"),

  // Google スプレッドシートのID
  // スクリプトプロパティ「SHEET_ID」から取得
  sheetId: PropertiesService.getScriptProperties().getProperty("SHEET_ID"),

  // シート名
  sheetName: "回答",

  fields: [
    {
      id: "name",
      type: "text",
      label: "氏名",
      placeholder: "山田 太郎",
      required: true,
    },
    {
      id: "room",
      type: "text",
      label: "部屋番号",
      placeholder: "例: 101, A-203",
      required: true,
    },
    {
      id: "opinion",
      type: "textarea",
      label: "意見・感想",
      placeholder: "ご自由にお書きください",
      required: false,
    },
    {
      id: "dateFrom",
      type: "datetime-local",
      label: "日時（開始）",
      required: false,
    },
    {
      id: "dateTo",
      type: "datetime-local",
      label: "日時（終了）",
      required: false,
      hint: "範囲指定が不要な場合は空欄で構いません",
    },
    {
      id: "photo",
      type: "file",
      label: "写真",
      accept: "image/*",
      required: false,
      maxFiles: 3,
    },
  ],
};
