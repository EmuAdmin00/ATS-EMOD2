
import React from 'react';
import { Item } from '../types';

interface InventoryProps {
  items: Item[];
}

export const Inventory: React.FC<InventoryProps> = ({ items }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Inventory Ledger</h3>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          Add New Item
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Min</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Unit Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-400">{item.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    item.category === 'Finished Good' ? 'bg-indigo-50 text-indigo-700' :
                    item.category === 'Raw Material' ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-700'
                  }`}>
                    {item.category}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${item.stock <= item.minStock ? 'text-rose-600' : 'text-slate-900'}`}>
                  {item.stock} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.minStock} {item.unit}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">Rp {item.pricePerUnit.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
