/**
 * Template de E-mail Transacional para Emissão de Boleto Bancário - LãoBank Digital
 */
export function generateBoletoEmail({ name, email, amount, barcode, dueDate }) {
  const safeName = name || 'Correntista LãoBank';
  const safeAmount = amount || 'R$ 2.975,00';
  const safeBarcode = barcode || '07790.00018 04829.400014 00000.000000 1 98450000297500';
  const safeDueDate = dueDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR');

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
    .boleto-card { background: rgba(255,255,255,0.03); border: 1px dashed #c5a059; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
    .barcode-display { font-family: monospace; font-size: 14px; background: #1e293b; padding: 12px; border-radius: 6px; color: #38bdf8; word-break: break-all; margin: 12px 0; }
    .barcode-visual { height: 45px; background: repeating-linear-gradient(90deg, #fff, #fff 2px, transparent 2px, transparent 4px, #fff 4px, #fff 7px, transparent 7px, transparent 9px); margin: 15px auto; width: 85%; }
    .btn-pay { display: inline-block; background: linear-gradient(135deg, #c5a059, #dfbe7a); color: #080c16; padding: 12px 24px; border-radius: 6px; font-weight: 700; text-decoration: none; margin-top: 15px; }
    .footer { text-align: center; font-size: 11px; color: #64748b; padding: 20px; border-top: 1px solid #1e293b; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="logo">🏦 LÃOBANK DIGITAL</div>
      <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Segurança Bancária &bull; Emissão de Boletos</div>
    </div>
    <div class="email-body">
      <h2 style="font-size: 18px; color: #ffffff; margin-top: 0;">Olá, ${safeName}!</h2>
      <p style="font-size: 14px; color: #94a3b8; line-height: 1.5;">
        Seu <strong>Boleto Bancário</strong> para pagamento da fatura foi emitido com sucesso pelo <strong>LãoBank S.A. (Banco 077)</strong>.
      </p>

      <div class="boleto-card">
        <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase;">Valor do Documento</div>
        <div style="font-size: 26px; font-weight: 800; color: #34d399; margin: 4px 0;">${safeAmount}</div>
        <div style="font-size: 13px; color: #fbbf24;">Vencimento: ${safeDueDate}</div>

        <div style="margin-top: 16px; font-size: 12px; color: #94a3b8;">Linha Digitável (Código de Barras):</div>
        <div class="barcode-display">${safeBarcode}</div>

        <div class="barcode-visual"></div>
      </div>

      <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
        Você pode pagar este boleto em qualquer agência bancária, internet banking ou casas lotéricas até a data de vencimento.
      </p>
    </div>
    <div class="footer">
      LãoBank S.A. &bull; CNPJ 00.000.000/0001-77 &bull; Banco 077 &bull; Mensagem Transacional Automática
    </div>
  </div>
</body>
</html>
`;
}
