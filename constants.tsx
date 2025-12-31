
import { Item, BranchOffice, TACData, Position, Employee } from './types';

export const INITIAL_ITEMS: Item[] = [
  // Raw Materials - Jakarta
  { id: 'RM001', name: 'Bitumen 60/70', category: 'Raw Material', unit: 'MT', stock: 300, minStock: 100, pricePerUnit: 6500000, officeId: 'OFF01' },
  { id: 'RM002', name: 'Kerosene', category: 'Raw Material', unit: 'Liter', stock: 1500, minStock: 500, pricePerUnit: 15000, officeId: 'OFF01' },
  { id: 'RM003', name: 'Emulsifier Alpha', category: 'Additive', unit: 'Kg', stock: 250, minStock: 50, pricePerUnit: 85000, officeId: 'OFF01' },
  
  // Raw Materials - Surabaya
  { id: 'RM001-S', name: 'Bitumen 60/70', category: 'Raw Material', unit: 'MT', stock: 200, minStock: 100, pricePerUnit: 6500000, officeId: 'OFF02' },
  { id: 'RM004', name: 'SBS Polymer', category: 'Additive', unit: 'Kg', stock: 1200, minStock: 200, pricePerUnit: 45000, officeId: 'OFF02' },
  
  // Finished Goods - Jakarta
  { id: 'FG001', name: 'Asphalt Emulsion CRS-1', category: 'Finished Good', unit: 'MT', stock: 45, minStock: 10, pricePerUnit: 8200000, officeId: 'OFF01' },
  { id: 'FG003', name: 'Modified Asphalt PG 70', category: 'Finished Good', unit: 'MT', stock: 120, minStock: 20, pricePerUnit: 9500000, officeId: 'OFF01' },

  // Finished Goods - Surabaya
  { id: 'FG002', name: 'Asphalt Emulsion CSS-1', category: 'Finished Good', unit: 'MT', stock: 30, minStock: 10, pricePerUnit: 8400000, officeId: 'OFF02' },
  { id: 'FG004', name: 'Modified Asphalt PG 76', category: 'Finished Good', unit: 'MT', stock: 85, minStock: 20, pricePerUnit: 10500000, officeId: 'OFF02' },
];

export const INITIAL_OFFICES: BranchOffice[] = [
  { id: 'OFF01', officeName: 'Head Office Jakarta', address: 'Jl. Sudirman No. 10', city: 'Jakarta Pusat', phone: '021-5551234', fax: '021-5551235' },
  { id: 'OFF02', officeName: 'Surabaya Branch', address: 'Jl. Basuki Rahmat No. 45', city: 'Surabaya', phone: '031-7778888', fax: '031-7778889' },
];

export const INITIAL_TAC: TACData[] = [
  { id: 'TAC01', officeId: 'OFF01', name: 'TAC Marunda', address: 'Kawasan Berikat Marunda', phone: '021-8889999', fax: '021-8889998' },
  { id: 'TAC02', officeId: 'OFF02', name: 'TAC Gresik', address: 'Jl. Raya Manyar Km 12', phone: '031-4445555', fax: '031-4445556' },
];

export const INITIAL_POSITIONS: Position[] = [
  { id: 'JAB01', name: 'Manager Produksi' },
  { id: 'JAB02', name: 'Operator Asphalt Mixing Plant' },
  { id: 'JAB03', name: 'Staff Administrasi' },
  { id: 'JAB04', name: 'Quality Control' },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { nik: '2023001', name: 'Budi Santoso', positionId: 'JAB01', status: 'Permanent', address: 'Kelapa Gading, Jakarta', phone: '08123456789', email: 'budi@atsemod.com', officeId: 'OFF01', tacId: 'TAC01' },
  { nik: '2023002', name: 'Siti Aminah', positionId: 'JAB04', status: 'Contract', address: 'Kebon Jeruk, Jakarta', phone: '08987654321', email: 'siti@atsemod.com', officeId: 'OFF01', tacId: 'TAC01' },
];
