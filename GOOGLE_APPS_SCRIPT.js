
/**
 * ATS-EMOD Cloud Sync Service v2.4 (Two-Way Sync Robust)
 * Mendukung Add, Edit, Delete untuk Master Data, Users, dan Production.
 */

function doGet(e) {
  var action = e.parameter.action;
  if (action === 'readAll') {
    return ContentService.createTextOutput(JSON.stringify(readAllData()))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var request = JSON.parse(e.postData.contents);
    var action = request.action;
    var data = request.data;
    var result = "Action not found";

    if (action === 'addMasterData') {
      result = addData(getSheetName(data.category), data.entry);
    } else if (action === 'editMasterData') {
      result = editData(getSheetName(data.category), data.entry, data.category);
    } else if (action === 'deleteMasterData') {
      result = deleteData(getSheetName(data.category), data.id, data.category);
    } else if (action === 'addUser') {
      result = addData('Users', data);
    } else if (action === 'editUser') {
      result = editData('Users', data, 'User');
    } else if (action === 'deleteUser') {
      result = deleteData('Users', data.id, 'User');
    } else if (action === 'addProduction') {
      result = addData('Production', data);
    }

    return ContentService.createTextOutput(result)
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.message)
      .setMimeType(ContentService.MimeType.TEXT);
  }
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
  return maps[category] || category;
}

function readAllData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return {
    offices: getSheetValues(ss, 'Offices'),
    tacs: getSheetValues(ss, 'Tacs'),
    positions: getSheetValues(ss, 'Positions'),
    employees: getSheetValues(ss, 'Employees'),
    items: getSheetValues(ss, 'Items'),
    users: getSheetValues(ss, 'Users'),
    batches: getSheetValues(ss, 'Production')
  };
}

function getSheetValues(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
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

function findHeaderIndex(headers, target) {
  for (var i = 0; i < headers.length; i++) {
    if (headers[i].toString().toLowerCase().trim() === target.toLowerCase().trim()) return i;
  }
  return -1;
}

function addData(sheetName, entry) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return "Error: Sheet " + sheetName + " not found";
  
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var row = [];
  for (var i = 0; i < headers.length; i++) {
    var key = headers[i];
    row.push(entry[key] !== undefined ? entry[key] : "");
  }
  sheet.appendRow(row);
  SpreadsheetApp.flush();
  return "Success Add to " + sheetName;
}

function editData(sheetName, entry, category) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return "Error: Sheet " + sheetName + " not found";
  
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  // Identifikasi kolom ID unik
  var searchKey = (category === 'Pegawai') ? 'nik' : 'id';
  if (category === 'User') searchKey = 'id';
  
  var idCol = findHeaderIndex(headers, searchKey);
  if (idCol === -1) idCol = 0; // Fallback ke kolom pertama jika header tidak ditemukan

  var idToFind = entry[searchKey] || entry.id || entry.username;

  for (var i = 1; i < data.length; i++) {
    // Gunakan toString() untuk membandingkan angka dan string
    if (data[i][idCol].toString().trim() === idToFind.toString().trim()) {
      for (var j = 0; j < headers.length; j++) {
        var key = headers[j];
        if (entry[key] !== undefined) {
          sheet.getRange(i + 1, j + 1).setValue(entry[key]);
        }
      }
      SpreadsheetApp.flush();
      return "Success Edit in " + sheetName + " row " + (i + 1);
    }
  }
  return "Error: ID " + idToFind + " not found in " + sheetName;
}

function deleteData(sheetName, id, category) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return "Error: Sheet " + sheetName + " not found";
  
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  var searchKey = (category === 'Pegawai') ? 'nik' : 'id';
  var idCol = findHeaderIndex(headers, searchKey);
  if (idCol === -1) idCol = 0;

  var deletedCount = 0;
  // Hapus dari bawah ke atas agar indeks baris tidak bergeser saat iterasi
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][idCol].toString().trim() === id.toString().trim()) {
      sheet.deleteRow(i + 1);
      deletedCount++;
    }
  }
  
  SpreadsheetApp.flush();
  return "Deleted " + deletedCount + " rows from " + sheetName;
}
