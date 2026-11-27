// 문의하기: 문자(A) + 구글 시트(B)로 보내기
//
// [구글 시트 연결 방법]
// 구글 설문지를 만든 뒤, 설문지 주소와 각 질문 번호(entry.숫자)를 아래에 적으면
// 컴퓨터에서 남긴 문의도 구글 시트에 쌓입니다. 비워 두면 문자로만 보냅니다.
var GOOGLE_FORM = {
  action: '',              // 예: https://docs.google.com/forms/d/e/....../formResponse
  fields: {
    service: '',           // 예: entry.1234567890
    from: '',
    to: '',
    when: '',
    car: '',
    name: '',
    phone: '',
    memo: ''
  }
};
var SMS_NUMBER = '01021335879';

(function () {
  var form = document.getElementById('ask-form');
  if (!form) return;
  var status = document.getElementById('form-status');

  // 첫 화면 표지판 상자에서 적은 출발지·도착지 이어받기
  var params = new URLSearchParams(location.search);
  ['from', 'to'].forEach(function (k) {
    var v = params.get(k);
    if (v) form.elements[k].value = v;
  });

  function value(name) {
    var el = form.elements[name];
    return el ? String(el.value || '').trim() : '';
  }

  function setInvalid(id, bad) {
    var el = document.getElementById(id);
    if (bad) {
      el.setAttribute('aria-invalid', 'true');
      el.setAttribute('aria-describedby', id + '-err');
    } else {
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-describedby');
    }
    return bad;
  }

  function validate() {
    var first = null;
    [['f-from', 'from'], ['f-to', 'to'], ['f-name', 'name'], ['f-phone', 'phone']].forEach(function (p) {
      var bad = !value(p[1]);
      if (p[1] === 'phone' && !bad) bad = value('phone').replace(/[^0-9]/g, '').length < 9;
      if (setInvalid(p[0], bad) && !first) first = document.getElementById(p[0]);
    });
    var agree = document.getElementById('f-agree');
    var agreeErr = document.getElementById('f-agree-err');
    agreeErr.style.display = agree.checked ? 'none' : 'block';
    if (!agree.checked && !first) first = agree;
    if (first) first.focus();
    return !first;
  }

  function message() {
    var lines = [
      '[차배달탁송 문의]',
      '서비스: ' + value('service'),
      '출발지: ' + value('from'),
      '도착지: ' + value('to')
    ];
    if (value('when')) lines.push('희망 일시: ' + value('when'));
    if (value('car')) lines.push('차종: ' + value('car'));
    lines.push('이름: ' + value('name'));
    lines.push('연락처: ' + value('phone'));
    if (value('memo')) lines.push('요청 사항: ' + value('memo'));
    return lines.join('\n');
  }

  function smsLink() {
    return 'sms:' + SMS_NUMBER + '?&body=' + encodeURIComponent(message());
  }

  function show(kind, html) {
    status.className = 'form-status ' + kind;
    status.innerHTML = html;
  }

  form.addEventListener('input', function (e) {
    if (e.target.getAttribute('aria-invalid') === 'true' && String(e.target.value).trim()) {
      setInvalid(e.target.id, false);
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) {
      show('bad', '빨간색으로 표시된 칸을 채워 주세요.');
      return;
    }

    // 구글 시트가 연결되지 않았으면 문자로 보냅니다
    if (!GOOGLE_FORM.action) {
      show('ok', '문자 앱에 문의 내용이 채워집니다. 보내기 버튼을 눌러 주세요.<br>' +
        '컴퓨터에서 보고 계시면 <a href="tel:16665879">1666-5879</a>로 전화하시거나 카카오톡으로 문의해 주세요.');
      location.href = smsLink();
      return;
    }

    var data = new FormData();
    Object.keys(GOOGLE_FORM.fields).forEach(function (k) {
      if (GOOGLE_FORM.fields[k]) data.append(GOOGLE_FORM.fields[k], value(k));
    });
    var btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.textContent = '보내는 중';

    fetch(GOOGLE_FORM.action, { method: 'POST', mode: 'no-cors', body: data })
      .then(function () {
        show('ok', '문의가 접수되었습니다. 확인 후 <strong>' + value('phone') + '</strong>로 연락드리겠습니다.' +
          '<br><a class="btn btn-outline" href="' + smsLink() + '">문자로도 보내기</a>');
        form.reset();
      })
      .catch(function () {
        show('bad', '인터넷 연결 문제로 문의를 보내지 못했습니다. 아래 버튼으로 문자를 보내시거나 ' +
          '<a href="tel:16665879">1666-5879</a>로 전화해 주세요.' +
          '<br><a class="btn btn-outline" href="' + smsLink() + '">문자로 보내기</a>');
      })
      .then(function () {
        btn.disabled = false;
        btn.textContent = '문의 남기기';
      });
  });
})();
