# Plano de Desenvolvimento - Novo Site Institucional PROJDET

> **Projeto:** Plataforma Institucional e Showcase 3D Industrial  
> **Empresa:** PROJDET - Projetos e Detalhamentos Mecânicos (Piracicaba - SP)  
> **Estilo Visual:** Réplica Fiel da Referência ForgeX (Fundo Branco `#FFFFFF`, Cards Escuros Industriais, Tipografia Grafite Nítida e Geometria Refinada)  
> **Arquitetura de Hospedagem:** SPA Estático com React + Vite (HTML/CSS/JS puros 100% compatíveis com hospedagem compartilhada Hostinger via `dist/` e `.htaccess`)  
> **Backend & Banco de Dados:** Supabase Serverless Cloud (Conectado via `.env` real com tabelas em inglês e RLS)  
> **Status Geral:** Em andamento (construção modular seção por seção)

---

## Legenda de Status
- [ ] Não iniciado
- [🔄] Em andamento
- [x] Concluído

---

## Etapa 1: Fundação do Projeto & Design System ForgeX
- [x] **1.1** Inicializar o projeto frontend em React JSX com Vite (foco em alta performance, carregamento estático e zero dependências de servidor Node na Hostinger).
- [x] **1.2** Criar o Design System e variáveis CSS de tokens (`tokens.css`):
  - [x] Fundo base 100% branco puro (`#FFFFFF`).
  - [x] Cores industriais de alto contraste (Títulos `#0F172A`, Textos `#475569`, Acento Azul `#0066FF`, Fundo Hero `#090E17`).
  - [x] Geometria refinada de bordas ForgeX (`--radius-sm: 8px`, `--radius-card: 16px`, `--radius-hero: 20px`, `--radius-full: 9999px`).
  - [x] Bloco de constantes comentadas para todas as durações e curvas de transições/animações.
- [x] **1.3** Importar e organizar assets oficiais da PROJDET (logotipo oficial em vetor/PNG sem fundo, favicons multi-tamanho e ícones industriais).

---

## Etapa 2: Banco de Dados no Supabase & Camada de Dados Real (Em Inglês)
- [x] **2.1** Configurar o cliente Supabase e conectar as credenciais reais no arquivo `.env` (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`).
- [x] **2.2** Criar o Schema SQL da tabela `projects` 100% em inglês com Row Level Security (RLS) e buckets de storage (`logos`, `imagens_landpage`).
- [x] **2.3** Integração do compressor de imagem nativo em Canvas (`imageUtils.js`) calibrado para 150KB WebP.
- [x] **2.4** Leitura direta da tabela real `projects` do Supabase via client SDK, exibindo os dados e simulações 3D cadastrados.

---

## Etapa 3: Construção Seção por Seção da Landing Page (Padrão ForgeX)
- [x] **3.1 Header & Navegação Fixa**:
  - [x] Fundo 100% branco com borda sutil `#E2E8F0`.
  - [x] Logotipo oficial da PROJDET e links suaves (`Início`, `Quem Somos`, `Soluções`, `Indústrias`, `Projetos`, `Contato`).
  - [x] Botão preto sólido com texto branco nítido e seta diagonal (`Solicitar Orçamento ↗`).
- [x] **3.2 Seção 1 - Início (Hero Industrial ForgeX)**:
  - [x] Card escuro flutuante sobre fundo branco, idêntico à referência ForgeX e ao mockup aprovado.
  - [x] Vídeo de simulação mecânica 3D do YouTube ocupando 100% do plano de fundo em loop contínuo.
  - [x] Overlay escuro de contraste, botões (Azul elétrico e Borda branca), selo `PIRACICABA / SP` e controle de som integrado.
- [x] **3.3 Seção 2 - Quem Somos & Faixa de Métricas**:
  - [x] Cabeçalho dividido no fundo branco: Título forte à esquerda e parágrafo institucional à direita.
  - [x] 3 cards escuros com imagens reais da indústria, ícones circulares e botões com seta `↗`.
  - [x] Barra de 4 métricas técnicas em caixa cinza clara (`#F8FAFC`).
- [x] **3.4 Seção 3 - Soluções & Projetos Unificados**:
  - [x] Unificação de Soluções e Projetos para uma apresentação direta e objetiva.
  - [x] 4 cards brancos industriais (ForgeX style) com fotos nítidas de projetos (Caldeiraria, Estruturas, Tubulações e Usinagem), tags técnicas (ASME, NBR, NR-12) e botões de ação rápida ↗.
  - [x] Régua horizontal dos setores atendidos: Sucroalcooleiro, Papel & Celulose, Metalmecânico, Agrícola e Químico.
- [x] **3.6 Seção 5 - Contato & CTA Final**:
  - [x] Bloco escuro de chamada para ação técnica (*"Tem um desafio de produção? Vamos engenhá-lo."*).
  - [x] Formulário B2B direto para WhatsApp e E-mail sem expor dados desnecessários.

---

## Etapa 4: Footer Técnico, Conformidade LGPD & Acessibilidade
- [x] **4.1 Footer Industrial**:
  - [x] Dados cadastrais completos da PROJDET, links rápidos e créditos técnicos.
- [x] **4.2 Banner & Modal LGPD**:
  - [x] Banner de cookies leve, com armazenamento de preferências no LocalStorage.

---

## Etapa 5: Painel Administrativo em Rota Protegida (`React.lazy`)
- [x] **5.1 Rota Oculta Protegida por Senha (`React.lazy`)**:
  - [x] O código do painel fica totalmente isolado em um chunk separado (não é baixado por visitantes comuns).
  - [x] Acesso através de URL dedicada (`/B4t8aBacktalk2-Plural-Applied-Slimy/Mashed0-Gyration-Overstay-Scrap-Multitude-proj`) sem tela de login nesta fase.
- [x] **5.2 Gerenciamento em Tempo Real no Supabase**:
  - [x] Gestão de Imagens de Alta Definição da Hero Section (`hero_settings` com upload direto WebP e preview ao vivo).
  - [x] Cadastro, edição e remoção de projetos com compressão automática de imagem para WebP até 200KB (`src/lib/imageUtils.js`).
  - [x] Sincronização direta com a tabela `projects`, `hero_settings` e os buckets do Supabase Storage.

---

## Etapa 6: Build Estático para Hostinger & Auditoria Final
- [🔄] **6.1 Criação do `.htaccess` para Hostinger**:
  - [ ] Regra de reescrita para Apache/LiteSpeed redirecionando rotas como a URL secreta para `index.html` (evitando erro 404).
- [ ] **6.2 Build de Produção (`npm run build`)**:
  - Geração da pasta `dist/` ultraleve (HTML/CSS/JS estáticos minificados) pronta para upload no `public_html` da Hostinger.
- [ ] **6.3 Validação de Performance e Regras Globais**:
  - Ausência de requisições desnecessárias, fontes e imagens otimizadas, e constantes comentadas para todas as animações.
