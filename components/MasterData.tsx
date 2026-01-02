
import React, { useState } from 'react';
import { BranchOffice, TACData, Position, Employee, Item, MasterSubView } from '../types';

interface MasterDataProps {
  offices: BranchOffice[];
  tacs: TACData[];
  positions: Position[];
  employees: Employee[];
  items: Item[];
  onAddData: (category: MasterSubView, data: any) => void;
  onUpdateData: (category: MasterSubView, data: any) => void;
  onDeleteData: (category: MasterSubView, id: string) => void;
}

export const MasterData: React.FC<MasterDataProps> = ({ offices, tacs, positions, employees, items, onAddData, onDeleteData }) => {
  const [activeTab, setActiveTab] = useState<MasterSubView>('Office');
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const menuItems: { id: MasterSubView; label: string; icon: React.ReactNode }[] = [
    { id: 'Office', label: 'Branches', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg> },
    { id: 'TAC', label: 'TAC Area', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
    { id: 'Jabatan', label: 'Positions', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> },
    { id: 'Pegawai', label: 'Employees', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg> },
    { id: 'Bahan Baku', label: 'Materials', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg> },
    { id: 'Produk', label: 'Products', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg> },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddData(activeTab, formData);
    setIsAdding(false);
    setFormData({});
  };

  const renderForm = () => (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 p-10 animate-in zoom-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Input Data {activeTab}</h3>
        <button onClick={() => setIsAdding(false)} className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeTab === 'Office' && (
          <>
            <div className="col-span-2"><label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Nama Office</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-indigo-500/10 outline-none" value={formData.officeName || ''} onChange={e => setFormData({...formData, officeName: e.target.value})} /></div>
            <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Kota</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-indigo-500/10 outline-none" value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} /></div>
            <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Telepon</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-indigo-500/10 outline-none" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
            <div className="col-span-2"><label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Alamat</label><textarea required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-indigo-500/10 outline-none" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
          </>
        )}
        {/* Simplified for demo, repeat structure for other tabs */}
        <div className="col-span-2 mt-4">
          <button type="submit" className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all">Submit Master Entry</button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      <aside className="w-full lg:w-64">
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-4 sticky top-32">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3">Catalog Management</p>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsAdding(false); }}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === item.id
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm border-l-4 border-indigo-600'
                    : 'text-slate-500 hover:bg-slate-50 border-l-4 border-transparent'
                }`}
              >
                <span className={`${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'}`}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <div className="flex-1">
        {isAdding ? renderForm() : (
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">
            <div className="px-10 py-8 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Katalog {activeTab}</h3>
                <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Master Data Repository</p>
              </div>
              <button 
                onClick={() => setIsAdding(true)}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-200 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                Tambah Data
              </button>
            </div>

            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Identification</th>
                    <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                    <th className="px-10 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activeTab === 'Office' && offices.map(o => (
                    <tr key={o.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-10 py-6">
                        <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{o.officeName}</p>
                        <p className="text-[10px] text-slate-400 font-mono uppercase mt-1">ID: {o.id}</p>
                      </td>
                      <td className="px-10 py-6">
                        <p className="text-xs font-bold text-slate-600">{o.city}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{o.phone}</p>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <button onClick={() => onDeleteData(activeTab, o.id)} className="text-[10px] font-black text-rose-500 hover:text-rose-700 uppercase tracking-widest">Delete Entry</button>
                      </td>
                    </tr>
                  ))}
                  {/* Additional tabs logic would be mapped here */}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
