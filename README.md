# xSpaceMKT - CRM & Sistema de Gestão Operacional e Financeira

Sistema completo, moderno e responsivo desenvolvido sob medida para a **xSpaceMKT** (*Marketing que Impulsiona*). O sistema atende perfeitamente às três operações centrais da agência:
1. **Venda e Configuração de Plaquinhas NFC** (Avaliações 5 Estrelas no Google).
2. **Posicionamento & Otimização no Google Meu Negócio** (SEO Local).
3. **Criação de Designs em Geral** (Identidade Visual, Banners e Criativos).

---

## 🚀 Como Executar

### Opção 1: Uso Imediato (Zero Instalação)
- Basta dar um **duplo clique no arquivo `index.html`** no Windows Explorer. Ele abrirá diretamente no Google Chrome, Microsoft Edge ou qualquer navegador moderno com 100% das funcionalidades ativas!

### Opção 2: Servidor Local
Se preferir rodar via terminal local:
```bash
npm start
# Ou
npx serve .
```

---

## 🎨 Identidade Visual & Design System
- **Paleta de Cores Oficial:** Baseada na marca `xSpaceMKT`:
  - **Fundo Deep Dark:** `#080C14` e superfícies `#0F1726` com bordas sutis `#1E293B`.
  - **Laranja xSpace:** `#FF6A00` para destaque e botões de conversão com efeito glow.
  - **Verde Esmeralda:** `#10B981` para entradas financeiras e ordens quitadas.
  - **Vermelho Rose:** `#F43F5E` para custos operacionais e alertas de ordens atrasadas.
  - **Amarelo Âmbar:** `#F59E0B` para prazos próximos e saldos devedores parciais.
- **Logo Integrada:** A logo oficial da agência está incorporada diretamente no cabeçalho e na barra lateral.
- **Mobile-First & Desktop Ready:** Interface com barra lateral expansiva no computador e barra de navegação no rodapé (*Bottom Navigation*) para uso rápido no celular em campo/visitas a clientes.

---

## 💼 Funcionalidades & Módulos

### 1. Dashboard & Gestão de Caixa (Financeiro)
- **Cards de KPIs no Topo:**
  1. **Saldo Líquido em Caixa** (Entradas menos despesas).
  2. **Faturamento Bruto do Mês** (Entradas do mês vigente).
  3. **Valores a Receber (Pendente)** (Soma de saldos restantes devidos por clientes).
  4. **Custos & Despesas Operacionais** (Acrílicos, chips NFC NTAG213, combustíveis, ferramentas).
  5. **Entregas Pendentes / Atrasadas** (Contador inteligente de prazos ativos).
- **Gráficos em Tempo Real (Chart.js):**
  - Gráfico de barras com entradas vs despesas dos últimos dias.
  - Gráfico Donut de distribuição de receita por serviço.
- **Fluxo de Caixa Completo:**
  - Lançamento rápido de Entradas ou Saídas/Despesas avulsas com data, descrição, categoria, forma de pagamento e valor.
  - Tabela de extrato com filtros dinâmicos por tipo (Entrada/Saída), categoria e busca.

### 2. Gestão de Ordens de Serviço (OS) & Prazos
- **Visualização Dupla:**
  - **Quadro Kanban Interativo:** Colunas *Pendente*, *Em Produção*, *Pronto para Entrega* e *Entregue / Concluído* com suporte a **Drag & Drop** ou clique rápido.
  - **Tabela Detalhada:** Filtros por status de entrega e status de pagamento.
- **Automação Inteligente de Caixa:**
  - Ao criar uma nova OS com entrada paga > 0, o sistema **gera automaticamente uma transação de Entrada no Fluxo de Caixa**.
  - Se a OS tiver saldo devedor pendente, exibe o botão **"💰 Dar Baixa / Receber"**. Ao clicar, o saldo é quitado e o valor restante é lançado instantaneamente no Caixa.
