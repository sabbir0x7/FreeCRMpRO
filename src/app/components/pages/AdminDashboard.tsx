import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth";
import { SERVER_URL } from "../../supabaseClient";
import { Users, Activity, CheckCircle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { accessToken, isAdmin } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const statsRes = await fetch(`${SERVER_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const usersRes = await fetch(`${SERVER_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (statsRes.ok && usersRes.ok) {
        setStats(await statsRes.json());
        setUsers((await usersRes.json()).users || []);
      } else {
        throw new Error("Failed to load admin data");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && accessToken) {
      fetchAdminData();
    }
  }, [isAdmin, accessToken]);

  const handleUpdateSubscription = async (userId: string, newStatus: string) => {
    try {
      const res = await fetch(`${SERVER_URL}/admin/update-subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          targetUserId: userId,
          updates: { subscription_status: newStatus },
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      
      toast.success(`User subscription updated to ${newStatus}`);
      fetchAdminData(); // refresh list
    } catch (err) {
      console.error(err);
      toast.error("Failed to update subscription");
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <ShieldAlert className="w-16 h-16 text-red-500" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You do not have Super Admin privileges.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-[80vh]">
        <div className="w-8 h-8 rounded-full border-4 border-brand border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform overview and user management.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand/10 rounded-xl">
              <Users className="w-6 h-6 text-brand" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
              <p className="text-3xl font-bold">{stats?.activeSubscriptions || 0}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-xl">
              <Activity className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Users on Trial</p>
              <p className="text-3xl font-bold">{stats?.trialingSubscriptions || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-semibold">User Directory & Payments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-muted-foreground font-medium">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl whitespace-nowrap">User</th>
                <th className="px-6 py-4 whitespace-nowrap">Joined</th>
                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 whitespace-nowrap">Plan</th>
                <th className="px-6 py-4 text-right rounded-tr-xl whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium">{u.name || "No Name"}</p>
                    <p className="text-muted-foreground text-xs">{u.email}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      u.subscription?.subscription_status === 'active' ? 'bg-green-500/10 text-green-500' :
                      u.subscription?.subscription_status === 'trialing' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {u.subscription?.subscription_status || "unknown"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">
                    {u.subscription?.plan_type || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    {u.subscription?.subscription_status !== 'active' ? (
                      <button 
                        onClick={() => handleUpdateSubscription(u.id, 'active')}
                        className="px-3 py-1 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors"
                      >
                        Mark Active
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleUpdateSubscription(u.id, 'canceled')}
                        className="px-3 py-1 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        Cancel Sub
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
