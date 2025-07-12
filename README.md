# <img src="https://raw.githubusercontent.com/SaudePet/assets/main/logo.png" alt="SaudePet" width="30" height="30"> SaudePet


## 📱 Sobre

**SaudePet** é uma plataforma revolucionária de saúde veterinária que conecta tutores de pets a um assistente veterinário virtual inteligente. Através de IA avançada, oferecemos consultas virtuais ilimitadas, diagnósticos preliminares e manutenção de prontuários eletrônicos completos.

### 🎯 Nossa Missão

Democratizar o acesso a cuidados veterinários de qualidade, fornecendo orientações confiáveis 24 horas por dia, 7 dias por semana, diretamente no smartphone dos tutores.

### 📊 Números

- 🏥 **+1000** protocolos veterinários
- 🤖 **< 3s** tempo de resposta da IA
- 📋 **100%** digital e sem papel
- 🌍 **3** idiomas suportados

---

## ✨ Features

### 🏥 Consultas Virtuais Ilimitadas
- Chat inteligente com IA veterinária especializada
- Análise de sintomas em tempo real
- Diagnósticos diferenciais baseados em evidências
- Recomendações de tratamento personalizadas

### 📋 Prontuário Eletrônico Completo
- Timeline visual da saúde do pet
- Upload de exames e documentos
- Histórico de vacinação integrado
- Compartilhamento seguro com veterinários

### 🔔 Sistema de Lembretes Inteligente
- Vacinas e reforços
- Medicações com horários
- Consultas de rotina
- Vermifugação periódica

### 💊 Prescrições Digitais
- Receitas veterinárias eletrônicas
- Dosagens calculadas automaticamente
- Integração futura com farmácias
- Histórico de medicamentos

### 📊 Dashboard Personalizado
- Insights de saúde do pet
- Alertas de cuidados preventivos
- Estatísticas de bem-estar
- Recomendações sazonais

---

## 🛠 Tecnologias

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.72-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React Native">
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Node.js-20_LTS-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Redis-7.0-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis">
  <img src="https://img.shields.io/badge/AWS-Cloud-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white" alt="AWS">
  <img src="https://img.shields.io/badge/OpenAI-API-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI">
  <img src="https://img.shields.io/badge/Stripe-Payments-008CDD?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe">
</p>

### 📱 Mobile
- **Framework:** React Native + TypeScript
- **Estado:** Zustand
- **Navegação:** React Navigation 6
- **UI/UX:** Custom components + Reanimated 3
- **Forms:** React Hook Form + Yup

### 🖥 Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** Express + TypeScript
- **ORM:** TypeORM
- **Cache:** Redis
- **Queue:** Bull

### ☁️ Infraestrutura
- **Cloud:** AWS (ECS, RDS, S3, CloudFront)
- **CI/CD:** GitHub Actions
- **Monitoring:** CloudWatch + Sentry
- **Analytics:** Mixpanel

---

## 🚀 Começando

### Pré-requisitos

- Node.js 20.x
- npm ou yarn
- PostgreSQL 15
- Redis 7
- Conta AWS (para deploy)
- Chaves de API (OpenAI, Stripe)

### 🔧 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/SaudePet/saudepet.git
cd saudepet
```

2. **Instale as dependências**
```bash
# Backend
cd backend
npm install

# Mobile
cd ../mobile
npm install
cd ios && pod install # apenas iOS
```

3. **Configure as variáveis de ambiente**
```bash
# Backend (.env)
cp .env.example .env

# Edite o arquivo .env com suas configurações:
DATABASE_URL=postgresql://user:password@localhost:5432/saudepet
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

4. **Configure o banco de dados**
```bash
cd backend
npm run migration:run
npm run seed # dados de exemplo
```

5. **Inicie os serviços**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Mobile
cd mobile
npm run ios     # ou
npm run android
```

### 🐳 Docker

```bash
# Desenvolvimento com Docker Compose
docker-compose up -d

