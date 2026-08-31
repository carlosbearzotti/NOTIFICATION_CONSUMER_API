import { notificationStore } from './notificationStore.js';

document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('emailList');
  const viewEl = document.getElementById('emailViewContainer');
  const countBadge = document.getElementById('inboxCountBadge');
  const sendTestBtn = document.getElementById('sendTestEmailBtn');

  function render(emails, selected) {
    if (countBadge) countBadge.textContent = emails.length;

    if (listEl) {
      listEl.innerHTML = emails.map(e => `
        <div class="message-card ${selected && selected.id === e.id ? 'active' : ''}" data-id="${e.id}">
          <div class="message-card-top">
            <span class="message-sender">${e.recipient}</span>
            <span class="message-time">${new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div class="message-subject">${e.subject}</div>
          <div class="message-preview">${e.preview}</div>
        </div>
      `).join('');

      listEl.querySelectorAll('.message-card').forEach(card => {
        card.addEventListener('click', () => {
          const id = parseInt(card.getAttribute('data-id'));
          notificationStore.select(id);
        });
      });
    }

    if (viewEl) {
      if (!selected) {
        viewEl.innerHTML = `<div style="color: var(--text-muted); text-align: center; padding: 3rem;">Selecione um e-mail para visualizar</div>`;
        return;
      }

      viewEl.innerHTML = `
        <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: #ffffff;">${selected.subject}</h2>
            <div style="font-size: 0.82rem; color: var(--text-secondary);">
              De: <strong>${selected.sender}</strong><br>
              Para: <strong style="color: var(--bank-gold-light);">${selected.recipient}</strong> &bull; ${new Date(selected.createdAt).toLocaleString('pt-BR')}
            </div>
          </div>
          <span class="badge badge-emerald">Entregue (200 OK)</span>
        </div>

        <div class="email-render-frame">
          ${selected.html}
        </div>
      `;
    }
  }

  notificationStore.subscribe(render);
  render(notificationStore.emails, notificationStore.getSelected());

  if (sendTestBtn) {
    sendTestBtn.addEventListener('click', () => {
      const code = Math.floor(100000 + Math.random() * 900000);
      notificationStore.addEmail({
        name: 'Carlos Silva',
        email: 'carlos@exemplo.com',
        resetCode: String(code),
        template: 'password_reset'
      });
    });
  }

  // Permite receber mensagens de outras abas ou chamadas HTTP simuladas
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'DISPATCH_EMAIL') {
      notificationStore.addEmail(event.data.payload);
    }
  });

  window.dispatchEmailNotification = (payload) => {
    return notificationStore.addEmail(payload);
  };
});
