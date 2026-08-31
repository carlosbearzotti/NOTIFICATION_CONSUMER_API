import { generatePasswordResetEmail } from './templates/laobank-password-reset.js';

/**
 * Real-time Store para Notificações & E-mails Transacionais
 */
class NotificationStore {
  constructor() {
    this.emails = [];
    this.selectedEmailId = null;
    this.listeners = [];
    this.init();
  }

  async init() {
    await this.fetchEmails();
    // Polling a cada 1.5s para atualizar a caixa de entrada em tempo real quando a API Core disparar
    setInterval(() => this.fetchEmails(), 1500);
  }

  async fetchEmails() {
    try {
      const res = await fetch('/api/emails');
      if (res.ok) {
        const serverEmails = await res.json();
        if (Array.isArray(serverEmails)) {
          const previousCount = this.emails.length;
          this.emails = serverEmails;
          
          if (!this.selectedEmailId && this.emails.length > 0) {
            this.selectedEmailId = this.emails[0].id;
          } else if (this.emails.length > previousCount && previousCount > 0) {
            // Se chegou um novo e-mail, seleciona ele automaticamente
            this.selectedEmailId = this.emails[0].id;
          }
          this.notify();
        }
      }
    } catch (err) {
      // Servidor ainda iniciando
    }
  }

  addEmail(emailData) {
    const id = Date.now();
    const html = emailData.html || (emailData.template === 'password_reset'
      ? generatePasswordResetEmail(emailData)
      : `<div style="padding: 20px; color: #fff;">${emailData.body || emailData.preview}</div>`);

    const newEmail = {
      id,
      sender: emailData.sender || 'LãoBank Security <seguranca@laobank.com.br>',
      recipient: emailData.recipient || emailData.email,
      subject: emailData.subject || `🔒 Código de Recuperação de Senha: ${emailData.resetCode || '123456'}`,
      preview: emailData.preview || 'Recebemos uma solicitação de redefinição de acesso...',
      status: 'DELIVERED',
      template: emailData.template || 'password_reset',
      createdAt: new Date().toISOString(),
      html
    };

    this.emails.unshift(newEmail);
    this.selectedEmailId = id;
    this.notify();
    return newEmail;
  }

  select(id) {
    this.selectedEmailId = id;
    this.notify();
  }

  getSelected() {
    return this.emails.find(e => e.id === this.selectedEmailId) || this.emails[0] || null;
  }

  subscribe(fn) {
    this.listeners.push(fn);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.emails, this.getSelected()));
  }
}

export const notificationStore = new NotificationStore();

