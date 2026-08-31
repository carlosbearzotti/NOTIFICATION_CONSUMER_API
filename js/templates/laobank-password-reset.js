/**
 * Template de E-mail de Recuperação de Senha - LãoBank Digital
 */
export function generatePasswordResetEmail({ name, email, resetCode, resetUrl }) {
  const code = resetCode || '482915';
  const url = resetUrl || `http://localhost:3000/#reset?code=${code}&email=${encodeURIComponent(email)}`;
  const userName = name || 'Carlos Silva';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #080c16; color: #f8fafc; margin: 0; padding: 24px; }
    .container { max-width: 560px; margin: 0 auto; background: #0e1626; border: 1px solid rgba(197, 160, 89, 0.3); border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #131c31 0%, #0a0f1d 100%); padding: 32px; text-align: center; border-bottom: 1px solid rgba(197, 160, 89, 0.2); }
    .logo-text { font-family: 'Cinzel', serif, Georgia; font-size: 24px; font-weight: 800; color: #f5d77f; letter-spacing: 2px; }
    .content { padding: 32px; font-size: 15px; line-height: 1.6; color: #cbd5e1; }
    .code-box { background: rgba(197, 160, 89, 0.1); border: 2px dashed #c5a059; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .code-text { font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #f5d77f; margin: 8px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #f5d77f 0%, #c5a059 50%, #8c6d1f 100%); color: #080c16; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 28px; border-radius: 8px; margin: 16px 0; text-align: center; }
    .footer { background: #090e1a; padding: 20px 32px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid rgba(255,255,255,0.05); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-text">🏛️ LÃOBANK DIGITAL</div>
      <div style="font-size: 12px; color: #94a3b8; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">Segurança & Proteção de Acesso</div>
    </div>
    
    <div class="content">
      <p style="font-size: 17px; font-weight: 600; color: #ffffff; margin-top: 0;">Olá, ${userName}</p>
      <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>LãoBank Digital</strong>.</p>
      
      <p>Para prosseguir com a redefinição de forma segura, utilize o código de validação de 6 dígitos abaixo:</p>
      
      <div class="code-box">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #c5a059;">Seu Código de Segurança</div>
        <div class="code-text">${code}</div>
        <div style="font-size: 12px; color: #94a3b8;">Válido pelos próximos 15 minutos</div>
      </div>

      <div style="text-align: center;">
        <a href="${url}" class="btn">Redefinir Minha Senha no LãoBank</a>
      </div>

      <p style="font-size: 13px; color: #94a3b8; margin-top: 24px;">
        ⚠️ <strong>Importante:</strong> Nunca compartilhe este código com ninguém. Se você não solicitou esta redefinição, desconsidere este e-mail imediatamente ou entre em contato com nosso time de segurança.
      </p>
    </div>

    <div class="footer">
      LãoBank S.A. &bull; Banco Múltiplo Digital 077 &bull; CNPJ 00.000.000/0001-99<br>
      Este é um e-mail transacional automático enviado pelo <code>consumerNotification</code>.
    </div>
  </div>
</body>
</html>
  `.trim();
}
