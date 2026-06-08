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
    <div className="py-6 space-y-6 max-w-5xl mx-auto px-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-sans text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-2" />
            Student Users Registry
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View registered student records and moderate university profiles.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-400">
          <ShieldAlert className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Roster Controls */}
      <div className="relative max-w-md bg-white rounded-xl border border-gray-100 shadow-sm dark:bg-darkCard dark:border-darkBorder">
        <input
          type="text"
          placeholder="Filter by name, email, or college ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-4 pr-10 text-xs focus:border-brand-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
        />
        <div className="absolute right-3 top-3 text-gray-400">
          <Search className="h-4.5 w-4.5" />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-100 rounded-xl dark:bg-darkCard dark:border-darkBorder">
          No students match search filters.
        </div>
      ) : (
        <div className="overflow-hidden bg-white border border-gray-100 rounded-xl shadow-sm dark:border-darkBorder dark:bg-darkCard">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-darkBorder text-xs text-left">
              <thead className="bg-gray-50 dark:bg-darkBg text-gray-400 font-bold uppercase">
                <tr>
                  <th className="px-6 py-4">Student Details</th>
                  <th className="px-6 py-4">College ID</th>
                  <th className="px-6 py-4">Academic Major</th>
                  <th className="px-6 py-4">Year</th>
                  <th className="px-6 py-4">Platform Authority</th>
                  <th className="px-6 py-4 text-right">Moderator actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-darkBorder/40">
                {filteredUsers.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/40 dark:hover:bg-darkBg/10">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      <div>{item.name}</div>
                      <div className="text-[10px] text-gray-400 font-normal mt-0.5">{item.email}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{item.college_id || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{item.branch || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{item.year || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                        item.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-gray-50 text-gray-600'
                      }`}>
                        {item.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(item.id, item.name)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          title="Delete Student Registry"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
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
