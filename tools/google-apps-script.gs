/**
 * 차배달탁송 홈페이지 문의 받기 (구글 시트용 Apps Script)
 *
 * 하는 일
 *  1. 홈페이지 문의하기에서 보낸 내용을 이 시트 첫 번째 탭에 한 줄씩 쌓습니다.
 *  2. 문의가 들어올 때마다 시트 주인의 Gmail로 알림 메일을 보냅니다.
 *
 * 붙이는 곳: 구글 시트 "홈페이지 견적 문의" > 확장 프로그램 > Apps Script
 */

// 받을 칸 순서 (시트 머리글과 같은 순서)
var FIELDS = ['service', 'from', 'to', 'when', 'car', 'name', 'phone', 'memo'];

function doPost(e) {
  var p = (e && e.parameter) || {};

  // 자동 광고 프로그램이 채우는 숨은 칸에 값이 있으면 저장하지 않습니다
  if (p.website) return done_();

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var row = [new Date()];
    FIELDS.forEach(function (k) {
      row.push(safe_(p[k], k === 'phone'));
    });
    row.push('접수', ''); // 처리 상태, 담당 기사
    sheet.appendRow(row);
  } finally {
    lock.releaseLock();
  }

  notify_(p);
  return done_();
}

// 시트에서 수식으로 바뀌거나 전화번호 앞 0이 사라지지 않게 글자로 저장
function safe_(v, keepAsText) {
  v = String(v || '').slice(0, 1000);
  if (keepAsText || /^[=+\-@]/.test(v)) return "'" + v;
  return v;
}

function notify_(p) {
  var to = Session.getEffectiveUser().getEmail();
  if (!to) return;
  var subject = '[홈페이지 문의] ' + (p.from || '') + ' → ' + (p.to || '') + ' (' + (p.service || '') + ')';
  var body = [
    '홈페이지로 새 문의가 들어왔습니다.',
    '',
    '서비스: ' + (p.service || ''),
    '출발지: ' + (p.from || ''),
    '도착지: ' + (p.to || ''),
    '희망 일시: ' + (p.when || ''),
    '차종: ' + (p.car || ''),
    '이름: ' + (p.name || ''),
    '연락처: ' + (p.phone || ''),
    '요청 사항: ' + (p.memo || ''),
    '',
    '시트에서 보기: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
  ].join('\n');
  MailApp.sendEmail(to, subject, body);
}

function done_() {
  return ContentService.createTextOutput('ok');
}

// 설치 확인용: Apps Script 화면에서 이 함수를 한 번 실행하면 권한 승인 창이 뜹니다
function 시험하기() {
  doPost({ parameter: {
    service: '승용차 탁송', from: '시험 출발지', to: '시험 도착지', when: '', car: '그랜저',
    name: '시험', phone: '010-0000-0000', memo: '설치 확인용 시험 문의입니다. 지우셔도 됩니다.'
  } });
}
