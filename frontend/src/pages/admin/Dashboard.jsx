// pages/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import toast from 'react-hot-toast';
import {
  Users, UserPlus, UserCheck, UserX, Trash2, Edit, Eye, Crown, Package,
  Calendar, CreditCard, Search, Plus, X, ChevronDown, ChevronUp, Shield,
  Mail, Phone, MoreVertical, Check, AlertCircle, RefreshCw, Clock, Award,
  Star, Zap, Rocket, Settings, Headphones, TrendingUp, BarChart3, PieChart,
  DollarSign, ShoppingCart, Gift, Ticket, Layers, Grid, List, FileText,
  Download, Printer, Copy, Share2,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentSearch, setPaymentSearch] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeletePlanModal, setShowDeletePlanModal] = useState(false);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [showPaymentDetailModal, setShowPaymentDetailModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', planId: 1, isActive: true, role: 'user' });
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', planId: 1, role: 'user' });
  const [planForm, setPlanForm] = useState({ name: '', slug: '', planId: '', jvzoo_id: '', launchpad_id: '', validity_days: 365, status: 'active', order: 0 });
  const [subscriptionForm, setSubscriptionForm] = useState({ planId: '', transactionId: '', source: 'Admin', amount: 0 });
  const [addingUser, setAddingUser] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [addingSubscription, setAddingSubscription] = useState(false);
  const [removingSubscription, setRemovingSubscription] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/dashboard'); return; }
    fetchStats(); fetchUsers(); fetchPlans(); fetchPayments();
  }, [user]);

  const fetchStats = async () => {
    try { const response = await api.get('/admin/stats'); setStats(response.data); }
    catch (error) { console.error('Stats error:', error); }
  };
  const fetchUsers = async () => {
    try { setLoading(true); const response = await api.get('/admin/users'); setUsers(response.data.users); }
    catch (error) { console.error('Users error:', error); } finally { setLoading(false); }
  };
  const fetchPlans = async () => {
    try { const response = await api.get('/plans'); setPlans(response.data); }
    catch (error) { console.error('Plans error:', error); }
  };
  const fetchPayments = async () => {
    try { const response = await api.get('/admin/payments'); setPayments(response.data); }
    catch (error) { console.error('Payments error:', error); }
  };

  const openDeleteModal = (user) => { setSelectedUser(user); setShowDeleteModal(true); };
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try { await api.delete(`/admin/users/${selectedUser._id}`); toast.success('User deleted successfully'); setShowDeleteModal(false); setSelectedUser(null); fetchUsers(); fetchStats(); }
    catch (error) { toast.error('Failed to delete user'); }
  };
  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({ name: user.name || '', email: user.email || '', planId: user.planId || 1, isActive: user.isActive !== false, role: user.role || 'user' });
    setShowEditModal(true);
  };
  const handleEditUser = async (e) => {
    e.preventDefault(); if (!selectedUser) return;
    setSavingUser(true);
    try {
      await api.put(`/admin/users/${selectedUser._id}`, { name: editForm.name, email: editForm.email, planId: editForm.planId, isActive: editForm.isActive, role: editForm.role });
      toast.success('User updated successfully'); setShowEditModal(false); setSelectedUser(null); fetchUsers(); fetchStats();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to update user'); }
    finally { setSavingUser(false); }
  };
  const handleAddUser = async (e) => {
    e.preventDefault(); setAddingUser(true);
    try {
      await api.post('/admin/users', addForm);
      toast.success('User created successfully!'); setShowAddModal(false);
      setAddForm({ name: '', email: '', password: '', planId: 1, role: 'user' });
      fetchUsers(); fetchStats();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to create user'); }
    finally { setAddingUser(false); }
  };
  const handleToggleStatus = async (userId) => {
    try { const response = await api.patch(`/admin/users/${userId}/toggle-status`); toast.success(response.data.message); fetchUsers(); }
    catch (error) { toast.error('Failed to update status'); }
  };
  const openSubscriptionModal = (user) => {
    setSelectedUser(user);
    setSubscriptionForm({ planId: '', transactionId: `ADMIN_${Date.now()}`, source: 'Admin', amount: 0 });
    setShowSubscriptionModal(true);
  };
  const handleAddSubscription = async () => {
    if (!selectedUser || !subscriptionForm.planId) { toast.error('Please select a plan'); return; }
    setAddingSubscription(true);
    try {
      await api.post(`/admin/users/${selectedUser._id}/subscriptions`, { planId: parseInt(subscriptionForm.planId), transactionId: subscriptionForm.transactionId, source: subscriptionForm.source, amount: parseFloat(subscriptionForm.amount) || 0 });
      toast.success('Subscription added successfully!'); setShowSubscriptionModal(false); setSelectedUser(null); fetchUsers(); fetchStats();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to add subscription'); }
    finally { setAddingSubscription(false); }
  };
  const handleRemoveSubscription = async (userId, planId) => {
    if (!confirm(`Remove plan ${planId} from this user?`)) return;
    setRemovingSubscription(true);
    try {
      await api.delete(`/admin/users/${userId}/subscriptions/${planId}`);
      toast.success('Subscription removed successfully!'); fetchUsers(); fetchStats();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to remove subscription'); }
    finally { setRemovingSubscription(false); }
  };

  const openAddPlanModal = () => {
    setPlanForm({ name: '', slug: '', planId: '', jvzoo_id: '', launchpad_id: '', validity_days: 365, status: 'active', order: 0 });
    setShowAddPlanModal(true);
  };
  const openEditPlanModal = (plan) => {
    setSelectedPlan(plan);
    setPlanForm({ name: plan.name || '', slug: plan.slug || '', planId: plan.planId || '', jvzoo_id: plan.jvzoo_id || '', launchpad_id: plan.launchpad_id || '', validity_days: plan.validity_days || 365, status: plan.status || 'active', order: plan.order || 0 });
    setShowEditPlanModal(true);
  };
  const openDeletePlanModal = (plan) => { setSelectedPlan(plan); setShowDeletePlanModal(true); };
  const handleAddPlan = async (e) => {
    e.preventDefault(); setSavingPlan(true);
    try { await api.post('/admin/plans', planForm); toast.success('Plan created successfully!'); setShowAddPlanModal(false); fetchPlans(); }
    catch (error) { toast.error(error.response?.data?.message || 'Failed to create plan'); }
    finally { setSavingPlan(false); }
  };
  const handleEditPlan = async (e) => {
    e.preventDefault(); if (!selectedPlan) return;
    setSavingPlan(true);
    try { await api.put(`/admin/plans/${selectedPlan._id}`, planForm); toast.success('Plan updated successfully!'); setShowEditPlanModal(false); setSelectedPlan(null); fetchPlans(); }
    catch (error) { toast.error(error.response?.data?.message || 'Failed to update plan'); }
    finally { setSavingPlan(false); }
  };
  const handleDeletePlan = async () => {
    if (!selectedPlan) return;
    try { await api.delete(`/admin/plans/${selectedPlan._id}`); toast.success('Plan deleted successfully'); setShowDeletePlanModal(false); setSelectedPlan(null); fetchPlans(); }
    catch (error) { toast.error('Failed to delete plan'); }
  };
  const openPaymentDetail = (payment) => { setSelectedPayment(payment); setShowPaymentDetailModal(true); };
  const getPlanName = (planId) => { const plan = plans.find(p => p.planId === planId); return plan ? plan.name : `Plan ${planId}`; };
  const getPlanIcon = (planId) => { const icons = { 1: '🆓', 2: '🚀', 3: '⚡', 4: '💎', 5: '👑', 8: '🏢', 10: '🤖' }; return icons[planId] || '📦'; };
  const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredPayments = payments.filter(p => p.buyerEmail?.toLowerCase().includes(paymentSearch.toLowerCase()) || p.transactionId?.toLowerCase().includes(paymentSearch.toLowerCase()) || p.buyerName?.toLowerCase().includes(paymentSearch.toLowerCase()));

  if (user?.role !== 'admin') return null;

  return (
    <div className="flex h-screen" style={{ background: '#020914' }}>
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] overflow-auto">
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between sticky top-0 z-10"
          style={{
            background: 'linear-gradient(180deg, #041124, #020914)',
            borderBottom: '1px solid #153c6d',
          }}
        >
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#eaf1ff' }}>Admin Dashboard</h1>
            <p className="text-sm" style={{ color: '#8fa0ba' }}>Manage users, plans, and monitor platform</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: '#aebfd5' }}>{user?.email}</span>
            <span
              className="px-2 py-1 text-xs rounded-full font-medium"
              style={{ background: 'rgba(255,95,126,.15)', color: '#ff8fa8', border: '1px solid rgba(255,95,126,.35)' }}
            >Admin</span>
            <button onClick={logout} className="text-sm transition" style={{ color: '#8fa0ba' }}>
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div
            className="flex gap-1 mb-6 rounded-lg p-1 w-fit flex-wrap"
            style={{ background: '#06162b', border: '1px solid #17385f' }}
          >
            {['overview', 'users', 'plans', 'payments'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-2 rounded-md text-sm font-medium transition capitalize"
                style={
                  activeTab === tab
                    ? { background: 'linear-gradient(100deg, #6e35ed, #3483ff)', color: '#fff', boxShadow: '0 4px 14px rgba(110,53,237,.35)' }
                    : { color: '#aebfd5' }
                }
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon="fa-users" color="blue" value={stats.totalUsers} label="Total Users" />
                <StatCard icon="fa-user-check" color="green" value={stats.activeUsers} label="Active Users (7d)" />
                <StatCard icon="fa-globe" color="purple" value={stats.totalWebsites} label="Total Websites" />
                <StatCard icon="fa-search" color="orange" value={stats.totalScans || 0} label="Total Scans" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <MiniStat value={stats.newUsersThisMonth} label="New Users" color="#4ef0ae" />
                <MiniStat value={stats.scansToday || 0} label="Scans Today" color="#6ddcff" />
                <MiniStat value={stats.totalAdmins} label="Admins" color="#c9b5ff" />
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#7d8fa8' }} />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 rounded-lg text-sm w-64 focus:outline-none"
                      style={{
                        background: '#06162b',
                        border: '1px solid #17385f',
                        color: '#eaf1ff',
                      }}
                    />
                  </div>
                  <span className="text-sm" style={{ color: '#8fa0ba' }}>{filteredUsers.length} users</span>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition hover:brightness-110"
                  style={{ background: 'linear-gradient(100deg, #6e35ed, #3483ff)', boxShadow: '0 4px 14px rgba(110,53,237,.35)' }}
                >
                  <UserPlus size={16} /> Add User
                </button>
              </div>

              <div className="rounded-xl overflow-x-auto" style={{ background: '#041124', border: '1px solid #17385f' }}>
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #17385f', background: '#06162b' }}>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#8fa0ba' }}>User</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#8fa0ba' }}>Role</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#8fa0ba' }}>Plan</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#8fa0ba' }}>Agency</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#8fa0ba' }}>Status</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#8fa0ba' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan="6" className="px-4 py-12 text-center" style={{ color: '#8fa0ba' }}>No users found</td></tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const userPlanIds = Array.isArray(u.planId) ? u.planId : [u.planId || 1];
                        const isAgencyOwner = userPlanIds.includes(8) && !u.ownerId;
                        const isAgencyMember = !!u.ownerId;
                        return (
                          <tr key={u._id} className="transition" style={{ borderBottom: '1px solid rgba(80,150,255,.1)' }}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(110,53,237,.25)', border: '1px solid rgba(150,120,255,.4)' }}>
                                  <span className="text-xs font-medium" style={{ color: '#c9b5ff' }}>{u.name?.charAt(0)?.toUpperCase()}</span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium" style={{ color: '#eaf1ff' }}>{u.name}</p>
                                  <p className="text-xs" style={{ color: '#8fa0ba' }}>{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className="text-xs px-2 py-1 rounded-full font-medium"
                                style={
                                  u.role === 'admin'
                                    ? { background: 'rgba(255,95,126,.15)', color: '#ff8fa8', border: '1px solid rgba(255,95,126,.35)' }
                                    : { background: 'rgba(80,150,255,.12)', color: '#aebfd5', border: '1px solid rgba(80,150,255,.3)' }
                                }
                              >{u.role}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 flex-wrap">
                                {userPlanIds.map((planId) => (
                                  <span
                                    key={planId}
                                    className="text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1"
                                    style={{ background: 'rgba(150,120,255,.15)', color: '#c9b5ff', border: '1px solid rgba(150,120,255,.35)' }}
                                  >
                                    {getPlanIcon(planId)} {getPlanName(planId)}
                                  </span>
                                ))}
                              </div>
                            </td>

                            {/* 👇 AGENCY COLUMN */}
                            <td className="px-4 py-3">
                              {isAgencyOwner ? (
                                <span
                                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap"
                                  style={{
                                    background: 'rgba(255,207,112,.15)',
                                    color: '#ffcf70',
                                    border: '1px solid rgba(255,207,112,.4)',
                                  }}
                                >
                                  ⭐ Agency Owner
                                </span>
                              ) : isAgencyMember ? (
                                <span
                                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap"
                                  style={{
                                    background: 'rgba(150,120,255,.15)',
                                    color: '#c9b5ff',
                                    border: '1px solid rgba(150,120,255,.35)',
                                  }}
                                  title={`Owned by ${u.ownerId.name || ''} ${u.ownerId.email ? `(${u.ownerId.email})` : ''}`}
                                >
                                  🏢 {u.ownerId.name || 'Agency'}
                                </span>
                              ) : (
                                <span className="text-xs" style={{ color: '#5f7391' }}>—</span>
                              )}
                            </td>

                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleToggleStatus(u._id)}
                                className="text-xs px-2 py-1 rounded-full font-medium"
                                style={
                                  u.isActive !== false
                                    ? { background: 'rgba(12,228,189,.15)', color: '#0ce4bd', border: '1px solid rgba(12,228,189,.35)' }
                                    : { background: 'rgba(255,95,126,.15)', color: '#ff8fa8', border: '1px solid rgba(255,95,126,.35)' }
                                }
                              >
                                {u.isActive !== false ? 'Active' : 'Disabled'}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => openSubscriptionModal(u)} className="text-xs font-medium flex items-center gap-1 transition hover:brightness-125" style={{ color: '#0ce4bd' }} title="Manage Subscriptions">
                                  <Crown size={14} />
                                </button>
                                <button onClick={() => openEditModal(u)} className="text-xs font-medium transition hover:brightness-125" style={{ color: '#6ddcff' }}>Edit</button>
                                <button onClick={() => openDeleteModal(u)} className="text-xs font-medium transition hover:brightness-125" style={{ color: '#ff8fa8' }}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Plans Tab */}
          {activeTab === 'plans' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm" style={{ color: '#8fa0ba' }}>{plans.length} plans</span>
                </div>
                <button
                  onClick={openAddPlanModal}
                  className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition hover:brightness-110"
                  style={{ background: 'linear-gradient(100deg, #6e35ed, #3483ff)', boxShadow: '0 4px 14px rgba(110,53,237,.35)' }}
                >
                  <Plus size={16} /> Add Plan
                </button>
              </div>

              <div className="rounded-xl overflow-x-auto" style={{ background: '#041124', border: '1px solid #17385f' }}>
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #17385f', background: '#06162b' }}>
                      {['ID', 'Name', 'Slug', 'JVZoo ID', 'LaunchPad ID'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#8fa0ba' }}>{h}</th>
                      ))}
                      {['Validity', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="text-center px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#8fa0ba' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {plans.length === 0 ? (
                      <tr><td colSpan="8" className="px-4 py-12 text-center" style={{ color: '#8fa0ba' }}>No plans found</td></tr>
                    ) : (
                      plans.map((p) => (
                        <tr key={p._id} className="transition" style={{ borderBottom: '1px solid rgba(80,150,255,.1)' }}>
                          <td className="px-4 py-3 text-sm" style={{ color: '#eaf1ff' }}>{p.planId}</td>
                          <td className="px-4 py-3 text-sm font-medium" style={{ color: '#eaf1ff' }}>{p.name}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: '#8fa0ba' }}>{p.slug}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: '#8fa0ba' }}>{p.jvzoo_id || '-'}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: '#8fa0ba' }}>{p.launchpad_id || '-'}</td>
                          <td className="px-4 py-3 text-sm text-center" style={{ color: '#8fa0ba' }}>{p.validity_days} days</td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className="text-xs px-2 py-1 rounded-full font-medium"
                              style={
                                p.status === 'active'
                                  ? { background: 'rgba(12,228,189,.15)', color: '#0ce4bd', border: '1px solid rgba(12,228,189,.35)' }
                                  : { background: 'rgba(255,95,126,.15)', color: '#ff8fa8', border: '1px solid rgba(255,95,126,.35)' }
                              }
                            >{p.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => openEditPlanModal(p)} className="text-xs font-medium transition hover:brightness-125" style={{ color: '#6ddcff' }}>Edit</button>
                              <button onClick={() => openDeletePlanModal(p)} className="text-xs font-medium transition hover:brightness-125" style={{ color: '#ff8fa8' }}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search payments by email, transaction ID, or name..."
                    value={paymentSearch}
                    onChange={(e) => setPaymentSearch(e.target.value)}
                    className="w-full px-4 py-2 pl-10 rounded-lg text-sm focus:outline-none"
                    style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }}
                  />
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#7d8fa8' }} />
                </div>
                <span className="text-sm whitespace-nowrap" style={{ color: '#8fa0ba' }}>{filteredPayments.length} payments</span>
              </div>

              <div className="rounded-xl overflow-x-auto" style={{ background: '#041124', border: '1px solid #17385f' }}>
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #17385f', background: '#06162b' }}>
                      {['Transaction', 'Buyer', 'Plan'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#8fa0ba' }}>{h}</th>
                      ))}
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#8fa0ba' }}>Platform</th>
                      {['Amount', 'Status', 'Date', 'Action'].map((h) => (
                        <th key={h} className="text-center px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#8fa0ba' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length === 0 ? (
                      <tr><td colSpan="8" className="px-4 py-12 text-center" style={{ color: '#8fa0ba' }}>No payments found</td></tr>
                    ) : (
                      filteredPayments.map((p) => (
                        <tr key={p._id} className="transition" style={{ borderBottom: '1px solid rgba(80,150,255,.1)' }}>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium truncate max-w-[150px]" style={{ color: '#eaf1ff' }} title={p.transactionId}>{p.transactionId}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium" style={{ color: '#eaf1ff' }}>{p.buyerName}</p>
                              <p className="text-xs" style={{ color: '#8fa0ba' }}>{p.buyerEmail}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'rgba(150,120,255,.15)', color: '#c9b5ff', border: '1px solid rgba(150,120,255,.35)' }}>
                              {p.purchasedPlanName || getPlanName(p.purchasedPlanId)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="text-xs px-2 py-1 rounded-full font-medium"
                              style={
                                p.platform === 'jvzoo'
                                  ? { background: 'rgba(80,150,255,.15)', color: '#6ddcff', border: '1px solid rgba(80,150,255,.35)' }
                                  : { background: 'rgba(12,228,189,.15)', color: '#0ce4bd', border: '1px solid rgba(12,228,189,.35)' }
                              }
                            >{p.platform || 'unknown'}</span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-bold" style={{ color: '#eaf1ff' }}>
                            ${p.amount?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className="text-xs px-2 py-1 rounded-full font-medium"
                              style={
                                p.status === 'completed'
                                  ? { background: 'rgba(12,228,189,.15)', color: '#0ce4bd', border: '1px solid rgba(12,228,189,.35)' }
                                  : p.status === 'refunded'
                                  ? { background: 'rgba(255,95,126,.15)', color: '#ff8fa8', border: '1px solid rgba(255,95,126,.35)' }
                                  : { background: 'rgba(255,207,112,.15)', color: '#ffcf70', border: '1px solid rgba(255,207,112,.35)' }
                              }
                            >{p.status}</span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm" style={{ color: '#8fa0ba' }}>
                            {new Date(p.paymentDate || p.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => openPaymentDetail(p)} className="text-xs font-medium transition hover:brightness-125" style={{ color: '#6ddcff' }}>View IPN Data</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==================== SUBSCRIPTION MANAGEMENT MODAL ==================== */}
      {showSubscriptionModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0" style={{ background: 'rgba(2,7,19,.75)', backdropFilter: 'blur(4px)' }} onClick={() => setShowSubscriptionModal(false)}></div>
          <div
            className="relative rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            style={{ background: 'linear-gradient(180deg,#06162b,#041124)', border: '1px solid #17385f' }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: '#eaf1ff' }}>
                  <Crown size={20} style={{ color: '#ffcf70' }} />
                  Manage Subscriptions
                </h3>
                <p className="text-sm" style={{ color: '#8fa0ba' }}>{selectedUser.name} - {selectedUser.email}</p>
              </div>
              <button onClick={() => setShowSubscriptionModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center transition" style={{ background: 'rgba(80,150,255,.1)' }}>
                <X size={20} style={{ color: '#aebfd5' }} />
              </button>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-semibold mb-3" style={{ color: '#c9b5ff' }}>Current Subscriptions</h4>
              {selectedUser.planId && selectedUser.planId.length > 0 ? (
                <div className="space-y-2">
                  {Array.isArray(selectedUser.planId) ? (
                    selectedUser.planId.map((planId) => (
                      <div key={planId} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(6,20,42,.7)', border: '1px solid #17385f' }}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getPlanIcon(planId)}</span>
                          <div>
                            <p className="text-sm font-medium" style={{ color: '#eaf1ff' }}>{getPlanName(planId)}</p>
                            <p className="text-xs" style={{ color: '#8fa0ba' }}>Plan ID: {planId}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveSubscription(selectedUser._id, planId)}
                          disabled={removingSubscription}
                          className="px-3 py-1 text-xs font-medium rounded-lg transition hover:brightness-125"
                          style={{ color: '#ff8fa8', background: 'rgba(255,95,126,.1)', border: '1px solid rgba(255,95,126,.3)' }}
                        >
                          {removingSubscription ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(6,20,42,.7)', border: '1px solid #17385f' }}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getPlanIcon(selectedUser.planId)}</span>
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#eaf1ff' }}>{getPlanName(selectedUser.planId)}</p>
                          <p className="text-xs" style={{ color: '#8fa0ba' }}>Plan ID: {selectedUser.planId}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveSubscription(selectedUser._id, selectedUser.planId)}
                        disabled={removingSubscription}
                        className="px-3 py-1 text-xs font-medium rounded-lg transition hover:brightness-125"
                        style={{ color: '#ff8fa8', background: 'rgba(255,95,126,.1)', border: '1px solid rgba(255,95,126,.3)' }}
                      >
                        {removingSubscription ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm" style={{ color: '#8fa0ba' }}>No subscriptions found for this user.</p>
              )}
            </div>

            <div className="pt-4" style={{ borderTop: '1px solid #17385f' }}>
              <h4 className="text-sm font-semibold mb-3" style={{ color: '#c9b5ff' }}>Add Subscription</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>Select Plan</label>
                  <select
                    value={subscriptionForm.planId}
                    onChange={(e) => setSubscriptionForm({ ...subscriptionForm, planId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none"
                    style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }}
                  >
                    <option value="">Select a plan...</option>
                    {plans.map((plan) => {
                      const isAlreadyAssigned = Array.isArray(selectedUser.planId)
                        ? selectedUser.planId.includes(plan.planId)
                        : selectedUser.planId === plan.planId;
                      return (
                        <option key={plan._id} value={plan.planId} disabled={isAlreadyAssigned}>
                          {plan.name} {isAlreadyAssigned ? '(Already Assigned)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>Transaction ID</label>
                    <input
                      type="text"
                      value={subscriptionForm.transactionId}
                      onChange={(e) => setSubscriptionForm({ ...subscriptionForm, transactionId: e.target.value })}
                      placeholder="ADMIN_12345"
                      className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none"
                      style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>Amount</label>
                    <input
                      type="number"
                      value={subscriptionForm.amount}
                      onChange={(e) => setSubscriptionForm({ ...subscriptionForm, amount: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none"
                      style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>Source</label>
                  <select
                    value={subscriptionForm.source}
                    onChange={(e) => setSubscriptionForm({ ...subscriptionForm, source: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none"
                    style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }}
                  >
                    <option value="Admin">Admin</option>
                    <option value="BULK_FIX">BULK_FIX</option>
                    <option value="Manual Assignment">Manual Assignment</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Stripe">Stripe</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition"
                  style={{ background: 'rgba(6,20,42,.7)', border: '1px solid #17385f', color: '#aebfd5' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSubscription}
                  disabled={addingSubscription || !subscriptionForm.planId}
                  className="flex-1 px-4 py-2.5 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2 hover:brightness-110"
                  style={{ background: 'linear-gradient(100deg, #6e35ed, #3483ff)', boxShadow: '0 4px 14px rgba(110,53,237,.35)' }}
                >
                  {addingSubscription ? (<><RefreshCw size={16} className="animate-spin" />Adding...</>) : (<><Plus size={16} />Add Subscription</>)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DELETE USER MODAL ==================== */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0" style={{ background: 'rgba(2,7,19,.75)', backdropFilter: 'blur(4px)' }} onClick={() => setShowDeleteModal(false)}></div>
          <div className="relative rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4" style={{ background: 'linear-gradient(180deg,#06162b,#041124)', border: '1px solid #17385f' }}>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,95,126,.15)', border: '1px solid rgba(255,95,126,.35)' }}>
                <Trash2 size={24} style={{ color: '#ff8fa8' }} />
              </div>
              <h3 className="text-lg font-bold" style={{ color: '#eaf1ff' }}>Delete User?</h3>
              <p className="text-sm mt-2" style={{ color: '#8fa0ba' }}>This will permanently delete <strong style={{ color: '#eaf1ff' }}>{selectedUser.name}</strong> and all their data.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition" style={{ background: 'rgba(6,20,42,.7)', border: '1px solid #17385f', color: '#aebfd5' }}>Cancel</button>
              <button onClick={handleDeleteUser} className="flex-1 px-4 py-2.5 text-white rounded-lg text-sm font-medium transition hover:brightness-110" style={{ background: 'linear-gradient(100deg, #e5395e, #c81c3c)' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== EDIT USER MODAL ==================== */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0" style={{ background: 'rgba(2,7,19,.75)', backdropFilter: 'blur(4px)' }} onClick={() => setShowEditModal(false)}></div>
          <div className="relative rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" style={{ background: 'linear-gradient(180deg,#06162b,#041124)', border: '1px solid #17385f' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold" style={{ color: '#eaf1ff' }}>Edit User</h3>
                <p className="text-sm" style={{ color: '#8fa0ba' }}>{selectedUser.email}</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center transition" style={{ background: 'rgba(80,150,255,.1)' }}>
                <X size={20} style={{ color: '#aebfd5' }} />
              </button>
            </div>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>Name</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>Email</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>Role</label>
                  <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>Plan</label>
                  <select value={editForm.planId} onChange={(e) => setEditForm({ ...editForm, planId: parseInt(e.target.value) })} className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }}>
                    {plans.map(plan => (<option key={plan._id} value={plan.planId}>{plan.name}</option>))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(6,20,42,.7)', border: '1px solid #17385f' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#eaf1ff' }}>Account Active</p>
                  <p className="text-xs" style={{ color: '#8fa0ba' }}>User can login and use the platform</p>
                </div>
                <button type="button" onClick={() => setEditForm({ ...editForm, isActive: !editForm.isActive })} className={`relative w-11 h-6 rounded-full transition-colors ${editForm.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${editForm.isActive ? 'translate-x-5' : ''}`}></span>
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition" style={{ background: 'rgba(6,20,42,.7)', border: '1px solid #17385f', color: '#aebfd5' }}>Cancel</button>
                <button type="submit" disabled={savingUser} className="flex-1 px-4 py-2.5 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 hover:brightness-110" style={{ background: 'linear-gradient(100deg, #6e35ed, #3483ff)' }}>
                  {savingUser ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== ADD USER MODAL ==================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0" style={{ background: 'rgba(2,7,19,.75)', backdropFilter: 'blur(4px)' }} onClick={() => setShowAddModal(false)}></div>
          <div className="relative rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" style={{ background: 'linear-gradient(180deg,#06162b,#041124)', border: '1px solid #17385f' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold" style={{ color: '#eaf1ff' }}>Add New User</h3>
                <p className="text-sm" style={{ color: '#8fa0ba' }}>Create a user account manually</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center transition" style={{ background: 'rgba(80,150,255,.1)' }}>
                <X size={20} style={{ color: '#aebfd5' }} />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>Full Name *</label>
                <input type="text" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} placeholder="John Doe" className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>Email *</label>
                <input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} placeholder="john@example.com" className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>Password *</label>
                <input type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} placeholder="Min. 6 characters" className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }} required minLength="6" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>Role</label>
                  <select value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value })} className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>Plan</label>
                  <select value={addForm.planId} onChange={(e) => setAddForm({ ...addForm, planId: parseInt(e.target.value) })} className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }}>
                    {plans.map(plan => (<option key={plan._id} value={plan.planId}>{plan.name}</option>))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition" style={{ background: 'rgba(6,20,42,.7)', border: '1px solid #17385f', color: '#aebfd5' }}>Cancel</button>
                <button type="submit" disabled={addingUser} className="flex-1 px-4 py-2.5 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 hover:brightness-110" style={{ background: 'linear-gradient(100deg, #6e35ed, #3483ff)' }}>
                  {addingUser ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== DELETE PLAN MODAL ==================== */}
      {showDeletePlanModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0" style={{ background: 'rgba(2,7,19,.75)', backdropFilter: 'blur(4px)' }} onClick={() => setShowDeletePlanModal(false)}></div>
          <div className="relative rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4" style={{ background: 'linear-gradient(180deg,#06162b,#041124)', border: '1px solid #17385f' }}>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,95,126,.15)', border: '1px solid rgba(255,95,126,.35)' }}>
                <Trash2 size={24} style={{ color: '#ff8fa8' }} />
              </div>
              <h3 className="text-lg font-bold" style={{ color: '#eaf1ff' }}>Delete Plan?</h3>
              <p className="text-sm mt-2" style={{ color: '#8fa0ba' }}>This will permanently delete <strong style={{ color: '#eaf1ff' }}>{selectedPlan.name}</strong> from the system.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeletePlanModal(false)} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition" style={{ background: 'rgba(6,20,42,.7)', border: '1px solid #17385f', color: '#aebfd5' }}>Cancel</button>
              <button onClick={handleDeletePlan} className="flex-1 px-4 py-2.5 text-white rounded-lg text-sm font-medium transition hover:brightness-110" style={{ background: 'linear-gradient(100deg, #e5395e, #c81c3c)' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ADD PLAN MODAL ==================== */}
      {showAddPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0" style={{ background: 'rgba(2,7,19,.75)', backdropFilter: 'blur(4px)' }} onClick={() => setShowAddPlanModal(false)}></div>
          <div className="relative rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" style={{ background: 'linear-gradient(180deg,#06162b,#041124)', border: '1px solid #17385f' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold" style={{ color: '#eaf1ff' }}>Add New Plan</h3>
                <p className="text-sm" style={{ color: '#8fa0ba' }}>Create a new subscription plan</p>
              </div>
              <button onClick={() => setShowAddPlanModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center transition" style={{ background: 'rgba(80,150,255,.1)' }}>
                <X size={20} style={{ color: '#aebfd5' }} />
              </button>
            </div>
            <form onSubmit={handleAddPlan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>Plan Name *</label>
                <input type="text" value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} placeholder="Healtrics Pro" className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>Slug *</label>
                <input type="text" value={planForm.slug} onChange={(e) => setPlanForm({ ...planForm, slug: e.target.value.toLowerCase().replace(/\s/g, '-') })} placeholder="healtrics-pro" className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>Plan ID</label>
                  <input type="number" value={planForm.planId} onChange={(e) => setPlanForm({ ...planForm, planId: e.target.value })} placeholder="1" className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>Validity (days)</label>
                  <input type="number" value={planForm.validity_days} onChange={(e) => setPlanForm({ ...planForm, validity_days: parseInt(e.target.value) })} placeholder="365" className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>JVZoo ID</label>
                  <input type="text" value={planForm.jvzoo_id} onChange={(e) => setPlanForm({ ...planForm, jvzoo_id: e.target.value })} placeholder="444615" className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>LaunchPad ID</label>
                  <input type="text" value={planForm.launchpad_id} onChange={(e) => setPlanForm({ ...planForm, launchpad_id: e.target.value })} placeholder="lp_healthrics_pro" className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>Status</label>
                  <select value={planForm.status} onChange={(e) => setPlanForm({ ...planForm, status: e.target.value })} className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>Order</label>
                  <input type="number" value={planForm.order} onChange={(e) => setPlanForm({ ...planForm, order: parseInt(e.target.value) })} placeholder="0" className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddPlanModal(false)} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition" style={{ background: 'rgba(6,20,42,.7)', border: '1px solid #17385f', color: '#aebfd5' }}>Cancel</button>
                <button type="submit" disabled={savingPlan} className="flex-1 px-4 py-2.5 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 hover:brightness-110" style={{ background: 'linear-gradient(100deg, #6e35ed, #3483ff)' }}>
                  {savingPlan ? 'Creating...' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== EDIT PLAN MODAL ==================== */}
      {showEditPlanModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0" style={{ background: 'rgba(2,7,19,.75)', backdropFilter: 'blur(4px)' }} onClick={() => setShowEditPlanModal(false)}></div>
          <div className="relative rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" style={{ background: 'linear-gradient(180deg,#06162b,#041124)', border: '1px solid #17385f' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold" style={{ color: '#eaf1ff' }}>Edit Plan</h3>
                <p className="text-sm" style={{ color: '#8fa0ba' }}>Update plan details</p>
              </div>
              <button onClick={() => setShowEditPlanModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center transition" style={{ background: 'rgba(80,150,255,.1)' }}>
                <X size={20} style={{ color: '#aebfd5' }} />
              </button>
            </div>
            <form onSubmit={handleEditPlan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>Plan Name *</label>
                <input type="text" value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>Slug *</label>
                <input type="text" value={planForm.slug} onChange={(e) => setPlanForm({ ...planForm, slug: e.target.value.toLowerCase().replace(/\s/g, '-') })} className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>Plan ID</label>
                  <input type="number" value={planForm.planId} onChange={(e) => setPlanForm({ ...planForm, planId: e.target.value })} className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>Validity (days)</label>
                  <input type="number" value={planForm.validity_days} onChange={(e) => setPlanForm({ ...planForm, validity_days: parseInt(e.target.value) })} className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>JVZoo ID</label>
                  <input type="text" value={planForm.jvzoo_id} onChange={(e) => setPlanForm({ ...planForm, jvzoo_id: e.target.value })} className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>LaunchPad ID</label>
                  <input type="text" value={planForm.launchpad_id} onChange={(e) => setPlanForm({ ...planForm, launchpad_id: e.target.value })} className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>Status</label>
                  <select value={planForm.status} onChange={(e) => setPlanForm({ ...planForm, status: e.target.value })} className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#aebfd5' }}>Order</label>
                  <input type="number" value={planForm.order} onChange={(e) => setPlanForm({ ...planForm, order: parseInt(e.target.value) })} className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: '#06162b', border: '1px solid #17385f', color: '#eaf1ff' }} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEditPlanModal(false)} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition" style={{ background: 'rgba(6,20,42,.7)', border: '1px solid #17385f', color: '#aebfd5' }}>Cancel</button>
                <button type="submit" disabled={savingPlan} className="flex-1 px-4 py-2.5 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 hover:brightness-110" style={{ background: 'linear-gradient(100deg, #6e35ed, #3483ff)' }}>
                  {savingPlan ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== PAYMENT DETAIL MODAL ==================== */}
      {showPaymentDetailModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0" style={{ background: 'rgba(2,7,19,.75)', backdropFilter: 'blur(4px)' }} onClick={() => setShowPaymentDetailModal(false)}></div>
          <div className="relative rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" style={{ background: 'linear-gradient(180deg,#06162b,#041124)', border: '1px solid #17385f' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold" style={{ color: '#eaf1ff' }}>Payment Details</h3>
                <p className="text-sm" style={{ color: '#8fa0ba' }}>Transaction ID: {selectedPayment.transactionId}</p>
              </div>
              <button onClick={() => setShowPaymentDetailModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center transition" style={{ background: 'rgba(80,150,255,.1)' }}>
                <X size={20} style={{ color: '#aebfd5' }} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(6,20,42,.7)', border: '1px solid #17385f' }}>
                  <p className="text-xs" style={{ color: '#8fa0ba' }}>Buyer</p>
                  <p className="text-sm font-medium" style={{ color: '#eaf1ff' }}>{selectedPayment.buyerName}</p>
                  <p className="text-xs" style={{ color: '#8fa0ba' }}>{selectedPayment.buyerEmail}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(6,20,42,.7)', border: '1px solid #17385f' }}>
                  <p className="text-xs" style={{ color: '#8fa0ba' }}>Amount</p>
                  <p className="text-sm font-bold" style={{ color: '#0ce4bd' }}>${selectedPayment.amount?.toFixed(2)}</p>
                  <p className="text-xs" style={{ color: '#8fa0ba' }}>{selectedPayment.currency}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(6,20,42,.7)', border: '1px solid #17385f' }}>
                  <p className="text-xs" style={{ color: '#8fa0ba' }}>Platform</p>
                  <p className="text-sm font-medium" style={{ color: '#eaf1ff' }}>{selectedPayment.platform || 'Unknown'}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(6,20,42,.7)', border: '1px solid #17385f' }}>
                  <p className="text-xs" style={{ color: '#8fa0ba' }}>Status</p>
                  <span
                    className="text-xs px-2 py-1 rounded-full font-medium inline-block mt-1"
                    style={
                      selectedPayment.status === 'completed'
                        ? { background: 'rgba(12,228,189,.15)', color: '#0ce4bd', border: '1px solid rgba(12,228,189,.35)' }
                        : selectedPayment.status === 'refunded'
                        ? { background: 'rgba(255,95,126,.15)', color: '#ff8fa8', border: '1px solid rgba(255,95,126,.35)' }
                        : { background: 'rgba(255,207,112,.15)', color: '#ffcf70', border: '1px solid rgba(255,207,112,.35)' }
                    }
                  >{selectedPayment.status}</span>
                </div>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'rgba(6,20,42,.7)', border: '1px solid #17385f' }}>
                <p className="text-xs" style={{ color: '#8fa0ba' }}>Plan</p>
                <p className="text-sm font-medium" style={{ color: '#eaf1ff' }}>{selectedPayment.purchasedPlanName || getPlanName(selectedPayment.purchasedPlanId)}</p>
                <p className="text-xs" style={{ color: '#8fa0ba' }}>Validity: {selectedPayment.validityDays || 365} days</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'rgba(6,20,42,.7)', border: '1px solid #17385f' }}>
                <p className="text-xs" style={{ color: '#8fa0ba' }}>Payment Date</p>
                <p className="text-sm" style={{ color: '#eaf1ff' }}>{new Date(selectedPayment.paymentDate || selectedPayment.createdAt).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'rgba(6,20,42,.7)', border: '1px solid #17385f' }}>
                <p className="text-xs" style={{ color: '#8fa0ba' }}>Product</p>
                <p className="text-sm" style={{ color: '#eaf1ff' }}>{selectedPayment.productName}</p>
                <p className="text-xs" style={{ color: '#8fa0ba' }}>Product ID: {selectedPayment.productId}</p>
              </div>
              {selectedPayment.ipnData && (
                <div className="p-3 rounded-lg" style={{ background: 'rgba(6,20,42,.7)', border: '1px solid #17385f' }}>
                  <p className="text-xs mb-2" style={{ color: '#8fa0ba' }}>IPN Data (Raw)</p>
                  <pre className="text-xs p-4 rounded-lg overflow-x-auto max-h-[200px] overflow-y-auto" style={{ background: '#020914', color: '#0ce4bd', border: '1px solid #17385f' }}>
                    {JSON.stringify(selectedPayment.ipnData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setShowPaymentDetailModal(false)} className="px-4 py-2 text-white rounded-lg text-sm font-medium transition hover:brightness-110" style={{ background: 'linear-gradient(100deg, #6e35ed, #3483ff)' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, color, value, label }) => {
  const colorMap = {
    blue: { bg: 'rgba(80,150,255,.15)', border: 'rgba(80,150,255,.35)', fg: '#6ddcff' },
    green: { bg: 'rgba(12,228,189,.15)', border: 'rgba(12,228,189,.35)', fg: '#0ce4bd' },
    purple: { bg: 'rgba(150,120,255,.15)', border: 'rgba(150,120,255,.35)', fg: '#c9b5ff' },
    orange: { bg: 'rgba(255,207,112,.15)', border: 'rgba(255,207,112,.35)', fg: '#ffcf70' },
  };
  const c = colorMap[color];
  return (
    <div className="rounded-xl p-5" style={{ background: '#06162b', border: '1px solid #17385f' }}>
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
        style={{ background: c.bg, border: `1px solid ${c.border}` }}
      >
        <i className={`fa-solid ${icon}`} style={{ color: c.fg }}></i>
      </div>
      <div className="text-2xl font-bold" style={{ color: '#eaf1ff' }}>{value || 0}</div>
      <div className="text-xs mt-1" style={{ color: '#8fa0ba' }}>{label}</div>
    </div>
  );
};

const MiniStat = ({ value, label, color }) => (
  <div className="rounded-xl p-5 text-center" style={{ background: '#06162b', border: '1px solid #17385f' }}>
    <div className="text-3xl font-bold" style={{ color }}>{value || 0}</div>
    <div className="text-xs mt-1" style={{ color: '#8fa0ba' }}>{label}</div>
  </div>
);

export default AdminDashboard;