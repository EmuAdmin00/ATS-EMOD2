
import { Item, BranchOffice, TACData, Position, Employee } from './types';

export const INITIAL_OFFICES: BranchOffice[] = [
  { id: 'OFF01', officeName: 'Head Office Jakarta', address: 'Jl. Jendral Sudirman Kav. 52-53', city: 'Jakarta Selatan', phone: '021-5150000', fax: '021-5150001' },
  { id: 'OFF02', officeName: 'Cabang Makassar', address: 'Kawasan Industri Makassar (KIMA)', city: 'Makassar', phone: '0411-472000', fax: '0411-472001' },
  { id: 'OFF03', officeName: 'Cabang Palu', address: 'Jl. Trans Sulawesi, Pantoloan', city: 'Palu', phone: '0451-491000', fax: '0451-491001' },
  { id: 'OFF04', officeName: 'Cabang Samarinda', address: 'Jl. Yos Sudarso, Area Pelabuhan', city: 'Samarinda', phone: '0541-741000', fax: '0541-741001' },
  { id: 'OFF05', officeName: 'Cabang Banjarmasin', address: 'Kawasan Industri Terpadu (Coming Soon)', city: 'Banjarmasin', phone: '-', fax: '-' },
];

export const INITIAL_ITEMS: Item[] = [
  // --- MAKASSAR (Produksi Emulsi) ---
  { id: 'RM-MKS-01', name: 'Bitumen 60/70', category: 'Raw Material', unit: 'MT', stock: 450, minStock: 100, pricePerUnit: 6800000, officeId: 'OFF02' },
  { id: 'RM-MKS-02', name: 'Emulsifier E-11', category: 'Additive', unit: 'Kg', stock: 800, minStock: 200, pricePerUnit: 125000, officeId: 'OFF02' },
  { id: 'FG-MKS-01', name: 'Aspal Emulsi CRS-1', category: 'Finished Good', unit: 'MT', stock: 120, minStock: 30, pricePerUnit: 8500000, officeId: 'OFF02' },
  { id: 'FG-MKS-02', name: 'Aspal Emulsi CMS-2', category: 'Finished Good', unit: 'MT', stock: 85, minStock: 20, pricePerUnit: 8700000, officeId: 'OFF02' },

  // --- PALU (Produksi Emulsi) ---
  { id: 'RM-PLU-01', name: 'Bitumen 60/70', category: 'Raw Material', unit: 'MT', stock: 320, minStock: 100, pricePerUnit: 7000000, officeId: 'OFF03' },
  { id: 'RM-PLU-02', name: 'Emulsifier E-11', category: 'Additive', unit: 'Kg', stock: 500, minStock: 150, pricePerUnit: 130000, officeId: 'OFF03' },
  { id: 'FG-PLU-01', name: 'Aspal Emulsi CRS-2', category: 'Finished Good', unit: 'MT', stock: 60, minStock: 25, pricePerUnit: 8900000, officeId: 'OFF03' },

  // --- SAMARINDA (Produksi Emulsi) ---
  { id: 'RM-SMD-01', name: 'Bitumen 60/70', category: 'Raw Material', unit: 'MT', stock: 500, minStock: 150, pricePerUnit: 6900000, officeId: 'OFF04' },
  { id: 'FG-SMD-01', name: 'Aspal Emulsi CSS-1', category: 'Finished Good', unit: 'MT', stock: 150, minStock: 40, pricePerUnit: 8650000, officeId: 'OFF04' },

  // --- JAKARTA (Planned Production PG 2026) ---
  { id: 'RM-JKT-01', name: 'Bitumen 60/70 Bulk', category: 'Raw Material', unit: 'MT', stock: 1200, minStock: 500, pricePerUnit: 6500000, officeId: 'OFF01' },
  { id: 'RM-JKT-02', name: 'Polymer SBS', category: 'Additive', unit: 'Kg', stock: 2500, minStock: 500, pricePerUnit: 48000, officeId: 'OFF01' },
  { id: 'FG-JKT-01', name: 'Aspal PG 70 (Project 2026)', category: 'Finished Good', unit: 'MT', stock: 0, minStock: 10, pricePerUnit: 9800000, officeId: 'OFF01' },
  { id: 'FG-JKT-02', name: 'Aspal PG 76 (Project 2026)', category: 'Finished Good', unit: 'MT', stock: 0, minStock: 10, pricePerUnit: 10500000, officeId: 'OFF01' },

  // --- BANJARMASIN (Coming Soon) ---
  { id: 'RM-BNJ-01', name: 'Base Bitumen (Standby)', category: 'Raw Material', unit: 'MT', stock: 50, minStock: 0, pricePerUnit: 7100000, officeId: 'OFF05' },
];

export const INITIAL_TAC: TACData[] = [
  { id: 'TAC-MKS', officeId: 'OFF02', name: 'TAC Makassar Kima', address: 'Kawasan Industri Kima Blok B', phone: '0411-111', fax: '-' },
  { id: 'TAC-PLU', officeId: 'OFF03', name: 'TAC Pantoloan', address: 'Area Pelabuhan Pantoloan', phone: '0451-222', fax: '-' },
  { id: 'TAC-SMD', officeId: 'OFF04', name: 'TAC Samarinda Port', address: 'Jl. Yos Sudarso Samarinda', phone: '0541-333', fax: '-' },
];

export const INITIAL_POSITIONS: Position[] = [
  { id: 'JAB01', name: 'Manager Produksi' },
  { id: 'JAB02', name: 'Operator Emulsi' },
  { id: 'JAB03', name: 'Staff Administrasi Logistik' },
  { id: 'JAB04', name: 'Quality Control Lab' },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { nik: 'MKS-001', name: 'Andi Yusuf', positionId: 'JAB01', status: 'Permanent', address: 'Makassar', phone: '08112233', email: 'andi@atsemod.com', officeId: 'OFF02', tacId: 'TAC-MKS' },
  { nik: 'PLU-001', name: 'Rahmat Palu', positionId: 'JAB02', status: 'Permanent', address: 'Palu City', phone: '08114455', email: 'rahmat@atsemod.com', officeId: 'OFF03', tacId: 'TAC-PLU' },
  { nik: 'SMD-001', name: 'Hendra Kaltim', positionId: 'JAB04', status: 'Permanent', address: 'Samarinda Seberang', phone: '08116677', email: 'hendra@atsemod.com', officeId: 'OFF04', tacId: 'TAC-SMD' },
];
