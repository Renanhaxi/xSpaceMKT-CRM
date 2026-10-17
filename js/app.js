/**
 * xSpaceMKT CRM - Main Application Logic & UI Controller
 */
window.XSpace = window.XSpace || {};

(function () {
  const { Utils, Storage } = window.XSpace;

  const App = {
    currentTab: 'dashboard',
    osViewMode: 'kanban', // 'kanban' or 'table'
    filters: {
      ordersSearch: '',
      ordersDeliveryStatus: 'all',
      ordersPaymentStatus: 'all',
      clientsSearch: '',
      clientsSegment: 'all',
      cashflowSearch: '',
      cashflowType: 'all',
      cashflowCategory: 'all'
    },
    cashflowChart: null,
    servicesChart: null,

    // Initialize application
    init() {
      this.initSecurity();
      this.bindGlobalEvents();
      this.switchTab('dashboard');
      this.renderAll();
      this.setupNfcTool();
      this.setupAutoCalculations();

      // Set default dates on inputs
      const today = Utils.formatDateForInput();
      document.querySelectorAll('input[type="date"].default-today').forEach(input => {
        if (!input.value) input.value = today;
      });

      console.log('xSpaceMKT CRM initialized successfully.');
    },

    // Global Event Listeners
    bindGlobalEvents() {
      // Navigation clicks
      document.querySelectorAll('[data-nav-tab]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const tab = e.currentTarget.getAttribute('data-nav-tab');
          this.switchTab(tab);
        });
      });

      // Backup & PDF Export
      const exportPdfBtn = document.getElementById('btn-export-pdf');
      if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', () => {
          if (window.XSpace.PdfService) {
            window.XSpace.PdfService.exportPdf();
          }
        });
      }

      const exportBtn = document.getElementById('btn-export-backup');
      if (exportBtn) {
        exportBtn.addEventListener('click', () => {
          Storage.exportBackupJSON();
          Utils.showToast('Backup Técnico Exportado!', 'Arquivo JSON salvo com sucesso.', 'info');
        });
      }

      const importInput = document.getElementById('file-import-backup');
      if (importInput) {
        importInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = (event) => {
            const res = Storage.importBackupJSON(event.target.result);
            if (res.success) {
              Utils.showToast('Backup Restaurado!', `Carregados ${res.count.clients} clientes e ${res.count.orders} ordens.`, 'success');
              this.renderAll();
            } else {
              Utils.showToast('Falha no Backup', res.error, 'error');
            }
            importInput.value = '';
          };
          reader.readAsText(file);
        });
      }

      // Reset to seed data
      const resetBtn = document.getElementById('btn-reset-demo');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if (confirm('Deseja restaurar os dados de exemplo da xSpaceMKT? Os dados atuais serão substituídos pelo modelo inicial.')) {
            Storage.seedInitialData();
            Utils.showToast('Dados Restaurados!', 'Dados padrão de demonstração recarregados com sucesso.', 'info');
            this.renderAll();
          }
        });
      }

      // Clear all demo data for clean production start
      const clearBtn = document.getElementById('btn-clear-demo');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          this.clearAllDemoData();
        });
      }

      // OS View mode toggles
      const viewTableBtn = document.getElementById('btn-os-view-table');
      const viewKanbanBtn = document.getElementById('btn-os-view-kanban');
      if (viewTableBtn && viewKanbanBtn) {
        viewTableBtn.addEventListener('click', () => {
          this.osViewMode = 'table';
          viewTableBtn.classList.add('bg-orange-600', 'text-white');
          viewTableBtn.classList.remove('text-slate-400');
          viewKanbanBtn.classList.remove('bg-orange-600', 'text-white');
          viewKanbanBtn.classList.add('text-slate-400');
          this.renderOrders();
        });
        viewKanbanBtn.addEventListener('click', () => {
          this.osViewMode = 'kanban';
          viewKanbanBtn.classList.add('bg-orange-600', 'text-white');
          viewKanbanBtn.classList.remove('text-slate-400');
          viewTableBtn.classList.remove('bg-orange-600', 'text-white');
          viewTableBtn.classList.add('text-slate-400');
          this.renderOrders();
        });
      }
    },

    // Navigation switcher
    switchTab(tabName) {
      this.currentTab = tabName;

      // Update active nav styling
      document.querySelectorAll('[data-nav-tab]').forEach(btn => {
        const btnTab = btn.getAttribute('data-nav-tab');
        if (btnTab === tabName) {
          btn.classList.add('nav-active');
          btn.classList.remove('text-slate-400', 'hover:text-slate-200');
        } else {
          btn.classList.remove('nav-active');
          btn.classList.add('text-slate-400', 'hover:text-slate-200');
        }
      });

      // Show/Hide Tab Panes
      document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.add('hidden');
      });
      const targetPane = document.getElementById(`tab-pane-${tabName}`);
      if (targetPane) {
        targetPane.classList.remove('hidden');
      }

      // Render tab-specific components
      if (tabName === 'dashboard') {
        this.renderDashboard();
      } else if (tabName === 'orders') {
        this.renderOrders();
      } else if (tabName === 'clients') {
        this.renderClients();
      } else if (tabName === 'cashflow') {
        this.renderCashflow();
      } else if (tabName === 'nfc') {
        this.setupNfcTool();
      } else if (tabName === 'security') {
        this.renderSecurityTab();
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // Render entire UI
    renderAll() {
      this.renderDashboard();
      this.renderOrders();
      this.renderClients();
      this.renderCashflow();
      this.populateClientSelectOptions();
    },

    // ================= DASHBOARD =================
    renderDashboard() {
      const metrics = Storage.getDashboardMetrics();

      // Top KPI Cards
      const elNetCash = document.getElementById('kpi-net-cash');
      const elMonthIncome = document.getElementById('kpi-month-income');
      const elPendingReceivables = document.getElementById('kpi-pending-receivables');
      const elTotalExpenses = document.getElementById('kpi-total-expenses');
      const elPendingDeliveries = document.getElementById('kpi-pending-deliveries');

      if (elNetCash) elNetCash.textContent = Utils.formatCurrency(metrics.netCashBalance);
      if (elMonthIncome) elMonthIncome.textContent = Utils.formatCurrency(metrics.monthIncome);
      if (elPendingReceivables) elPendingReceivables.textContent = Utils.formatCurrency(metrics.pendingReceivables);
      if (elTotalExpenses) elTotalExpenses.textContent = Utils.formatCurrency(metrics.totalExpenses);
      
      if (elPendingDeliveries) {
        let text = `${metrics.pendingDeliveriesCount} em andamento`;
        if (metrics.overdueDeliveriesCount > 0) {
          text += ` (${metrics.overdueDeliveriesCount} atrasada${metrics.overdueDeliveriesCount > 1 ? 's' : ''}! )`;
          elPendingDeliveries.classList.add('text-rose-400');
        } else {
          elPendingDeliveries.classList.remove('text-rose-400');
        }
        elPendingDeliveries.textContent = text;
      }

      // Recent urgent orders list
      this.renderDashboardUrgentOrders();
      // Recent transactions
      this.renderDashboardRecentTransactions();
      // Render Charts
      this.renderDashboardCharts();
    },

    renderDashboardUrgentOrders() {
      const container = document.getElementById('dashboard-urgent-orders');
      if (!container) return;

      const orders = Storage.getOrders()
        .filter(o => o.deliveryStatus !== 'Entregue / Concluído')
        .sort((a, b) => new Date(a.deliveryDeadline) - new Date(b.deliveryDeadline))
        .slice(0, 5);

      if (orders.length === 0) {
        container.innerHTML = `
          <div class="p-6 text-center text-slate-400 text-sm">
            <svg class="w-10 h-10 mx-auto text-emerald-500/50 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Tudo em dia! Nenhuma ordem de serviço pendente ou atrasada.
          </div>
        `;
        return;
      }

      container.innerHTML = orders.map(order => {
        const client = Storage.getClientById(order.clientId);
        const deadline = Utils.getDeadlineStatus(order.deliveryDeadline, order.deliveryStatus);
        const clientName = client ? client.companyName : 'Cliente não identificado';

        return `
          <div class="flex items-center justify-between p-3.5 bg-slate-900/60 hover:bg-slate-800/80 rounded-xl border border-slate-800/80 transition-all mb-2.5">
            <div class="flex items-center space-x-3">
              <span class="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold text-xs flex items-center justify-center">
                ${order.id.replace('OS-', '#')}
              </span>
              <div>
                <h4 class="text-sm font-semibold text-slate-100">${clientName}</h4>
                <div class="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span class="text-orange-400 font-medium">${order.serviceType}</span>
                  <span>•</span>
                  <span>Entrega: ${Utils.formatDate(order.deliveryDeadline)}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <span class="px-2.5 py-1 text-xs rounded-full ${deadline.badgeClass}">
                ${deadline.text}
              </span>
              <button onclick="window.XSpace.App.openEditOrderModal('${order.id}')" class="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700">
                Ver OS
              </button>
            </div>
          </div>
        `;
      }).join('');
    },

    renderDashboardRecentTransactions() {
      const container = document.getElementById('dashboard-recent-transactions');
      if (!container) return;

      const txs = Storage.getTransactions().slice(0, 5);

      if (txs.length === 0) {
        container.innerHTML = `<div class="p-6 text-center text-slate-400 text-sm">Nenhum lançamento no caixa ainda.</div>`;
        return;
      }

      container.innerHTML = txs.map(tx => {
        const isIncome = tx.type === 'entrada';
        const sign = isIncome ? '+' : '-';
        const colorClass = isIncome ? 'text-emerald-400' : 'text-rose-400';
        const bgIcon = isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400';

        return `
          <div class="flex items-center justify-between p-3 bg-slate-900/60 hover:bg-slate-800/60 rounded-xl border border-slate-800/80 transition-all mb-2">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded-lg ${bgIcon} flex items-center justify-center text-xs font-bold">
                ${isIncome ? '↓' : '↑'}
              </div>
              <div>
                <div class="text-sm font-medium text-slate-200">${tx.description}</div>
                <div class="text-xs text-slate-400">${Utils.formatDate(tx.date)} • ${tx.paymentMethod || 'PIX'} • ${tx.category}</div>
              </div>
            </div>
            <div class="text-sm font-bold ${colorClass}">
              ${sign} ${Utils.formatCurrency(tx.amount)}
            </div>
          </div>
        `;
      }).join('');
    },

    renderDashboardCharts() {
      // Check if Chart.js is loaded
      if (typeof Chart === 'undefined') return;

      const transactions = Storage.getTransactions();
      const orders = Storage.getOrders();

      // Chart 1: Cashflow (Entradas vs Saídas)
      const ctxCash = document.getElementById('chart-cashflow');
      if (ctxCash) {
        // Group by last 6 days or transactions
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = Utils.formatDateForInput(d);
          last7Days.push({
            dateStr,
            label: `${d.getDate()}/${d.getMonth() + 1}`,
            income: 0,
            expense: 0
          });
        }

        transactions.forEach(t => {
          const found = last7Days.find(d => d.dateStr === t.date);
          if (found) {
            if (t.type === 'entrada') found.income += Number(t.amount);
            else if (t.type === 'saida') found.expense += Number(t.amount);
          }
        });

        if (this.cashflowChart) this.cashflowChart.destroy();

        this.cashflowChart = new Chart(ctxCash, {
          type: 'bar',
          data: {
            labels: last7Days.map(d => d.label),
            datasets: [
              {
                label: 'Entradas (R$)',
                data: last7Days.map(d => d.income),
                backgroundColor: '#10B981',
                borderRadius: 6
              },
              {
                label: 'Despesas (R$)',
                data: last7Days.map(d => d.expense),
                backgroundColor: '#F43F5E',
                borderRadius: 6
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: { color: '#94A3B8', font: { family: 'Plus Jakarta Sans', size: 11 } }
              }
            },
            scales: {
              x: { grid: { color: '#1E293B' }, ticks: { color: '#94A3B8' } },
              y: { grid: { color: '#1E293B' }, ticks: { color: '#94A3B8' } }
            }
          }
        });
      }

      // Chart 2: Services Distribution
      const ctxServices = document.getElementById('chart-services');
      if (ctxServices) {
        const counts = {
          'Plaquinha NFC': 0,
          'Otimização GMB': 0,
          'Design': 0,
          'Pacote Combo': 0
        };

        orders.forEach(o => {
          if (o.serviceType.includes('NFC') && !o.serviceType.includes('Combo')) counts['Plaquinha NFC']++;
          else if (o.serviceType.includes('Google') || o.serviceType.includes('GMB')) counts['Otimização GMB']++;
          else if (o.serviceType.includes('Design')) counts['Design']++;
          else if (o.serviceType.includes('Combo')) counts['Pacote Combo']++;
          else counts['Plaquinha NFC']++;
        });

        if (this.servicesChart) this.servicesChart.destroy();

        this.servicesChart = new Chart(ctxServices, {
          type: 'doughnut',
          data: {
            labels: Object.keys(counts),
            datasets: [
              {
                data: Object.values(counts),
                backgroundColor: ['#FF6A00', '#0EA5E9', '#8B5CF6', '#10B981'],
                borderWidth: 0
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: '#94A3B8', font: { family: 'Plus Jakarta Sans', size: 11 } }
              }
            },
            cutout: '68%'
          }
        });
      }
    },

    // ================= CLIENTS =================
    renderClients() {
      const container = document.getElementById('clients-list-container');
      if (!container) return;

      let clients = Storage.getClients();
      const search = (this.filters.clientsSearch || '').toLowerCase().trim();
      const segmentFilter = this.filters.clientsSegment;

      if (search) {
        clients = clients.filter(c =>
          (c.companyName || '').toLowerCase().includes(search) ||
          (c.contactName || '').toLowerCase().includes(search) ||
          (c.phone || '').includes(search) ||
          (c.address || '').toLowerCase().includes(search)
        );
      }

      if (segmentFilter && segmentFilter !== 'all') {
        clients = clients.filter(c => c.segment === segmentFilter);
      }

      if (clients.length === 0) {
        container.innerHTML = `
          <div class="col-span-full py-16 text-center text-slate-400">
            <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            </div>
            <p class="text-base font-medium text-slate-300">Nenhum cliente encontrado</p>
            <p class="text-xs text-slate-500 mt-1">Tente ajustar seus filtros de busca ou cadastre um novo cliente.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = clients.map(client => {
        const metrics = Storage.getClientMetrics(client.id);
        const waLink = Utils.buildWhatsAppLink(
          client.phone,
          `Olá ${client.contactName || ''}! Aqui é da xSpaceMKT. Tudo bem? Gostaria de alinhar sobre seu serviço.`
        );

        return `
          <div class="glass-card rounded-2xl p-5 flex flex-col justify-between hover:shadow-xl transition-all relative overflow-hidden group">
            <div class="absolute top-0 left-0 w-1.5 h-full bg-orange-500/80 group-hover:bg-orange-500 transition-colors"></div>

            <div>
              <div class="flex items-start justify-between mb-3">
                <div>
                  <span class="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-1.5">
                    ${client.segment || 'Geral'}
                  </span>
                  <h3 class="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">
                    ${client.companyName}
                  </h3>
                  <p class="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    ${client.contactName || 'Sem contato'}
                  </p>
                </div>

                <!-- WhatsApp Quick Action Button -->
                <a href="${waLink}" target="_blank" rel="noopener noreferrer" 
                   class="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 transition-all flex items-center justify-center shadow-lg"
                   title="Falar no WhatsApp">
                  <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </a>
              </div>

              <!-- Address and Phone -->
              <div class="space-y-1 text-xs text-slate-400 mb-4">
                <div class="flex items-center gap-1.5">
                  <span class="text-slate-500">📞</span>
                  <span>${Utils.formatPhone(client.phone)}</span>
                </div>
                ${client.address ? `
                  <div class="flex items-center gap-1.5 truncate" title="${client.address}">
                    <span class="text-slate-500">📍</span>
                    <span class="truncate">${client.address}</span>
                  </div>
                ` : ''}
              </div>

              <!-- Metrics Strip (LTV, OS Count, Debt) -->
              <div class="grid grid-cols-3 gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center mb-4">
                <div>
                  <div class="text-[10px] text-slate-400 font-medium">LTV (Total)</div>
                  <div class="text-xs font-bold text-emerald-400 mt-0.5">${Utils.formatCurrency(metrics.totalSpent)}</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400 font-medium">Serviços</div>
                  <div class="text-xs font-bold text-white mt-0.5">${metrics.ordersCount} OS</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400 font-medium">A Receber</div>
                  <div class="text-xs font-bold ${metrics.totalDebt > 0 ? 'text-amber-400' : 'text-slate-500'} mt-0.5">
                    ${Utils.formatCurrency(metrics.totalDebt)}
                  </div>
                </div>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="flex items-center justify-between pt-3 border-t border-slate-800/80">
              <button onclick="window.XSpace.App.openNewOrderForClient('${client.id}')" 
                      class="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1">
                + Nova OS
              </button>
              <div class="flex items-center space-x-1.5">
                <button onclick="window.XSpace.App.openClientHistoryModal('${client.id}')" class="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800" title="Ver Histórico Completo">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                </button>
                <button onclick="window.XSpace.App.openEditClientModal('${client.id}')" class="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800" title="Editar">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </button>
                <button onclick="window.XSpace.App.confirmDeleteClient('${client.id}')" class="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800" title="Excluir">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    },

    // ================= ORDERS OF SERVICE =================
    renderOrders() {
      if (this.osViewMode === 'kanban') {
        document.getElementById('os-kanban-view').classList.remove('hidden');
        document.getElementById('os-table-view').classList.add('hidden');
        this.renderKanbanOrders();
      } else {
        document.getElementById('os-kanban-view').classList.add('hidden');
        document.getElementById('os-table-view').classList.remove('hidden');
        this.renderTableOrders();
      }
    },

    getFilteredOrders() {
      let orders = Storage.getOrders();
      const search = (this.filters.ordersSearch || '').toLowerCase().trim();
      const delivFilter = this.filters.ordersDeliveryStatus;
      const payFilter = this.filters.ordersPaymentStatus;

      return orders.filter(o => {
        const client = Storage.getClientById(o.clientId);
        const clientName = client ? client.companyName.toLowerCase() : '';
        const matchSearch = !search ||
          o.id.toLowerCase().includes(search) ||
          clientName.includes(search) ||
          o.serviceType.toLowerCase().includes(search);

        const matchDeliv = delivFilter === 'all' || o.deliveryStatus === delivFilter;
        const matchPay = payFilter === 'all' || o.paymentStatus === payFilter;

        return matchSearch && matchDeliv && matchPay;
      });
    },

    renderKanbanOrders() {
      const orders = this.getFilteredOrders();
      const columns = {
        'Pendente': document.getElementById('kanban-col-pendente'),
        'Em Produção / Configuração': document.getElementById('kanban-col-producao'),
        'Pronto para Entrega': document.getElementById('kanban-col-pronto'),
        'Entregue / Concluído': document.getElementById('kanban-col-entregue')
      };

      // Clear column bodies
      Object.keys(columns).forEach(col => {
        if (columns[col]) columns[col].innerHTML = '';
      });

      // Counters
      const counts = {
        'Pendente': 0,
        'Em Produção / Configuração': 0,
        'Pronto para Entrega': 0,
        'Entregue / Concluído': 0
      };

      orders.forEach(order => {
        const colContainer = columns[order.deliveryStatus];
        if (!colContainer) return;

        counts[order.deliveryStatus]++;
        const client = Storage.getClientById(order.clientId);
        const clientName = client ? client.companyName : 'Cliente não informado';
        const deadline = Utils.getDeadlineStatus(order.deliveryDeadline, order.deliveryStatus);
        const hasDebt = Number(order.remainingBalance) > 0;

        const card = document.createElement('div');
        card.className = 'draggable-card glass-card p-4 rounded-xl mb-3 shadow-md border-l-4 transition-all relative';
        card.setAttribute('draggable', 'true');
        card.setAttribute('data-order-id', order.id);

        // Status border highlight
        if (deadline.isOverdue) {
          card.classList.add('border-l-rose-500');
        } else if (order.deliveryStatus === 'Entregue / Concluído') {
          card.classList.add('border-l-emerald-500');
        } else {
          card.classList.add('border-l-orange-500');
        }

        // Drag events
        card.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', order.id);
          card.classList.add('dragging');
        });
        card.addEventListener('dragend', () => {
          card.classList.remove('dragging');
        });

        card.innerHTML = `
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
              ${order.id}
            </span>
            <span class="text-[11px] px-2 py-0.5 rounded-full ${deadline.badgeClass}">
              ${deadline.text}
            </span>
          </div>

          <h4 class="text-sm font-bold text-white mb-1 hover:text-orange-300 cursor-pointer" onclick="window.XSpace.App.openEditOrderModal('${order.id}')">
            ${clientName}
          </h4>

          <div class="text-xs text-orange-400/90 font-medium mb-2.5 flex items-center gap-1.5">
            <span>⚡ ${order.serviceType}</span>
          </div>

          <!-- Financial indicators -->
          <div class="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-xs mb-3 space-y-1">
            <div class="flex justify-between text-slate-400">
              <span>Valor Total:</span>
              <span class="font-semibold text-slate-200">${Utils.formatCurrency(order.totalAmount)}</span>
            </div>
            <div class="flex justify-between ${hasDebt ? 'text-amber-400 font-bold' : 'text-emerald-400'}">
              <span>${hasDebt ? 'Saldo Devedor:' : 'Status Pago:'}</span>
              <span>${hasDebt ? Utils.formatCurrency(order.remainingBalance) : 'Quitado ✓'}</span>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="flex items-center justify-between pt-2 border-t border-slate-800/80">
            ${hasDebt ? `
              <button onclick="window.XSpace.App.openReceiveDebtModal('${order.id}')"
                      class="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                <span>💰</span> Dar Baixa
              </button>
            ` : `
              <span class="text-[11px] text-emerald-400 flex items-center gap-1">
                <span>✓</span> 100% Pago
              </span>
            `}

            <div class="flex items-center space-x-1">
              <button onclick="window.XSpace.App.openEditOrderModal('${order.id}')" class="p-1 text-slate-400 hover:text-white rounded" title="Editar">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
              </button>
              <button onclick="window.XSpace.App.confirmDeleteOrder('${order.id}')" class="p-1 text-slate-400 hover:text-rose-400 rounded" title="Excluir">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
        `;

        colContainer.appendChild(card);
      });

      // Update counters in column headers
      document.getElementById('count-col-pendente').textContent = counts['Pendente'];
      document.getElementById('count-col-producao').textContent = counts['Em Produção / Configuração'];
      document.getElementById('count-col-pronto').textContent = counts['Pronto para Entrega'];
      document.getElementById('count-col-entregue').textContent = counts['Entregue / Concluído'];

      // Setup drop targets
      this.setupKanbanDropZones();
    },

    setupKanbanDropZones() {
      const dropZones = [
        { el: document.getElementById('kanban-col-pendente'), status: 'Pendente' },
        { el: document.getElementById('kanban-col-producao'), status: 'Em Produção / Configuração' },
        { el: document.getElementById('kanban-col-pronto'), status: 'Pronto para Entrega' },
        { el: document.getElementById('kanban-col-entregue'), status: 'Entregue / Concluído' }
      ];

      dropZones.forEach(zone => {
        if (!zone.el) return;
        zone.el.addEventListener('dragover', (e) => {
          e.preventDefault();
          zone.el.classList.add('drag-over');
        });
        zone.el.addEventListener('dragleave', () => {
          zone.el.classList.remove('drag-over');
        });
        zone.el.addEventListener('drop', (e) => {
          e.preventDefault();
          zone.el.classList.remove('drag-over');
          const orderId = e.dataTransfer.getData('text/plain');
          if (orderId) {
            Storage.updateOrderStatus(orderId, zone.status);
            Utils.showToast('Status Atualizado', `${orderId} movido para "${zone.status}"`, 'success');
            this.renderOrders();
            this.renderDashboard();
          }
        });
      });
    },

    renderTableOrders() {
      const tbody = document.getElementById('orders-table-tbody');
      if (!tbody) return;

      const orders = this.getFilteredOrders();

      if (orders.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center py-12 text-slate-500">
              Nenhuma ordem de serviço corresponde aos filtros selecionados.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = orders.map(order => {
        const client = Storage.getClientById(order.clientId);
        const clientName = client ? client.companyName : 'Não informado';
        const deadline = Utils.getDeadlineStatus(order.deliveryDeadline, order.deliveryStatus);
        const hasDebt = Number(order.remainingBalance) > 0;

        let statusBg = 'bg-slate-800 text-slate-300';
        if (order.deliveryStatus === 'Entregue / Concluído') statusBg = 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30';
        else if (order.deliveryStatus === 'Em Produção / Configuração') statusBg = 'bg-blue-950/80 text-blue-400 border border-blue-500/30';
        else if (order.deliveryStatus === 'Pronto para Entrega') statusBg = 'bg-purple-950/80 text-purple-400 border border-purple-500/30';
        else if (order.deliveryStatus === 'Pendente') statusBg = 'bg-amber-950/80 text-amber-400 border border-amber-500/30';

        return `
          <tr class="border-b border-slate-800/80 hover:bg-slate-800/30 transition-colors">
            <td class="py-3 px-4 font-mono font-bold text-orange-400 text-xs">
              ${order.id}
            </td>
            <td class="py-3 px-4">
              <div class="font-bold text-white text-sm">${clientName}</div>
              <div class="text-xs text-orange-400/80">${order.serviceType}</div>
            </td>
            <td class="py-3 px-4">
              <span class="inline-block px-2.5 py-1 text-xs rounded-full ${statusBg}">
                ${order.deliveryStatus}
              </span>
            </td>
            <td class="py-3 px-4">
              <div class="text-xs text-slate-200">${Utils.formatDate(order.deliveryDeadline)}</div>
              <span class="inline-block mt-0.5 px-2 py-0.5 text-[10px] rounded ${deadline.badgeClass}">
                ${deadline.text}
              </span>
            </td>
            <td class="py-3 px-4">
              <div class="text-xs font-bold text-slate-200">${Utils.formatCurrency(order.totalAmount)}</div>
              <div class="text-[11px] ${hasDebt ? 'text-amber-400 font-semibold' : 'text-emerald-400'}">
                ${hasDebt ? `Falta ${Utils.formatCurrency(order.remainingBalance)}` : '100% Quitado'}
              </div>
            </td>
            <td class="py-3 px-4">
              ${hasDebt ? `
                <button onclick="window.XSpace.App.openReceiveDebtModal('${order.id}')"
                        class="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                  <span>💰</span> Receber
                </button>
              ` : `
                <span class="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <span>✓</span> Quitado
                </span>
              `}
            </td>
            <td class="py-3 px-4 text-right">
              <div class="flex items-center justify-end space-x-1.5">
                <button onclick="window.XSpace.App.openEditOrderModal('${order.id}')" class="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800" title="Editar">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                </button>
                <button onclick="window.XSpace.App.confirmDeleteOrder('${order.id}')" class="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800" title="Excluir">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    },

    // ================= CASHFLOW (FLUXO DE CAIXA) =================
    renderCashflow() {
      const tbody = document.getElementById('cashflow-table-tbody');
      if (!tbody) return;

      let txs = Storage.getTransactions();
      const search = (this.filters.cashflowSearch || '').toLowerCase().trim();
      const typeFilter = this.filters.cashflowType;
      const catFilter = this.filters.cashflowCategory;

      if (search) {
        txs = txs.filter(t =>
          (t.description || '').toLowerCase().includes(search) ||
          (t.category || '').toLowerCase().includes(search) ||
          (t.paymentMethod || '').toLowerCase().includes(search)
        );
      }

      if (typeFilter && typeFilter !== 'all') {
        txs = txs.filter(t => t.type === typeFilter);
      }

      if (catFilter && catFilter !== 'all') {
        txs = txs.filter(t => t.category === catFilter);
      }

      // Summary totals for current filtered view
      let filteredIncome = 0;
      let filteredExpenses = 0;

      txs.forEach(t => {
        if (t.type === 'entrada') filteredIncome += Number(t.amount);
        else if (t.type === 'saida') filteredExpenses += Number(t.amount);
      });

      const elFIncome = document.getElementById('cashflow-filtered-income');
      const elFExpense = document.getElementById('cashflow-filtered-expense');
      const elFBalance = document.getElementById('cashflow-filtered-balance');

      if (elFIncome) elFIncome.textContent = Utils.formatCurrency(filteredIncome);
      if (elFExpense) elFExpense.textContent = Utils.formatCurrency(filteredExpenses);
      if (elFBalance) {
        const bal = filteredIncome - filteredExpenses;
        elFBalance.textContent = Utils.formatCurrency(bal);
        elFBalance.className = `text-lg font-bold ${bal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;
      }

      if (txs.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center py-12 text-slate-500">
              Nenhuma transação encontrada para os filtros aplicados.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = txs.map(t => {
        const isIncome = t.type === 'entrada';

        return `
          <tr class="border-b border-slate-800/80 hover:bg-slate-800/30 transition-colors">
            <td class="py-3 px-4 text-xs text-slate-300">
              ${Utils.formatDate(t.date)}
            </td>
            <td class="py-3 px-4">
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${isIncome ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'}">
                ${isIncome ? 'Entrada' : 'Saída'}
              </span>
            </td>
            <td class="py-3 px-4">
              <div class="text-sm font-medium text-white">${t.description}</div>
              ${t.orderId ? `<div class="text-[11px] text-orange-400">Ref: ${t.orderId}</div>` : ''}
            </td>
            <td class="py-3 px-4 text-xs text-slate-300">
              ${t.category}
            </td>
            <td class="py-3 px-4 text-xs text-slate-400">
              ${t.paymentMethod || 'PIX'}
            </td>
            <td class="py-3 px-4 text-right">
              <span class="text-sm font-bold ${isIncome ? 'text-emerald-400' : 'text-rose-400'}">
                ${isIncome ? '+' : '-'} ${Utils.formatCurrency(t.amount)}
              </span>
            </td>
            <td class="py-3 px-4 text-right">
              <button onclick="window.XSpace.App.confirmDeleteTransaction('${t.id}')" class="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800" title="Excluir Lançamento">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    },

    // ================= NFC LINK GENERATOR TOOL =================
    setupNfcTool() {
      const placeIdInput = document.getElementById('nfc-input-placeid');
      const generatedUrlInput = document.getElementById('nfc-output-url');
      const byteCountDisplay = document.getElementById('nfc-byte-count');
      const byteProgress = document.getElementById('nfc-byte-progress');
      const byteStatusAlert = document.getElementById('nfc-byte-status-alert');
      const copyBtn = document.getElementById('btn-copy-nfc-url');
      const testBtn = document.getElementById('btn-test-nfc-url');
      const qrCodeImg = document.getElementById('nfc-qrcode-image');

      if (!placeIdInput) return;

      const updateNfcPreview = () => {
        const raw = (placeIdInput.value || '').trim();
        if (!raw) {
          generatedUrlInput.value = '';
          byteCountDisplay.textContent = '0 / 144 bytes';
          byteProgress.style.width = '0%';
          byteStatusAlert.innerHTML = `<span class="text-slate-400">Aguardando Place ID do Google...</span>`;
          if (qrCodeImg) qrCodeImg.src = '';
          return;
        }

        const fullUrl = Utils.buildGoogleReviewUrl(raw);
        generatedUrlInput.value = fullUrl;

        const bytes = Utils.calculateByteLength(fullUrl);
        const maxBytes = 144; // NTAG213 limit
        const pct = Math.min(100, Math.round((bytes / maxBytes) * 100));

        byteCountDisplay.textContent = `${bytes} / ${maxBytes} bytes (${pct}%)`;
        byteProgress.style.width = `${pct}%`;

        if (bytes <= maxBytes) {
          byteProgress.className = 'h-full bg-emerald-500 rounded-full transition-all duration-300';
          byteStatusAlert.innerHTML = `
            <span class="text-emerald-400 font-semibold flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              Tamanho Ideal! 100% Compatível com Chips NFC NTAG213.
            </span>
          `;
        } else {
          byteProgress.className = 'h-full bg-rose-500 rounded-full transition-all duration-300';
          byteStatusAlert.innerHTML = `
            <span class="text-rose-400 font-semibold flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              Atenção: Passou de 144 bytes! Recomenda-se usar chip NTAG215/216 ou encurtar a URL.
            </span>
          `;
        }

        // Generate QR Code via clean API or QR canvas
        if (qrCodeImg) {
          qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fullUrl)}&color=FF6A00&bgcolor=080C14`;
        }
      };

      placeIdInput.addEventListener('input', updateNfcPreview);

      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          if (!generatedUrlInput.value) {
            Utils.showToast('Campo Vazio', 'Digite um Place ID primeiro!', 'warning');
            return;
          }
          navigator.clipboard.writeText(generatedUrlInput.value).then(() => {
            Utils.showToast('Copiado!', 'Link de avaliação direta do Google copiado.', 'success');
          }).catch(() => {
            generatedUrlInput.select();
            document.execCommand('copy');
            Utils.showToast('Copiado!', 'Link copiado com sucesso.', 'success');
          });
        });
      }

      if (testBtn) {
        testBtn.addEventListener('click', () => {
          if (!generatedUrlInput.value) {
            Utils.showToast('Campo Vazio', 'Digite um Place ID para testar!', 'warning');
            return;
          }
          window.open(generatedUrlInput.value, '_blank');
        });
      }

      // Initial check
      updateNfcPreview();
    },

    // Populate dropdowns with clients
    populateClientSelectOptions(selectedId = null) {
      const selects = [
        document.getElementById('form-order-client-select'),
        document.getElementById('form-tx-client-select')
      ];

      const clients = Storage.getClients();

      selects.forEach(select => {
        if (!select) return;
        const currentVal = selectedId || select.value;
        select.innerHTML = '<option value="">-- Selecione o Cliente --</option>';

        clients.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c.id;
          opt.textContent = `${c.companyName} (${c.contactName || 'Sem contato'})`;
          if (c.id === currentVal) opt.selected = true;
          select.appendChild(opt);
        });
      });
    },

    // Auto calculate remaining balance on order form in real-time
    setupAutoCalculations() {
      const totalInput = document.getElementById('form-order-total');
      const paidInput = document.getElementById('form-order-paid');
      const remainingDisplay = document.getElementById('form-order-remaining-display');

      const recalc = () => {
        const total = parseFloat(totalInput.value) || 0;
        const paid = parseFloat(paidInput.value) || 0;
        const remaining = Math.max(0, total - paid);
        if (remainingDisplay) {
          remainingDisplay.textContent = Utils.formatCurrency(remaining);
          if (remaining > 0) {
            remainingDisplay.className = 'text-amber-400 font-bold';
          } else {
            remainingDisplay.className = 'text-emerald-400 font-bold';
          }
        }
      };

      if (totalInput && paidInput) {
        totalInput.addEventListener('input', recalc);
        paidInput.addEventListener('input', recalc);
      }
    },

    // ================= MODAL CONTROLLERS =================
    // Order Modal
    openNewOrderModal() {
      document.getElementById('modal-order-title').textContent = 'Nova Ordem de Serviço';
      document.getElementById('form-order').reset();
      document.getElementById('form-order-id').value = '';
      document.getElementById('form-order-date').value = Utils.formatDateForInput();
      
      // Default deadline: +5 days
      const d = new Date();
      d.setDate(d.getDate() + 5);
      document.getElementById('form-order-deadline').value = Utils.formatDateForInput(d);

      document.getElementById('form-order-status').value = 'Pendente';
      this.populateClientSelectOptions();
      
      const remainingDisplay = document.getElementById('form-order-remaining-display');
      if (remainingDisplay) remainingDisplay.textContent = 'R$ 0,00';

      this.showModal('modal-order');
    },

    openNewOrderForClient(clientId) {
      this.openNewOrderModal();
      const select = document.getElementById('form-order-client-select');
      if (select) select.value = clientId;
    },

    openEditOrderModal(orderId) {
      const order = Storage.getOrderById(orderId);
      if (!order) return;

      document.getElementById('modal-order-title').textContent = `Editar Ordem ${order.id}`;
      document.getElementById('form-order-id').value = order.id;
      this.populateClientSelectOptions(order.clientId);

      document.getElementById('form-order-service').value = order.serviceType;
      document.getElementById('form-order-total').value = order.totalAmount;
      document.getElementById('form-order-paid').value = order.paidAmount;
      document.getElementById('form-order-paymethod').value = order.initialPaymentMethod || 'PIX';
      document.getElementById('form-order-date').value = order.orderDate;
      document.getElementById('form-order-deadline').value = order.deliveryDeadline;
      document.getElementById('form-order-status').value = order.deliveryStatus;
      document.getElementById('form-order-placeid').value = order.placeId || '';
      document.getElementById('form-order-drive').value = order.driveLink || '';
      document.getElementById('form-order-notes').value = order.notes || '';

      const remainingDisplay = document.getElementById('form-order-remaining-display');
      if (remainingDisplay) {
        remainingDisplay.textContent = Utils.formatCurrency(order.remainingBalance);
      }

      this.showModal('modal-order');
    },

    saveOrderForm() {
      const form = document.getElementById('form-order');
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const id = document.getElementById('form-order-id').value;
      const clientId = document.getElementById('form-order-client-select').value;
      if (!clientId) {
        Utils.showToast('Atenção', 'Selecione um cliente para a ordem de serviço.', 'warning');
        return;
      }

      const orderData = {
        id: id || undefined,
        clientId: clientId,
        serviceType: document.getElementById('form-order-service').value,
        totalAmount: parseFloat(document.getElementById('form-order-total').value) || 0,
        paidAmount: parseFloat(document.getElementById('form-order-paid').value) || 0,
        initialPaymentMethod: document.getElementById('form-order-paymethod').value,
        orderDate: document.getElementById('form-order-date').value,
        deliveryDeadline: document.getElementById('form-order-deadline').value,
        deliveryStatus: document.getElementById('form-order-status').value,
        placeId: document.getElementById('form-order-placeid').value.trim(),
        driveLink: document.getElementById('form-order-drive').value.trim(),
        notes: document.getElementById('form-order-notes').value.trim()
      };

      const saved = Storage.saveOrder(orderData, !id); // Auto cashflow only for new orders

      this.hideModal('modal-order');
      Utils.showToast('Ordem Salva!', `${saved.id} gravada com sucesso.`, 'success');
      this.renderAll();
    },

    confirmDeleteOrder(orderId) {
      if (confirm(`Deseja realmente excluir a ordem ${orderId}? Essa ação não pode ser desfeita.`)) {
        Storage.deleteOrder(orderId);
        Utils.showToast('Ordem Excluída', `Ordem ${orderId} removida.`, 'info');
        this.renderAll();
      }
    },

    // Receive Remaining Debt Modal
    openReceiveDebtModal(orderId) {
      const order = Storage.getOrderById(orderId);
      if (!order) return;

      const client = Storage.getClientById(order.clientId);
      const clientName = client ? client.companyName : 'Cliente';

      document.getElementById('debt-modal-order-id').value = order.id;
      document.getElementById('debt-modal-client-name').textContent = clientName;
      document.getElementById('debt-modal-service-name').textContent = order.serviceType;
      document.getElementById('debt-modal-amount').textContent = Utils.formatCurrency(order.remainingBalance);

      this.showModal('modal-receive-debt');
    },

    confirmReceiveDebt() {
      const orderId = document.getElementById('debt-modal-order-id').value;
      const method = document.getElementById('debt-modal-paymethod').value;

      const updated = Storage.receiveRemainingBalance(orderId, method);
      this.hideModal('modal-receive-debt');

      if (updated) {
        Utils.showToast('Saldo Quitado!', `Recebimento lançado no Caixa e ordem ${orderId} quitada com sucesso!`, 'success');
        this.renderAll();
      }
    },

    // Client Modal
    openNewClientModal() {
      document.getElementById('modal-client-title').textContent = 'Novo Cliente';
      document.getElementById('form-client').reset();
      document.getElementById('form-client-id').value = '';
      this.showModal('modal-client');
    },

    openEditClientModal(clientId) {
      const client = Storage.getClientById(clientId);
      if (!client) return;

      document.getElementById('modal-client-title').textContent = 'Editar Cliente';
      document.getElementById('form-client-id').value = client.id;
      document.getElementById('form-client-company').value = client.companyName || '';
      document.getElementById('form-client-contact').value = client.contactName || '';
      document.getElementById('form-client-phone').value = client.phone || '';
      document.getElementById('form-client-segment').value = client.segment || 'Oficina Mecânica';
      document.getElementById('form-client-address').value = client.address || '';
      document.getElementById('form-client-placeid').value = client.placeId || '';
      document.getElementById('form-client-notes').value = client.notes || '';

      this.showModal('modal-client');
    },

    saveClientForm() {
      const form = document.getElementById('form-client');
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const id = document.getElementById('form-client-id').value;
      const clientData = {
        id: id || undefined,
        companyName: document.getElementById('form-client-company').value.trim(),
        contactName: document.getElementById('form-client-contact').value.trim(),
        phone: document.getElementById('form-client-phone').value.trim(),
        segment: document.getElementById('form-client-segment').value,
        address: document.getElementById('form-client-address').value.trim(),
        placeId: document.getElementById('form-client-placeid').value.trim(),
        notes: document.getElementById('form-client-notes').value.trim()
      };

      const saved = Storage.saveClient(clientData);
      this.hideModal('modal-client');
      Utils.showToast('Cliente Salvo!', `${saved.companyName} salvo com sucesso.`, 'success');
      this.renderAll();
    },

    confirmDeleteClient(clientId) {
      const client = Storage.getClientById(clientId);
      const name = client ? client.companyName : 'este cliente';

      if (confirm(`Atenção: Tem certeza que deseja remover ${name}?`)) {
        Storage.deleteClient(clientId);
        Utils.showToast('Cliente Removido', `${name} foi excluído da base.`, 'info');
        this.renderAll();
      }
    },

    // Client History Modal
    openClientHistoryModal(clientId) {
      const client = Storage.getClientById(clientId);
      if (!client) return;

      const metrics = Storage.getClientMetrics(clientId);
      document.getElementById('history-modal-client-name').textContent = client.companyName;
      document.getElementById('history-modal-contact').textContent = `${client.contactName || ''} • ${Utils.formatPhone(client.phone)}`;
      document.getElementById('history-modal-ltv').textContent = Utils.formatCurrency(metrics.totalSpent);
      document.getElementById('history-modal-debt').textContent = Utils.formatCurrency(metrics.totalDebt);
      document.getElementById('history-modal-orders-count').textContent = `${metrics.ordersCount} Ordens`;

      const listContainer = document.getElementById('history-modal-orders-list');
      if (metrics.orders.length === 0) {
        listContainer.innerHTML = `<p class="text-sm text-slate-500 py-4 text-center">Nenhuma ordem vinculada ainda.</p>`;
      } else {
        listContainer.innerHTML = metrics.orders.map(o => `
          <div class="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs mb-2">
            <div>
              <div class="font-bold text-white">${o.id} - ${o.serviceType}</div>
              <div class="text-slate-400 mt-0.5">Criada em: ${Utils.formatDate(o.orderDate)} • Entrega: ${Utils.formatDate(o.deliveryDeadline)}</div>
            </div>
            <div class="text-right">
              <div class="font-bold text-slate-200">${Utils.formatCurrency(o.totalAmount)}</div>
              <span class="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold ${o.remainingBalance > 0 ? 'bg-amber-950 text-amber-400' : 'bg-emerald-950 text-emerald-400'}">
                ${o.remainingBalance > 0 ? `Deve ${Utils.formatCurrency(o.remainingBalance)}` : 'Quitado'}
              </span>
            </div>
          </div>
        `).join('');
      }

      this.showModal('modal-client-history');
    },

    // Cashflow Modal
    openNewTransactionModal(defaultType = 'entrada') {
      document.getElementById('form-tx').reset();
      document.getElementById('form-tx-type').value = defaultType;
      document.getElementById('form-tx-date').value = Utils.formatDateForInput();
      this.populateClientSelectOptions();
      this.updateTxCategoryOptions(defaultType);
      this.showModal('modal-transaction');
    },

    updateTxCategoryOptions(type) {
      const select = document.getElementById('form-tx-category');
      if (!select) return;

      if (type === 'entrada') {
        select.innerHTML = `
          <option value="Serviço / OS">Serviço / OS</option>
          <option value="Venda Plaquinha NFC Avulsa">Venda Plaquinha NFC Avulsa</option>
          <option value="Consultoria SEO / GMB">Consultoria SEO / GMB</option>
          <option value="Criação de Artes / Design">Criação de Artes / Design</option>
          <option value="Outras Entradas">Outras Entradas</option>
        `;
      } else {
        select.innerHTML = `
          <option value="Insumos Plaquinhas NFC">Insumos Plaquinhas NFC (Acrílicos, Chips NTAG)</option>
          <option value="Transporte / Logística">Transporte / Logística / Combustível</option>
          <option value="Softwares & Ferramentas">Softwares & Ferramentas (Canva, SEO, etc.)</option>
          <option value="Marketing & Tráfego">Marketing & Anúncios</option>
          <option value="Alimentação / Comercial">Alimentação / Visita Comercial</option>
          <option value="Outras Despesas">Outras Despesas</option>
        `;
      }
    },

    saveTransactionForm() {
      const form = document.getElementById('form-tx');
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const txData = {
        type: document.getElementById('form-tx-type').value,
        category: document.getElementById('form-tx-category').value,
        amount: parseFloat(document.getElementById('form-tx-amount').value) || 0,
        paymentMethod: document.getElementById('form-tx-paymethod').value,
        date: document.getElementById('form-tx-date').value,
        description: document.getElementById('form-tx-description').value.trim(),
        clientId: document.getElementById('form-tx-client-select').value || null
      };

      Storage.addTransaction(txData);
      this.hideModal('modal-transaction');
      Utils.showToast('Lançamento Registrado!', `${txData.type === 'entrada' ? 'Entrada' : 'Saída'} no valor de ${Utils.formatCurrency(txData.amount)} salva.`, 'success');
      this.renderAll();
    },

    confirmDeleteTransaction(txId) {
      if (confirm('Deseja excluir este lançamento financeiro do caixa?')) {
        Storage.deleteTransaction(txId);
        Utils.showToast('Lançamento Excluído', 'Transação removida do extrato.', 'info');
        this.renderAll();
      }
    },

    // Modal Helper
    showModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
      }
    },

    hideModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
      }
    },

    // ================= SECURITY & ACCESS CONTROL =================
    lastUserActivity: Date.now(),
    inactivityTimerInterval: null,

    initSecurity() {
      // Activity listeners for auto-lock
      const resetActivity = () => {
        this.lastUserActivity = Date.now();
      };
      ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'].forEach(evt => {
        window.addEventListener(evt, resetActivity, { passive: true });
      });

      // Check on startup
      const sec = Storage.getSecuritySettings();
      if (!sec.passwordEnabled) {
        this.hideLockOverlay();
        return;
      }

      const isUnlocked = sessionStorage.getItem('xspacemkt_unlocked');
      if (isUnlocked === 'true') {
        this.hideLockOverlay();
        this.startInactivityTimer();
      } else {
        this.showLockOverlay();
      }
    },

    showLockOverlay() {
      const overlay = document.getElementById('app-lock-overlay');
      if (overlay) {
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }
      const pwdInput = document.getElementById('input-lock-password');
      if (pwdInput) {
        pwdInput.value = '';
        setTimeout(() => pwdInput.focus(), 60);
      }
      const err = document.getElementById('lock-error-msg');
      if (err) err.textContent = '';
    },

    hideLockOverlay() {
      const overlay = document.getElementById('app-lock-overlay');
      if (overlay) {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
      const err = document.getElementById('lock-error-msg');
      if (err) err.textContent = '';
    },

    unlockSystem() {
      const pwdInput = document.getElementById('input-lock-password');
      const err = document.getElementById('lock-error-msg');
      const card = document.getElementById('lock-screen-card');
      const val = pwdInput ? pwdInput.value.trim() : '';

      if (Storage.verifyPassword(val)) {
        sessionStorage.setItem('xspacemkt_unlocked', 'true');
        this.hideLockOverlay();
        this.startInactivityTimer();
        Utils.showToast('Acesso Permitido', 'Bem-vindo ao painel xSpaceMKT.', 'success');
      } else {
        if (err) err.textContent = 'Senha incorreta. Tente novamente.';
        if (card) {
          card.classList.remove('shake');
          void card.offsetWidth; // trigger reflow
          card.classList.add('shake');
        }
        if (pwdInput) {
          pwdInput.select();
          pwdInput.focus();
        }
      }
    },

    lockSystem() {
      sessionStorage.removeItem('xspacemkt_unlocked');
      if (this.inactivityTimerInterval) {
        clearInterval(this.inactivityTimerInterval);
        this.inactivityTimerInterval = null;
      }
      this.showLockOverlay();
      Utils.showToast('Sistema Bloqueado', 'Acesso restrito protegido por senha.', 'info');
    },

    startInactivityTimer() {
      if (this.inactivityTimerInterval) clearInterval(this.inactivityTimerInterval);
      this.lastUserActivity = Date.now();

      this.inactivityTimerInterval = setInterval(() => {
        const sec = Storage.getSecuritySettings();
        if (!sec.passwordEnabled) return;

        const minutes = Number(sec.autoLockMinutes) || 0;
        if (minutes > 0) {
          const elapsedMs = Date.now() - this.lastUserActivity;
          if (elapsedMs >= minutes * 60 * 1000) {
            this.lockSystem();
            Utils.showToast('Bloqueio por Inatividade', `Sistema bloqueado após ${minutes} min sem uso.`, 'warning');
          }
        }
      }, 20000); // Check every 20s
    },

    renderSecurityTab() {
      const sec = Storage.getSecuritySettings();
      const toggle = document.getElementById('security-toggle-enabled');
      const select = document.getElementById('security-select-autolock');
      const badge = document.getElementById('security-status-badge');

      if (toggle) toggle.checked = !!sec.passwordEnabled;
      if (select) select.value = String(sec.autoLockMinutes !== undefined ? sec.autoLockMinutes : 15);
      if (badge) {
        if (sec.passwordEnabled) {
          badge.className = 'px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
          badge.textContent = 'Proteção Ativa';
        } else {
          badge.className = 'px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30';
          badge.textContent = 'Proteção Desativada';
        }
      }
    },

    changePasswordFormSubmit() {
      const currInput = document.getElementById('input-curr-pwd');
      const newInput = document.getElementById('input-new-pwd');
      const confirmInput = document.getElementById('input-confirm-pwd');

      const curr = currInput ? currInput.value : '';
      const newPwd = newInput ? newInput.value : '';
      const confirmPwd = confirmInput ? confirmInput.value : '';

      if (newPwd !== confirmPwd) {
        Utils.showToast('Senhas Não Conferem', 'A nova senha e a confirmação estão diferentes.', 'error');
        return;
      }

      const res = Storage.changePassword(curr, newPwd);
      if (res.success) {
        Utils.showToast('Senha Alterada!', res.message, 'success');
        document.getElementById('form-change-password').reset();
      } else {
        Utils.showToast('Erro ao Alterar', res.message, 'error');
      }
    },

    saveSecurityPreferences() {
      const toggle = document.getElementById('security-toggle-enabled');
      const select = document.getElementById('security-select-autolock');

      const passwordEnabled = toggle ? toggle.checked : true;
      const autoLockMinutes = select ? parseInt(select.value, 10) : 15;

      Storage.saveSecuritySettings({ passwordEnabled, autoLockMinutes });
      this.renderSecurityTab();

      if (!passwordEnabled) {
        this.hideLockOverlay();
        Utils.showToast('Proteção Desativada', 'O sistema não solicitará mais senha ao entrar.', 'warning');
      } else {
        this.startInactivityTimer();
        Utils.showToast('Preferências Salvas!', 'Configurações de segurança atualizadas com sucesso.', 'success');
      }
    },

    togglePasswordVisibility(inputId, btn) {
      const input = document.getElementById(inputId);
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
      } else {
        input.type = 'password';
        btn.textContent = '👁️';
      }
    },

    clearAllDemoData() {
      const confirmed = confirm(
        '⚠️ ATENÇÃO: Deseja apagar TODOS os dados de teste (clientes fictícios, ordens e caixa) para iniciar o sistema do zero com seus dados reais da xSpaceMKT?\n\n' +
        'Suas configurações de senha e segurança NÃO serão perdidas.\n\n' +
        'Deseja prosseguir?'
      );

      if (confirmed) {
        Storage.clearAllData();
        this.renderAll();
        Utils.showToast('Base Zerada com Sucesso!', 'Agora o sistema está 100% limpo e pronto para receber seus clientes reais.', 'success');
      }
    }
  };

  window.XSpace.App = App;

  // Initialize once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    App.init();
  });
})();
