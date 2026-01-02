
/**
 * ATS-EMOD Cloud Sync Service v2.2
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

    // Mapping Action dari App.tsx
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

function addData(sheetName, entry) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return "Error: Sheet " + sheetName + " not found";
  
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var row = [];
  for (var i = 0; i < headers.length; i++) {
    row.push(entry[headers[i]] !== undefined ? entry[headers[i]] : "");
  }
  sheet.appendRow(row);
  return "Success Add to " + sheetName;
}

function editData(sheetName, entry, category) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  // Tentukan kolom ID
  var idCol = 0; // Default kolom A
  var idToFind = entry.id;

  if (category === 'Pegawai') {
    idCol = headers.indexOf('nik');
    idToFind = entry.nik;
  } else {
    idCol = headers.indexOf('id');
    if (idCol === -1) idCol = 0;
  }

  for (var i = 1; i < data.length; i++) {
    if (data[i][idCol].toString() === idToFind.toString()) {
      for (var j = 0; j < headers.length; j++) {
        if (entry[headers[j]] !== undefined) {
          sheet.getRange(i + 1, j + 1).setValue(entry[headers[j]]);
        }
      }
      SpreadsheetApp.flush();
      return "Success Edit in " + sheetName;
    }
  }
  return "Error: ID " + idToFind + " not found in " + sheetName;
}

function deleteData(sheetName, id, category) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  var idCol = 0;
  if (category === 'Pegawai') {
    idCol = headers.indexOf('nik');
  } else {
    idCol = headers.indexOf('id');
    if (idCol === -1) idCol = 0;
  }

  var deleted = 0;
  // Loop dari bawah ke atas agar indeks baris stabil
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][idCol].toString() === id.toString()) {
      sheet.deleteRow(i + 1);
      deleted++;
    }
  }
  
  SpreadsheetApp.flush();
  return "Deleted " + deleted + " rows from " + sheetName;
}
