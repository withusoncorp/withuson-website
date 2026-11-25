// 문의 유형 표시명 (partnership 은 2차 수정 전 옛 값)
const INQUIRY_LABELS = {
  education: '교육 문의',
  performance: '공연 문의',
  instructor: '강사 등록 문의',
  performer: '연주자 등록 문의',
  press: '언론사 제휴 및 광고 문의',
  etc: '기타 문의',
  partnership: '제휴 문의(이전 유형)',
};

const ADMIN_EMAIL = 'withusoncorp@withusoncorp.co.kr';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'RESEND_API_KEY is not configured' });
    return;
  }

  const { name, phone, email, inquiryType, message, attachmentNames } = req.body || {};
  // 첨부 파일은 이름만 받는다 (최대 3개, 각 200자). 파일 자체·링크는 메일에 넣지 않는다.
  const fileNames = Array.isArray(attachmentNames)
    ? attachmentNames.filter((n) => typeof n === 'string' && n.trim()).slice(0, 3).map((n) => n.slice(0, 200))
    : [];

  if (!name || !phone || !email || !inquiryType || !message) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const typeLabel = INQUIRY_LABELS[inquiryType] || inquiryType;
  const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

  const html = `
    <div style="font-family:sans-serif;line-height:1.6;color:#26301C;">
      <h2 style="color:#5E661A;">새 문의가 접수되었습니다</h2>
      <p><strong>문의 유형:</strong> ${escape(typeLabel)}</p>
      <p><strong>이름:</strong> ${escape(name)}</p>
      <p><strong>연락처:</strong> ${escape(phone)}</p>
      <p><strong>이메일:</strong> ${escape(email)}</p>
      <p><strong>문의 내용:</strong></p>
      <p style="white-space:pre-wrap;background:#F8F9EC;padding:12px 16px;border-radius:8px;">${escape(message)}</p>
      ${fileNames.length ? `
      <p><strong>첨부 파일 (${fileNames.length}개):</strong></p>
      <ul>${fileNames.map((n) => `<li>${escape(n)}</li>`).join('')}</ul>
      <p style="color:#5C6653;font-size:14px;">첨부 파일은 관리자 페이지 &gt; 문의 관리에서 확인·다운로드할 수 있습니다.</p>` : ''}
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: '위더스온 홈페이지 <noreply@withusoncorp.co.kr>',
        to: ADMIN_EMAIL,
        reply_to: email,
        subject: `[위더스온] 새 문의 - ${typeLabel} (${name})${fileNames.length ? ` · 첨부 ${fileNames.length}개` : ''}`,
        html,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(502).json({ error: 'Resend request failed', detail: errText });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Unexpected error', detail: String(err) });
  }
};
