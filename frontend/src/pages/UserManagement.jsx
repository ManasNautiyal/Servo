import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Search, Trash2, ShieldAlert } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`WARNING: Are you sure you want to permanently delete user "${userName}"? This will delete all their service listings, orders, and review history.`)) {
      return;
    }

    setError('');
    try {
      await api.delete(`/api/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to delete user registry.';
      setError(msg);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.college_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-6 space-y-6 max-w-5xl mx-auto px-4 text-brutal-charcoal dark:text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-black tracking-tight text-brutal-charcoal dark:text-white uppercase flex items-center">
            <Users className="h-8 w-8 text-brutal-red mr-2 stroke-[3]" />
            Student Users Registry
          </h1>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">
            View registered student records and moderate university profiles.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 rounded-none border-2 border-brutal-charcoal bg-brutal-red p-4 text-sm text-white shadow-brutal-sm font-bold">
          <ShieldAlert className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Roster Controls */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Filter by name, email, or college ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full py-2.5 pl-4 pr-10 text-xs brutal-input rounded-none font-bold"
        />
        <div className="absolute right-3 top-3 text-brutal-charcoal dark:text-white font-bold">
          <Search className="h-4.5 w-4.5 stroke-[2.5]" />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-white border-2 border-brutal-charcoal rounded-none dark:bg-darkCard dark:border-white font-bold uppercase tracking-wider shadow-brutal-sm">
          No students match search filters.
        </div>
      ) : (
        <div className="overflow-hidden bg-white border-2 border-brutal-charcoal rounded-none shadow-brutal-md dark:border-white dark:bg-darkCard dark:shadow-brutal-dark-md text-brutal-charcoal dark:text-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-brutal-charcoal dark:divide-white text-xs text-left">
              <thead className="bg-brutal-yellow text-brutal-charcoal font-black uppercase border-b-2 border-brutal-charcoal">
                <tr>
                  <th className="px-6 py-4">Student Details</th>
                  <th className="px-6 py-4">College ID</th>
                  <th className="px-6 py-4">Academic Major</th>
                  <th className="px-6 py-4">Year</th>
                  <th className="px-6 py-4">Platform Authority</th>
                  <th className="px-6 py-4 text-right">Moderator actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-darkBorder/40">
                {filteredUsers.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/40 dark:hover:bg-darkBg/10 font-bold">
                    <td className="px-6 py-4 font-black">
                      <div>{item.name}</div>
                      <div className="text-[10px] text-gray-500 font-bold mt-0.5">{item.email}</div>
                    </td>
                    <td className="px-6 py-4">{item.college_id || 'N/A'}</td>
                    <td className="px-6 py-4">{item.branch || 'N/A'}</td>
                    <td className="px-6 py-4">{item.year || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-none border-2 border-brutal-charcoal font-black uppercase text-[9px] shadow-brutal-sm ${
                        item.role === 'admin' ? 'bg-brutal-red text-white' : 'bg-white text-brutal-charcoal'
                      }`}>
                        {item.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(item.id, item.name)}
                          className="rounded-none border-2 border-brutal-charcoal bg-brutal-red p-2 text-white hover:bg-red-700 shadow-brutal-sm transition-transform active:scale-95"
                          title="Delete Student Registry"
                        >
                          <Trash2 className="h-4.5 w-4.5 stroke-[2.5]" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
