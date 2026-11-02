/**
 * Cadex early access: receives the form on /cadex/ and records it in this Google Sheet.
 * Bound to the sheet (Extensions > Apps Script). Setup steps are in cadex/README.md.
 *
 * Columns: Signed up | Email | What does your work involve? | Province
 * Each email gets one row. The details step fills in the same row the email step created.
 */

var COL = { SIGNED_UP: 1, EMAIL: 2, WORK: 3, PROVINCE: 4 };
var EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
var MAX_LEN = 200;
var MAX_CHOICES = 10;

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var data = JSON.parse(e.postData.contents);
    var email = String(data.email || '').trim().slice(0, 254);
    if (!EMAIL_RE.test(email)) return reply_({ ok: false, error: 'invalid email' });

    // Two people submitting at once must not both add a row or overwrite each other.
    lock.waitLock(20000);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var row = findRow_(sheet, email);
    if (!row) {
      row = sheet.getLastRow() + 1;
      sheet.getRange(row, COL.SIGNED_UP).setValue(new Date());
      sheet.getRange(row, COL.EMAIL).setValue(safe_(email));
    }
    if (data.step === 'details') {
      // A blank answer never erases one already recorded.
      var work = answer_(data.work, data.workOther);
      var province = answer_(data.province, data.provinceOther);
      if (work) sheet.getRange(row, COL.WORK).setValue(safe_(work));
      if (province) sheet.getRange(row, COL.PROVINCE).setValue(safe_(province));
    }
    return reply_({ ok: true });
  } catch (err) {
    console.error(err);
    return reply_({ ok: false, error: 'could not save' });
  } finally {
    lock.releaseLock();
  }
}

/** Run once from the editor: authorizes the script and formats the sheet. */
function setup() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
  sheet.setFrozenRows(1);
  sheet.getRange('A2:A').setNumberFormat('yyyy-mm-dd hh:mm');
  sheet.getRange('B2:D').setNumberFormat('@'); // keep answers as plain text
  sheet.setColumnWidth(COL.SIGNED_UP, 140);
  sheet.setColumnWidth(COL.EMAIL, 260);
  sheet.setColumnWidth(COL.WORK, 320);
  sheet.setColumnWidth(COL.PROVINCE, 160);
}

function findRow_(sheet, email) {
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var values = sheet.getRange(2, COL.EMAIL, last - 1, 1).getValues();
  var key = email.toLowerCase();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim().toLowerCase() === key) return i + 2;
  }
  return 0;
}

/** ["Forestry","Other"] + "surveying" becomes "Forestry, Other: surveying". */
function answer_(choices, other) {
  var list = Array.isArray(choices) ? choices.slice(0, MAX_CHOICES) : [];
  var text = String(other || '').trim().slice(0, MAX_LEN);
  return list.map(function (c) {
    var choice = String(c).slice(0, MAX_LEN);
    return choice === 'Other' && text ? 'Other: ' + text : choice;
  }).join(', ');
}

/** The form is public, so stop submitted text from running as a spreadsheet formula. */
function safe_(text) {
  return /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
}

function reply_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
