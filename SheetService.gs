/**
 * Google スプレッドシートへの書き込み処理
 */

/**
 * スプレッドシートにヘッダー行がなければ作成する
 * @param {Sheet} sheet - 対象シート
 */
function ensureHeader(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    var headers = ["タイムスタンプ"];
    FORM_CONFIG.fields.forEach(function (field) {
      if (field.type === "file") {
        var maxFiles = field.maxFiles || 1;
        for (var i = 1; i <= maxFiles; i++) {
          headers.push(field.label + i + " (URL)");
        }
      } else {
        headers.push(field.label);
      }
    });
    sheet.appendRow(headers);

    // ヘッダー行を太字に
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }
}

/**
 * 回答データをスプレッドシートに追記する
 * @param {object} formData - フォームの回答データ
 * @param {string[]} imageUrls - アップロードした画像のURL配列
 * @returns {number} 書き込んだ行番号
 */
function appendResponse(formData, imageUrls) {
  var ss = SpreadsheetApp.openById(FORM_CONFIG.sheetId);
  var sheet = ss.getSheetByName(FORM_CONFIG.sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(FORM_CONFIG.sheetName);
  }

  ensureHeader(sheet);

  var row = [new Date()]; // タイムスタンプ

  FORM_CONFIG.fields.forEach(function (field) {
    if (field.type === "file") {
      var maxFiles = field.maxFiles || 1;
      for (var i = 0; i < maxFiles; i++) {
        row.push(imageUrls[i] || "");
      }
    } else {
      row.push(formData[field.id] || "");
    }
  });

  sheet.appendRow(row);
  return sheet.getLastRow();
}
