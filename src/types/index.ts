export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'staff';
  createdAt: string;
  firebaseUid?: string; // Optional to maintain compatibility with existing data
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  balance: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  balance: number;
  createdAt: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category?: string;
  tradePrice: number;
  salePrice: number;
  currentStock: number;
  minStockLevel?: number;
  unit: string;
  createdAt: string;
  isBattery?: boolean;
  packing?: string;
  retailer?: string;
}

export interface Purchase {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplier?: Supplier;
  totalAmount: number;
  discount: number;
  netAmount: number;
  totalItems: number;
  status: 'pending' | 'completed';
  purchaseDate: string;
  createdAt: string;
  items: PurchaseItem[];
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productId: string;
  product?: Product;
  quantity: number;
  tradePrice: number;
  salePrice: number;
  total: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customer?: Customer;
  customerName?: string; // For manually entered customer name
  customerPhone?: string; // For manually entered customer phone
  salesperson?: string; // For salesperson name
  totalAmount: number;
  discount: number;
  netAmount: number;
  amountPaid: number; // Amount paid by customer
  remainingBalance: number; // Remaining balance to be paid
  totalItems: number;
  status: 'completed' | 'returned';
  saleDate: string;
  createdAt: string;
  items: SaleItem[];
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  product?: Product;
  quantity: number;
  salePrice: number;
  discount: number;
  total: number;
  includeOldBattery: boolean;
  oldBatteryData?: {
    name: string;
    weight: number;
    ratePerKg: number;
    deductionAmount: number;
  };
  createdAt: string;
  oldBatteryId?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  product?: Product;
  type: 'purchase' | 'sale' | 'return_purchase' | 'return_sale' | 'transfer_in' | 'transfer_out';
  quantity: number;
  referenceId: string;
  referenceType: string;
  date: string;
  createdAt: string;
}

export interface Return {
  id: string;
  type: 'purchase' | 'sale';
  referenceId: string;
  totalAmount: number;
  reason?: string;
  returnDate: string;
  createdAt: string;
  items: ReturnItem[];
}

export interface ReturnItem {
  id: string;
  returnId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  total: number;
}

export interface OldBattery {
  id: string;
  name: string;
  weight: number;
  ratePerKg: number;
  deductionAmount: number;
  discount: number;
  amountPaid: number;
  invoiceNumber: string;
  customerName?: string;
  customerPhone?: string;
  saleDate: string;
  status: 'completed' | 'pending';
  saleId: string;
  saleItemId: string;
  quantity: number;
  createdAt: string;
}

export interface Staff {
  id: string;
  fullName: string;
  fatherName?: string;
  cnic: string;
  phone: string;
  category: string;
  salary: number;
  salaryPaid?: number;
  remainingSalary?: number;
  joiningDate: string;
  address: string;
  status: 'active' | 'resigned';
  createdAt: string;
}

export interface ExpenseHead {
  id: string;
  name: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  paymentMethod: string;
  description?: string;
  createdAt: string;
}