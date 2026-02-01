/**
 * =============================================================================
 * API TYPES & PAYLOADS - Shiv Furniture Budget Accounting System
 * =============================================================================
 * 
 * This file contains all TypeScript interfaces and types that match the backend
 * Prisma schema. Use these types for consistent data handling between frontend
 * and backend.
 * 
 * Structure:
 * 1. Enums - Status types, roles, etc.
 * 2. Base Models - Core entity interfaces (matching DB schema)
 * 3. Request Payloads - Data structures for POST/PUT requests
 * 4. Response Types - API response structures
 * 5. API Field Keys - Mapping objects for form fields
 * =============================================================================
 */

// =============================================================================
// ENUMS (Match Backend Prisma Enums)
// =============================================================================

export enum UserRole {
  ADMIN = "ADMIN",
  PORTAL = "PORTAL",
}

export enum ContactType {
  CUSTOMER = "CUSTOMER",
  VENDOR = "VENDOR",
  BOTH = "BOTH",
}

export enum AnalyticalType {
  DEPARTMENT = "DEPARTMENT",
  SESSION = "SESSION",
  EVENT = "EVENT",
  PROJECT = "PROJECT",
  OTHER = "OTHER",
}

export enum BudgetStatus {
  DRAFT = "DRAFT",
  CONFIRMED = "CONFIRMED",
  REVISED = "REVISED",
  ARCHIVED = "ARCHIVED",
}

