"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, UserCog } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import * as api from "@/lib/api-client";
import { ApiError } from "@/lib/api-client";
import { User } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

export default function UsersPage() {
  const { user: me } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("agent");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .getUsers()
      .then((res) => {
        setUsers(res?.users ?? []);
        console.log("Users:", res?.users ?? []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    setSubmitting(true);
    try {
      await api.createUser({ name, email, password, role });
      toast("User created");
      setAddOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      setRole("agent");
      load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to create user", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await api.deleteUser(id);
      toast("User deleted");
      setUsers((prev) => {
        const updated = prev.filter((u) => u.id !== id);
        console.log("Users after delete:", updated);
        return updated;
      });
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to delete user", "error");
    }
  };

  const changeRole = async (id: string, newRole: string) => {
    try {
      const updated = await api.updateUser(id, { role: newRole });
      setUsers((prev) => {
        const mapped = prev.map((u) => (u.id === id ? updated : u));
        console.log("Users after role change:", mapped);
        return mapped;
      });
      toast("Role updated");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to update role", "error");
    }
  };

  if (me && me.role !== "admin") {
    return (
      <AppShell title="Users">
        <div className="p-6">
          <EmptyState
            icon={UserCog}
            title="Admins only"
            description="You need admin access to manage users."
          />
        </div>
      </AppShell>
    );
  }

  // Defensive: users may be undefined/null until setUsers runs after the API call
  const usersArr: User[] = Array.isArray(users) ? users : [];

  // Log users whenever users state changes
  useEffect(() => {
    console.log("Current users state:", users);
  }, [users]);

  return (
    <AppShell title="Users">
      <div className="p-4 md:p-6 space-y-4 max-w-3xl">
        <div className="flex justify-end">
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add User
          </Button>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          {loading ? (
            <TableSkeleton rows={5} cols={4} />
          ) : usersArr.length === 0 ? (
            <EmptyState icon={UserCog} title="No users yet" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium">Email</th>
                  <th className="px-4 py-2.5 font-medium">Role</th>
                  <th className="px-4 py-2.5 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {usersArr.map((u) => (
                  <tr key={u.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-2.5 font-medium text-slate-900">{u.name}</td>
                    <td className="px-4 py-2.5 text-slate-600">{u.email}</td>
                    <td className="px-4 py-2.5">
                      <Select
                        value={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        className="w-auto"
                      >
                        <option value="admin">admin</option>
                        <option value="agent">agent</option>
                      </Select>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => remove(u.id)}
                        className="text-slate-300 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add User">
        <div className="space-y-3.5">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <Label>Role</Label>
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="admin">admin</option>
              <option value="agent">agent</option>
            </Select>
          </div>
          <div className="flex justify-end pt-1">
            <Button
              onClick={create}
              loading={submitting}
              disabled={!name || !email || !password}
            >
              Create User
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
