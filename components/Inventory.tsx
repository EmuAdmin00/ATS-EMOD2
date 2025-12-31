
import React, { useState, useMemo } from 'react';
import { Item, BranchOffice, Category } from '../types';

interface InventoryProps {
  items: Item[];
  offices: BranchOffice[];
}

export const Inventory: React.FC<InventoryProps> = ({ items, offices }) => {
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>(offices[0]?.id || 'all');

  // Grouping logic
  const groupedData = useMemo(() => {
    const filtered = selectedOfficeId === 'all' 
      ? items 
      : items.filter(i => i.officeId === selectedOfficeId);

    const groups: Record<Category, Item[]> = {
      'Raw Material': [],
      'Additive': [],
      'Finished Good': []
    };

    filtered.forEach(item => {
      groups[item.category].push(item);
    });

    return groups;
  }, [items, selectedOfficeId]);

  const lowStockCount = items.filter(i => i.stock <= i.minStock).length;
  const totalValue = items.reduce((acc, curr) => acc + (curr.stock * curr.pricePerUnit), 0);

  const stats = useMemo(() => {
    const filtered = selectedOfficeId === 'all' 
      ? items 
      : items.filter(i => i.officeId === selectedOfficeId);
    
    return {
      count: filtered.length,
      low: filtered.filter(i => i.stock <= i.minStock).length,
      val: filtered.reduce((acc, curr) => acc + (curr.stock * curr.pricePerUnit), 0)
    };
  }, [items, selectedOfficeId]);

  return (
    <div className="space-y-6">
      {/* Header & Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Sku</span>
            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.count}</p>
          <p className="text-xs text-slate-400 mt-1">Item aktif terdaftar</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-rose-500">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Low Stock Alert</span>
            <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
          </div>
          <p className={`text-2xl font-black ${stats.low > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{stats.low}</p>
          <p className="text-xs text-slate-400 mt-1">Butuh pengadaan segera</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estimated Value</span>
            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">Rp {stats.val.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Total nilai aset gudang</p>
        </div>
      </div>

      {/* Branch Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => setSelectedOfficeId('all')}
          className={`px-6 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
            selectedOfficeId === 'all' 
            ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Semua Cabang
        </button>
        {offices.map(office => (
          <button 
            key={office.id}
            onClick={() => setSelectedOfficeId(office.id)}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
              selectedOfficeId === office.id 
              ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {office.officeName}
          </button>
        ))}
      </div>

      {/* Grouped Content */}
      <div className="space-y-8">
        {(Object.keys(groupedData) as Category[]).map(category => (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className={`w-2 h-8 rounded-full ${
                category === 'Finished Good' ? 'bg-indigo-500' :
                category === 'Raw Material' ? 'bg-amber-500' : 'bg-slate-400'
              }`}></div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">{category}</h3>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {groupedData[category].length} items
              </span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Material</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cabang</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stok Saat Ini</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Min Level</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Harga / Unit</th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {groupedData[category].length > 0 ? groupedData[category].map((item) => {
                      const office = offices.find(o => o.id === item.officeId);
                      return (
                        <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-400">{item.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-bold text-slate-900">{item.name}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-xs text-slate-500 flex items-center gap-1.5">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                              {office?.officeName || 'Global'}
                            </span>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-black ${item.stock <= item.minStock ? 'text-rose-600' : 'text-slate-900'}`}>
                            {item.stock.toLocaleString()} <span className="text-[10px] font-normal text-slate-400 uppercase tracking-tighter">{item.unit}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-mono italic">{item.minStock} {item.unit}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">Rp {item.pricePerUnit.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                             {item.stock <= item.minStock ? (
                               <span className="px-2 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-lg border border-rose-100 animate-pulse">REPLENISH</span>
                             ) : (
                               <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg border border-emerald-100">STABLE</span>
                             )}
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-slate-300 italic text-sm">
                          Tidak ada data untuk kategori ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
