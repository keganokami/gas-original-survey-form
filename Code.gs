/**
 * メインのサーバーサイド処理
 */

/**
 * Webアプリとしてアクセスされた際にHTMLを返す
 */
function doGet() {
  var template = HtmlService.createTemplateFromFile("index");
  return template
    .evaluate()
    .setTitle(FORM_CONFIG.title)
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * HTMLテンプレートから部分HTMLを読み込む
 * @param {string} filename - ファイル名
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * フォーム設定をクライアントに返す
 */
function getFormConfig() {
  return JSON.parse(JSON.stringify(FORM_CONFIG));
}

/**
 * フォーム送信を処理する
 * @param {object} payload - { formData: {...}, file: { base64, name, mimeType } | null }
 * @returns {object} { success, message, rowNumber }
 */
function submitForm(payload) {
  try {
    var formData = payload.formData;
    var files = payload.files || [];
    var imageUrls = [];

    // バリデーション
    var errors = validateForm(formData);
    if (errors.length > 0) {
      return { success: false, message: errors.join("\n") };
    }

    // 画像がある場合はDriveにアップロード（複数対応）
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      if (file && file.base64) {
        var timestamp = Utilities.formatDate(
          new Date(),
          Session.getScriptTimeZone(),
          "yyyyMMdd_HHmmss"
        );
        var fileName = timestamp + "_" + (i + 1) + "_" + (file.name || "image.jpg");

        var result = uploadImageToDrive(file.base64, fileName, file.mimeType);
        imageUrls.push(result.fileUrl);
      }
    }

    // スプレッドシートに書き込み
    var rowNumber = appendResponse(formData, imageUrls);

    return {
      success: true,
      message: "回答を送信しました。ありがとうございます。",
      rowNumber: rowNumber,
    };
  } catch (e) {
    Logger.log("submitForm error: " + e.toString());
    return {
      success: false,
      message: "送信中にエラーが発生しました: " + e.toString(),
    };
  }
}

/**
 * サーバーサイドバリデーション
 * @param {object} formData
 * @returns {string[]} エラーメッセージの配列
 */
function validateForm(formData) {
  var errors = [];

  FORM_CONFIG.fields.forEach(function (field) {
    if (field.required && field.type !== "file") {
      var value = formData[field.id];
      if (!value || String(value).trim() === "") {
        errors.push("「" + field.label + "」は必須項目です。");
      }
    }
  });

  return errors;
}
