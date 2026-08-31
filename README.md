# 📬 consumerNotification — Middleware de Mensageria & Notificações Transacionais

[![Vanilla JS](https://img.shields.io/badge/JavaScript-ES6%20Modules-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3 Glassmorphism](https://img.shields.io/badge/CSS3-Dark%20Inbox-blue.svg)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Event-Driven](https://img.shields.io/badge/Architecture-Event--Driven%20%2F%20Webhooks-purple.svg)](https://en.wikipedia.org/wiki/Event-driven_architecture)
[![Core API](https://img.shields.io/badge/Backend-Integrados%20API-brightgreen.svg)](https://github.com/carlosbearzotti/INTEGRATE_SERVICES_JAVA_API)

O **`consumerNotification`** é uma aplicação **Middleware & Web Inbox** especializada no processamento, formatação e entrega de **e-mails transacionais e notificações críticas** originadas no ecossistema `Integrados` e `consumerLãoBank`.

---

## 🎯 Casos de Uso & Propósito

- **Recepção de Webhooks**: Atua como endpoint receptor para eventos transacionais despachados pelo backend `Integrados` (assinados com HMAC-SHA256).
- **Renderização de Templates HTML**: Converte payloads JSON brutos em e-mails HTML ricos com a identidade visual dos Tenants (ex: LãoBank).
- **Web Inbox Visual**: Permite que desenvolvedores, operadores de suporte e clientes visualizem notificações em tempo real sem a necessidade de configurar servidores SMTP locais pesados (ex: MailHog/Mailtrap).
- **Fluxo de Recuperação de Senha**: Recebe solicitações de redefinição de senha do LãoBank e entrega o código de verificação de 6 dígitos ao usuário.

---

## 🔌 Funcionalidades Consumidas do Backend (`Integrados`)

### 1. 🔑 Recuperação de Senha (`user.password_reset`)
- **Origem**: `POST /api/auth/forgot-password` (Core API `Integrados` / `consumerLãoBank`)
- **Comportamento**: Recebe o evento contendo o e-mail do usuário e o código numérico de 6 dígitos gerado com expiração de 15 minutos. Renderiza o template de segurança do LãoBank.

### 2. 💳 Confirmação de Transações (`transaction.completed`)
- **Origem**: `POST /api/transactions`
- **Comportamento**: Notifica o titular da conta com o valor, data e comprovante criptografado da operação.

### 3. 🚨 Alertas do Radar Antifraude (`fraud.alert`)
- **Origem**: `FraudEvaluationService`
- **Comportamento**: Notifica a equipe de segurança e o cliente sobre transações retidas devido a divergências de geolocalização ou valores anômalos.

### 4. 📄 Contratação de Empréstimos (`loan.contracted`)
- **Origem**: `POST /customer-loans` / `GET /api/loans/me`
- **Comportamento**: Envia o resumo das parcelas, taxa de juros e contrato digital de crédito.

---

## 🎨 Templates de E-mail Integrados

1. **LãoBank — Código de Recuperação de Senha**:
   - Layout corporativo dourado e preto.
   - Destaque para o código de 6 dígitos com timer de expiração.
   - Alerta de segurança contra compartilhamento de dados.
2. **Notificação de Nova Transação**:
   - Resumo financeiro e link encurtado para comprovante digital.
3. **Alerta de Segurança / Geofencing**:
   - Detalhes de localização e botão de bloqueio preventivo de cartão.

---

## 🏃 Como Executar

A aplicação roda em servidor estático na porta **3002**:

```bash
# Na pasta consumerNotification
npx serve . -l 3002
```
Acesse no navegador: **`http://localhost:3002`**

---

## 👨‍💻 Autor
Desenvolvido por **Carlos Bearzotti**  
GitHub: [@carlosbearzotti](https://github.com/carlosbearzotti)
