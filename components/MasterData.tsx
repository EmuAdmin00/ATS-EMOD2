
import React, { useState } from 'react';
import { BranchOffice, TACData, Position, Employee, Item, MasterSubView } from '../types';

interface MasterDataProps {
  offices: BranchOffice[];
  tacs: TACData[];
  positions: Position[];
  employees: Employee[];
  items: Item[];
  onAddData: (category: MasterSubView, data: any) => void;
}

export const MasterData: React.FC<MasterDataProps> = ({ offices, tacs, positions, employees, items, onAddData }) => {
  const [activeTab, setActiveTab] = useState<MasterSubView>('Office');
  const [isAdding, setIsAdding] = useState(false);
  
  // Form States
  const [formData, setFormData] = useState<any>({});

  const menuItems: { id: MasterSubView; label: string; icon: React.ReactNode }[] = [
    { id: 'Office', label: 'Branch Office', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg> },
    { id: 'TAC', label: 'Data TAC', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
    { id: 'Jabatan', label: 'Data Jabatan', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> },
    { id: 'Pegawai', label: 'Data Pegawai', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg> },
    { id: 'Bahan Baku', label: 'Data Bahan Baku', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg> },
    { id: 'Produk', label: 'Data Produk', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg> },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddData(activeTab, formData);
    setIsAdding(false);
    setFormData({});
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const rawMaterials = items.filter(i => i.category !== 'Finished Good');
  const finishedProducts = items.filter(i => i.category === 'Finished Good');

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sub-Navigation Sidebar */}
      <aside className="w-full lg:w-64 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 sticky top-24">
          <div className="px-3 py-2 mb-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Katalog Master</h4>
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsAdding(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-600'
                    : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                }`}
              >
                <span className={`${activeTab === item.id ? 'text-blue-600' : 'text-slate-400'}`}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Content Area */}
      <div className="flex-1">
        {isAdding ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Tambah {activeTab} Baru</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dynamic Form Fields based on activeTab */}
              {activeTab === 'Office' && (
                <>
                  <div className="col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Office</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" onChange={e => handleInputChange('officeName', e.target.value)} /></div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kota</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" onChange={e => handleInputChange('city', e.target.value)} /></div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telepon</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" onChange={e => handleInputChange('phone', e.target.value)} /></div>
                  <div className="col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alamat Lengkap</label><textarea required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" onChange={e => handleInputChange('address', e.target.value)} /></div>
                </>
              )}
              {activeTab === 'Pegawai' && (
                <>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">NIK</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" onChange={e => handleInputChange('nik', e.target.value)} /></div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Lengkap</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" onChange={e => handleInputChange('name', e.target.value)} /></div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jabatan</label>
                    <select required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" onChange={e => handleInputChange('positionId', e.target.value)}>
                      <option value="">Pilih Jabatan</option>
                      {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                    <select required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" onChange={e => handleInputChange('status', e.target.value)}>
                      <option value="Permanent">Permanent</option>
                      <option value="Contract">Contract</option>
                      <option value="Probation">Probation</option>
                    </select>
                  </div>
                </>
              )}
              {activeTab === 'Jabatan' && (
                <div className="col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Jabatan</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" onChange={e => handleInputChange('name', e.target.value)} /></div>
              )}
              {activeTab === 'Bahan Baku' && (
                <>
                  <div className="col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Bahan</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" onChange={e => handleInputChange('name', e.target.value)} /></div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unit (Kg/MT/Liter)</label><input required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" onChange={e => handleInputChange('unit', e.target.value)} /></div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stok Awal</label><input type="number" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" onChange={e => handleInputChange('stock', Number(e.target.value))} /></div>
                </>
              )}
              
              <div className="col-span-2 mt-6 flex gap-3">
                <button type="submit" className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-200 hover:bg-blue-700">Simpan Data</button>
                <button type="button" onClick={() => setIsAdding(false)} className="bg-white border border-slate-200 px-8 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-50">Batal</button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Daftar {activeTab}</h3>
                <p className="text-xs text-slate-400 mt-1">Manajemen data fundamental untuk operasional ATS-EMOD</p>
              </div>
              <button 
                onClick={() => setIsAdding(true)}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-100 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                Tambah {activeTab}
              </button>
            </div>

            <div className="p-0 overflow-x-auto">
              {activeTab === 'Office' && (
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ID Office</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Office</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Lokasi</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Telepon</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {offices.map(o => (
                      <tr key={o.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-400 group-hover:text-blue-600">{o.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{o.officeName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          <div className="flex flex-col">
                            <span>{o.city}</span>
                            <span className="text-[10px] text-slate-400">{o.address}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">{o.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-medium cursor-pointer hover:underline">Detail</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'TAC' && (
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ID TAC</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nama TAC</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Induk Office</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {tacs.map(t => (
                      <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-400">{t.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{t.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">{t.officeId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-medium cursor-pointer hover:underline">Edit</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'Jabatan' && (
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Jabatan</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {positions.map(p => (
                      <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-400">{p.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{p.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-medium cursor-pointer hover:underline">Ubah</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'Pegawai' && (
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">NIK & Nama</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Jabatan</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {employees.map(e => (
                      <tr key={e.nik} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-900">{e.name}</span>
                            <span className="text-xs font-mono text-slate-400">{e.nik}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {positions.find(p => p.id === e.positionId)?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                           <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                             e.status === 'Permanent' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                           }`}>{e.status}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-medium cursor-pointer hover:underline">Opsi</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'Bahan Baku' && (
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Material</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Stok</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {rawMaterials.map(i => (
                      <tr key={i.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-900">{i.name}</span>
                            <span className="text-xs font-mono text-slate-400">{i.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{i.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-bold ${i.stock <= i.minStock ? 'text-rose-600' : 'text-slate-900'}`}>
                            {i.stock} <span className="text-xs font-normal text-slate-400 uppercase">{i.unit}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-medium cursor-pointer hover:underline">Edit</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
