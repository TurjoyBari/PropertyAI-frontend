"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listAdminUsers, updateUserRole } from "@/services/admin.service";
import type { AdminUser } from "@/services/admin.service";

export default function AdminHomePage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reload = () =>
    listAdminUsers()
      .then((data) => setUsers(data.items))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed"));

  useEffect(() => {
    reload();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Manage roles, then jump into the full ops console.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/dashboard"
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium"
          >
            Dashboard
          </Link>
          <Link
            href="/ai"
            className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
          >
            Admin AI
          </Link>
        </div>
      </div>

      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-semibold">Users & roles</h2>
        <table className="mt-4 w-full min-w-[36rem] text-left text-sm">
          <thead className="text-xs uppercase text-[var(--muted)]">
            <tr>
              <th className="pb-3">Name</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-[var(--border)]">
                <td className="py-3">{user.name}</td>
                <td className="py-3">{user.email}</td>
                <td className="py-3">
                  <select
                    className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-1"
                    value={user.role}
                    onChange={async (e) => {
                      await updateUserRole(user.id, e.target.value);
                      await reload();
                    }}
                  >
                    <option value="user">user (customer)</option>
                    <option value="agent">agent</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
