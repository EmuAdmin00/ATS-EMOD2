
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
  { id: 'OFF01', officeName: 'Head Office Jakarta', address: 'Jl. Jendral Sudirman Kav. 52-53', city: 'Jakarta (Planned)', phone: '021-5150000', fax: '021-5150001' },
  { id: 'OFF02', officeName: 'Cabang Makassar', address: 'Kawasan Industri Makassar (KIMA)', city: 'Makassar', phone: '0411-472000', fax: '0411-472001' },
  { id: 'OFF03', officeName: 'Cabang Palu', address: 'Jl. Trans Sulawesi, Pantoloan', city: 'Palu', phone: '0451-491000', fax: '0451-491001' },
  { id: 'OFF04', officeName: 'Cabang Samarinda', address: 'Jl. Yos Sudarso, Area Pelabuhan', city: 'Samarinda', phone: '0541-741000', fax: '0541-741001' },
  { id: 'OFF05', officeName: 'Cabang Banjarmasin', address: 'Kawasan Industri Terpadu (Coming Soon)', city: 'Banjarmasin (Planned)', phone: '-', fax: '-' },
];

// DATA DUMMY DIHAPUS - Mulai dari Nol
export const INITIAL_ITEMS: Item[] = [];

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
];
