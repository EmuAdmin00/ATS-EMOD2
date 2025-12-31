
export type Category = 'Raw Material' | 'Finished Good' | 'Additive';

export interface Item {
  id: string;
  name: string;
  category: Category;
  unit: string;
  stock: number;
  minStock: number;
  pricePerUnit: number;
}

export interface BranchOffice {
  id: string;
  officeName: string;
  address: string;
  city: string;
  phone: string;
  fax: string;
}

export interface TACData {
  id: string;
  officeId: string;
  name: string;
  address: string;
  phone: string;
  fax: string;
}

export interface Position {
  id: string;
  name: string;
}

export interface Employee {
  nik: string;
  name: string;
  positionId: string;
  status: 'Permanent' | 'Contract' | 'Probation';
  address: string;
  phone: string;
  email: string;
  officeId: string;
  tacId: string;
}

export interface Transaction {
  id: string;
  itemId: string;
  type: 'Purchase' | 'Sale' | 'Usage' | 'Production';
  quantity: number;
  date: string;
  note: string;
}

export interface ProductionBatch {
  id: string;
  productId: string;
  outputQuantity: number;
  ingredients: { itemId: string; quantity: number }[];
  date: string;
  status: 'Draft' | 'Completed';
}

export type View = 'Dashboard' | 'Master Data' | 'Inventory' | 'Purchasing' | 'Production' | 'Sales' | 'Insights';
export type MasterSubView = 'Office' | 'TAC' | 'Jabatan' | 'Pegawai' | 'Bahan Baku' | 'Produk';