export enum BudgetLineType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export enum PurchaseStatus {
  DRAFT = "DRAFT",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

export enum BillStatus {
  DRAFT = "DRAFT",
  CONFIRMED = "CONFIRMED",
  PARTIAL = "PARTIAL",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
}

export enum SalesStatus {
  DRAFT = "DRAFT",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

export enum InvoiceStatus {
  DRAFT = "DRAFT",
  CONFIRMED = "CONFIRMED",
  PARTIAL = "PARTIAL",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
}

export enum PaymentMethod {
  CASH = "CASH",
  BANK = "BANK",
  CARD = "CARD",
  UPI = "UPI",
  RAZORPAY = "RAZORPAY",
}

export enum PaymentStatus {
  INITIATED = "INITIATED",
  PARTIAL = "PARTIAL",
  PAID = "PAID",
  FAILED = "FAILED",
}

export enum PaymentType {
  BILL = "BILL",
  INVOICE = "INVOICE",
}

// =============================================================================
// BASE MODEL INTERFACES (Response from GET requests)
// =============================================================================

/** User entity - represents system users */
export interface User {
  id: string;
  name: string;
  loginId: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  contacts?: Contact[];
}

/** Contact entity - customers, vendors, or both */
export interface Contact {
  id: string;
  name: string;
  type: ContactType;
  tags: string[];
  email?: string;
  phone?: string;
  imageUrl?: string;
  portalUserId?: string;
  createdAt: string;
  updatedAt: string;
  portalUser?: User;
}

/** Product entity - items that can be purchased or sold */
export interface Product {
  id: string;
  name: string;
  category?: string;
  salesPrice: number;
  purchasePrice: number;
  createdAt: string;
  updatedAt: string;
}

/** Analytical Account - cost centers for budget tracking */
export interface AnalyticalAccount {
  id: string;
  name: string;
  type: AnalyticalType;
  createdAt: string;
  updatedAt: string;
}

/** Budget Line - individual income/expense line in a budget */
export interface BudgetLine {
  id: string;
  budgetId: string;
  type: BudgetLineType;
  budgetedAmount: number;
  actualAmount: number;
  createdAt: string;
  updatedAt: string;
}

/** Budget - financial plan for a period */
export interface Budget {
  id: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  status: BudgetStatus;
  analyticalAccountId: string;
  version: number;
  revisionOfId?: string;
  createdAt: string;
  updatedAt: string;
  analyticalAccount?: AnalyticalAccount;
  lines: BudgetLine[];
  revisions?: Budget[];
}

/** Auto Analytical Model - rules for auto-assigning cost centers */
export interface AutoAnalyticalModel {
  id: string;
  name: string;
  partnerId?: string;
  partnerTag?: string;
  productId?: string;
  productCategory?: string;
  analyticalAccountId: string;
  priority: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  partner?: Contact;
  product?: Product;
  analyticalAccount?: AnalyticalAccount;
}

/** Purchase Order Line - line item in purchase order */
export interface PurchaseOrderLine {
  id: string;
  purchaseOrderId: string;
  productId: string;
  analyticalAccountId?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  autoAssigned: boolean;
  product?: Product;
  analyticalAccount?: AnalyticalAccount;
}

/** Purchase Order - order placed to vendor */
export interface PurchaseOrder {
  id: string;
  number: string;
  vendorId: string;
  orderDate: string;
  status: PurchaseStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
  vendor?: Contact;
  lines: PurchaseOrderLine[];
  vendorBills?: VendorBill[];
}

/** Vendor Bill Line - line item in vendor bill */
export interface VendorBillLine {
  id: string;
  vendorBillId: string;
  productId: string;
  analyticalAccountId?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  autoAssigned: boolean;
  product?: Product;
  analyticalAccount?: AnalyticalAccount;
}

/** Vendor Bill - bill received from vendor */
export interface VendorBill {
  id: string;
  number: string;
  purchaseOrderId?: string;
  vendorId: string;
  billDate: string;
  dueDate?: string;
  status: BillStatus;
  total: number;
  amountDue: number;
  createdAt: string;
  updatedAt: string;
  purchaseOrder?: PurchaseOrder;
  vendor?: Contact;
  lines: VendorBillLine[];
  payments?: Payment[];
}

/** Sales Order Line - line item in sales order */
export interface SalesOrderLine {
  id: string;
  salesOrderId: string;
  productId: string;
  analyticalAccountId?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  autoAssigned: boolean;
  product?: Product;
  analyticalAccount?: AnalyticalAccount;
}

/** Sales Order - order from customer */
export interface SalesOrder {
  id: string;
  number: string;
  customerId: string;
  orderDate: string;
  status: SalesStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
  customer?: Contact;
  lines: SalesOrderLine[];
  invoices?: CustomerInvoice[];
}

/** Customer Invoice Line - line item in customer invoice */
export interface CustomerInvoiceLine {
  id: string;
  customerInvoiceId: string;
  productId: string;
  analyticalAccountId?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  autoAssigned: boolean;
  product?: Product;
  analyticalAccount?: AnalyticalAccount;
}

/** Customer Invoice - invoice sent to customer */
export interface CustomerInvoice {
  id: string;
  number: string;
  salesOrderId?: string;
  customerId: string;
  invoiceDate: string;
  dueDate?: string;
  status: InvoiceStatus;
  total: number;
  amountDue: number;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
  salesOrder?: SalesOrder;
  customer?: Contact;
  lines: CustomerInvoiceLine[];
  payments?: Payment[];
}

/** Payment - payment for bill or invoice */
export interface Payment {
  id: string;
  number: string;
  paymentType: PaymentType;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  paidAt?: string;
  referenceNotes?: string;
  vendorBillId?: string;
  customerInvoiceId?: string;
  createdAt: string;
  updatedAt: string;
  vendorBill?: VendorBill;
  customerInvoice?: CustomerInvoice;
}

/** Audit Log - system activity logging */
export interface AuditLog {
  id: string;
  actorId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// =============================================================================
// REQUEST PAYLOADS (For POST/PUT requests)
// =============================================================================

// --- User Payloads ---
export interface CreateUserPayload {
  name: string;
  loginId: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

// --- Contact Payloads ---
export interface CreateContactPayload {
  name: string;
  type: ContactType;
  tags?: string[];
  email?: string;
  phone?: string;
  imageUrl?: string;
}

export interface UpdateContactPayload extends Partial<CreateContactPayload> {}

// --- Product Payloads ---
export interface CreateProductPayload {
  name: string;
  category?: string;
  salesPrice: number;
  purchasePrice: number;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {}

// --- Analytical Account Payloads ---
export interface CreateAnalyticalAccountPayload {
  name: string;
  type: AnalyticalType;
}

export interface UpdateAnalyticalAccountPayload extends Partial<CreateAnalyticalAccountPayload> {}

// --- Budget Payloads ---
export interface CreateBudgetLinePayload {
  type: BudgetLineType;
  budgetedAmount: number;
}

export interface CreateBudgetPayload {
  name: string;
  periodStart: string;
  periodEnd: string;
  analyticalAccountId: string;
  lines: CreateBudgetLinePayload[];
}

export interface UpdateBudgetPayload extends Partial<CreateBudgetPayload> {
  status?: BudgetStatus;
}

// --- Auto Model Payloads ---
export interface CreateAutoModelPayload {
  name: string;
  partnerId?: string;
  partnerTag?: string;
  productId?: string;
  productCategory?: string;
  analyticalAccountId: string;
  priority?: number;
  active?: boolean;
}

export interface UpdateAutoModelPayload extends Partial<CreateAutoModelPayload> {}

// --- Purchase Order Payloads ---
export interface CreatePurchaseOrderLinePayload {
  productId: string;
  quantity: number;
  unitPrice: number;
  analyticalAccountId?: string;
}

export interface CreatePurchaseOrderPayload {
  number: string;
  vendorId: string;
  orderDate: string;
  status?: PurchaseStatus;
  lines: CreatePurchaseOrderLinePayload[];
}

export interface UpdatePurchaseOrderPayload {
  vendorId?: string;
  orderDate?: string;
  lines?: CreatePurchaseOrderLinePayload[];
}

// --- Vendor Bill Payloads ---
export interface CreateVendorBillLinePayload {
  productId: string;
  quantity: number;
  unitPrice: number;
  analyticalAccountId?: string;
}

export interface CreateVendorBillPayload {
  number: string;
  vendorId: string;
  billDate: string;
  dueDate?: string;
  purchaseOrderId?: string;
  status?: BillStatus;
  lines: CreateVendorBillLinePayload[];
}

export interface UpdateVendorBillPayload {
  vendorId?: string;
  billDate?: string;
  dueDate?: string;
  purchaseOrderId?: string;
  lines?: CreateVendorBillLinePayload[];
}

// --- Sales Order Payloads ---
export interface CreateSalesOrderLinePayload {
  productId: string;
  quantity: number;
  unitPrice: number;
  analyticalAccountId?: string;
}

export interface CreateSalesOrderPayload {
  number: string;
  customerId: string;
  orderDate: string;
  status?: SalesStatus;
  lines: CreateSalesOrderLinePayload[];
}

export interface UpdateSalesOrderPayload {
  customerId?: string;
  orderDate?: string;
  lines?: CreateSalesOrderLinePayload[];
}

// --- Customer Invoice Payloads ---
export interface CreateCustomerInvoiceLinePayload {
  productId: string;
  quantity: number;
  unitPrice: number;
  analyticalAccountId?: string;
}

export interface CreateCustomerInvoicePayload {
  number: string;
  customerId: string;
  invoiceDate: string;
  dueDate?: string;
  salesOrderId?: string;
  status?: InvoiceStatus;
  qrCode?: string;
  lines: CreateCustomerInvoiceLinePayload[];
}

export interface UpdateCustomerInvoicePayload {
  customerId?: string;
  invoiceDate?: string;
  dueDate?: string;
  salesOrderId?: string;
  qrCode?: string;
  lines?: CreateCustomerInvoiceLinePayload[];
}

// --- Payment Payloads ---
export interface CreatePaymentPayload {
  number?: string;
  paymentType: PaymentType;
  method: PaymentMethod;
  amount: number;
  referenceNotes?: string;
  vendorBillId?: string;
  customerInvoiceId?: string;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// --- Dashboard Response ---
export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  activeBudgetsCount: number;
  recentInvoices: Array<{
    id: string;
    number: string;
    total: number;
    status: InvoiceStatus;
    invoiceDate: string;
    customer: { name: string };
  }>;
  recentBills: Array<{
    id: string;
    number: string;
    total: number;
    status: BillStatus;
    billDate: string;
    vendor: { name: string };
  }>;
}

// =============================================================================
// API FIELD KEYS - For form field mapping & validation
// =============================================================================

/**
 * Field keys for User entity
 * Use these constants for form fields to ensure consistency with backend
 */
export const USER_FIELDS = {
  id: "id",
  name: "name",
  loginId: "loginId",
  email: "email",
  password: "password",
  role: "role",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
} as const;

/**
 * Field keys for Contact entity
 */
export const CONTACT_FIELDS = {
  id: "id",
  name: "name",
  type: "type",
  tags: "tags",
  email: "email",
  phone: "phone",
  imageUrl: "imageUrl",
  portalUserId: "portalUserId",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
} as const;

/**
 * Field keys for Product entity
 */
export const PRODUCT_FIELDS = {
  id: "id",
  name: "name",
  category: "category",
  salesPrice: "salesPrice",
  purchasePrice: "purchasePrice",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
} as const;

/**
 * Field keys for Analytical Account entity
 */
export const ANALYTICAL_ACCOUNT_FIELDS = {
  id: "id",
  name: "name",
  type: "type",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
} as const;

/**
 * Field keys for Budget entity
 */
export const BUDGET_FIELDS = {
  id: "id",
  name: "name",
  periodStart: "periodStart",
  periodEnd: "periodEnd",
  status: "status",
  analyticalAccountId: "analyticalAccountId",
  version: "version",
  revisionOfId: "revisionOfId",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
} as const;

/**
 * Field keys for Budget Line entity
 */
export const BUDGET_LINE_FIELDS = {
  id: "id",
  budgetId: "budgetId",
  type: "type",
  budgetedAmount: "budgetedAmount",
  actualAmount: "actualAmount",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
} as const;

/**
 * Field keys for Auto Analytical Model entity
 */
export const AUTO_MODEL_FIELDS = {
  id: "id",
  name: "name",
  partnerId: "partnerId",
  partnerTag: "partnerTag",
  productId: "productId",
  productCategory: "productCategory",
  analyticalAccountId: "analyticalAccountId",
  priority: "priority",
  active: "active",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
} as const;

/**
 * Field keys for Purchase Order entity
 */
export const PURCHASE_ORDER_FIELDS = {
  id: "id",
  number: "number",
  vendorId: "vendorId",
  orderDate: "orderDate",
  status: "status",
  total: "total",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
} as const;

/**
 * Field keys for Purchase Order Line entity
 */
export const PURCHASE_ORDER_LINE_FIELDS = {
  id: "id",
  purchaseOrderId: "purchaseOrderId",
  productId: "productId",
  analyticalAccountId: "analyticalAccountId",
  quantity: "quantity",
  unitPrice: "unitPrice",
  lineTotal: "lineTotal",
  autoAssigned: "autoAssigned",
} as const;

/**
 * Field keys for Vendor Bill entity
 */
export const VENDOR_BILL_FIELDS = {
  id: "id",
  number: "number",
  purchaseOrderId: "purchaseOrderId",
  vendorId: "vendorId",
  billDate: "billDate",
  dueDate: "dueDate",
  status: "status",
  total: "total",
  amountDue: "amountDue",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
} as const;

/**
 * Field keys for Vendor Bill Line entity
 */
export const VENDOR_BILL_LINE_FIELDS = {
  id: "id",
  vendorBillId: "vendorBillId",
  productId: "productId",
  analyticalAccountId: "analyticalAccountId",
  quantity: "quantity",
  unitPrice: "unitPrice",
  lineTotal: "lineTotal",
  autoAssigned: "autoAssigned",
} as const;

/**
 * Field keys for Sales Order entity
 */
export const SALES_ORDER_FIELDS = {
  id: "id",
  number: "number",
  customerId: "customerId",
  orderDate: "orderDate",
  status: "status",
  total: "total",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
} as const;

/**
 * Field keys for Sales Order Line entity
 */
export const SALES_ORDER_LINE_FIELDS = {
  id: "id",
  salesOrderId: "salesOrderId",
  productId: "productId",
  analyticalAccountId: "analyticalAccountId",
  quantity: "quantity",
  unitPrice: "unitPrice",
  lineTotal: "lineTotal",
  autoAssigned: "autoAssigned",
} as const;

/**
 * Field keys for Customer Invoice entity
 */
export const CUSTOMER_INVOICE_FIELDS = {
  id: "id",
  number: "number",
  salesOrderId: "salesOrderId",
  customerId: "customerId",
  invoiceDate: "invoiceDate",
  dueDate: "dueDate",
  status: "status",
  total: "total",
  amountDue: "amountDue",
  qrCode: "qrCode",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
} as const;

/**
 * Field keys for Customer Invoice Line entity
 */
export const CUSTOMER_INVOICE_LINE_FIELDS = {
  id: "id",
  customerInvoiceId: "customerInvoiceId",
  productId: "productId",
  analyticalAccountId: "analyticalAccountId",
  quantity: "quantity",
  unitPrice: "unitPrice",
  lineTotal: "lineTotal",
  autoAssigned: "autoAssigned",
} as const;

/**
 * Field keys for Payment entity
 */
export const PAYMENT_FIELDS = {
  id: "id",
  number: "number",
  paymentType: "paymentType",
  method: "method",
  status: "status",
  amount: "amount",
  paidAt: "paidAt",
  referenceNotes: "referenceNotes",
  vendorBillId: "vendorBillId",
  customerInvoiceId: "customerInvoiceId",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
} as const;

// =============================================================================
// API ENDPOINTS
// =============================================================================

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ME: "/auth/me",
    LOGOUT: "/auth/logout",
    GOOGLE: "/auth/google",
  },
  
