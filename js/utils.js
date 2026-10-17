/**
 * xSpaceMKT CRM - Utilities & Helpers
 */
window.XSpace = window.XSpace || {};

window.XSpace.Utils = {
  // Format currency in BRL (R$ 1.500,00)
  formatCurrency(value) {
    const num = Number(value) || 0;
    return num.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  },

  // Parse raw currency string/number to clean float
  parseCurrency(value) {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const cleanStr = String(value)
      .replace(/[^\d,-]/g, '')
      .replace(',', '.');
    const parsed = parseFloat(cleanStr);
    return isNaN(parsed) ? 0 : parsed;
  },

  // Format date YYYY-MM-DD to DD/MM/YYYY
  formatDate(dateString) {
    if (!dateString) return '-';
    // If string has T (ISO), extract date portion
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('pt-BR');
  },

  // Format Date object to YYYY-MM-DD for <input type="date">
  formatDateForInput(date = new Date()) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // Get Relative Deadline Status
  getDeadlineStatus(deadlineStr, orderStatus) {
    if (!deadlineStr) return { type: 'normal', text: 'Sem prazo', badgeClass: 'bg-slate-800 text-slate-400' };

    // If order is completed/delivered, deadline is no longer active
    if (orderStatus === 'Entregue / Concluído') {
      return { 
        type: 'done', 
        text: 'Concluído', 
        badgeClass: 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' 
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadlineParts = deadlineStr.split('-');
    const deadline = new Date(deadlineParts[0], deadlineParts[1] - 1, deadlineParts[2]);
    deadline.setHours(0, 0, 0, 0);

    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const overdueDays = Math.abs(diffDays);
      return {
        type: 'overdue',
        isOverdue: true,
        diffDays,
        text: `Atrasado há ${overdueDays} ${overdueDays === 1 ? 'dia' : 'dias'}!`,
        badgeClass: 'bg-rose-950/90 text-rose-300 border border-rose-500/50 animate-urgent font-bold'
      };
    } else if (diffDays === 0) {
      return {
        type: 'today',
        isWarning: true,
        diffDays,
        text: 'Vence HOJE!',
        badgeClass: 'bg-amber-950/90 text-amber-300 border border-amber-500/50 font-bold'
      };
    } else if (diffDays === 1) {
      return {
        type: 'tomorrow',
        isWarning: true,
        diffDays,
        text: 'Vence Amanhã',
        badgeClass: 'bg-amber-950/70 text-amber-400 border border-amber-500/30 font-medium'
      };
    } else {
      return {
        type: 'ontime',
        diffDays,
        text: `${diffDays} dias restantes`,
        badgeClass: 'bg-slate-800/80 text-slate-300 border border-slate-700'
      };
    }
  },

  // Format phone number (XX) XXXXX-XXXX
  formatPhone(phone) {
    if (!phone) return '';
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 11) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
    } else if (clean.length === 10) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
    }
    return phone;
  },

  // Clean phone to numeric only with Brazilian country code if missing
  cleanPhoneForWhatsApp(phone) {
    if (!phone) return '';
    let digits = phone.replace(/\D/g, '');
    if (digits.length === 10 || digits.length === 11) {
      digits = '55' + digits;
    }
    return digits;
  },

  // Build direct WhatsApp Web / App link
  buildWhatsAppLink(phone, message = '') {
    const clean = this.cleanPhoneForWhatsApp(phone);
    if (!clean) return '#';
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${clean}?text=${encoded}`;
  },

  // Build official Google direct write-a-review URL from Place ID
  buildGoogleReviewUrl(placeId) {
    if (!placeId) return '';
    const cleanId = placeId.trim();
    // If the user pasted a full URL containing placeid=...
    if (cleanId.includes('placeid=')) {
      const match = cleanId.match(/placeid=([^&]+)/);
      if (match && match[1]) {
        return `https://search.google.com/local/writereview?placeid=${match[1]}`;
      }
    }
    return `https://search.google.com/local/writereview?placeid=${cleanId}`;
  },

  // Calculate size in bytes (UTF-8)
  calculateByteLength(str) {
    if (!str) return 0;
    return new Blob([str]).size;
  },

  // Generate robust UUID v4
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },

  // Toast Notification System
  showToast(title, message = '', type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast flex items-start p-4 rounded-xl shadow-2xl border text-sm backdrop-blur-md transition-all duration-300';

    let iconSvg = '';
    let borderClass = '';
    let bgClass = '';
    let titleClass = '';

    switch (type) {
      case 'success':
        bgClass = 'bg-[#0B1B15]';
        borderClass = 'border-emerald-500/40 text-emerald-100';
        titleClass = 'text-emerald-400 font-bold';
        iconSvg = `<svg class="w-5 h-5 text-emerald-400 flex-shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`;
        break;
      case 'error':
        bgClass = 'bg-[#1C0E12]';
        borderClass = 'border-rose-500/40 text-rose-100';
        titleClass = 'text-rose-400 font-bold';
        iconSvg = `<svg class="w-5 h-5 text-rose-400 flex-shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`;
        break;
      case 'warning':
        bgClass = 'bg-[#1C170E]';
        borderClass = 'border-amber-500/40 text-amber-100';
        titleClass = 'text-amber-400 font-bold';
        iconSvg = `<svg class="w-5 h-5 text-amber-400 flex-shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
        break;
      default:
        bgClass = 'bg-[#121927]';
        borderClass = 'border-orange-500/40 text-slate-100';
        titleClass = 'text-orange-400 font-bold';
        iconSvg = `<svg class="w-5 h-5 text-orange-400 flex-shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
        break;
    }

    toast.classList.add(...bgClass.split(' '), ...borderClass.split(' '));
    toast.innerHTML = `
      ${iconSvg}
      <div class="flex-1 pr-2">
        <div class="${titleClass}">${title}</div>
        ${message ? `<div class="text-xs text-slate-300 mt-0.5 leading-relaxed">${message}</div>` : ''}
      </div>
      <button class="text-slate-400 hover:text-white ml-2 text-xs" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }, 4500);
  }
};
