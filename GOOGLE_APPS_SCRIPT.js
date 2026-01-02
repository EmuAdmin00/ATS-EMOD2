
/**
 * ATS-EMOD Cloud Sync Service
 * Paste this code into your Google Apps Script Editor (Code.gs)
 */

function doGet(e) {
  var action = e.parameter.action;
  if (action === 'readAll') {
    return ContentService.createTextOutput(JSON.stringify(readAllData()))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  var request = JSON.parse(e.postData.contents);
  var action = request.action;
  var data = request.data;
  
  var result = "Action not found";
  
  if (action === 'addMasterData') {
    result = addMasterData(data.category, data.entry);
  } else if (action === 'deleteMasterData') {
    result = deleteMasterData(data.category, data.id);
  } else if (action === 'editMasterData') {
    result = editMasterData(data.category, data.entry);
  }
  
  return ContentService.createTextOutput(result)
    .setMimeType(ContentService.MimeType.TEXT);
}

function getSheetName(category) {
  var maps = {
    'Office': 'Offices',
    'TAC': 'Tacs',
    'Jabatan': 'Positions',
    'Pegawai': 'Employees',
    'Bahan Baku': 'Items',
    'Produk': 'Items'
  };
  return maps[category] || 'Items';
}

function readAllData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return {
    offices: getSheetData(ss, 'Offices'),
    tacs: getSheetData(ss, 'Tacs'),
    positions: getSheetData(ss, 'Positions'),
    employees: getSheetData(ss, 'Employees'),
    items: getSheetData(ss, 'Items'),
    users: getSheetData(ss, 'Users'),
    batches: getSheetData(ss, 'Production')
  };
}

function getSheetData(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var data = [];
  for (var i = 1; i < values.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[i][j];
    }
    data.push(obj);
  }
  return data;
}

function addMasterData(category, entry) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(getSheetName(category));
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var row = [];
  for (var i = 0; i < headers.length; i++) {
    row.push(entry[headers[i]] || "");
  }
  sheet.appendRow(row);
  return "Success Add";
}

function deleteMasterData(category, id) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(getSheetName(category));
  var data = sheet.getDataRange().getValues();
  
  // Cari ID di kolom pertama (indeks 0) atau kolom NIK untuk Pegawai
  var idColumnIndex = (category === 'Pegawai') ? findHeaderIndex(sheet, 'nik') : 0;
  
  var deletedCount = 0;
  // Loop dari bawah ke atas untuk menghindari pergeseran indeks saat menghapus
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][idColumnIndex].toString() === id.toString()) {
      sheet.deleteRow(i + 1);
      deletedCount++;
    }
  }
  return "Deleted " + deletedCount + " rows";
}

function findHeaderIndex(sheet, headerName) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  for (var i = 0; i < headers.length; i++) {
    if (headers[i].toLowerCase() === headerName.toLowerCase()) return i;
  }
  return 0;
}
