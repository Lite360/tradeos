// TradeOS Master Domain Interfaces & Schemas

export type BusinessRole = 'owner' | 'manager' | 'finance' | 'cashier' | 'inventory';

export type RetailCategory = 
  | 'provision' 
  | 'electronics' 
  | 'fashion' 
  | 'foodstuff' 
  | 'cosmetics' 
  | 'general';

export type SubscriptionPlanCode = 'free' | 'pro' | 'enterprise';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  isPlatformAdmin: boolean;
  isSuperAdmin: boolean;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  code: SubscriptionPlanCode;
  name: string;
  description: string;
  priceNgn: number;
  billingInterval: 'monthly' | 'annual';
  maxBusinesses: number;
  maxBranchesPerBusiness: number;
  maxStaffPerBusiness: number;
  maxProductsPerBusiness: number;
  hasAdvancedReports: boolean;
  hasApiAccess: boolean;
  isActive: boolean;
}

export interface Branch {
  id: string;
  businessId: string;
  name: string;
  code?: string;
  address?: string;
  phoneNumber?: string;
  isMainBranch: boolean;
}

export interface BusinessBranding {
  logoUrl?: string;
  primaryColor?: string;
  documentFooterNote?: string;
  bankAccountDetails?: string;
  taxRegistrationNumber?: string;
  invoicePrefix?: string;
  quotePrefix?: string;
  receiptPrefix?: string;
}

export interface Business {
  id: string;
  ownerUserId: string;
  name: string;
  legalName?: string;
  category: RetailCategory;
  currencyCode: string;
  countryCode: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  logoUrl?: string;
  subscriptionPlanId: string;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionStatus: 'active' | 'past_due' | 'canceled' | 'expired';
  subscriptionExpiresAt?: string;
  branding: BusinessBranding;
  branches: Branch[];
  createdAt: string;
}

export interface BusinessMembership {
  id: string;
  businessId: string;
  userId: string;
  role: BusinessRole;
  isActive: boolean;
  assignedBranchIds: string[];
  user?: UserProfile;
}

export interface ProductCategory {
  id: string;
  businessId: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  businessId: string;
  categoryId?: string;
  categoryName?: string;
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  unitOfMeasure: 'pcs' | 'kg' | 'carton' | 'pack' | 'liter' | 'service';
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
  isService: boolean;
  imageUrl?: string;
  quantityOnHand?: number; // Aggregate or branch specific
  categorySpecificData?: {
    sizes?: string[];
    expiryDate?: string;
    serialNumber?: string;
    warrantyPeriod?: string;
    bulkWeightKg?: number;
  };
  createdAt: string;
}

export interface BranchInventory {
  id: string;
  businessId: string;
  branchId: string;
  productId: string;
  quantityOnHand: number;
}

export interface StockMovement {
  id: string;
  businessId: string;
  branchId: string;
  productId: string;
  productName: string;
  movementType: 'sale' | 'purchase_receipt' | 'adjustment' | 'transfer_in' | 'transfer_out' | 'return';
  quantityChange: number;
  quantityAfter: number;
  unitCost?: number;
  referenceNumber?: string;
  reason?: string;
  createdByUserId: string;
  createdByName?: string;
  createdAt: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  productNameSnapshot: string;
  unitCostSnapshot: number;
  unitPrice: number;
  quantity: number;
  lineSubtotal: number;
  lineDiscount: number;
  lineTotal: number;
}

export interface Sale {
  id: string;
  businessId: string;
  branchId: string;
  branchName?: string;
  cashierUserId: string;
  cashierName?: string;
  customerId?: string;
  customerName?: string;
  receiptNumber: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: 'paid' | 'partially_paid' | 'credit';
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'split' | 'credit';
  notes?: string;
  items: SaleItem[];
  createdAt: string;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  outstandingDebt: number;
  creditLimit: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  businessId: string;
  companyName: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  outstandingLiability: number;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  productId?: string;
  description: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Invoice {
  id: string;
  businessId: string;
  branchId: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  status: 'draft' | 'issued' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  items: InvoiceItem[];
  brandingSnapshot: BusinessBranding;
  createdAt: string;
}

export interface Expense {
  id: string;
  businessId: string;
  branchId: string;
  branchName?: string;
  recordedByUserId: string;
  recordedByName?: string;
  category: 'rent' | 'utilities' | 'salaries' | 'logistics' | 'restock' | 'other';
  amount: number;
  paymentMethod: string;
  description: string;
  expenseDate: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  businessId?: string;
  actorUserId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalSalesToday: number;
  salesCountToday: number;
  totalCashCollectedToday: number;
  outstandingCustomerDebts: number;
  totalSupplierLiabilities: number;
  totalInventoryValuation: number;
  lowStockItemsCount: number;
  totalExpensesMonth: number;
}