- **Controle de Prazos Inteligente:**
  - Badges vermelhos com animação de pulso para serviços **atrasados**.
  - Badges amarelos para serviços que vencem **hoje** ou **amanhã**.
  - Cálculo automático de dias restantes.

### 3. Carteira de Clientes (CRM & Prospecção)
- Cadastro de Nome da Empresa, Responsável, Telefone WhatsApp, Segmento, Endereço e Place ID.
- **Ação Rápida WhatsApp:** Botão verde que abre conversa direta no WhatsApp (`https://wa.me/55...`) com mensagem pré-formatada.
- **Métricas de LTV por Cliente:** Visualização instantânea de quanto o cliente já investiu no total, total de ordens contratadas e histórico completo de pedidos.

### 4. Ferramenta Integrada: Gerador de Link NFC Google
- Digite apenas o **Place ID** da empresa (ex: `ChIJ6wrcMwCLpJIR4l-700RbfAA`).
- O sistema monta a URL oficial: `https://search.google.com/local/writereview?placeid=SEU_ID`.
- **Analisador de Memória NTAG213 (144 bytes):** Exibe contador de bytes em tempo real e barra de compatibilidade para gravação.
- Botões de **Copiar Link** (com feedback toast) e **Testar Link em Nova Aba**.
- **QR Code Automático** renderizado na tela para impressão imediata.

### 5. Exportação em PDF Personalizado da Empresa (xSpaceMKT)
- **Relatório Executivo Oficial (.pdf):**
  - Ao clicar em **"Exportar Relatório PDF"** (disponível no cabeçalho e na barra lateral), o sistema gera instantaneamente um arquivo PDF corporativo no padrão A4 (`xSpaceMKT-Relatorio-Gestao-AAAA-MM-DD.pdf`).
  - **Identidade da Agência:** Cabeçalho com a logo da `xSpaceMKT`, slogan *"Marketing que Impulsiona"* e dados da emissão.
  - **Seções Estruturadas:**
    1. **Resumo Executivo (KPIs):** Saldo em Caixa, Faturamento Mensal, Contas a Receber e Custos Operacionais.
    2. **Ordens de Serviço Ativas & Histórico:** Tabela com códigos de OS, clientes, serviços (NFC, GMB, Design), valores e prazos.
    3. **Extrato do Fluxo de Caixa Recente:** Entradas e Despesas com categorias e formas de pagamento.
    4. **Carteira de Clientes:** Empresas atendidas, contatos, telefones e LTV acumulado.
  - **Pré-visualização e Impressão:** Botão **"👁️ Ver PDF"** permite visualizar o documento em tela cheia antes de salvar ou imprimir diretamente via impressora / PDF nativo do navegador.
  - **Backup Técnico Complementar:** Opção discreta para download do arquivo bruto `.json` caso deseje transferir dados entre navegadores ou restaurar em outro dispositivo.

### 6. Sistema de Senha & Proteção de Acesso (Aba Segurança)
- **Tela de Bloqueio Completa (Lock Screen):**
  - Ao abrir a plataforma ou após período de inatividade, o sistema exibe uma tela de bloqueio com a marca xSpaceMKT, impedindo que qualquer pessoa visualize saldos, clientes ou ordens de serviço.
  - **Senha padrão de primeiro acesso:** `1234`.
  - Animação de vibração (*shake*) e mensagem de erro visual caso a senha digitada esteja incorreta.
- **Aba Dedicada "Segurança & Senha":**
  - **Alteração de Senha Mestre:** Permite trocar a senha atual informando a senha antiga e a nova senha.
  - **Preferências de Bloqueio:**
    - Ativar / desativar a exigência de senha ao entrar.
    - Bloqueio automático por inatividade configurável (5 min, 15 min, 30 min, 1 hora ou desativado).
  - **Botão de Bloqueio Rápido:** Botão `🔒 Bloquear Sistema Agora (Sair)` no cabeçalho e na aba de segurança para proteger a tela com 1 clique antes de se afastar do computador ou celular.

---
*xSpaceMKT - Marketing que Impulsiona.*
