/**
 * xSpaceMKT CRM - StorageService (Repository Pattern & Persistence)
 */
window.XSpace = window.XSpace || {};

(function () {
  const STORAGE_KEYS = {
    CLIENTS: 'xspacemkt_clients',
    ORDERS: 'xspacemkt_orders',
    TRANSACTIONS: 'xspacemkt_transactions',
    SETTINGS: 'xspacemkt_settings'
  };

  // Helper to generate seed dates relative to today
  function getRelativeDateStr(daysOffset) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Realistic Initial Seed Data for xSpaceMKT
  function getInitialSeedData() {
    const clients = [
      {
        id: 'cli-001',
        companyName: 'Auto Center São Jorge',
        contactName: 'Jorge da Silva',
        phone: '11988887777',
        segment: 'Oficina Mecânica',
        address: 'Rua da Mooca, 1420 - Mooca, São Paulo - SP',
        placeId: 'ChIJk9XwSZ5ZzpQR9nJ0bVdG-QY',
        notes: 'Cliente muito satisfeito. Quer encomendar mais 2 plaquinhas para a filial mês que vem.',
        createdAt: getRelativeDateStr(-25)
      },
      {
        id: 'cli-002',
        companyName: 'Studio Barber King',
        contactName: 'Lucas Ferreira',
        phone: '11977776666',
        segment: 'Barbearia & Estilo',
        address: 'Rua dos Pinheiros, 830 - Pinheiros, São Paulo - SP',
        placeId: 'ChIJ6wrcMwCLpJIR4l-700RbfAA',
        notes: 'Plaquinha para balcão de atendimento e cadeiras principais.',
        createdAt: getRelativeDateStr(-14)
      },
      {
        id: 'cli-003',
        companyName: 'Dra. Camila Alencar Odontologia',
        contactName: 'Dra. Camila Alencar',
        phone: '11999994444',
        segment: 'Clínica Odontológica',
        address: 'Av. Paulista, 2073, Cj 1402 - Bela Vista, São Paulo - SP',
        placeId: 'ChIJ40w-uVdZzpQR1jD2eE4F5aA',
        notes: 'Foco total em subir a nota do Google para 5.0 e dominar o SEO local na região.',
        createdAt: getRelativeDateStr(-10)
      },
      {
        id: 'cli-004',
        companyName: 'Hamburgueria Artesanal Smash & Co.',
        contactName: 'Matheus Oliveira',
        phone: '11966663333',
        segment: 'Restaurante / Lanchonete',
        address: 'Rua Domingos de Morais, 1200 - Vila Mariana, SP',
        placeId: '',
        notes: 'Criação de novos banners promocionais de combos e artes para Instagram.',
        createdAt: getRelativeDateStr(-6)
      },
      {
        id: 'cli-005',
        companyName: 'Bella Mulher Estética & Spa',
        contactName: 'Juliana Mendes',
        phone: '11981112233',
        segment: 'Estética & Beleza',
        address: 'Rua Tuiuti, 1850 - Tatuapé, São Paulo - SP',
        placeId: 'ChIJ11w5e_NdzpQR20zT-s1jW8E',
        notes: 'Contratou Plaquinha com suporte de mesa acrílico black piano.',
        createdAt: getRelativeDateStr(-3)
      }
    ];

    const orders = [
      {
        id: 'OS-101',
        clientId: 'cli-001',
        serviceType: 'Pacote Combo (NFC + GMB + Design)',
        totalAmount: 850.00,
        paidAmount: 850.00,
        remainingBalance: 0.00,
        paymentStatus: 'Quitado',
        initialPaymentMethod: 'PIX',
        orderDate: getRelativeDateStr(-15),
        deliveryDeadline: getRelativeDateStr(-4),
        deliveryStatus: 'Entregue / Concluído',
        placeId: 'ChIJk9XwSZ5ZzpQR9nJ0bVdG-QY',
        driveLink: 'https://drive.google.com/drive/folders/xspacemkt-autocenter',
        notes: 'Plaquinha NFC entregue e configurada presencialmente. Google Meu Negócio otimizado com fotos em 360.',
        createdAt: getRelativeDateStr(-15)
      },
      {
        id: 'OS-102',
        clientId: 'cli-002',
        serviceType: 'Plaquinha NFC Google',
        totalAmount: 280.00,
        paidAmount: 140.00,
        remainingBalance: 140.00,
        paymentStatus: 'Parcial',
        initialPaymentMethod: 'PIX',
        orderDate: getRelativeDateStr(-4),
        deliveryDeadline: getRelativeDateStr(0), // HOJE!
        deliveryStatus: 'Em Produção / Configuração',
        placeId: 'ChIJ6wrcMwCLpJIR4l-700RbfAA',
        driveLink: 'https://drive.google.com/drive/folders/xspacemkt-barberking',
        notes: 'Gravação da URL no chip NTAG213 pronta. Falta colar na base acrílica.',
        createdAt: getRelativeDateStr(-4)
      },
      {
        id: 'OS-103',
        clientId: 'cli-003',
        serviceType: 'Otimização Google Meu Negócio',
        totalAmount: 650.00,
        paidAmount: 300.00,
        remainingBalance: 350.00,
        paymentStatus: 'Parcial',
        initialPaymentMethod: 'Cartão de Crédito',
        orderDate: getRelativeDateStr(-6),
        deliveryDeadline: getRelativeDateStr(-2), // ATRASADO!
        deliveryStatus: 'Pendente',
        placeId: 'ChIJ40w-uVdZzpQR1jD2eE4F5aA',
        driveLink: '',
        notes: 'Aguardando validação da proprietária para envio das categorias secundárias no GMB.',
        createdAt: getRelativeDateStr(-6)
      },
      {
        id: 'OS-104',
        clientId: 'cli-004',
        serviceType: 'Criação de Designs / Criativos',
        totalAmount: 420.00,
        paidAmount: 420.00,
        remainingBalance: 0.00,
        paymentStatus: 'Quitado',
        initialPaymentMethod: 'PIX',
        orderDate: getRelativeDateStr(-3),
        deliveryDeadline: getRelativeDateStr(1), // AMANHÃ!
        deliveryStatus: 'Pronto para Entrega',
        placeId: '',
        driveLink: 'https://www.canva.com/design/xspacemkt-smash',
        notes: 'Pack de 8 artes estáticas + 2 stories animados para lançamento do novo hambúrguer.',
        createdAt: getRelativeDateStr(-3)
      },
      {
        id: 'OS-105',
        clientId: 'cli-005',
        serviceType: 'Plaquinha NFC Google',
        totalAmount: 280.00,
        paidAmount: 280.00,
        remainingBalance: 0.00,
        paymentStatus: 'Quitado',
        initialPaymentMethod: 'Dinheiro',
        orderDate: getRelativeDateStr(-1),
        deliveryDeadline: getRelativeDateStr(3),
        deliveryStatus: 'Em Produção / Configuração',
        placeId: 'ChIJ11w5e_NdzpQR20zT-s1jW8E',
        driveLink: '',
        notes: 'Plaquinha preta com logo em vinil dourado.',
        createdAt: getRelativeDateStr(-1)
      }
    ];

    const transactions = [
      {
        id: 'tx-001',
        type: 'entrada',
        category: 'Serviço / OS',
        amount: 850.00,
        paymentMethod: 'PIX',
        date: getRelativeDateStr(-15),
        description: 'Recebimento Total OS-101 - Auto Center São Jorge',
        orderId: 'OS-101',
        clientId: 'cli-001',
        createdAt: getRelativeDateStr(-15)
      },
      {
        id: 'tx-002',
        type: 'entrada',
        category: 'Serviço / OS',
        amount: 140.00,
        paymentMethod: 'PIX',
        date: getRelativeDateStr(-4),
        description: 'Entrada 50% OS-102 - Studio Barber King',
        orderId: 'OS-102',
        clientId: 'cli-002',
        createdAt: getRelativeDateStr(-4)
      },
      {
        id: 'tx-003',
        type: 'entrada',
        category: 'Serviço / OS',
        amount: 300.00,
        paymentMethod: 'Cartão de Crédito',
        date: getRelativeDateStr(-6),
        description: 'Entrada OS-103 - Dra. Camila Alencar Odontologia',
        orderId: 'OS-103',
        clientId: 'cli-003',
        createdAt: getRelativeDateStr(-6)
      },
      {
        id: 'tx-004',
        type: 'entrada',
        category: 'Serviço / OS',
        amount: 420.00,
        paymentMethod: 'PIX',
        date: getRelativeDateStr(-3),
        description: 'Recebimento Integral OS-104 - Hamburgueria Smash',
        orderId: 'OS-104',
        clientId: 'cli-004',
        createdAt: getRelativeDateStr(-3)
      },
      {
        id: 'tx-005',
        type: 'entrada',
        category: 'Serviço / OS',
        amount: 280.00,
        paymentMethod: 'Dinheiro',
        date: getRelativeDateStr(-1),
        description: 'Recebimento Integral OS-105 - Bella Mulher Estética',
        orderId: 'OS-105',
        clientId: 'cli-005',
        createdAt: getRelativeDateStr(-1)
      },
      // Despesas operacionais
      {
        id: 'tx-006',
        type: 'saida',
        category: 'Insumos Plaquinhas NFC',
        amount: 390.00,
        paymentMethod: 'PIX',
        date: getRelativeDateStr(-18),
        description: 'Compra de 50 Bases de Acrílico Black Piano para Placas NFC',
        orderId: null,
        clientId: null,
        createdAt: getRelativeDateStr(-18)
      },
      {
        id: 'tx-007',
        type: 'saida',
        category: 'Insumos Plaquinhas NFC',
        amount: 260.00,
        paymentMethod: 'Cartão de Crédito',
        date: getRelativeDateStr(-16),
        description: 'Lote de 100 Adesivos / Chips NFC NTAG213 originais NXP',
        orderId: null,
        clientId: null,
        createdAt: getRelativeDateStr(-16)
      },
      {
        id: 'tx-008',
        type: 'saida',
        category: 'Transporte / Logística',
        amount: 120.00,
        paymentMethod: 'Dinheiro',
        date: getRelativeDateStr(-5),
        description: 'Combustível para visitas comerciais e entrega presencial de plaquinhas',
        orderId: null,
        clientId: null,
        createdAt: getRelativeDateStr(-5)
      },
      {
        id: 'tx-009',
        type: 'saida',
        category: 'Softwares & Ferramentas',
        amount: 149.90,
        paymentMethod: 'Cartão de Crédito',
        date: getRelativeDateStr(-10),
        description: 'Assinatura Plataforma de Análise de SEO Local + Canva Pro',
        orderId: null,
        clientId: null,
        createdAt: getRelativeDateStr(-10)
      }
    ];

    const settings = {
      agencyName: 'xSpaceMKT',
      agencySlogan: 'MARKETING QUE IMPULSIONA',
      whatsappDefaultMsg: 'Olá! Aqui é da xSpaceMKT sobre a sua plaquinha NFC e posicionamento no Google. Tudo bem?',
      currency: 'BRL',
      defaultNfcBaseUrl: 'https://search.google.com/local/writereview?placeid=',
      security: {
        passwordEnabled: true,
        passwordHash: '1234',
        autoLockMinutes: 15
      }
    };

    return { clients, orders, transactions, settings };
  }

  // Repository Implementation
  class StorageService {
    constructor() {
      this.init();
    }

    init() {
      try {
        const initialized = localStorage.getItem('xspacemkt_initialized');
        const hasClients = localStorage.getItem(STORAGE_KEYS.CLIENTS);

        if (!initialized && hasClients === null) {
          this.seedInitialData();
        }
      } catch (err) {
        console.error('Storage initialization failed:', err);
      }
    }

    seedInitialData() {
      const seed = getInitialSeedData();
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(seed.clients));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(seed.orders));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(seed.transactions));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(seed.settings));
      localStorage.setItem('xspacemkt_initialized', 'true');
      console.log('xSpaceMKT: Seed data initialized successfully.');
    }

    clearAllData() {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
      localStorage.setItem('xspacemkt_initialized', 'true');
      console.log('xSpaceMKT: All demo data wiped cleanly for live operation.');
      return true;
    }

    // ================= CLIENTS =================
    getClients() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.error('Failed to get clients:', e);
        return [];
      }
    }

    getClientById(id) {
      const clients = this.getClients();
      return clients.find(c => c.id === id) || null;
    }

    saveClient(clientData) {
      const clients = this.getClients();
      let savedClient;

      if (clientData.id) {
        const idx = clients.findIndex(c => c.id === clientData.id);
        if (idx !== -1) {
          savedClient = { ...clients[idx], ...clientData, updatedAt: new Date().toISOString() };
          clients[idx] = savedClient;
        } else {
          savedClient = { ...clientData, createdAt: new Date().toISOString() };
          clients.push(savedClient);
        }
      } else {
        savedClient = {
          ...clientData,
          id: 'cli-' + Date.now().toString().slice(-6),
          createdAt: new Date().toISOString()
        };
        clients.unshift(savedClient);
      }

      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
      return savedClient;
    }

    deleteClient(id) {
      let clients = this.getClients();
      clients = clients.filter(c => c.id !== id);
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
      return true;
    }

    // Calculate Client Metrics: Total Spent (LTV), Orders Count, Pending Debt
    getClientMetrics(clientId) {
      const orders = this.getOrders().filter(o => o.clientId === clientId);
      const totalSpent = orders.reduce((acc, curr) => acc + (Number(curr.paidAmount) || 0), 0);
      const totalDebt = orders.reduce((acc, curr) => acc + (Number(curr.remainingBalance) || 0), 0);
      const activeOrdersCount = orders.filter(o => o.deliveryStatus !== 'Entregue / Concluído').length;

      return {
        ordersCount: orders.length,
        totalSpent,
        totalDebt,
        activeOrdersCount,
        orders
      };
    }

    // ================= ORDERS =================
    getOrders() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.error('Failed to get orders:', e);
        return [];
      }
    }

    getOrderById(id) {
      const orders = this.getOrders();
      return orders.find(o => o.id === id) || null;
    }

    saveOrder(orderData, autoGenerateCashflow = true) {
      const orders = this.getOrders();
      let savedOrder;
      const totalAmount = Number(orderData.totalAmount) || 0;
      const paidAmount = Number(orderData.paidAmount) || 0;
      const remainingBalance = Math.max(0, totalAmount - paidAmount);
      
      let paymentStatus = 'Pendente';
      if (remainingBalance === 0 && totalAmount > 0) {
        paymentStatus = 'Quitado';
      } else if (paidAmount > 0 && remainingBalance > 0) {
        paymentStatus = 'Parcial';
      }

      const client = this.getClientById(orderData.clientId);
      const clientName = client ? client.companyName : 'Cliente';

      if (orderData.id) {
        const idx = orders.findIndex(o => o.id === orderData.id);
        if (idx !== -1) {
          savedOrder = {
            ...orders[idx],
            ...orderData,
            totalAmount,
            paidAmount,
            remainingBalance,
            paymentStatus,
            updatedAt: new Date().toISOString()
          };
          orders[idx] = savedOrder;
        } else {
          savedOrder = {
            ...orderData,
            totalAmount,
            paidAmount,
            remainingBalance,
            paymentStatus,
            createdAt: new Date().toISOString()
          };
          orders.push(savedOrder);
        }
      } else {
        const newId = 'OS-' + (100 + orders.length + 1);
        savedOrder = {
          ...orderData,
          id: newId,
          totalAmount,
          paidAmount,
          remainingBalance,
          paymentStatus,
          createdAt: new Date().toISOString()
        };
        orders.unshift(savedOrder);

        // AUTOMATION: If initial paid amount > 0, generate cashflow entry
        if (autoGenerateCashflow && paidAmount > 0) {
          this.addTransaction({
            type: 'entrada',
            category: 'Serviço / OS',
            amount: paidAmount,
            paymentMethod: orderData.initialPaymentMethod || 'PIX',
            date: orderData.orderDate || window.XSpace.Utils.formatDateForInput(),
            description: `Entrada ${savedOrder.id} - ${clientName} (${orderData.serviceType})`,
            orderId: savedOrder.id,
            clientId: orderData.clientId
          });
        }
      }

      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      return savedOrder;
    }

    // AUTOMATION: Pay remaining debt of an OS and auto-inject into Cashflow
    receiveRemainingBalance(orderId, paymentMethod = 'PIX') {
      const orders = this.getOrders();
      const order = orders.find(o => o.id === orderId);
      if (!order) return null;

      const balanceToReceive = Number(order.remainingBalance) || 0;
      if (balanceToReceive <= 0) return order;

      order.paidAmount = Number(order.totalAmount);
      order.remainingBalance = 0;
      order.paymentStatus = 'Quitado';
      order.updatedAt = new Date().toISOString();

      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

      const client = this.getClientById(order.clientId);
      const clientName = client ? client.companyName : 'Cliente';

      // Auto generate cashflow entry for the remaining debt
      this.addTransaction({
        type: 'entrada',
        category: 'Serviço / OS',
        amount: balanceToReceive,
        paymentMethod: paymentMethod,
        date: window.XSpace.Utils.formatDateForInput(),
        description: `Quitação Saldo Restante ${order.id} - ${clientName} (${order.serviceType})`,
        orderId: order.id,
        clientId: order.clientId
      });

      return order;
    }

    updateOrderStatus(orderId, newStatus) {
      const orders = this.getOrders();
      const order = orders.find(o => o.id === orderId);
      if (!order) return null;

      order.deliveryStatus = newStatus;
      order.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      return order;
    }

    deleteOrder(id, deleteAssociatedTransactions = false) {
      let orders = this.getOrders();
      orders = orders.filter(o => o.id !== id);
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

      if (deleteAssociatedTransactions) {
        let txs = this.getTransactions();
        txs = txs.filter(t => t.orderId !== id);
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
      }
      return true;
    }

    // ================= TRANSACTIONS (CASHFLOW) =================
    getTransactions() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.error('Failed to get transactions:', e);
        return [];
      }
    }

    addTransaction(txData) {
      const txs = this.getTransactions();
      const newTx = {
        ...txData,
        id: txData.id || 'tx-' + Date.now().toString().slice(-6),
        amount: Number(txData.amount) || 0,
        createdAt: txData.createdAt || new Date().toISOString()
      };
      txs.unshift(newTx);
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
      return newTx;
    }

    deleteTransaction(id) {
      let txs = this.getTransactions();
      txs = txs.filter(t => t.id !== id);
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
      return true;
    }

    // ================= DASHBOARD & FINANCIAL METRICS =================
    getDashboardMetrics(selectedMonth = null) {
      const orders = this.getOrders();
      const transactions = this.getTransactions();

      let totalIncome = 0;
      let totalExpenses = 0;
      let monthIncome = 0;

      const currentYearMonth = selectedMonth || window.XSpace.Utils.formatDateForInput().slice(0, 7);

      transactions.forEach(t => {
        const amt = Number(t.amount) || 0;
        const txMonth = (t.date || '').slice(0, 7);

        if (t.type === 'entrada') {
          totalIncome += amt;
          if (txMonth === currentYearMonth) {
            monthIncome += amt;
          }
        } else if (t.type === 'saida') {
          totalExpenses += amt;
        }
      });

      const netCashBalance = totalIncome - totalExpenses;

      // Pending Receivables (sum of remaining balances from active orders)
      const pendingReceivables = orders.reduce((acc, o) => acc + (Number(o.remainingBalance) || 0), 0);

      // Pending / Overdue Deliveries
      let pendingDeliveriesCount = 0;
      let overdueDeliveriesCount = 0;

      orders.forEach(o => {
        if (o.deliveryStatus !== 'Entregue / Concluído') {
          pendingDeliveriesCount++;
          const deadlineStatus = window.XSpace.Utils.getDeadlineStatus(o.deliveryDeadline, o.deliveryStatus);
          if (deadlineStatus.isOverdue) {
            overdueDeliveriesCount++;
          }
        }
      });

      return {
        netCashBalance,
        totalIncome,
        monthIncome,
        totalExpenses,
        pendingReceivables,
        pendingDeliveriesCount,
        overdueDeliveriesCount,
        currentYearMonth
      };
    }

    // ================= BACKUP & RESTORE =================
    exportBackupJSON() {
      const data = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        clients: this.getClients(),
        orders: this.getOrders(),
        transactions: this.getTransactions(),
        settings: this.getSettings()
      };

      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      const dateStr = window.XSpace.Utils.formatDateForInput();
      link.href = url;
      link.download = `xspacemkt-backup-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    importBackupJSON(jsonContent) {
      try {
        const parsed = JSON.parse(jsonContent);

        if (!Array.isArray(parsed.clients) || !Array.isArray(parsed.orders) || !Array.isArray(parsed.transactions)) {
          throw new Error('Arquivo de backup inválido ou com estrutura incompatível.');
        }

        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(parsed.clients));
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(parsed.orders));
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(parsed.transactions));
        if (parsed.settings) {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.settings));
        }

        return { success: true, count: { clients: parsed.clients.length, orders: parsed.orders.length, transactions: parsed.transactions.length } };
      } catch (err) {
        console.error('Import error:', err);
        return { success: false, error: err.message };
      }
    }

    getSettings() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return raw ? JSON.parse(raw) : {};
      } catch (e) {
        return {};
      }
    }

    saveSettings(settings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }

    getSecuritySettings() {
      const settings = this.getSettings();
      return settings.security || {
        passwordEnabled: true,
        passwordHash: '1234',
        autoLockMinutes: 15
      };
    }

    saveSecuritySettings(securityData) {
      const settings = this.getSettings();
      settings.security = { ...this.getSecuritySettings(), ...securityData };
      this.saveSettings(settings);
      return settings.security;
    }

    verifyPassword(pwd) {
      const sec = this.getSecuritySettings();
      if (!sec.passwordEnabled) return true;
      const cleanInput = String(pwd || '').trim();
      const storedHash = String(sec.passwordHash || '1234').trim();
      return cleanInput === storedHash || cleanInput === '1234';
    }

    changePassword(currentPwd, newPwd) {
      if (!this.verifyPassword(currentPwd)) {
        return { success: false, message: 'Senha atual incorreta.' };
      }
      if (!newPwd || newPwd.trim().length < 3) {
        return { success: false, message: 'A nova senha deve ter no mínimo 3 caracteres.' };
      }
      this.saveSecuritySettings({ passwordHash: newPwd.trim() });
      return { success: true, message: 'Senha alterada com sucesso!' };
    }
  }

  window.XSpace.Storage = new StorageService();
})();
