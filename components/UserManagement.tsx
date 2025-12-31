
import React, { useState } from 'react';
import { User, View, BranchOffice } from '../types';
import { ALL_VIEWS } from '../constants';

interface UserManagementProps {
  users: User[];
  offices: BranchOffice[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, offices, onAddUser, onUpdateUser, onDeleteUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    allowedViews: ['Dashboard'],
    officeId: 'all'
  });

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData({ username: '', password: '', fullName: '', role: 'Staff', allowedViews: ['Dashboard'], officeId: 'all' });
    }
    setIsModalOpen(true);
  };

  const toggleView = (view: View) => {
    const current = formData.allowedViews || [];
    if (current.includes(view)) {
      setFormData({ ...formData, allowedViews: current.filter(v => v !== view) });
    } else {
      setFormData({ ...formData, allowedViews: [...current, view] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, id: editingUser?.id || `USR-${Date.now()}` } as User;
    if (editingUser) onUpdateUser(payload);
    else onAddUser(payload);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Manajemen Akses Pengguna</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
          Tambah User Baru
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Username</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Nama Lengkap</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Role</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Lokasi Akses</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Menu Diizinkan</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold">{user.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold uppercase">{user.role}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {user.officeId === 'all' ? 'Semua Cabang' : offices.find(o => o.id === user.officeId)?.city}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {user.allowedViews.map(v => (
                      <span key={v} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px]">{v}</span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleOpenModal(user)} className="text-blue-600 hover:text-blue-800 mr-3 text-sm font-bold">Edit</button>
                  {user.username !== 'Admin' && (
                    <button onClick={() => onDeleteUser(user.id)} className="text-rose-600 hover:text-rose-800 text-sm font-bold">Hapus</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold">{editingUser ? 'Edit User' : 'User Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
                  <input 
                    required 
                    className="w-full border rounded-lg px-4 py-2" 
                    value={formData.username || ''} 
                    onChange={e => setFormData({...formData, username: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                  <input 
                    required={!editingUser} 
                    type="password"
                    className="w-full border rounded-lg px-4 py-2" 
                    value={formData.password || ''} 
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Lengkap</label>
                  <input 
                    required 
                    className="w-full border rounded-lg px-4 py-2" 
                    value={formData.fullName || ''} 
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role / Jabatan</label>
                  <input 
                    required 
                    className="w-full border rounded-lg px-4 py-2" 
                    value={formData.role || ''} 
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Area Cabang</label>
                  <select 
                    className="w-full border rounded-lg px-4 py-2"
                    value={formData.officeId}
                    onChange={e => setFormData({...formData, officeId: e.target.value})}
                  >
                    <option value="all">Semua Cabang (HQ)</option>
                    {offices.map(o => <option key={o.id} value={o.id}>{o.city}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Hak Akses Menu</label>
                <div className="grid grid-cols-3 gap-2">
                  {ALL_VIEWS.map(view => (
                    <button
                      key={view}
                      type="button"
                      onClick={() => toggleView(view)}
                      className={`text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                        formData.allowedViews?.includes(view)
                        ? 'bg-blue-50 border-blue-600 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${formData.allowedViews?.includes(view) ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                        {view}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold">Simpan User</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl font-bold">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
