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
    initializeWorkspaceData() {
      const authStore = useAuthStore();
      const bizId = authStore.activeBusinessId;
      if (!bizId) return;

      const prefix = `tradeos_${bizId}_`;
      const cat = localStorage.getItem(prefix + 'categories');
      const prod = localStorage.getItem(prefix + 'products');
      const sales = localStorage.getItem(prefix + 'sales');
      const cust = localStorage.getItem(prefix + 'customers');
      const supp = localStorage.getItem(prefix + 'suppliers');
      const inv = localStorage.getItem(prefix + 'invoices');
      const exp = localStorage.getItem(prefix + 'expenses');
      const mov = localStorage.getItem(prefix + 'movements');

      if (cat) this.categories = JSON.parse(cat);
      if (prod) this.products = JSON.parse(prod);
      if (sales) this.sales = JSON.parse(sales);
      if (cust) this.customers = JSON.parse(cust);
      if (supp) this.suppliers = JSON.parse(supp);
      if (inv) this.invoices = JSON.parse(inv);
      if (exp) this.expenses = JSON.parse(exp);
      if (mov) this.stockMovements = JSON.parse(mov);

      window.addEventListener('online', () => { this.isOffline = false; });
      window.addEventListener('offline', () => { this.isOffline = true; });
    },

    saveWorkspaceData() {
      const authStore = useAuthStore();
      const bizId = authStore.activeBusinessId;
      if (!bizId) return;

      const prefix = `tradeos_${bizId}_`;
      localStorage.setItem(prefix + 'categories', JSON.stringify(this.categories));
      localStorage.setItem(prefix + 'products', JSON.stringify(this.products));
      localStorage.setItem(prefix + 'sales', JSON.stringify(this.sales));
      localStorage.setItem(prefix + 'customers', JSON.stringify(this.customers));
      localStorage.setItem(prefix + 'suppliers', JSON.stringify(this.suppliers));
      localStorage.setItem(prefix + 'invoices', JSON.stringify(this.invoices));
      localStorage.setItem(prefix + 'expenses', JSON.stringify(this.expenses));
      localStorage.setItem(prefix + 'movements', JSON.stringify(this.stockMovements));
    },

    addCategory(name: string, description?: string) {
      const authStore = useAuthStore();
      const newCat: ProductCategory = {
        id: 'cat_' + Math.random().toString(36).substring(2, 9),
        businessId: authStore.activeBusinessId!,
        name,
        description
      };
      this.categories.push(newCat);
      this.saveWorkspaceData();
      return newCat;
    },

    addProduct(payload: Omit<Product, 'id' | 'businessId' | 'createdAt'>) {
      const authStore = useAuthStore();
      const newProd: Product = {
        ...payload,
        id: 'prd_' + Math.random().toString(36).substring(2, 9),
        businessId: authStore.activeBusinessId!,
        createdAt: new Date().toISOString()
      };
      this.products.push(newProd);

      if (!newProd.isService && (newProd.quantityOnHand || 0) > 0) {
        this.recordStockMovement({
          productId: newProd.id,
          productName: newProd.name,
          movementType: 'adjustment',
          quantityChange: newProd.quantityOnHand || 0,
          quantityAfter: newProd.quantityOnHand || 0,
          unitCost: newProd.costPrice,
          reason: 'Initial stock setup'
        });
      }

      this.saveWorkspaceData();
      return newProd;
    },

    updateProduct(productId: string, updates: Partial<Product>) {
      const idx = this.products.findIndex(p => p.id === productId);
      if (idx !== -1) {
        this.products[idx] = { ...this.products[idx], ...updates };
        this.saveWorkspaceData();
      }
    },

    adjustStock(productId: string, quantityChange: number, reason: string) {
      const prod = this.products.find(p => p.id === productId);
      if (!prod || prod.isService) return;

      const oldQty = prod.quantityOnHand || 0;
      const newQty = Math.max(0, oldQty + quantityChange);
      prod.quantityOnHand = newQty;

      this.recordStockMovement({
        productId: prod.id,
        productName: prod.name,
        movementType: 'adjustment',
        quantityChange,
        quantityAfter: newQty,
        unitCost: prod.costPrice,
        reason
      });

      this.saveWorkspaceData();
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

    completeSale(payload: {
      paymentMethod: Sale['paymentMethod'];
      amountPaid: number;
      customerId?: string;
      notes?: string;
    }): Sale {
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
        const prod = this.products.find(p => p.id === item.product.id);
        if (prod && !prod.isService) {
          const currentQty = prod.quantityOnHand || 0;
          const newQty = Math.max(0, currentQty - item.quantity);
          prod.quantityOnHand = newQty;

          this.recordStockMovement({
            productId: prod.id,
            productName: prod.name,
            movementType: 'sale',
            quantityChange: -item.quantity,
            quantityAfter: newQty,
            unitCost: prod.costPrice,
            referenceNumber: receiptNumber,
            reason: `POS Sale ${receiptNumber}`
          });
        }

        return {
          id: 'item_' + Math.random().toString(36).substring(2, 9),
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

      if (customer && balanceDue > 0) {
        customer.outstandingDebt = (customer.outstandingDebt || 0) + balanceDue;
      }

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

      this.sales.unshift(sale);
      this.clearCart();
      this.saveWorkspaceData();
      return sale;
    },

    addCustomer(payload: Omit<Customer, 'id' | 'businessId' | 'outstandingDebt' | 'createdAt'>) {
      const authStore = useAuthStore();
      const newCust: Customer = {
        ...payload,
        id: 'cust_' + Math.random().toString(36).substring(2, 9),
        businessId: authStore.activeBusinessId!,
        outstandingDebt: 0,
        createdAt: new Date().toISOString()
      };
      this.customers.push(newCust);
      this.saveWorkspaceData();
      return newCust;
    },

    recordCustomerDebtPayment(customerId: string, amount: number) {
      const cust = this.customers.find(c => c.id === customerId);
      if (!cust) return;
      cust.outstandingDebt = Math.max(0, (cust.outstandingDebt || 0) - amount);
      this.saveWorkspaceData();
    },

    addSupplier(payload: Omit<Supplier, 'id' | 'businessId' | 'outstandingLiability' | 'createdAt'>) {
      const authStore = useAuthStore();
      const newSupp: Supplier = {
        ...payload,
        id: 'supp_' + Math.random().toString(36).substring(2, 9),
        businessId: authStore.activeBusinessId!,
        outstandingLiability: 0,
        createdAt: new Date().toISOString()
      };
      this.suppliers.push(newSupp);
      this.saveWorkspaceData();
      return newSupp;
    },

    recordSupplierLiabilityPayment(supplierId: string, amount: number) {
      const supp = this.suppliers.find(s => s.id === supplierId);
      if (!supp) return;
      supp.outstandingLiability = Math.max(0, (supp.outstandingLiability || 0) - amount);
      this.saveWorkspaceData();
    },

    createInvoice(payload: {
      customerId: string;
      dueDate: string;
      items: { description: string; unitPrice: number; quantity: number }[];
      notes?: string;
    }): Invoice {
      const authStore = useAuthStore();
      const customer = this.customers.find(c => c.id === payload.customerId);
      if (!customer) throw new Error('Customer not found');

      const invoiceNumber = (authStore.activeBusiness?.branding.invoicePrefix || 'INV-') + Date.now().toString().substring(5);

      const subtotal = payload.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
      const totalAmount = subtotal;

      const invoiceItems = payload.items.map(item => ({
        id: 'invitem_' + Math.random().toString(36).substring(2, 9),
        description: item.description,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal: item.unitPrice * item.quantity
      }));

      const invoice: Invoice = {
        id: 'inv_' + Math.random().toString(36).substring(2, 9),
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
        taxAmount: 0,
        discountAmount: 0,
        totalAmount,
        amountPaid: 0,
        status: 'issued',
        notes: payload.notes,
        items: invoiceItems,
        brandingSnapshot: { ...authStore.activeBusiness?.branding },
        createdAt: new Date().toISOString()
      };

      this.invoices.unshift(invoice);
      customer.outstandingDebt = (customer.outstandingDebt || 0) + totalAmount;

      this.saveWorkspaceData();
      return invoice;
    },

    recordExpense(payload: {
      category: Expense['category'];
      amount: number;
      paymentMethod: string;
      description: string;
      expenseDate: string;
    }): Expense {
      const authStore = useAuthStore();
      const expense: Expense = {
        id: 'exp_' + Math.random().toString(36).substring(2, 9),
        businessId: authStore.activeBusinessId!,
        branchId: authStore.activeBranchId || 'main',
        branchName: authStore.activeBranch?.name || 'Main Branch',
        recordedByUserId: authStore.user?.id || 'usr_staff',
        recordedByName: authStore.user?.fullName || 'Staff',
        category: payload.category,
        amount: payload.amount,
        paymentMethod: payload.paymentMethod,
        description: payload.description,
        expenseDate: payload.expenseDate,
        createdAt: new Date().toISOString()
      };

      this.expenses.unshift(expense);
      this.saveWorkspaceData();
      return expense;
    }
  }
});
