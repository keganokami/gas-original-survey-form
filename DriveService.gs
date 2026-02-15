/**
 * Google Drive への画像アップロード処理
 */

/**
 * Base64エンコードされた画像をGoogle Driveにアップロードする
 * @param {string} base64Data - Base64エンコードされた画像データ（data URI含む）
 * @param {string} fileName - ファイル名
 * @param {string} mimeType - MIMEタイプ (例: image/jpeg)
 * @returns {object} { fileId, fileUrl }
 */
function uploadImageToDrive(base64Data, fileName, mimeType) {
  var folderId = FORM_CONFIG.driveFolderId;
  var folder = DriveApp.getFolderById(folderId);

  // data URI プレフィックスを除去
  var base64Content = base64Data.replace(/^data:[^;]+;base64,/, "");
  var decoded = Utilities.base64Decode(base64Content);
  var blob = Utilities.newBlob(decoded, mimeType, fileName);

  var file = folder.createFile(blob);

  // 閲覧リンクを取得（リンクを知っている全員が閲覧可能に設定）
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return {
    fileId: file.getId(),
    fileUrl: file.getUrl(),
  };
}
