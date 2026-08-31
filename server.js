import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generatePasswordResetEmail } from './js/templates/laobank-password-reset.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3002;

// In-memory store for dispatched emails
const dispatchedEmails = [];

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

  // API Endpoint: Dispatch Email Notification
  if (req.method === 'POST' && (parsedUrl.pathname === '/api/notify' || parsedUrl.pathname === '/api/emails/send')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const recipient = payload.to || payload.recipient || payload.email;
        const token = payload.token || payload.resetCode || '123456';
        const name = payload.name || 'Cliente LãoBank';
        const subject = payload.subject || 'Código de Recuperação de Senha - LãoBank Digital';
        const template = payload.template || 'password_reset';

        if (!recipient) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Campo "to" ou "recipient" é obrigatório.' }));
          return;
        }

        // Render HTML template with Token in the body
        const htmlBody = generatePasswordResetEmail({
          name,
          email: recipient,
          resetCode: token,
          resetUrl: `http://localhost:3000/#reset?code=${token}&email=${encodeURIComponent(recipient)}`
        });

        const record = {
          id: Date.now(),
          recipient,
          sender: 'seguranca@laobank.com.br',
          subject,
          token,
          template,
          html: htmlBody,
          sentAt: new Date().toISOString(),
          status: 'DELIVERED'
        };

        dispatchedEmails.unshift(record);

        // Terminal Log with Rich Box Formatting
        console.log('\n' + '═'.repeat(65));
        console.log(`📬 [consumerNotification] DISPARO DE E-MAIL TRANSACIONAL`);
        console.log('─'.repeat(65));
        console.log(` Destinatário : ${recipient}`);
        console.log(` Assunto      : ${subject}`);
        console.log(` Token / OTP  : ${token}`);
        console.log(` Template     : ${template}`);
        console.log(` Origem       : consumerLãoBank -> Integrados Core API`);
        console.log(` Status       : 200 OK (Entregue com sucesso)`);
        console.log('═'.repeat(65) + '\n');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: `E-mail transacional contendo o token ${token} despachado com sucesso para ${recipient}!`,
          deliveredTo: recipient,
          token: token,
          dispatchedAt: record.sentAt
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Falha ao processar notificação: ' + err.message }));
      }
    });
    return;
  }

  // API Endpoint: List Dispatched Emails (JSON)
  if (req.method === 'GET' && parsedUrl.pathname === '/api/emails') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(dispatchedEmails));
    return;
  }

  // Static File Server (Optional developer inbox UI)
  let filePath = path.join(__dirname, parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname);
  const extname = String(path.extname(filePath)).toLowerCase();
  
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
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
  console.log(`\n🚀 consumerNotification Server ativo em http://localhost:${PORT}`);
  console.log(`📡 Endpoint de Disparo: POST http://localhost:${PORT}/api/notify`);
});
