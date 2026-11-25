// 문의 답변 메일 양식 (파일명이 _ 로 시작 → Vercel 이 별도 함수로 배포하지 않음)
// 관리자 '미리보기'와 실제 발송이 같은 함수를 쓰므로, 미리보기에 보인 그대로 발송된다.
const INQUIRY_LABELS = {
  education: '교육 문의',
  performance: '공연 문의',
  instructor: '강사 등록 문의',
  performer: '연주자 등록 문의',
  press: '언론사 제휴 및 광고 문의',
  etc: '기타 문의',
  partnership: '제휴 문의',
};

const COMPANY = {
  name: '주식회사 위더스온',
  tel: '02-2217-9765',
  email: 'withusoncorp@withusoncorp.co.kr',
  address: '서울특별시 동대문구 전농로 82, JM빌딩 3층',
  site: 'https://www.withusoncorp.co.kr',
  logo: 'https://www.withusoncorp.co.kr/brand_logo/logo.png',
};

const FROM = '위더스온 <noreply@withusoncorp.co.kr>';
const REPLY_TO = COMPANY.email;
const SUBJECT = '[위더스온] 문의하신 내용에 대한 답변입니다';
const MAX_BODY = 5000;

const escape = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));
const paragraphs = (s) => escape(s).replace(/\r\n/g, '\n').replace(/\n/g, '<br>');

function formatKST(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return '';
  const p = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(d).reduce((o, x) => (o[x.type] = x.value, o), {});
  return `${p.year}.${p.month}.${p.day}`;
}

// row: consultations 한 행, body: 관리자가 쓴 답변 본문
function buildReplyMail(row, body) {
  const typeLabel = INQUIRY_LABELS[row.inquiry_type] || row.inquiry_type || '문의';
  const message = String(row.message || '');
  const quoted = message.length > 600 ? message.slice(0, 600) + '…' : message;
  const html = `<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escape(SUBJECT)}</title></head>
<body style="margin:0;padding:0;background:#F4F4EE;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4EE;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:16px;overflow:hidden;font-family:'Pretendard','Apple SD Gothic Neo','Malgun Gothic',sans-serif;color:#26301C;">
  <tr><td style="padding:28px 32px 20px;border-bottom:1px solid #EEF0D2;">
    <img src="${COMPANY.logo}" alt="WithUsOn 위더스온" height="28" style="display:block;height:28px;border:0;">
  </td></tr>
  <tr><td style="padding:28px 32px 8px;">
    <p style="margin:0 0 18px;font-size:18px;font-weight:700;color:#26301C;">문의하신 내용에 대한 답변입니다</p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.75;">안녕하세요, ${escape(row.name)}님.<br>위더스온입니다.</p>
    <div style="font-size:15px;line-height:1.8;color:#26301C;">${paragraphs(body)}</div>
    <p style="margin:24px 0 0;font-size:15px;line-height:1.75;">감사합니다.<br>위더스온 드림</p>
  </td></tr>
  <tr><td style="padding:24px 32px 8px;">
    <div style="background:#F8F9EC;border-radius:12px;padding:16px 18px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#5E661A;">보내주신 문의 · ${escape(typeLabel)} · ${formatKST(row.created_at)}</p>
      <p style="margin:0;font-size:13px;line-height:1.7;color:#5C6653;">${paragraphs(quoted)}</p>
    </div>
  </td></tr>
  <tr><td style="padding:20px 32px 28px;">
    <p style="margin:0;font-size:13px;line-height:1.7;color:#5C6653;">이 메일에 회신하시면 담당자에게 바로 전달됩니다.</p>
  </td></tr>
  <tr><td style="padding:20px 32px;background:#26301C;color:#C9CCBF;font-size:12px;line-height:1.8;">
    <strong style="color:#FFFFFF;">${COMPANY.name}</strong><br>
    ${escape(COMPANY.address)}<br>
    T ${COMPANY.tel} · ${COMPANY.email}<br>
    <a href="${COMPANY.site}" style="color:#C9D35E;text-decoration:none;">www.withusoncorp.co.kr</a>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;

  const text = `안녕하세요, ${row.name}님.\n위더스온입니다.\n\n${body}\n\n감사합니다.\n위더스온 드림\n\n` +
    `-- 보내주신 문의 (${typeLabel} · ${formatKST(row.created_at)}) --\n${quoted}\n\n` +
    `${COMPANY.name} · T ${COMPANY.tel} · ${COMPANY.email}\n${COMPANY.site}`;

  return { from: FROM, to: row.email, reply_to: REPLY_TO, subject: SUBJECT, html, text };
}

module.exports = { buildReplyMail, MAX_BODY };
