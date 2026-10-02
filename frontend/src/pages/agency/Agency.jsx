// frontend/src/pages/Agency.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  Crown,
  Trash2,
  Check,
  X,
  Loader2,
  UserCheck,
  UserX,
  Mail,
  Key,
  Building2,
  Sparkles,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function Agency() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [agencyName, setAgencyName] = useState("");
  const [members, setMembers] = useState([]);
  const [isAgency, setIsAgency] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", email: "", password: "" });
  const [adding, setAdding] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/agency/members");
      setMembers(res.data?.members || []);
      setAgencyName(res.data?.agencyName || "");
      setIsAgency(true);
    } catch (err) {
      console.error("Failed to load members:", err);
      if (err.response?.status === 403) {
        setIsAgency(false);
      } else {
        toast.error("Failed to load agency");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    if (addForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setAdding(true);
    try {
      await api.post("/agency/members", addForm);
      toast.success(`Member "${addForm.name}" added!`);
      setAddForm({ name: "", email: "", password: "" });
      setShowAddForm(false);
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add member");
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (member) => {
    try {
      const res = await api.patch(`/agency/members/${member._id}/toggle`);
      toast.success(res.data?.message || "Updated");
      fetchMembers();
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/agency/members/${deleteTarget._id}`);
      toast.success("Member removed");
      setDeleteTarget(null);
      fetchMembers();
    } catch {
      toast.error("Failed to remove member");
    } finally {
      setDeleting(false);
    }
  };

  // Not an agency owner
  if (!loading && !isAgency) {
    return (
      <div className="flex h-screen" style={{ background: "#020914" }}>
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 flex items-center justify-center p-6">
            <div
              className="text-center max-w-md p-8 rounded-2xl"
              style={{
                background:
                  "linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.7))",
                border: "1px solid rgba(80,150,255,.25)",
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl grid place-items-center mx-auto mb-5"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(110,53,237,.25), rgba(52,131,255,.2))",
                  border: "1px solid rgba(150,120,255,.4)",
                }}
              >
                <Building2 size={28} className="text-[#c9b5ff]" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-[#eaf1ff]">
                Agency Plan Required
              </h2>
              <p className="text-sm text-[#8fa0ba] mb-6 leading-relaxed">
                Agency (Plan 8) lets you add team members — everyone shares your
                subscription. Upgrade to unlock.
              </p>
              <button
                onClick={() => navigate("/upgrades")}
                className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:brightness-110"
                style={{
                  background: "linear-gradient(100deg, #6e35ed, #3483ff)",
                  boxShadow: "0 8px 24px rgba(110,53,237,.35)",
                }}
              >
                <Crown size={16} />
                Upgrade to Agency
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#020914" }}>
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen bg-[#020814]">
        <Navbar />

        <main className="flex-1 p-3 md:p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#eaf1ff] flex items-center gap-2.5">
                <Building2 size={24} className="text-[#c9b5ff]" />
                {agencyName || "Your Agency"}
              </h1>
              <p className="text-sm text-[#8fa0ba] mt-1">
                Manage members and share your subscription with your team.
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
              style={{
                background: "linear-gradient(100deg, #6e35ed, #3483ff)",
                boxShadow: "0 8px 24px rgba(110,53,237,.35)",
              }}
            >
              <UserPlus size={15} />
              Add Member
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard label="Total Members" value={members.length} color="#6ddcff" icon={Users} />
            <StatCard
              label="Active"
              value={members.filter((m) => m.isActive !== false).length}
              color="#0ce4bd"
              icon={UserCheck}
            />
            <StatCard
              label="Disabled"
              value={members.filter((m) => m.isActive === false).length}
              color="#ff8fa8"
              icon={UserX}
            />
            <StatCard label="Shared Plan" value="Agency" color="#c9b5ff" icon={Crown} />
          </div>

          {/* Add member form */}
          {showAddForm && (
            <div
              className="rounded-2xl p-5 mb-6"
              style={{
                background:
                  "radial-gradient(circle at 100% 0%, rgba(110,53,237,.15), transparent 60%), linear-gradient(180deg, rgba(4,26,53,.65), rgba(3,17,38,.8))",
                border: "1px solid rgba(150,120,255,.4)",
                boxShadow: "0 12px 40px rgba(0,0,0,.4)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-[9px] grid place-items-center"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(110,53,237,.35), rgba(52,131,255,.35))",
                      border: "1px solid rgba(150,120,255,.5)",
                    }}
                  >
                    <UserPlus size={14} className="text-[#c9b5ff]" />
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-[#eaf1ff]">
                      Add New Member
                    </div>
                    <div className="text-[11px] text-[#8fa0ba] mt-0.5">
                      They'll share your subscription automatically.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setAddForm({ name: "", email: "", password: "" });
                  }}
                  className="w-8 h-8 rounded-full grid place-items-center text-[#aebfd5] transition hover:bg-[rgba(80,150,255,.1)]"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddMember}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8fa0ba] mb-1.5 uppercase tracking-wider">
                      Name
                    </label>
                    <div
                      className="flex items-center gap-2 px-3.5 rounded-[10px]"
                      style={{
                        height: 44,
                        background: "rgba(6,34,74,.55)",
                        border: "1px solid rgba(23,96,160,.6)",
                      }}
                    >
                      <Users size={14} className="text-[#7d8fa8]" />
                      <input
                        type="text"
                        value={addForm.name}
                        onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                        placeholder="John Doe"
                        className="flex-1 bg-transparent outline-none text-[13px] text-white placeholder:text-[#6b7c93]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#8fa0ba] mb-1.5 uppercase tracking-wider">
                      Email
                    </label>
                    <div
                      className="flex items-center gap-2 px-3.5 rounded-[10px]"
                      style={{
                        height: 44,
                        background: "rgba(6,34,74,.55)",
                        border: "1px solid rgba(23,96,160,.6)",
                      }}
                    >
                      <Mail size={14} className="text-[#7d8fa8]" />
                      <input
                        type="email"
                        value={addForm.email}
                        onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                        placeholder="john@example.com"
                        className="flex-1 bg-transparent outline-none text-[13px] text-white placeholder:text-[#6b7c93]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#8fa0ba] mb-1.5 uppercase tracking-wider">
                      Password
                    </label>
                    <div
                      className="flex items-center gap-2 px-3.5 rounded-[10px]"
                      style={{
                        height: 44,
                        background: "rgba(6,34,74,.55)",
                        border: "1px solid rgba(23,96,160,.6)",
                      }}
                    >
                      <Key size={14} className="text-[#7d8fa8]" />
                      <input
                        type="password"
                        value={addForm.password}
                        onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                        placeholder="Min 6 chars"
                        className="flex-1 bg-transparent outline-none text-[13px] text-white placeholder:text-[#6b7c93]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setAddForm({ name: "", email: "", password: "" });
                    }}
                    className="h-[42px] px-5 rounded-[10px] text-[13px] font-medium transition"
                    style={{
                      background: "rgba(6,20,42,.7)",
                      border: "1px solid #17385f",
                      color: "#aebfd5",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adding}
                    className="h-[42px] px-6 rounded-[10px] text-[13px] font-semibold text-white flex items-center gap-2 transition hover:brightness-110 disabled:opacity-60"
                    style={{
                      background: "linear-gradient(100deg, #6e35ed, #3483ff)",
                      boxShadow: "0 4px 14px rgba(110,53,237,.35)",
                    }}
                  >
                    {adding ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Adding…
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        Add Member
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Members list */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "#041124", border: "1px solid #17385f" }}
          >
            <div
              className="grid grid-cols-12 gap-3 px-5 py-3 text-[10.5px] font-semibold tracking-[0.5px] uppercase"
              style={{
                background: "#06162b",
                borderBottom: "1px solid #17385f",
                color: "#8fa0ba",
              }}
            >
              <div className="col-span-4">Member</div>
              <div className="col-span-3">Role</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-2 text-center">Joined</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <Loader2 size={28} className="animate-spin text-[#c9b5ff] mx-auto mb-3" />
                <p className="text-[13px] text-[#8fa0ba]">Loading members…</p>
              </div>
            ) : members.length === 0 ? (
              <div className="py-16 text-center">
                <div
                  className="w-14 h-14 rounded-full grid place-items-center mx-auto mb-3"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(110,53,237,.2), rgba(52,131,255,.2))",
                    border: "1px solid rgba(150,120,255,.35)",
                  }}
                >
                  <Users size={22} className="text-[#c9b5ff]" />
                </div>
                <p className="text-[14px] font-medium text-[#eaf1ff]">No members yet</p>
                <p className="text-[12px] text-[#8fa0ba] mt-1 max-w-[340px] mx-auto">
                  Add your first team member — they'll get instant access to your plan.
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 h-[38px] px-5 rounded-[10px] text-[12.5px] font-semibold text-white inline-flex items-center gap-2 transition hover:brightness-110"
                  style={{ background: "linear-gradient(100deg, #6e35ed, #3483ff)" }}
                >
                  <UserPlus size={14} />
                  Add First Member
                </button>
              </div>
            ) : (
              members.map((m) => (
                <div
                  key={m._id}
                  className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center"
                  style={{ borderBottom: "1px solid rgba(80,150,255,.1)" }}
                >
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-full grid place-items-center shrink-0 text-[13px] font-bold"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(110,53,237,.3), rgba(52,131,255,.3))",
                        border: "1px solid rgba(150,120,255,.4)",
                        color: "#c9b5ff",
                      }}
                    >
                      {m.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-[#eaf1ff] truncate">
                        {m.name}
                      </div>
                      <div className="text-[11px] text-[#8fa0ba] truncate">{m.email}</div>
                    </div>
                  </div>

                  <div className="col-span-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-semibold"
                      style={{
                        background: "rgba(150,120,255,.15)",
                        border: "1px solid rgba(150,120,255,.35)",
                        color: "#c9b5ff",
                      }}
                    >
                      <Users size={10} />
                      Agency Member
                    </span>
                  </div>

                  <div className="col-span-2 text-center">
                    <button
                      onClick={() => handleToggle(m)}
                      className="text-[10.5px] px-2.5 py-1 rounded-full font-semibold transition"
                      style={
                        m.isActive !== false
                          ? {
                              background: "rgba(12,228,189,.15)",
                              border: "1px solid rgba(12,228,189,.35)",
                              color: "#0ce4bd",
                            }
                          : {
                              background: "rgba(255,95,126,.15)",
                              border: "1px solid rgba(255,95,126,.35)",
                              color: "#ff8fa8",
                            }
                      }
                    >
                      {m.isActive !== false ? "Active" : "Disabled"}
                    </button>
                  </div>

                  <div className="col-span-2 text-center text-[11px] text-[#8fa0ba]">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </div>

                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => setDeleteTarget(m)}
                      className="w-7 h-7 rounded-[7px] grid place-items-center transition hover:brightness-125"
                      style={{
                        background: "rgba(255,95,126,.1)",
                        border: "1px solid rgba(255,95,126,.3)",
                      }}
                      title="Remove member"
                    >
                      <Trash2 size={12} className="text-[#ff8fa8]" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Info footer */}
          <div
            className="mt-5 rounded-xl p-4 flex items-start gap-3"
            style={{
              background: "rgba(6,20,42,.6)",
              border: "1px solid rgba(80,150,255,.2)",
            }}
          >
            <Sparkles size={14} className="text-[#c9b5ff] shrink-0 mt-0.5" />
            <div className="text-[12px] text-[#aebfd5] leading-[1.55]">
              <b className="text-[#eaf1ff]">How Agency works:</b> Members you add here
              can log in with their email/password and get full access to everything in
              your current plan. All usage counts toward your subscription — no separate
              billing.
            </div>
          </div>
        </main>
      </div>

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(2,7,19,.75)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="rounded-2xl max-w-md w-full p-6"
            style={{
              background: "linear-gradient(180deg, #06162b, #041124)",
              border: "1px solid #17385f",
            }}
          >
            <div className="text-center mb-6">
              <div
                className="w-14 h-14 rounded-full grid place-items-center mx-auto mb-4"
                style={{
                  background: "rgba(255,95,126,.15)",
                  border: "1px solid rgba(255,95,126,.35)",
                }}
              >
                <Trash2 size={24} className="text-[#ff8fa8]" />
              </div>
              <h3 className="text-lg font-bold text-[#eaf1ff]">Remove Member?</h3>
              <p className="text-sm text-[#8fa0ba] mt-2 leading-relaxed">
                <b className="text-[#eaf1ff]">{deleteTarget.name}</b> (
                {deleteTarget.email}) will lose access to your agency immediately.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition"
                style={{
                  background: "rgba(6,20,42,.7)",
                  border: "1px solid #17385f",
                  color: "#aebfd5",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition hover:brightness-110 disabled:opacity-60"
                style={{ background: "linear-gradient(100deg, #e5395e, #c81c3c)" }}
              >
                {deleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Removing…
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Remove
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================================================================
// STAT CARD
// ================================================================
function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div
      className="rounded-[12px] p-4"
      style={{
        background:
          "linear-gradient(180deg, rgba(4,26,53,.55), rgba(3,17,38,.7))",
        border: "1px solid rgba(80,150,255,.25)",
        boxShadow: "0 1px 0 rgba(255,255,255,.05) inset",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="w-8 h-8 rounded-lg grid place-items-center"
          style={{ background: `${color}20`, border: `1px solid ${color}40` }}
        >
          <Icon size={14} style={{ color }} />
        </span>
      </div>
      <div className="text-2xl font-bold" style={{ color }}>
        {value}
      </div>
      <div className="text-[11.5px] text-[#8fa0ba] font-medium mt-0.5">{label}</div>
    </div>
  );
}