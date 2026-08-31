import { generatePasswordResetEmail } from './templates/laobank-password-reset.js';

/**
 * In-memory Store para Notificações & E-mails
 */
class NotificationStore {
  constructor() {
    this.emails = this.loadInitialEmails();
    this.selectedEmailId = this.emails[0]?.id || null;
    this.listeners = [];
  }

  loadInitialEmails() {
    return [
      {
        id: 1,
        sender: 'LãoBank Security <seguranca@laobank.com.br>',
        recipient: 'carlos@exemplo.com',
        subject: '🔒 Código de Recuperação de Senha: 482915',
        preview: 'Recebemos uma solicitação para redefinir a senha da sua conta no LãoBank Digital...',
        status: 'DELIVERED',
        template: 'password_reset',
        createdAt: new Date().toISOString(),
        html: generatePasswordResetEmail({
          name: 'Carlos Silva',
          email: 'carlos@exemplo.com',
          resetCode: '482915'
        })
      }
    ];
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
    return this.emails.find(e => e.id === this.selectedEmailId) || this.emails[0];
  }

  subscribe(fn) {
    this.listeners.push(fn);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.emails, this.getSelected()));
  }
}

export const notificationStore = new NotificationStore();
