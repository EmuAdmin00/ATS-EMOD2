
/**
 * ATS-EMOD Cloud Sync Service v2.7 (Split Material/Product & Auto-Setup)
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

    if (action === 'setup') {
      result = setupSheets();
    } else if (action === 'addMasterData') {
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

function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = {
    'Offices': ['id', 'officeName', 'address', 'city', 'phone', 'fax'],
    'Tacs': ['id', 'officeId', 'name', 'address', 'phone', 'fax'],
    'Positions': ['id', 'name'],
    'Employees': ['nik', 'name', 'positionId', 'status', 'address', 'phone', 'email', 'officeId', 'tacId'],
    'RawMaterials': ['id', 'name', 'category', 'unit', 'stock', 'minStock', 'pricePerUnit', 'officeId'],
    'Products': ['id', 'name', 'category', 'unit', 'stock', 'minStock', 'pricePerUnit', 'officeId'],
    'Users': ['id', 'username', 'password', 'fullName', 'role', 'allowedViews', 'officeId'],
    'Production': ['id', 'productId', 'outputQuantity', 'date', 'status']
  };

  for (var name in sheets) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    sheet.getRange(1, 1, 1, sheets[name].length).setValues([sheets[name]]);
    sheet.getRange(1, 1, 1, sheets[name].length).setFontWeight("bold").setBackground("#f3f3f3");
  }
  return "Spreadsheet initialized successfully with separate Raw Materials and Products sheets.";
}

function getSheetName(category) {
  var maps = {
    'Office': 'Offices',
    'TAC': 'Tacs',
    'Jabatan': 'Positions',
    'Pegawai': 'Employees',
    'Bahan Baku': 'RawMaterials',
    'Produk': 'Products'
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
    rawMaterials: getSheetValues(ss, 'RawMaterials'),
    products: getSheetValues(ss, 'Products'),
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
      var val = values[i][j];
      if (headers[j] === 'allowedViews' && typeof val === 'string') {
        obj[headers[j]] = val.split(',').map(v => v.trim());
      } else {
        obj[headers[j]] = val;
      }
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
  if (!sheet) return "Error: Sheet " + sheetName + " not found. Run setup first.";
  
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var row = [];
  for (var i = 0; i < headers.length; i++) {
    var key = headers[i];
    var val = entry[key] !== undefined ? entry[key] : "";
    if (Array.isArray(val)) val = val.join(', ');
    row.push(val);
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
  
  var searchKey = (category === 'Pegawai') ? 'nik' : 'id';
  if (category === 'User') searchKey = 'id';
  
  var idCol = findHeaderIndex(headers, searchKey);
  if (idCol === -1) idCol = 0;

  var idToFind = entry[searchKey] || entry.id || entry.username;

  for (var i = 1; i < data.length; i++) {
    if (data[i][idCol].toString().trim() === idToFind.toString().trim()) {
      for (var j = 0; j < headers.length; j++) {
        var headerName = headers[j];
        if (entry[headerName] !== undefined) {
          var val = entry[headerName];
          if (Array.isArray(val)) val = val.join(', ');
          sheet.getRange(i + 1, j + 1).setValue(val);
        }
      }
      SpreadsheetApp.flush();
      return "Success Edit: " + idToFind;
    }
  }
  return "Error: ID " + idToFind + " not found";
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
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][idCol].toString().trim() === id.toString().trim()) {
      sheet.deleteRow(i + 1);
      deletedCount++;
    }
  }
  SpreadsheetApp.flush();
  return "Deleted " + deletedCount + " rows";
}
