💈 Sistema de Gestão para Barbearia (SaaS)

Sistema completo de gestão para barbearias, desenvolvido com Django + Next.js, focado em operação diária, controle financeiro e comissões, com interface moderna no padrão SaaS clean.

✨ Visão Geral

Este sistema foi projetado para resolver os principais problemas operacionais de uma barbearia:

Registro rápido de serviços

Pagamento na hora

Controle de caixa

Cálculo automático de comissões

Separação de permissões por função

Interface simples, rápida e profissional

O sistema já está estruturado para evoluir para multi-barbearias (white-label / SaaS).

🧱 Arquitetura
Frontend (Next.js + Tailwind)
        ↓ API REST (JWT)
Backend (Django + DRF)
        ↓
Banco de Dados (PostgreSQL)

Tecnologias principais
Backend

Python 3

Django

Django Rest Framework

SimpleJWT (JWT + Refresh)

Django Filters

PostgreSQL

DRF Spectacular (Swagger)

Frontend

Next.js (App Router)

React

TypeScript

Tailwind CSS

TanStack React Query

Axios

Lucide Icons

Framer Motion (animações leves)

👥 Papéis de Usuário (Roles)
Role	Permissões
BARBER	Registrar serviços, ver suas comissões
MANAGER	Abrir/fechar caixa, entradas/saídas, ver tudo
ADMIN	Total controle do sistema

As permissões são validadas no backend, não apenas no frontend.

📦 Funcionalidades
🔐 Autenticação

Login com usuário e senha

JWT com refresh automático

Proteção de rotas

Logout automático ao expirar token

💇 Serviços

Cadastro de serviços (ex: Corte, Barba)

Preço padrão

Comissão padrão por serviço

Ativação / desativação

🧾 Registros de Serviço

Registro rápido do atendimento

Pagamento na hora (PIX / Dinheiro / Cartão)

Associação opcional a cliente

Geração automática de:

Pagamento

Comissão

Validação de caixa aberto

👤 Clientes

Cadastro simples de clientes

Busca rápida

Histórico preparado para evolução

💰 Caixa

Abertura de caixa com valor inicial

Entradas manuais

Saídas manuais

Fechamento de caixa

Cálculo automático do valor esperado

Diferença entre esperado x contado

Apenas MANAGER / ADMIN podem operar o caixa.

📊 Dashboard

Faturamento do dia

Quantidade de atendimentos

Visão geral operacional

Atualização automática

💸 Comissões

Geração automática por serviço

Visualização por barbeiro

Manager/Admin vê todas

Barbeiro vê apenas as próprias

🎨 Interface (Frontend)

Design SaaS clean

Totalmente responsivo

Ícones discretos

Skeleton loading

Animações leves de transição

White-label (logo configurável)

🧩 White-label / Branding

O sistema suporta personalização de marca:

// src/config/brand.ts
export const BRAND = {
  name: "Nome da Barbearia",
  logo: "/brand/logo.png",
};


Logo no login

Logo na sidebar

Favicon customizável

Preparado para múltiplos clientes

🚀 Rodando o projeto localmente
Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver


API disponível em:

http://localhost:8000/api/


Swagger:

http://localhost:8000/api/docs/

Frontend
cd web
npm install
npm run dev


Frontend disponível em:

http://localhost:3000


Configure o .env.local:

NEXT_PUBLIC_API_BASE=http://localhost:8000/api

🔒 Segurança

JWT com refresh token

Interceptor automático no frontend

Proteção por role no backend

Validações críticas feitas no servidor

Sem lógica sensível no frontend

📈 Evoluções planejadas

📅 Agenda (já estruturada no backend)

📊 Relatórios PDF / CSV

🌙 Dark mode

🧩 Multi-tenant (várias barbearias)

💳 Integração com gateway de pagamento

📱 App mobile (React Native)

💼 Modelo de Negócio (referência)

Setup inicial

Mensalidade recorrente

White-label por cliente

Escalável para SaaS

📄 Licença

Projeto desenvolvido para uso comercial privado.
Distribuição e revenda conforme acordo com o desenvolvedor.

👨‍💻 Autor

Sistema desenvolvido por Pedro Santos
Arquitetura, backend, frontend e UI/UX pensados para uso real em produção.