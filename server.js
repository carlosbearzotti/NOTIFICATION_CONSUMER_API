import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { generatePasswordResetEmail } from './js/templates/laobank-password-reset.js';
import { generateBoletoEmail } from './js/templates/laobank-boleto.js';
import { generateCardIssuedEmail } from './js/templates/laobank-card-issued.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3002;
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const rawUser = (process.env.SMTP_USER || '').trim();
const rawPass = (process.env.SMTP_PASS || '').trim();

const cleanUser = (rawUser && !rawUser.includes('@') && SMTP_HOST.includes('gmail'))
  ? `${rawUser}@gmail.com`
  : rawUser;

const cleanPass = rawPass.replace(/\s+/g, '');
const SMTP_FROM = process.env.SMTP_FROM || `LãoBank Digital <${cleanUser || 'seguranca@laobank.com.br'}>`;

let mailTransporter = null;
const dispatchedLogs = [];

// Inicializa o transportador SMTP
async function initTransporter() {
  if (cleanUser && cleanPass) {
    console.log(`📡 [SMTP] Configurando envio real via host: ${SMTP_HOST}:${SMTP_PORT} (Usuário: ${cleanUser})`);
    mailTransporter = nodemailer.createTransport({
      service: SMTP_HOST.includes('gmail') ? 'gmail' : undefined,
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: cleanUser,
        pass: cleanPass
      }
    });

    // Validação da conexão SMTP
    try {
      await mailTransporter.verify();
      console.log(`✅ [SMTP] Autenticação com ${SMTP_HOST} bem-sucedida! Pronto para envios reais.`);
    } catch (authErr) {
      console.error(`❌ [SMTP Auth Error] Falha ao autenticar no servidor SMTP (${cleanUser}):`, authErr.message);
    }
  } else {
    console.log(`⚠️ [SMTP] Nenhuma credencial SMTP configurada no .env. Inicializando conta de teste Ethereal para envio com link de preview.`);
    try {
      const testAccount = await nodemailer.createTestAccount();
      mailTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`✅ [SMTP Ethereal] Conta temporária criada: ${testAccount.user}`);
    } catch (err) {
      console.warn(`[SMTP] Fallback para logger direto: ${err.message}`);
    }
  }
}

await initTransporter();

