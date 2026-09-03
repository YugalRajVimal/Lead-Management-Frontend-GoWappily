"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import * as api from "@/lib/api-client";
import { ApiError } from "@/lib/api-client";
import { Lead, User } from "@/lib/types";
import { useToast } from "@/hooks/useToast";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(6, "Enter a valid phone number"),
  whatsapp: z.string().optional(),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  city: z.string().optional(),
  projectName: z.string().optional(),
  campaign: z.string().optional(),
  serviceInterested: z.string().optional(),
  requirement: z.string().optional(),
  expectedValue: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : Number(v))),
  status: z.string().optional(),
  priority: z.string().optional(),
  assignedTo: z.string().optional(),
  remarks: z.string().optional(),
  nextAction: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function EditLeadForm({
  lead,
  users,
  onSuccess,
  onCancel,
}: {
  lead: Lead;
  users: User[];
  onSuccess: (updated: Lead) => void;
  onCancel?: () => void;
}) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: lead.name,
      phone: lead.phone,
      whatsapp: lead.whatsapp || "",
      email: lead.email || "",
      city: lead.city || "",
      projectName: (lead as any).projectName || "",
      campaign: lead.campaign || "",
      serviceInterested: lead.serviceInterested || "",
      requirement: lead.requirement || "",
      expectedValue: typeof lead.expectedValue === "number" ? lead.expectedValue : undefined,
 
      status: lead.status,
      priority: lead.priority || "",
      assignedTo: lead.assignedTo || "",
      remarks: lead.remarks || "",
      nextAction: lead.nextAction || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const updated = await api.updateLead(lead._id, {
        name: data.name,
        phone: data.phone,
        whatsapp: data.whatsapp || null,
        email: data.email || null,
        city: data.city || null,
        projectName: data.projectName || null,
        campaign: data.campaign || null,
        serviceInterested: data.serviceInterested || null,
        requirement: data.requirement || null,
        expectedValue:
          data.expectedValue === undefined ? null : data.expectedValue,
        status: data.status as never,
        priority: (data.priority || null) as never,
        assignedTo: data.assignedTo || null,
        remarks: data.remarks || null,
        nextAction: data.nextAction || null,
      });
      toast("Lead updated");
      onSuccess(updated);
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        err.errors.forEach((e) =>
          setError(e.field as keyof FormData, { message: e.message })
        );
      } else {
        toast(err instanceof ApiError ? err.message : "Failed to update lead", "error");
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
          <Label>WhatsApp</Label>
          <Input {...register("whatsapp")} placeholder="98xxxxxxxx" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Email</Label>
          <Input {...register("email")} placeholder="name@example.com" />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Campaign</Label>
          <Input {...register("campaign")} placeholder="Campaign" />
        </div>
        <div>
          <Label>Service Interested</Label>
          <Input {...register("serviceInterested")} placeholder="Service" />
        </div>
      </div>
      <div>
        <Label>Requirement</Label>
        <Textarea rows={2} {...register("requirement")} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Status</Label>
          <Select {...register("status")}>
            {[
              "new",
              "not contacted",
              "call later",
              "pitched",
              "quotation send",
              "follow up",
              "converted",
              "lost",
              "junk"
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
     
        </div>
        <div>
          <Label>Priority</Label>
          <Select {...register("priority")}>
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
          <Select {...register("assignedTo")}>
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div>
        <Label>Expected Value</Label>
        <Input type="number" step="1" {...register("expectedValue")} placeholder="0" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label>Remarks</Label>
          <Textarea rows={2} {...register("remarks")} />
        </div>
        <div>
          <Label>Next Action</Label>
          <Textarea rows={2} {...register("nextAction")} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}