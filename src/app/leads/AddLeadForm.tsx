

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, Label } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import * as api from "@/lib/api-client";
import { ApiError } from "@/lib/api-client";
import { User } from "@/lib/types";
import { useToast } from "@/hooks/useToast";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(6, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  city: z.string().optional(),
  projectName: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  assignedTo: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function AddLeadForm({
  users,
  onSuccess,
}: {
  users: User[];
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await api.createLead({
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        city: data.city || null,
        projectName: data.projectName || null,
        status: (data.status || "new") as never,
        priority: (data.priority || null) as never,
        assignedTo: data.assignedTo || null,
      });
      toast("Lead created");
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        err.errors.forEach((e) =>
          setError(e.field as keyof FormData, { message: e.message })
        );
      } else {
        toast(err instanceof ApiError ? err.message : "Failed to create lead", "error");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
      <div>
        <Label>Name *</Label>
        <Input {...register("name")} placeholder="Full name" />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Phone *</Label>
          <Input {...register("phone")} placeholder="98xxxxxxxx" />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
        </div>
        <div>
          <Label>City</Label>
          <Input {...register("city")} placeholder="City" />
        </div>
      </div>
      <div>
        <Label>Project Name</Label>
        <Input {...register("projectName")} placeholder="e.g. Diwali Balloon Setup" />
      </div>
      <div>
        <Label>Email</Label>
        <Input {...register("email")} placeholder="name@example.com" />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Status</Label>
          <Select {...register("status")} defaultValue="new">
            {["new", "contacted", "follow_up", "qualified", "converted", "lost", "junk"].map(
              (s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              )
            )}
          </Select>
        </div>
        <div>
          <Label>Priority</Label>
          <Select {...register("priority")} defaultValue="">
            <option value="">None</option>
            {["low", "medium", "high"].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Assign to</Label>
          <Select {...register("assignedTo")} defaultValue="">
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" loading={isSubmitting}>
          Create Lead
        </Button>
      </div>
    </form>
  );
}