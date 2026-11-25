"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const res = await fetch("/api/admin/users");
      const data = (await res.json()) as User[] | { error: string };
      if (!res.ok) throw new Error("error" in data ? data.error : "Failed to load");
      setUsers(data as User[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleRole(user: User) {
    const newRole = user.role === "admin" ? "customer" : "admin";
    setBusy(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)),
      );
    } catch {
      alert("Failed to update role");
    } finally {
      setBusy(null);
    }
  }

  async function deleteUser(user: User) {
    if (!confirm(`Delete account for ${user.email}? This cannot be undone.`)) return;
    setBusy(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to delete");
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete user");
    } finally {
      setBusy(null);
    }
  }

  if (isLoading) return <p className="text-stone-600">Loading users...</p>;
  if (error) return <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-red-700">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-stone-900">Users</h1>
        <p className="mt-1 text-stone-500">{users.length} accounts</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 text-left text-xs uppercase tracking-wide text-stone-400">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-stone-50">
                <td className="px-6 py-4 font-medium text-stone-900">{user.name}</td>
                <td className="px-6 py-4 text-stone-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      user.role === "admin"
                        ? "bg-red-100 text-red-700"
                        : "bg-stone-100 text-stone-700"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-stone-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => toggleRole(user)}
                      disabled={busy === user.id}
                      className="text-xs font-medium text-blue-700 hover:text-blue-900 disabled:opacity-50"
                    >
                      {user.role === "admin" ? "Demote" : "Make admin"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteUser(user)}
                      disabled={busy === user.id}
                      className="text-xs font-medium text-red-700 hover:text-red-900 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="px-6 py-8 text-center text-stone-500">No users found.</p>
        )}
      </div>
    </div>
  );
}
