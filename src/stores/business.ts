import { defineStore } from 'pinia';
import type { 
  Product, 
  ProductCategory, 
  StockMovement, 
  Sale, 
  SaleItem, 
  Customer, 
  Supplier, 
  Invoice, 
  Expense, 
  DashboardSummary
} from '@/types';
import { useAuthStore } from './auth';

interface PosCartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
}

interface BusinessState {
  categories: ProductCategory[];
  products: Product[];
  stockMovements: StockMovement[];
  sales: Sale[];
  customers: Customer[];
  suppliers: Supplier[];
  invoices: Invoice[];
  expenses: Expense[];
  cart: PosCartItem[];
  cartDiscount: number;
  cartPaymentMethod: 'cash' | 'card' | 'bank_transfer' | 'split' | 'credit';
  cartAmountPaid: number;
  cartNotes: string;
  selectedCustomerId: string | null;
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;
}

export const useBusinessStore = defineStore('business', {
  state: (): BusinessState => ({
    categories: [],
    products: [],
    stockMovements: [],
    sales: [],
    customers: [],
    suppliers: [],
    invoices: [],
    expenses: [],
    cart: [],
    cartDiscount: 0,
    cartPaymentMethod: 'cash',
    cartAmountPaid: 0,
    cartNotes: '',
    selectedCustomerId: null,
    isLoading: false,
    error: null,
    isOffline: !navigator.onLine,
  }),

  getters: {
    cartSubtotal(state): number {
      return state.cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity - item.discount), 0);
    },

    cartTotal(state): number {
      const sub = this.cartSubtotal;
      const total = sub - state.cartDiscount;
      return Math.max(0, total);
    },

    cartItemsCount(state): number {
      return state.cart.reduce((count, item) => count + item.quantity, 0);
    },

    lowStockProducts(state): Product[] {
      return state.products.filter(p => !p.isService && (p.quantityOnHand || 0) <= p.reorderLevel);
    },

    totalCustomerDebt(state): number {
      return state.customers.reduce((sum, c) => sum + (c.outstandingDebt || 0), 0);
    },

    totalSupplierLiability(state): number {
      return state.suppliers.reduce((sum, s) => sum + (s.outstandingLiability || 0), 0);
    },

    totalInventoryValuation(state): number {
      return state.products.reduce((sum, p) => sum + ((p.quantityOnHand || 0) * p.costPrice), 0);
    },

    dashboardSummary(state): DashboardSummary {
      const today = new Date().toISOString().split('T')[0];
      const todaySales = state.sales.filter(s => s.createdAt.startsWith(today));
      
      const totalSalesToday = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
      const totalCashCollectedToday = todaySales.reduce((sum, s) => sum + s.amountPaid, 0);

      const thisMonth = new Date().toISOString().substring(0, 7);
      const monthlyExpenses = state.expenses
        .filter(e => e.expenseDate.startsWith(thisMonth))
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        totalSalesToday,
        salesCountToday: todaySales.length,
        totalCashCollectedToday,
        outstandingCustomerDebts: this.totalCustomerDebt,
        totalSupplierLiabilities: this.totalSupplierLiability,
        totalInventoryValuation: this.totalInventoryValuation,
        lowStockItemsCount: this.lowStockProducts.length,
        totalExpensesMonth: monthlyExpenses,
      };
    }
  },

  actions: {
    async initializeWorkspaceData() {
      const authStore = useAuthStore();
      const bizId = authStore.activeBusinessId;
      if (!bizId) return;

      this.isLoading = true;
      try {
        const res = await fetch(`/api/workspace-data?businessId=${bizId}`);
        if (res.ok) {
          const data = await res.json();
          this.categories = data.categories || [];
          this.products = data.products || [];
          this.sales = data.sales || [];
          this.customers = data.customers || [];
          this.suppliers = data.suppliers || [];
          this.invoices = data.invoices || [];
          this.expenses = data.expenses || [];
          this.stockMovements = data.stockMovements || [];
        }
      } catch (err) {
        console.error('Failed to initialize workspace data', err);
      } finally {
        this.isLoading = false;
      }

      window.addEventListener('online', () => { this.isOffline = false; });
      window.addEventListener('offline', () => { this.isOffline = true; });
    },

    saveWorkspaceData() {
      // Deprecated: Now handled by API
    },

    async addCategory(name: string, description?: string) {
      const authStore = useAuthStore();
      this.isLoading = true;
      try {
        const res = await fetch('/api/products?action=category', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId: authStore.activeBusinessId, name, description })
        });
        if (res.ok) {
          const newCat = await res.json();
          const cat = { id: newCat.id, businessId: newCat.business_id, name: newCat.name, description: newCat.description };
          this.categories.push(cat);
          return cat;
        }
      } finally {
        this.isLoading = false;
      }
    },

    async addProduct(payload: Omit<Product, 'id' | 'businessId' | 'createdAt'>) {
      const authStore = useAuthStore();
      this.isLoading = true;
      try {
        const res = await fetch('/api/products?action=product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            businessId: authStore.activeBusinessId,
            branchId: authStore.activeBranchId || 'main',
            ...payload 
          })
        });
        if (res.ok) {
          const p = await res.json();
          const newProd: Product = {
            id: p.id,
            businessId: p.business_id,
            categoryId: p.category_id,
            name: p.name,
            sku: p.sku,
            barcode: p.barcode,
            description: p.description,
            costPrice: parseFloat(p.cost_price),
            sellingPrice: parseFloat(p.selling_price),
            quantityOnHand: parseFloat(p.quantity_on_hand),
            reorderLevel: parseFloat(p.reorder_level),
            unitOfMeasure: p.unit_of_measure,
            isService: p.is_service,
            createdAt: p.created_at
          };
          this.products.push(newProd);
          return newProd;
        }
      } finally {
        this.isLoading = false;
      }
    },

    updateProduct(productId: string, updates: Partial<Product>) {
      const idx = this.products.findIndex(p => p.id === productId);
      if (idx !== -1) {
        this.products[idx] = { ...this.products[idx], ...updates };
        this.saveWorkspaceData();
      }
    },

    async adjustStock(productId: string, quantityChange: number, reason: string) {
      const prod = this.products.find(p => p.id === productId);
      if (!prod || prod.isService) return;

      try {
        const res = await fetch('/api/products?action=product', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: productId, quantityChange, reason })
        });
        
        if (res.ok) {
          const data = await res.json();
          prod.quantityOnHand = data.newQuantity;
        }
      } catch (err) {
        console.error('Stock adjustment failed', err);
      }
    },

    recordStockMovement(movement: {
      productId: string;
      productName: string;
      movementType: StockMovement['movementType'];
      quantityChange: number;
      quantityAfter: number;
      unitCost?: number;
      referenceNumber?: string;
      reason?: string;
    }) {
      const authStore = useAuthStore();
      const newMov: StockMovement = {
        id: 'mov_' + Math.random().toString(36).substring(2, 9),
        businessId: authStore.activeBusinessId!,
        branchId: authStore.activeBranchId || 'main',
        createdByUserId: authStore.user?.id || 'usr_unknown',
        createdByName: authStore.user?.fullName || 'Cashier',
        createdAt: new Date().toISOString(),
        ...movement
      };
      this.stockMovements.unshift(newMov);
    },

    addToCart(product: Product, quantity = 1) {
      const existing = this.cart.find(item => item.product.id === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        this.cart.push({
          product,
          quantity,
          unitPrice: product.sellingPrice,
          discount: 0
        });
      }
    },

    updateCartQuantity(productId: string, quantity: number) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
        return;
      }
      const item = this.cart.find(i => i.product.id === productId);
      if (item) item.quantity = quantity;
    },

    removeFromCart(productId: string) {
      this.cart = this.cart.filter(item => item.product.id !== productId);
    },

    clearCart() {
      this.cart = [];
      this.cartDiscount = 0;
      this.cartAmountPaid = 0;
      this.cartNotes = '';
      this.selectedCustomerId = null;
      this.cartPaymentMethod = 'cash';
    },

    async completeSale(payload: {
      paymentMethod: Sale['paymentMethod'];
      amountPaid: number;
      customerId?: string;
      notes?: string;
    }): Promise<Sale> {
      const authStore = useAuthStore();
      if (this.cart.length === 0) throw new Error('Cart is empty');

      const total = this.cartTotal;
      const subtotal = this.cartSubtotal;
      const amountPaid = Math.min(payload.amountPaid, total);
      const balanceDue = Math.max(0, total - amountPaid);
      
      let paymentStatus: Sale['paymentStatus'] = 'paid';
      if (balanceDue > 0 && amountPaid > 0) {
        paymentStatus = 'partially_paid';
      } else if (balanceDue > 0 && amountPaid === 0) {
        paymentStatus = 'credit';
      }

      const receiptNumber = 'REC-' + Date.now().toString().substring(5);
      const customer = payload.customerId ? this.customers.find(c => c.id === payload.customerId) : null;

      const saleItems: SaleItem[] = this.cart.map(item => {
        return {
          id: 'item_' + Math.random().toString(36).substring(2, 9), // Local temp ID
          productId: item.product.id,
          productNameSnapshot: item.product.name,
          unitCostSnapshot: item.product.costPrice,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineSubtotal: item.unitPrice * item.quantity,
          lineDiscount: item.discount,
          lineTotal: (item.unitPrice * item.quantity) - item.discount
        };
      });

      const sale: Sale = {
        id: 'sale_' + Math.random().toString(36).substring(2, 9),
        businessId: authStore.activeBusinessId!,
        branchId: authStore.activeBranchId || 'main',
        branchName: authStore.activeBranch?.name || 'Main Branch',
        cashierUserId: authStore.user?.id || 'usr_cashier',
        cashierName: authStore.user?.fullName || 'Cashier',
        customerId: customer?.id,
        customerName: customer?.name || 'Walk-in Customer',
        receiptNumber,
        subtotal,
        discountAmount: this.cartDiscount,
        taxAmount: 0,
        totalAmount: total,
        amountPaid,
        balanceDue,
        paymentStatus,
        paymentMethod: payload.paymentMethod,
        notes: payload.notes,
        items: saleItems,
        createdAt: new Date().toISOString()
      };

      try {
        const res = await fetch('/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sale)
        });
        
        if (res.ok) {
          const data = await res.json();
          sale.id = data.saleId; // Update with DB ID
          this.sales.unshift(sale);
          
          // Optimistically update local stock
          this.cart.forEach(item => {
            const prod = this.products.find(p => p.id === item.product.id);
            if (prod && !prod.isService) {
              prod.quantityOnHand = Math.max(0, (prod.quantityOnHand || 0) - item.quantity);
            }
          });
          
          if (customer && balanceDue > 0) {
            customer.outstandingDebt = (customer.outstandingDebt || 0) + balanceDue;
          }
          
          this.clearCart();
          return sale;
        } else {
          throw new Error('Failed to record sale');
        }
      } catch (err: any) {
        throw new Error(err.message || 'Network error');
      }
    },

    async addCustomer(payload: Omit<Customer, 'id' | 'businessId' | 'outstandingDebt' | 'createdAt'>) {
      const authStore = useAuthStore();
      try {
        const res = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId: authStore.activeBusinessId, ...payload })
        });
        if (res.ok) {
          const c = await res.json();
          this.customers.push(c);
          return c;
        }
      } catch (e) {
        console.warn('Network error adding customer:', e);
      }

      // Local fallback in state
      const fallbackCustomer: Customer = {
        id: `cust_${Date.now()}`,
        businessId: authStore.activeBusinessId || 'biz_default',
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        address: payload.address,
        creditLimit: payload.creditLimit || 0,
        outstandingDebt: 0,
        createdAt: new Date().toISOString()
      };
      this.customers.push(fallbackCustomer);
      return fallbackCustomer;
    },

    async recordCustomerDebtPayment(customerId: string, amount: number) {
      const res = await fetch('/api/customers?action=payment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: customerId, amount })
      });
      if (res.ok) {
        const data = await res.json();
        const cust = this.customers.find(c => c.id === customerId);
        if (cust) cust.outstandingDebt = data.outstandingDebt;
      }
    },

    async addSupplier(payload: Omit<Supplier, 'id' | 'businessId' | 'outstandingLiability' | 'createdAt'>) {
      const authStore = useAuthStore();
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: authStore.activeBusinessId, ...payload })
      });
      if (res.ok) {
        const s = await res.json();
        this.suppliers.push(s);
        return s;
      }
    },

    async recordSupplierLiabilityPayment(supplierId: string, amount: number) {
      const res = await fetch('/api/suppliers?action=payment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: supplierId, amount })
      });
      if (res.ok) {
        const data = await res.json();
        const supp = this.suppliers.find(s => s.id === supplierId);
        if (supp) supp.outstandingLiability = data.outstandingLiability;
      }
    },

    async createInvoice(payload: {
      customerId: string;
      dueDate: string;
      items: { description: string; unitPrice: number; quantity: number }[];
      notes?: string;
    }) {
      const authStore = useAuthStore();
      const customer = this.customers.find(c => c.id === payload.customerId);
      if (!customer) throw new Error('Customer not found');

      const invoiceNumber = (authStore.activeBusiness?.branding.invoicePrefix || 'INV-') + Date.now().toString().substring(5);

      const subtotal = payload.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
      const totalAmount = subtotal;

      const invoiceItems = payload.items.map(item => ({
        description: item.description,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal: item.unitPrice * item.quantity
      }));

      const invoicePayload = {
        businessId: authStore.activeBusinessId!,
        branchId: authStore.activeBranchId || 'main',
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        invoiceNumber,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: payload.dueDate,
        subtotal,
        totalAmount,
        notes: payload.notes,
        items: invoiceItems
      };

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoicePayload)
      });

      if (res.ok) {
        const data = await res.json();
        const invoice: Invoice = {
          ...invoicePayload,
          id: data.invoiceId,
          amountPaid: 0,
          status: 'issued',
          discountAmount: 0,
          taxAmount: 0,
          items: invoiceItems.map(i => ({ ...i, id: 'temp' })),
          brandingSnapshot: { ...authStore.activeBusiness?.branding },
          createdAt: data.invoice.created_at
        };
        this.invoices.unshift(invoice);
        customer.outstandingDebt = (customer.outstandingDebt || 0) + totalAmount;
        return invoice;
      }
    },

    async recordExpense(payload: {
      category: Expense['category'];
      amount: number;
      paymentMethod: string;
      description: string;
      expenseDate: string;
    }) {
      const authStore = useAuthStore();
      
      const expensePayload = {
        businessId: authStore.activeBusinessId!,
        branchId: authStore.activeBranchId || 'main',
        recordedByUserId: authStore.user?.id || 'usr_staff',
        ...payload
      };

      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expensePayload)
      });

      if (res.ok) {
        const expense = await res.json();
        this.expenses.unshift(expense);
        return expense;
      }
    }
  }
});
