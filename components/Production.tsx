
import React, { useState } from 'react';
import { Item, ProductionBatch } from '../types';

interface ProductionProps {
  items: Item[];
  batches: ProductionBatch[];
  onAddBatch: (batch: ProductionBatch) => void;
}

export const Production: React.FC<ProductionProps> = ({ items, batches, onAddBatch }) => {
  const [isAdding, setIsAdding] = useState(false);
  const finishedGoods = items.filter(i => i.category === 'Finished Good');
  const rawMaterials = items.filter(i => i.category !== 'Finished Good');

  const [selectedProduct, setSelectedProduct] = useState(finishedGoods[0]?.id || '');
  const [quantity, setQuantity] = useState(1);

  const handleCreate = () => {
    const newBatch: ProductionBatch = {
      id: `BATCH-${Date.now()}`,
      productId: selectedProduct,
      outputQuantity: quantity,
      date: new Date().toISOString(),
      status: 'Completed',
      ingredients: [], // In real app, calculate based on formula
    };
    onAddBatch(newBatch);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Production Control</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          Log New Production Batch
        </button>
      </div>

      {isAdding && (
        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-indigo-900 mb-4">Production Entry</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-indigo-700 mb-1">Target Product</label>
              <select 
                className="w-full bg-white border border-indigo-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                {finishedGoods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-700 mb-1">Output Quantity (MT)</label>
              <input 
                type="number"
                className="w-full bg-white border border-indigo-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button 
              onClick={handleCreate}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Confirm Completion
            </button>
            <button 
              onClick={() => setIsAdding(false)}
              className="bg-white border border-slate-300 text-slate-600 px-6 py-2 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Batch ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {batches.map((batch) => {
              const product = items.find(i => i.id === batch.productId);
              return (
                <tr key={batch.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">{batch.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{product?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{batch.outputQuantity} MT</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(batch.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                      {batch.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {batches.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">No production batches recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
