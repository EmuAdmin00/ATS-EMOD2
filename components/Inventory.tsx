
import React, { useMemo } from 'react';
import { Item, BranchOffice, Category } from '../types';

interface InventoryProps {
  items: Item[];
  offices: BranchOffice[];
  initialOfficeId?: string;
}

export const Inventory: React.FC<InventoryProps> = ({ items, offices, initialOfficeId = 'all' }) => {
  // Grouping logic based on initialOfficeId from props (global selection)
  const groupedData = useMemo(() => {
    const filtered = initialOfficeId === 'all' 
      ? items 
      : items.filter(i => i.officeId === initialOfficeId);

    const groups: Record<Category, Item[]> = {
      'Raw Material': [],
      'Additive': [],
      'Finished Good': []
    };

    filtered.forEach(item => {
      groups[item.category].push(item);
    });

    return groups;
  }, [items, initialOfficeId]);

  const stats = useMemo(() => {
    const filtered = initialOfficeId === 'all' 
      ? items 
      : items.filter(i => i.officeId === initialOfficeId);
    
    return {
      count: filtered.length,
      low: filtered.filter(i => i.stock <= i.minStock).length,
      val: filtered.reduce((acc, curr) => acc + (curr.stock * curr.pricePerUnit), 0)
    };
  }, [items, initialOfficeId]);

  return (
    <div className="space-y-6">
      {/* Local quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Item di Lokasi Ini</span>
            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.count}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-rose-500">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Critical Stock</span>
            <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
          </div>
          <p className={`text-2xl font-black ${stats.low > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{stats.low}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory Value</span>
            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <p className="text-xl font-black text-slate-900">Rp {stats.val.toLocaleString()}</p>
        </div>
      </div>

      {/* Grouped Content */}
      <div className="space-y-8">
        {(Object.keys(groupedData) as Category[]).map(category => (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className={`w-1.5 h-6 rounded-full ${
                category === 'Finished Good' ? 'bg-indigo-500' :
                category === 'Raw Material' ? 'bg-amber-500' : 'bg-slate-400'
              }`}></div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{category}</h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {groupedData[category].length} items
              </span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Material</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cabang</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stok</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Min</th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {groupedData[category].length > 0 ? groupedData[category].map((item) => {
                      const office = offices.find(o => o.id === item.officeId);
                      return (
                        <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-bold text-slate-900">{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{item.id}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded">
                              {office?.city || 'HQ'}
                            </span>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-black ${item.stock <= item.minStock ? 'text-rose-600' : 'text-slate-900'}`}>
                            {item.stock.toLocaleString()} <span className="text-[10px] font-normal text-slate-400 uppercase tracking-tighter">{item.unit}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-[10px] text-slate-400 font-mono italic">{item.minStock} {item.unit}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                             {item.stock <= item.minStock ? (
                               <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-lg border border-rose-100 animate-pulse">REPLENISH</span>
                             ) : (
                               <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg border border-emerald-100">STABLE</span>
                             )}
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-slate-300 italic text-sm">
                          Tidak ada data di lokasi ini.
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
