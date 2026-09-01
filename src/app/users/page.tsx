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

// Logo palette colors
const PALETTE = {
  blue: "#2E93D6",
  orange: "#F2591C",
  navy: "#0B2C5F",
  blueBg: "#F3F8FB",
  navyLight: "#E9EFF6",
};

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
      <div
        className="p-4 md:p-6 space-y-4"
        style={{
          background: `linear-gradient(135deg, ${PALETTE.blueBg} 0%, ${PALETTE.navyLight} 100%)`,
          minHeight: "100vh",
        }}
      >
        <div className="flex justify-end">
          <Button
            onClick={() => setAddOpen(true)}
            style={{
              background: `linear-gradient(90deg, ${PALETTE.blue} 60%, ${PALETTE.orange} 100%)`,
              color: "#fff",
              fontWeight: 500,
              letterSpacing: "0.01em",
            }}
          >
            <Plus className="h-3.5 w-3.5" /> Add User
          </Button>
        </div>
        {/* Add scroll container here for table */}
        <div className="w-full overflow-x-auto">
          <div
            className="rounded-xl border min-w-[520px] overflow-hidden"
            style={{
              background: "#fff",
              border: `2px solid ${PALETTE.blue}`,
              boxShadow:
                "0 4px 24px 0 rgba(46,147,214,0.10), 0 1.5px 8px 0 #F2591C38"
            }}
          >
            {loading ? (
              <TableSkeleton rows={5} cols={4} />
            ) : usersArr.length === 0 ? (
              <EmptyState icon={UserCog} title="No users yet" />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="border-b text-left text-xs"
                    style={{
                      color: PALETTE.navy,
                      background: `linear-gradient(90deg, ${PALETTE.blue} 0%, ${PALETTE.orange} 80%)`,
                      opacity: 0.9,
                    }}
                  >
                    <th className="px-4 py-2.5 font-bold" style={{ color: "#fff" }}>
                      Name
                    </th>
                    <th className="px-4 py-2.5 font-bold" style={{ color: "#fff" }}>
                      Email
                    </th>
                    <th className="px-4 py-2.5 font-bold" style={{ color: "#fff" }}>
                      Role
                    </th>
                    <th className="px-4 py-2.5 font-bold" style={{ color: "#fff" }}>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {usersArr.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b last:border-0"
                      style={{
                        borderColor: PALETTE.blueBg,
                        background:
                          u.role === "admin"
                            ? "linear-gradient(90deg, #fff 70%, #F3F8FB 100%)"
                            : "#fff"
                      }}
                    >
                      <td
                        className="px-4 py-2.5 font-medium"
                        style={{ color: PALETTE.navy }}
                      >
                        {u.name}
                      </td>
                      <td
                        className="px-4 py-2.5"
                        style={{ color: "#637381" }}
                      >
                        {u.email}
                      </td>
                      <td className="px-4 py-2.5">
                        <Select
                          value={u.role}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                          className="w-auto"
                          style={{
                            backgroundColor: PALETTE.blueBg,
                            color: PALETTE.navy,
                            borderColor: PALETTE.blue,
                            fontWeight: 500,
                          }}
                        >
                          <option
                            value="admin"
                            style={{
                              color: PALETTE.orange,
                              fontWeight: 600,
                              background: "#fff",
                            }}
                          >admin</option>
                          <option
                            value="agent"
                            style={{
                              color: PALETTE.blue,
                              fontWeight: 600,
                              background: "#fff",
                            }}
                          >agent</option>
                        </Select>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => remove(u.id)}
                          style={{
                            color: PALETTE.navyLight,
                            transition: "color 0.2s",
                          }}
                          className="hover:text-red-500"
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
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add User">
        <div className="space-y-3.5">
          <div>
            <Label className="text-[#0B2C5F] font-medium">
       
              Name
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                borderColor: PALETTE.blue,
                background: PALETTE.blueBg,
                color: PALETTE.navy,
                fontWeight: 500,
              }}
            />
          </div>
          <div>
            <Label className="text-[#0B2C5F] font-medium">
       
              Email
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                borderColor: PALETTE.blue,
                background: PALETTE.blueBg,
                color: PALETTE.navy,
                fontWeight: 500,
              }}
            />
          </div>
          <div>
            <Label className="text-[#0B2C5F] font-medium">
       
              Password
            </Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                borderColor: PALETTE.blue,
                background: PALETTE.blueBg,
                color: PALETTE.navy,
                fontWeight: 500,
              }}
            />
          </div>
          <div>
            <Label className="text-[#0B2C5F] font-medium">
       
              Role
            </Label>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                backgroundColor: PALETTE.blueBg,
                borderColor: PALETTE.blue,
                color: PALETTE.navy,
                fontWeight: 500,
              }}
            >
              <option
                value="admin"
                style={{
                  color: PALETTE.orange,
                  fontWeight: 600,
                  background: "#fff",
                }}
              >
                admin
              </option>
              <option
                value="agent"
                style={{
                  color: PALETTE.blue,
                  fontWeight: 600,
                  background: "#fff",
                }}
              >
                agent
              </option>
            </Select>
          </div>
          <div className="flex justify-end pt-1">
            <Button
              onClick={create}
              loading={submitting}
              disabled={!name || !email || !password}
              style={{
                background: `linear-gradient(90deg, ${PALETTE.blue} 60%, ${PALETTE.orange} 100%)`,
                color: "#fff",
                fontWeight: 600,
                letterSpacing: "0.01em",
              }}
            >
              Create User
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