# Produção
docker build -t saudepet-api:latest .
docker run -p 3000:3000 saudepet-api:latest
```

---

## 📸 Screenshots

<p align="center">
  <img src="https://raw.githubusercontent.com/SaudePet/assets/main/screenshot-1.png" width="200" alt="Home">
  <img src="https://raw.githubusercontent.com/SaudePet/assets/main/screenshot-2.png" width="200" alt="Chat">
  <img src="https://raw.githubusercontent.com/SaudePet/assets/main/screenshot-3.png" width="200" alt="Prontuário">
  <img src="https://raw.githubusercontent.com/SaudePet/assets/main/screenshot-4.png" width="200" alt="Timeline">
</p>

---

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

### 📊 Padrões de Código

- **Linting:** ESLint + Prettier
- **Commit:** Conventional Commits
- **Branches:** GitFlow
- **Code Review:** Obrigatório para merge

---

## 🗺 Roadmap

### ✅ Fase 1 - MVP (Q1 2025)
- [x] Sistema de autenticação
- [x] Chat com IA veterinária
- [x] Prontuário básico
- [x] Sistema de pagamentos
- [x] Apps iOS e Android

### 🚧 Fase 2 - Expansão (Q2 2025)
- [ ] Timeline visual completa
- [ ] Sistema avançado de lembretes
- [ ] Análise de imagens por IA
- [ ] Multi-idioma (EN, ES)
- [ ] Compartilhamento de prontuário

### 📅 Fase 3 - Marketplace (Q3 2025)
- [ ] Integração com e-commerces
- [ ] Recomendações de produtos
- [ ] Sistema de cashback
- [ ] Programa de fidelidade

### 🔮 Fase 4 - Inovação (Q4 2025)
- [ ] Teleconsulta com veterinários
- [ ] Seguro pet integrado
- [ ] API para clínicas
- [ ] Wearables para pets

---

## 🤝 Contribuindo

Adoramos contribuições! Por favor, leia nosso [Guia de Contribuição](CONTRIBUTING.md) para detalhes sobre nosso código de conduta e processo de submissão de pull requests.

### 🐛 Encontrou um bug?

- Verifique se já não foi reportado nas [issues](https://github.com/SaudePet/saudepet/issues)
- Se não, [abra uma nova issue](https://github.com/SaudePet/saudepet/issues/new?template=bug_report.md)

### 💡 Tem uma sugestão?

- Primeiro, verifique as [discussões](https://github.com/SaudePet/saudepet/discussions)
- Abra uma [feature request](https://github.com/SaudePet/saudepet/issues/new?template=feature_request.md)

### 📝 Pull Requests

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add: amazing feature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 👥 Time

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/founder">
        <img src="https://github.com/founder.png" width="100px;" alt=""/>
        <br />
        <sub><b>João Silva</b></sub>
      </a>
      <br />
      <sub>Founder & CEO</sub>
    </td>
    <td align="center">
      <a href="https://github.com/cto">
        <img src="https://github.com/cto.png" width="100px;" alt=""/>
        <br />
        <sub><b>Maria Santos</b></sub>
      </a>
      <br />
      <sub>CTO</sub>
    </td>
    <td align="center">
      <a href="https://github.com/lead-dev">
        <img src="https://github.com/lead-dev.png" width="100px;" alt=""/>
        <br />
        <sub><b>Pedro Costa</b></sub>
      </a>
      <br />
      <sub>Lead Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/vet-advisor">
        <img src="https://github.com/vet-advisor.png" width="100px;" alt=""/>
        <br />
        <sub><b>Dra. Ana Lima</b></sub>
      </a>
      <br />
      <sub>Veterinary Advisor</sub>
    </td>
  </tr>
</table>

---

## 📞 Contato

- **Website:** [www.saudepet.com.br](https://www.saudepet.com.br)
- **Email:** contato@saudepet.com.br
- **LinkedIn:** [SaudePet](https://linkedin.com/company/saudepet)
- **Instagram:** [@saudepetbr](https://instagram.com/saudepetbr)

---

## 🙏 Agradecimentos

- Todos os veterinários que contribuíram com conhecimento
- Comunidade open source
- Beta testers e early adopters
- Nossos investidores e apoiadores

---

<p align="center">
  Feito com ❤️ para pets e seus tutores
  <br>
  <strong>SaudePet © 2025</strong>
</p>
