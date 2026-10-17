/**
 * xSpaceMKT CRM - PDF Export & Report Generator
 * Generates an executive, personalized company PDF report with branding, logo, KPIs,
 * orders, cashflow statement, and clients directory.
 */
window.XSpace = window.XSpace || {};

(function () {
  const { Utils, Storage } = window.XSpace;

  const PdfService = {
    // Generate the complete HTML structure for the branded PDF report
    generateReportHtml() {
      const metrics = Storage.getDashboardMetrics();
      const orders = Storage.getOrders();
      const transactions = Storage.getTransactions();
      const clients = Storage.getClients();
      const now = new Date();
      const dateFormatted = now.toLocaleDateString('pt-BR');
      const timeFormatted = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      // KPI values
      const netCash = Utils.formatCurrency(metrics.netCashBalance);
      const monthIncome = Utils.formatCurrency(metrics.monthIncome);
      const receivables = Utils.formatCurrency(metrics.pendingReceivables);
      const expenses = Utils.formatCurrency(metrics.totalExpenses);
      const pendingOrders = metrics.pendingDeliveriesCount;
      const overdueOrders = metrics.overdueDeliveriesCount;

      // Orders rows
      const ordersRowsHtml = orders.map(o => {
        const client = Storage.getClientById(o.clientId);
        const clientName = client ? client.companyName : 'Não identificado';
        const hasDebt = Number(o.remainingBalance) > 0;
        const deadline = Utils.getDeadlineStatus(o.deliveryDeadline, o.deliveryStatus);

        return `
          <tr style="border-bottom: 1px solid #E2E8F0; font-size: 11px;">
            <td style="padding: 7px 8px; font-weight: bold; font-family: monospace; color: #FF6A00;">${o.id}</td>
            <td style="padding: 7px 8px; font-weight: 600; color: #1E293B;">${clientName}</td>
            <td style="padding: 7px 8px; color: #475569;">${o.serviceType}</td>
            <td style="padding: 7px 8px; font-weight: 600; color: #0F172A;">${Utils.formatCurrency(o.totalAmount)}</td>
            <td style="padding: 7px 8px; font-weight: bold; color: ${hasDebt ? '#D97706' : '#16A34A'};">
              ${hasDebt ? Utils.formatCurrency(o.remainingBalance) : 'Quitado'}
            </td>
            <td style="padding: 7px 8px; color: #475569;">${Utils.formatDate(o.deliveryDeadline)}</td>
            <td style="padding: 7px 8px;">
              <span style="display: inline-block; padding: 2px 7px; border-radius: 9999px; font-size: 10px; font-weight: 600; 
                ${o.deliveryStatus === 'Entregue / Concluído' ? 'background: #DCFCE7; color: #15803D;' : 
                  (deadline.isOverdue ? 'background: #FFE4E6; color: #BE123C;' : 'background: #FEF3C7; color: #B45309;')}">
                ${o.deliveryStatus}
              </span>
            </td>
          </tr>
        `;
      }).join('');

      // Cashflow rows (last 10 transactions)
      const txRowsHtml = transactions.slice(0, 12).map(t => {
        const isIncome = t.type === 'entrada';
        return `
          <tr style="border-bottom: 1px solid #E2E8F0; font-size: 11px;">
            <td style="padding: 7px 8px; color: #64748B;">${Utils.formatDate(t.date)}</td>
            <td style="padding: 7px 8px;">
              <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; 
                ${isIncome ? 'background: #DCFCE7; color: #166534;' : 'background: #FFE4E6; color: #9F1239;'}">
                ${isIncome ? 'ENTRADA' : 'SAÍDA'}
              </span>
            </td>
            <td style="padding: 7px 8px; font-weight: 500; color: #1E293B;">${t.description}</td>
            <td style="padding: 7px 8px; color: #64748B;">${t.category}</td>
            <td style="padding: 7px 8px; color: #64748B;">${t.paymentMethod || 'PIX'}</td>
            <td style="padding: 7px 8px; text-align: right; font-weight: bold; color: ${isIncome ? '#16A34A' : '#E11D48'};">
              ${isIncome ? '+' : '-'} ${Utils.formatCurrency(t.amount)}
            </td>
          </tr>
        `;
      }).join('');

      // Clients summary rows
      const clientsRowsHtml = clients.map(c => {
        const m = Storage.getClientMetrics(c.id);
        return `
          <tr style="border-bottom: 1px solid #E2E8F0; font-size: 11px;">
            <td style="padding: 7px 8px; font-weight: 600; color: #0F172A;">${c.companyName}</td>
            <td style="padding: 7px 8px; color: #475569;">${c.contactName || '-'}</td>
            <td style="padding: 7px 8px; font-family: monospace; color: #475569;">${Utils.formatPhone(c.phone)}</td>
            <td style="padding: 7px 8px; color: #64748B;">${c.segment || 'Geral'}</td>
            <td style="padding: 7px 8px; text-align: center; font-weight: bold; color: #0F172A;">${m.ordersCount}</td>
            <td style="padding: 7px 8px; text-align: right; font-weight: bold; color: #16A34A;">${Utils.formatCurrency(m.totalSpent)}</td>
          </tr>
        `;
      }).join('');

      return `
        <div id="pdf-report-content" style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #0F172A; background: #FFFFFF; padding: 24px; max-width: 800px; margin: 0 auto; box-sizing: border-box;">
          
          <!-- BRAND HEADER -->
          <div style="border-bottom: 3px solid #FF6A00; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 14px;">
              <div style="background: #080C14; padding: 6px 10px; border-radius: 8px; display: inline-block;">
                <img src="./assets/logo.jpg" alt="xSpaceMKT" style="height: 38px; width: auto; display: block; object-contain: contain;">
              </div>
              <div>
                <div style="font-size: 18px; font-weight: 800; color: #080C14; letter-spacing: -0.5px; line-height: 1;">
                  xSpace<span style="color: #FF6A00;">MKT</span>
                </div>
                <div style="font-size: 9px; font-weight: 700; color: #64748B; letter-spacing: 1px; text-transform: uppercase; margin-top: 4px;">
                  Marketing que Impulsiona
                </div>
              </div>
            </div>

            <div style="text-align: right;">
              <div style="font-size: 13px; font-weight: 800; color: #FF6A00; text-transform: uppercase; letter-spacing: 0.5px;">
                Relatório Operacional & Financeiro
              </div>
              <div style="font-size: 10px; color: #64748B; margin-top: 2px;">
                Emissão: <strong>${dateFormatted} às ${timeFormatted}</strong>
              </div>
              <div style="font-size: 9px; color: #94A3B8; margin-top: 2px;">
                Plaquinhas NFC • SEO Google Meu Negócio • Design
              </div>
            </div>
          </div>

          <!-- EXECUTIVE KPIS GRID -->
          <div style="margin-bottom: 24px;">
            <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #334155; margin-bottom: 10px; letter-spacing: 0.5px;">
              1. Indicadores Chave de Desempenho (KPIs)
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
              
              <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-top: 3px solid #16A34A; border-radius: 8px; padding: 10px;">
                <div style="font-size: 9px; font-weight: 700; color: #64748B; text-transform: uppercase;">Saldo em Caixa</div>
                <div style="font-size: 15px; font-weight: 800; color: #16A34A; margin-top: 4px;">${netCash}</div>
                <div style="font-size: 8px; color: #94A3B8; margin-top: 2px;">Líquido acumulado</div>
              </div>

              <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-top: 3px solid #FF6A00; border-radius: 8px; padding: 10px;">
                <div style="font-size: 9px; font-weight: 700; color: #64748B; text-transform: uppercase;">Faturamento Mês</div>
                <div style="font-size: 15px; font-weight: 800; color: #0F172A; margin-top: 4px;">${monthIncome}</div>
                <div style="font-size: 8px; color: #94A3B8; margin-top: 2px;">Entradas do mês atual</div>
              </div>

              <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-top: 3px solid #D97706; border-radius: 8px; padding: 10px;">
                <div style="font-size: 9px; font-weight: 700; color: #64748B; text-transform: uppercase;">A Receber</div>
                <div style="font-size: 15px; font-weight: 800; color: #D97706; margin-top: 4px;">${receivables}</div>
                <div style="font-size: 8px; color: #94A3B8; margin-top: 2px;">Saldos pendentes de OS</div>
              </div>

              <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-top: 3px solid #E11D48; border-radius: 8px; padding: 10px;">
                <div style="font-size: 9px; font-weight: 700; color: #64748B; text-transform: uppercase;">Custos Operacionais</div>
                <div style="font-size: 15px; font-weight: 800; color: #E11D48; margin-top: 4px;">${expenses}</div>
                <div style="font-size: 8px; color: #94A3B8; margin-top: 2px;">Acrílicos, Chips, Combustível</div>
              </div>

            </div>
          </div>

          <!-- ORDERS SECTION -->
          <div style="margin-bottom: 24px; page-break-inside: avoid;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #334155; letter-spacing: 0.5px;">
                2. Ordens de Serviço & Entregas (${orders.length} cadastradas)
              </div>
              <div style="font-size: 10px; color: #64748B;">
                <strong>${pendingOrders}</strong> em andamento ${overdueOrders > 0 ? `<span style="color: #BE123C; font-weight: bold;">(${overdueOrders} atrasadas)</span>` : ''}
              </div>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; text-align: left; background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 6px; overflow: hidden;">
              <thead>
                <tr style="background: #0F172A; color: #FFFFFF; font-size: 10px; text-transform: uppercase;">
                  <th style="padding: 7px 8px;">Código</th>
                  <th style="padding: 7px 8px;">Cliente</th>
                  <th style="padding: 7px 8px;">Serviço</th>
                  <th style="padding: 7px 8px;">Valor Total</th>
                  <th style="padding: 7px 8px;">Saldo Devedor</th>
                  <th style="padding: 7px 8px;">Prazo</th>
                  <th style="padding: 7px 8px;">Status Entrega</th>
                </tr>
              </thead>
              <tbody>
                ${ordersRowsHtml}
              </tbody>
            </table>
          </div>

          <!-- CASHFLOW RECENT EXTRACT -->
          <div style="margin-bottom: 24px; page-break-inside: avoid;">
            <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #334155; margin-bottom: 8px; letter-spacing: 0.5px;">
              3. Extrato Recente do Fluxo de Caixa
            </div>
            <table style="width: 100%; border-collapse: collapse; text-align: left; background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 6px; overflow: hidden;">
              <thead>
                <tr style="background: #0F172A; color: #FFFFFF; font-size: 10px; text-transform: uppercase;">
                  <th style="padding: 7px 8px;">Data</th>
                  <th style="padding: 7px 8px;">Tipo</th>
                  <th style="padding: 7px 8px;">Descrição</th>
                  <th style="padding: 7px 8px;">Categoria</th>
                  <th style="padding: 7px 8px;">Forma Pagto</th>
                  <th style="padding: 7px 8px; text-align: right;">Valor</th>
                </tr>
              </thead>
              <tbody>
                ${txRowsHtml}
              </tbody>
            </table>
          </div>

          <!-- CLIENTS DIRECTORY -->
          <div style="margin-bottom: 24px; page-break-inside: avoid;">
            <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #334155; margin-bottom: 8px; letter-spacing: 0.5px;">
              4. Carteira de Clientes (${clients.length} empresas ativas)
            </div>
            <table style="width: 100%; border-collapse: collapse; text-align: left; background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 6px; overflow: hidden;">
              <thead>
                <tr style="background: #0F172A; color: #FFFFFF; font-size: 10px; text-transform: uppercase;">
                  <th style="padding: 7px 8px;">Empresa</th>
                  <th style="padding: 7px 8px;">Responsável</th>
                  <th style="padding: 7px 8px;">Telefone / WhatsApp</th>
                  <th style="padding: 7px 8px;">Segmento</th>
                  <th style="padding: 7px 8px; text-align: center;">Total OS</th>
                  <th style="padding: 7px 8px; text-align: right;">Total Investido (LTV)</th>
                </tr>
              </thead>
              <tbody>
                ${clientsRowsHtml}
              </tbody>
            </table>
          </div>

          <!-- BRAND FOOTER -->
          <div style="border-top: 1px solid #E2E8F0; padding-top: 14px; margin-top: 24px; display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #64748B;">
            <div>
              <strong>xSpaceMKT</strong> • Soluções em Marketing que Impulsiona
            </div>
            <div>
              Documento oficial emitido via Sistema de Gestão Interno • Confidencial
            </div>
          </div>

        </div>
      `;
    },

    // Export directly to .PDF file
    exportPdf() {
      Utils.showToast('Gerando PDF...', 'Compilando relatório personalizado da xSpaceMKT...', 'info');

      // Create a container offscreen
      let container = document.getElementById('pdf-export-hidden-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'pdf-export-hidden-container';
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        document.body.appendChild(container);
      }

      container.innerHTML = this.generateReportHtml();
      const reportElement = container.querySelector('#pdf-report-content');

      const dateStr = Utils.formatDateForInput();
      const filename = `xSpaceMKT-Relatorio-Gestao-${dateStr}.pdf`;

      // Check if html2pdf is available
      if (typeof html2pdf !== 'undefined') {
        const opt = {
          margin: [8, 8, 8, 8],
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(reportElement).save().then(() => {
          Utils.showToast('PDF Exportado com Sucesso!', `Arquivo salvo: ${filename}`, 'success');
        }).catch(err => {
          console.error('Error with html2pdf:', err);
          // Fallback to print preview
          this.openPreviewModal();
        });
      } else {
        // Fallback: Open preview modal with direct print / save as PDF option
        this.openPreviewModal();
        Utils.showToast('Visualização do Relatório', 'Utilize o botão "Salvar como PDF / Imprimir".', 'info');
      }
    },

    // Open Interactive PDF Preview Modal
    openPreviewModal() {
      const modal = document.getElementById('modal-pdf-preview');
      const bodyContainer = document.getElementById('pdf-preview-modal-body');
      if (!modal || !bodyContainer) return;

      bodyContainer.innerHTML = this.generateReportHtml();
      window.XSpace.App.showModal('modal-pdf-preview');
    },

    // Print Report
    printReport() {
      const bodyContainer = document.getElementById('pdf-preview-modal-body');
      if (!bodyContainer || !bodyContainer.innerHTML.trim()) {
        bodyContainer.innerHTML = this.generateReportHtml();
      }

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Relatório xSpaceMKT - Impressão / PDF</title>
          <style>
            @page { size: A4; margin: 10mm; }
            body { margin: 0; padding: 0; background: white; font-family: sans-serif; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
          </style>
        </head>
        <body>
          ${this.generateReportHtml()}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  window.XSpace.PdfService = PdfService;
})();
