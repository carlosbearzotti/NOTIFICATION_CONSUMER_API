/**
 * Template de E-mail Transacional para Emissão de Cartão Físico & Virtual - LãoBank Digital
 */
export function generateCardIssuedEmail({ name, email, last4, address, deliveryDays }) {
  const safeName = name || 'Correntista LãoBank';
  const safeLast4 = last4 || '8824';
  const safeAddress = address || 'Endereço cadastrado na sua conta';
  const safeDelivery = deliveryDays || 7;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #080c16; color: #f1f5f9; margin: 0; padding: 20px; }
    .email-container { max-width: 580px; margin: 0 auto; background: #0f172a; border: 1px solid #334155; border-radius: 12px; overflow: hidden; }
    .email-header { background: linear-gradient(135deg, #1e293b, #0f172a); padding: 24px; text-align: center; border-bottom: 1px solid rgba(197,160,89,0.3); }
    .logo { font-size: 22px; font-weight: 800; color: #c5a059; letter-spacing: 2px; }
    .email-body { padding: 28px; }
    .card-preview-box { background: linear-gradient(135deg, #0b0f19, #1e293b); border: 1px solid rgba(197,160,89,0.4); border-radius: 12px; padding: 20px; margin: 20px 0; color: #fff; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
    .badge-status { display: inline-block; background: rgba(52,211,153,0.15); color: #34d399; border: 1px solid #059669; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 10px; }
    .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .feature-card { background: rgba(255,255,255,0.03); border: 1px solid #334155; border-radius: 8px; padding: 15px; }
    .footer { text-align: center; font-size: 11px; color: #64748b; padding: 20px; border-top: 1px solid #1e293b; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="logo">💳 LÃOBANK DIGITAL</div>
      <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Emissão e Entrega de Cartões</div>
    </div>
    <div class="email-body">
      <div class="badge-status">✓ Cartão Emitido com Sucesso</div>
      <h2 style="font-size: 20px; color: #ffffff; margin-top: 0;">Olá, ${safeName}!</h2>
      <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
        Temos uma ótima notícia: o seu <strong>Cartão LãoBank Black Prestige</strong> foi gerado e já está pronto para uso!
      </p>

      <!-- Card Graphic Preview -->
      <div class="card-preview-box">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <span style="font-size: 12px; color: #c5a059; font-weight: 700; letter-spacing: 1px;">LÃOBANK PRESTIGE</span>
          <span style="font-size: 14px; font-weight: 800; font-style: italic;">VISA</span>
        </div>
        <div style="font-family: monospace; font-size: 16px; letter-spacing: 3px; margin: 10px 0; color: #f1f5f9;">
          •••• •••• •••• ${safeLast4}
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; margin-top: 15px;">
          <div>TITULAR: <strong style="color: #fff;">${safeName.toUpperCase()}</strong></div>
          <div>VALIDADE: <strong style="color: #fff;">08/32</strong></div>
        </div>
      </div>

      <!-- Feature Grid: Físico vs Virtual -->
      <div class="feature-grid">
        <div class="feature-card">
          <div style="font-size: 18px; margin-bottom: 5px;">📦 Cartão Físico</div>
          <div style="font-size: 13px; font-weight: 700; color: #fbbf24; margin-bottom: 4px;">Chega em até ${safeDelivery} dias úteis</div>
          <div style="font-size: 12px; color: #94a3b8; line-height: 1.4;">
            Seu cartão com chip e tecnologia Contactless está a caminho do seu endereço: <em>${safeAddress}</em>.
          </div>
        </div>

        <div class="feature-card">
          <div style="font-size: 18px; margin-bottom: 5px;">⚡ Cartão Virtual</div>
          <div style="font-size: 13px; font-weight: 700; color: #34d399; margin-bottom: 4px;">Disponível Imediatamente</div>
          <div style="font-size: 12px; color: #94a3b8; line-height: 1.4;">
            Você já pode fazer compras online no app com CVV dinâmico e proteção antifraude ativa.
          </div>
        </div>
      </div>

      <div style="background: rgba(197,160,89,0.1); border: 1px solid rgba(197,160,89,0.3); border-radius: 8px; padding: 14px; font-size: 12px; color: #dfbe7a; line-height: 1.5;">
        🔒 <strong>Dica de Segurança:</strong> Nunca compartilhe sua senha de 4 dígitos ou o código CVV com terceiros. O LãoBank nunca solicita senhas por telefone.
      </div>
    </div>
    <div class="footer">
      LãoBank S.A. &bull; Banco Múltiplo 077 &bull; Notificação de Ativação de Produto
    </div>
  </div>
</body>
</html>
`;
}