  // Users
  USERS: {
    LIST: "/users",
    CREATE: "/users",
    GET: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
  
  // Contacts
  CONTACTS: {
    LIST: "/contacts",
    CREATE: "/contacts",
    GET: (id: string) => `/contacts/${id}`,
    UPDATE: (id: string) => `/contacts/${id}`,
    DELETE: (id: string) => `/contacts/${id}`,
  },
  
  // Products
  PRODUCTS: {
    LIST: "/products",
    CREATE: "/products",
    GET: (id: string) => `/products/${id}`,
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
  },
  
  // Analytical Accounts
  ANALYTICAL_ACCOUNTS: {
    LIST: "/analytical-accounts",
    CREATE: "/analytical-accounts",
    GET: (id: string) => `/analytical-accounts/${id}`,
    UPDATE: (id: string) => `/analytical-accounts/${id}`,
    DELETE: (id: string) => `/analytical-accounts/${id}`,
  },
  
  // Budgets
  BUDGETS: {
    LIST: "/budgets",
    CREATE: "/budgets",
    GET: (id: string) => `/budgets/${id}`,
    UPDATE: (id: string) => `/budgets/${id}`,
    DELETE: (id: string) => `/budgets/${id}`,
    CONFIRM: (id: string) => `/budgets/${id}/confirm`,
    REVISE: (id: string) => `/budgets/${id}/revise`,
  },
  
  // Auto Models
  AUTO_MODELS: {
    LIST: "/auto-analytical-models",
    CREATE: "/auto-analytical-models",
    GET: (id: string) => `/auto-analytical-models/${id}`,
    UPDATE: (id: string) => `/auto-analytical-models/${id}`,
    DELETE: (id: string) => `/auto-analytical-models/${id}`,
  },
  
  // Purchase Orders
  PURCHASE_ORDERS: {
    LIST: "/purchase-orders",
    CREATE: "/purchase-orders",
    GET: (id: string) => `/purchase-orders/${id}`,
    UPDATE: (id: string) => `/purchase-orders/${id}`,
    DELETE: (id: string) => `/purchase-orders/${id}`,
    CONFIRM: (id: string) => `/purchase-orders/${id}/confirm`,
  },
  
  // Vendor Bills
  VENDOR_BILLS: {
    LIST: "/vendor-bills",
    CREATE: "/vendor-bills",
    GET: (id: string) => `/vendor-bills/${id}`,
    UPDATE: (id: string) => `/vendor-bills/${id}`,
    DELETE: (id: string) => `/vendor-bills/${id}`,
    CONFIRM: (id: string) => `/vendor-bills/${id}/confirm`,
    FROM_PO: (poId: string) => `/vendor-bills/from-po/${poId}`,
  },
  
  // Sales Orders
  SALES_ORDERS: {
    LIST: "/sales-orders",
    CREATE: "/sales-orders",
    GET: (id: string) => `/sales-orders/${id}`,
    UPDATE: (id: string) => `/sales-orders/${id}`,
    DELETE: (id: string) => `/sales-orders/${id}`,
    CONFIRM: (id: string) => `/sales-orders/${id}/confirm`,
  },
  
  // Customer Invoices
  CUSTOMER_INVOICES: {
    LIST: "/customer-invoices",
    CREATE: "/customer-invoices",
    GET: (id: string) => `/customer-invoices/${id}`,
    UPDATE: (id: string) => `/customer-invoices/${id}`,
    DELETE: (id: string) => `/customer-invoices/${id}`,
    CONFIRM: (id: string) => `/customer-invoices/${id}/confirm`,
    FROM_SO: (soId: string) => `/customer-invoices/from-so/${soId}`,
    PDF: (id: string) => `/customer-invoices/${id}/pdf`,
  },
  
  // Payments
  PAYMENTS: {
    LIST: "/payments",
    CREATE: "/payments",
  },
  
  // Dashboard
  DASHBOARD: {
    STATS: "/dashboard/stats",
  },
  
  // Health
  HEALTH: "/health",
} as const;

// =============================================================================
// ENUM OPTIONS (For Select dropdowns)
// =============================================================================

export const USER_ROLE_OPTIONS = [
  { value: UserRole.ADMIN, label: "Admin" },
  { value: UserRole.PORTAL, label: "Portal User" },
];

export const CONTACT_TYPE_OPTIONS = [
  { value: ContactType.CUSTOMER, label: "Customer" },
  { value: ContactType.VENDOR, label: "Vendor" },
  { value: ContactType.BOTH, label: "Both" },
];

export const ANALYTICAL_TYPE_OPTIONS = [
  { value: AnalyticalType.DEPARTMENT, label: "Department" },
  { value: AnalyticalType.SESSION, label: "Session" },
  { value: AnalyticalType.EVENT, label: "Event" },
  { value: AnalyticalType.PROJECT, label: "Project" },
  { value: AnalyticalType.OTHER, label: "Other" },
];

export const BUDGET_STATUS_OPTIONS = [
  { value: BudgetStatus.DRAFT, label: "Draft" },
  { value: BudgetStatus.CONFIRMED, label: "Confirmed" },
  { value: BudgetStatus.REVISED, label: "Revised" },
  { value: BudgetStatus.ARCHIVED, label: "Archived" },
];

export const BUDGET_LINE_TYPE_OPTIONS = [
  { value: BudgetLineType.INCOME, label: "Income" },
  { value: BudgetLineType.EXPENSE, label: "Expense" },
];

export const PURCHASE_STATUS_OPTIONS = [
  { value: PurchaseStatus.DRAFT, label: "Draft" },
  { value: PurchaseStatus.CONFIRMED, label: "Confirmed" },
  { value: PurchaseStatus.CANCELLED, label: "Cancelled" },
];

export const BILL_STATUS_OPTIONS = [
  { value: BillStatus.DRAFT, label: "Draft" },
  { value: BillStatus.CONFIRMED, label: "Confirmed" },
  { value: BillStatus.PARTIAL, label: "Partial" },
  { value: BillStatus.PAID, label: "Paid" },
  { value: BillStatus.CANCELLED, label: "Cancelled" },
];

export const SALES_STATUS_OPTIONS = [
  { value: SalesStatus.DRAFT, label: "Draft" },
  { value: SalesStatus.CONFIRMED, label: "Confirmed" },
  { value: SalesStatus.CANCELLED, label: "Cancelled" },
];

export const INVOICE_STATUS_OPTIONS = [
  { value: InvoiceStatus.DRAFT, label: "Draft" },
  { value: InvoiceStatus.CONFIRMED, label: "Confirmed" },
  { value: InvoiceStatus.PARTIAL, label: "Partial" },
  { value: InvoiceStatus.PAID, label: "Paid" },
  { value: InvoiceStatus.CANCELLED, label: "Cancelled" },
];

export const PAYMENT_METHOD_OPTIONS = [
  { value: PaymentMethod.CASH, label: "Cash" },
  { value: PaymentMethod.BANK, label: "Bank Transfer" },
  { value: PaymentMethod.CARD, label: "Card" },
  { value: PaymentMethod.UPI, label: "UPI" },
  { value: PaymentMethod.RAZORPAY, label: "Razorpay" },
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: PaymentStatus.INITIATED, label: "Initiated" },
  { value: PaymentStatus.PARTIAL, label: "Partial" },
  { value: PaymentStatus.PAID, label: "Paid" },
  { value: PaymentStatus.FAILED, label: "Failed" },
];

export const PAYMENT_TYPE_OPTIONS = [
  { value: PaymentType.BILL, label: "Vendor Bill" },
  { value: PaymentType.INVOICE, label: "Customer Invoice" },
];

// =============================================================================
// TYPE GUARDS (For runtime type checking)
// =============================================================================

export const isUser = (obj: unknown): obj is User => {
  return typeof obj === "object" && obj !== null && "loginId" in obj && "email" in obj;
};

export const isContact = (obj: unknown): obj is Contact => {
  return typeof obj === "object" && obj !== null && "type" in obj && "tags" in obj;
};

export const isProduct = (obj: unknown): obj is Product => {
  return typeof obj === "object" && obj !== null && "salesPrice" in obj && "purchasePrice" in obj;
};

export const isPurchaseOrder = (obj: unknown): obj is PurchaseOrder => {
  return typeof obj === "object" && obj !== null && "vendorId" in obj && "lines" in obj;
};

export const isSalesOrder = (obj: unknown): obj is SalesOrder => {
  return typeof obj === "object" && obj !== null && "customerId" in obj && "lines" in obj;
};

export const isVendorBill = (obj: unknown): obj is VendorBill => {
  return typeof obj === "object" && obj !== null && "vendorId" in obj && "amountDue" in obj;
};

export const isCustomerInvoice = (obj: unknown): obj is CustomerInvoice => {
  return typeof obj === "object" && obj !== null && "customerId" in obj && "amountDue" in obj;
};

export const isPayment = (obj: unknown): obj is Payment => {
  return typeof obj === "object" && obj !== null && "paymentType" in obj && "method" in obj;
};