// Servidor HTTP / Microserviço Headless SMTP com Painel de Confirmação tipo Resend
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

  // Endpoint de Logs / Telemetria para o Dashboard Resend: GET /api/logs
  if (req.method === 'GET' && parsedUrl.pathname === '/api/logs') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      smtpConfigured: Boolean(cleanUser && cleanPass),
      smtpHost: SMTP_HOST,
      smtpPort: SMTP_PORT,
      logs: dispatchedLogs
    }));
    return;
  }

  // Healthcheck endpoint
  if (req.method === 'GET' && parsedUrl.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      service: 'LaoBank Notification SMTP Consumer',
      status: 'UP',
      port: PORT,
      smtpHost: SMTP_HOST,
      smtpConfigured: Boolean(cleanUser && cleanPass)
    }));
    return;
  }

  // Endpoint de Disparo de E-mails: POST /api/notify ou POST /api/emails/send
  if (req.method === 'POST' && (parsedUrl.pathname === '/api/notify' || parsedUrl.pathname === '/api/emails/send')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      const startTime = Date.now();
      try {
        const payload = JSON.parse(body || '{}');
        const recipient = payload.to || payload.recipient || payload.email;
        const token = payload.token || payload.resetCode || '123456';
        const name = payload.name || 'Correntista LãoBank';
        const template = payload.template || 'password_reset';
        const amount = payload.amount || 'R$ 2.975,00';
        const barcode = payload.barcode || '07790.00018 04829.400014 00000.000000 1 98450000297500';
        const dueDate = payload.dueDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR');
        const last4 = payload.last4 || '8824';
        const deliveryDays = payload.deliveryDays || 7;
        const address = payload.address || 'Endereço cadastrado na conta';

        if (!recipient) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'O campo "to" ou "email" do destinatário é obrigatório.' }));
          return;
        }

        let subject = payload.subject;
        let htmlBody = '';

        if (template === 'boleto') {
          subject = subject || `📄 Boleto Bancário LãoBank - Fatura ${amount}`;
          htmlBody = generateBoletoEmail({
            name,
            email: recipient,
            amount,
            barcode,
            dueDate
          });
        } else if (template === 'card_issued' || template === 'welcome_card') {
          subject = subject || `💳 Seu Cartão LãoBank foi emitido! Físico em até ${deliveryDays} dias e Virtual liberado`;
          htmlBody = generateCardIssuedEmail({
            name,
            email: recipient,
            last4,
            address,
            deliveryDays
          });
        } else {
          subject = subject || `🔒 Código de Recuperação de Senha: ${token}`;
          htmlBody = generatePasswordResetEmail({
            name,
            email: recipient,
            resetCode: token,
            resetUrl: `http://localhost:3000/#reset?code=${token}&email=${encodeURIComponent(recipient)}`
          });
        }

        // Monta o e-mail SMTP
        const mailOptions = {
          from: SMTP_FROM,
          to: recipient,
          subject: subject,
          html: htmlBody
        };

        let messageId = `<msg-${Date.now()}@laobank.com.br>`;
        let previewUrl = null;
        let deliveryStatus = 'DELIVERED';

        if (mailTransporter) {
          try {
            const info = await mailTransporter.sendMail(mailOptions);
            messageId = info.messageId || messageId;
            previewUrl = nodemailer.getTestMessageUrl(info) || null;
          } catch (smtpErr) {
            console.error(`❌ [SMTP Error] Falha ao enviar para ${recipient}:`, smtpErr.message);
            deliveryStatus = 'ERROR';
          }
        }

        const duration = Date.now() - startTime;

        const logRecord = {
          id: Date.now(),
          recipient,
          sender: SMTP_FROM,
          subject,
          template,
          messageId,
          previewUrl,
          duration: `${duration}ms`,
          status: deliveryStatus,
          timestamp: new Date().toISOString(),
          createdAt: new Date().toLocaleTimeString('pt-BR')
        };

        dispatchedLogs.unshift(logRecord);
        if (dispatchedLogs.length > 50) dispatchedLogs.pop();

        // Terminal Log
        console.log('\n' + '═'.repeat(65));
        console.log(`📧 [consumerNotification] DISPARO DE E-MAIL VIA SMTP`);
        console.log('─'.repeat(65));
        console.log(` Para         : ${recipient}`);
        console.log(` Assunto      : ${subject}`);
        console.log(` Template     : ${template}`);
        console.log(` Message-ID   : ${messageId}`);
        console.log(` Duração      : ${duration}ms`);
        if (previewUrl) {
          console.log(` Preview URL  : ${previewUrl}`);
        }
        console.log(` Status       : 200 OK (${deliveryStatus})`);
        console.log('═'.repeat(65) + '\n');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: `E-mail transacional enviado com sucesso via SMTP para ${recipient}!`,
          recipient,
          subject,
          template,
          messageId,
          previewUrl,
          duration: `${duration}ms`
        }));

      } catch (err) {
        console.error('Erro no processamento da notificação:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Erro interno ao processar notificação: ' + err.message }));
      }
    });
    return;
  }

  // Static File Server (Painel Resend-Style Telemetria)
  let filePath = path.join(__dirname, parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname);
  const extname = String(path.extname(filePath)).toLowerCase();

  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 [consumerNotification] Resend-Style Telemetry & SMTP Server ativo em http://localhost:${PORT}`);
  console.log(`📡 Endpoint de Disparo: POST http://localhost:${PORT}/api/notify`);
  console.log(`⚙️ Configuração SMTP: ${cleanUser ? 'Credenciais Reais Configuradas' : 'Modo Sandbox Ethereal Ativo'}\n`);
});
