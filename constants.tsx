
import { Item, BranchOffice, TACData, Position, Employee, User, View } from './types';

export const ALL_VIEWS: View[] = [
  'Dashboard', 
  'Master Data', 
  'Inventory', 
  'Purchasing', 
  'Production', 
  'Sales', 
  'Insights', 
  'System',
  'User Management'
];

export const INITIAL_USERS: User[] = [
  {
    id: 'USR001',
    username: 'Admin',
    password: 'kerjaibadah',
    fullName: 'Administrator Utama',
    role: 'Super Admin',
    allowedViews: ALL_VIEWS,
    officeId: 'all'
  }
];

export const INITIAL_OFFICES: BranchOffice[] = [
  { id: 'OFF01', officeName: 'Head Office Jakarta', address: 'Jakarta Selatan', city: 'Jakarta (Planned)', phone: '-', fax: '-' },
  { id: 'OFF02', officeName: 'Cabang Makassar', address: 'Kawasan Industri Kima', city: 'Makassar', phone: '0411-472000', fax: '0411-472001' },
  { id: 'OFF03', officeName: 'Cabang Palu', address: 'Jl. Trans Sulawesi', city: 'Palu', phone: '0451-491000', fax: '0451-491001' },
  { id: 'OFF04', officeName: 'Cabang Samarinda', address: 'Area Pelabuhan', city: 'Samarinda', phone: '0541-741000', fax: '0541-741001' },
  { id: 'OFF05', officeName: 'Cabang Banjarmasin', address: 'Kaltim', city: 'Banjarmasin (Planned)', phone: '-', fax: '-' },
];

export const INITIAL_ITEMS: Item[] = [
  { id: 'RM-MKS-01', name: 'Bitumen 60/70', category: 'Raw Material', unit: 'MT', stock: 450, minStock: 100, pricePerUnit: 6800000, officeId: 'OFF02' },
  { id: 'FG-MKS-01', name: 'Aspal Emulsi CRS-1', category: 'Finished Good', unit: 'MT', stock: 120, minStock: 30, pricePerUnit: 8500000, officeId: 'OFF02' },
];

export const INITIAL_TAC: TACData[] = [
  { id: 'TAC-MKS', officeId: 'OFF02', name: 'TAC Makassar Kima', address: 'KIMA Blok B', phone: '0411-111', fax: '-' },
];

export const INITIAL_POSITIONS: Position[] = [
  { id: 'JAB01', name: 'Manager Produksi' },
  { id: 'JAB02', name: 'Operator Emulsi' },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { nik: 'MKS-001', name: 'Andi Yusuf', positionId: 'JAB01', status: 'Permanent', address: 'Makassar', phone: '08112233', email: 'andi@atsemod.com', officeId: 'OFF02', tacId: 'TAC-MKS' },
];
