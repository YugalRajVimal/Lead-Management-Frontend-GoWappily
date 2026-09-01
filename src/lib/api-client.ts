import {
  ApiError,
  DashboardFollowUp,
  DashboardOverview,
  Lead,
  LeadNote,
  LeadsQuery,
  LeadsResponse,
  FollowUp,
  Notification,
  SheetSource,
  SourcePreviewResponse,
  User,
} from "./types";
import {
  MOCK_LEADS,
  MOCK_NOTIFICATIONS,
  MOCK_SOURCES,
  MOCK_USER,
  MOCK_USERS,
  buildMockFollowUps,
  buildMockOverview,
} from "./mock-data";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

const TOKEN_KEY = "gowappily_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

async function mockDelay<T>(value: T, ms = 400): Promise<T> {
  await new Promise((r) => setTimeout(r, ms));
  return value;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { message: text };
    }
  }

  if (!res.ok) {
    throw new ApiError(
      res.status,
      (body as { message: string; errors?: { field: string; message: string }[] }) || {
        message: "Request failed",
      }
    );
  }
  return body as T;
}

function qs(params: Record<string, unknown>): string {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") usp.set(k, String(v));
  });
  const s = usp.toString();
  return s ? `?${s}` : "";
}

// In-memory mutable mock store (persists for the session only)
const mockState = {
  leads: [...MOCK_LEADS],
  sources: [...MOCK_SOURCES],
  notifications: [...MOCK_NOTIFICATIONS],
  users: [...MOCK_USERS],
};

let idCounter = 10000;
const nextId = (prefix: string) => `${prefix}_${idCounter++}`;

// ---------------- Auth ----------------

export async function login(email: string, password: string) {
  if (USE_MOCK) {
    if (!email || !password) {
      throw new ApiError(401, { message: "Invalid credentials" });
    }
    return mockDelay({ token: "mock-jwt-token", user: MOCK_USER });
  }
  return request<{ token: string; user: User }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe() {
  if (USE_MOCK) return mockDelay(MOCK_USER, 150);
  return request<User>("/auth/me");
}

export async function logout() {
  if (USE_MOCK) return mockDelay({ message: "Logged out" }, 100);
  return request<{ message: string }>("/auth/logout", { method: "POST" });
}

// ---------------- Leads ----------------

export async function getLeads(query: LeadsQuery): Promise<LeadsResponse> {
  if (USE_MOCK) {
    let items = [...mockState.leads];
    if (query.status) items = items.filter((l) => l.status === query.status);
    if (query.priority) items = items.filter((l) => l.priority === query.priority);
    if (query.sourceSheetId)
      items = items.filter((l) => l.sourceSheetId === query.sourceSheetId);
    if (query.tag) items = items.filter((l) => l.tags.includes(query.tag!));
    if (query.assignedTo)
      items = items.filter((l) => l.assignedTo === query.assignedTo);
    if (query.search) {
      const s = query.search.toLowerCase();
      items = items.filter(
        (l) =>
          l.name.toLowerCase().includes(s) ||
          l.phone.includes(s) ||
          (l.email || "").toLowerCase().includes(s)
      );
    }
    if (query.dateFrom)
      items = items.filter((l) => l.createdAt >= query.dateFrom!);
    if (query.dateTo) items = items.filter((l) => l.createdAt <= query.dateTo!);

    const sortBy = query.sortBy || "createdAt";
    const dir = query.sortOrder === "asc" ? 1 : -1;
    items.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortBy];
      const bv = (b as unknown as Record<string, unknown>)[sortBy];
      if (av === bv) return 0;
      return av! > bv! ? dir : -dir;
    });

    const page = query.page || 1;
    const limit = query.limit || 20;
    const total = items.length;
    const start = (page - 1) * limit;
    const leads = items.slice(start, start + limit);
    return mockDelay({
      leads,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }
  return request<LeadsResponse>(`/leads${qs(query as Record<string, unknown>)}`);
}

export async function getLead(id: string): Promise<Lead> {
  if (USE_MOCK) {
    const lead = mockState.leads.find((l) => l._id === id);
    if (!lead) throw new ApiError(404, { message: "Lead not found" });
    return mockDelay(lead, 200);
  }
  return request<Lead>(`/leads/${id}`);
}

export async function createLead(
  data: Partial<Lead>
): Promise<Lead> {
  if (USE_MOCK) {
    const now = new Date().toISOString();
    const lead: Lead = {
      _id: nextId("lead"),
      name: data.name || "",
      phone: data.phone || "",
      whatsapp: data.whatsapp ?? null,
      email: data.email ?? null,
      city: data.city ?? null,
      projectName: data.projectName || "", // <-- Added to satisfy required property
      sourceSheetId: "",
      sourceSheetName: "Manual entry",
      sourceRowId: "",
      campaign: null,
      serviceInterested: null,
      requirement: null,
      status: data.status || "new",
      priority: data.priority ?? null,
      assignedTo: data.assignedTo ?? null,
      expectedValue: null,
      remarks: null,
      nextAction: null,
      originalDate: now,
      notes: [],
      followUps: [],
      tags: data.tags || [],
      createdAt: now,
      updatedAt: now,
    };
    mockState.leads.unshift(lead);
    return mockDelay(lead);
  }
  return request<Lead>("/leads", { method: "POST", body: JSON.stringify(data) });
}

export async function updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
  if (USE_MOCK) {
    const idx = mockState.leads.findIndex((l) => l._id === id);
    if (idx === -1) throw new ApiError(404, { message: "Lead not found" });
    mockState.leads[idx] = {
      ...mockState.leads[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockDelay(mockState.leads[idx]);
  }
  return request<Lead>(`/leads/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteLead(id: string): Promise<{ message: string }> {
  if (USE_MOCK) {
    mockState.leads = mockState.leads.filter((l) => l._id !== id);
    return mockDelay({ message: "Lead deleted" });
  }
  return request(`/leads/${id}`, { method: "DELETE" });
}

export async function addNote(leadId: string, text: string): Promise<LeadNote> {
  if (USE_MOCK) {
    const note: LeadNote = {
      _id: nextId("note"),
      text,
      createdBy: MOCK_USER.id,
      createdAt: new Date().toISOString(),
    };
    const lead = mockState.leads.find((l) => l._id === leadId);
    if (lead) lead.notes.unshift(note);
    return mockDelay(note);
  }
  return request<LeadNote>(`/leads/${leadId}/notes`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function deleteNote(leadId: string, noteId: string) {
  if (USE_MOCK) {
    const lead = mockState.leads.find((l) => l._id === leadId);
    if (lead) lead.notes = lead.notes.filter((n) => n._id !== noteId);
    return mockDelay({ message: "Note deleted" });
  }
  return request<{ message: string }>(`/leads/${leadId}/notes/${noteId}`, {
    method: "DELETE",
  });
}

export async function addFollowUp(
  leadId: string,
  data: { dueDate: string; note: string }
): Promise<FollowUp> {
  if (USE_MOCK) {
    const fu: FollowUp = {
      _id: nextId("fu"),
      dueDate: data.dueDate,
      note: data.note,
      status: "pending",
      reminderSent: false,
      createdAt: new Date().toISOString(),
    };
    const lead = mockState.leads.find((l) => l._id === leadId);
    if (lead) lead.followUps.unshift(fu);
    return mockDelay(fu);
  }
  return request<FollowUp>(`/leads/${leadId}/follow-ups`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateFollowUp(
  leadId: string,
  followUpId: string,
  data: Partial<Pick<FollowUp, "status" | "note" | "dueDate">>
): Promise<FollowUp> {
  if (USE_MOCK) {
    const lead = mockState.leads.find((l) => l._id === leadId);
    const fu = lead?.followUps.find((f) => f._id === followUpId);
    if (!fu) throw new ApiError(404, { message: "Follow-up not found" });
    Object.assign(fu, data);
    return mockDelay(fu);
  }
  return request<FollowUp>(`/leads/${leadId}/follow-ups/${followUpId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteFollowUp(leadId: string, followUpId: string) {
  if (USE_MOCK) {
    const lead = mockState.leads.find((l) => l._id === leadId);
    if (lead) lead.followUps = lead.followUps.filter((f) => f._id !== followUpId);
    return mockDelay({ message: "Follow-up deleted" });
  }
  return request<{ message: string }>(
    `/leads/${leadId}/follow-ups/${followUpId}`,
    { method: "DELETE" }
  );
}

// ---------------- Sources ----------------

export async function getSources(params: {
  tag?: string;
  status?: string;
}): Promise<{ sources: SheetSource[] }> {
  if (USE_MOCK) {
    let items = [...mockState.sources];
    if (params.tag) items = items.filter((s) => s.tags.includes(params.tag!));
    if (params.status) items = items.filter((s) => s.status === params.status);
    return mockDelay({ sources: items });
  }
  return request(`/sources${qs(params)}`);
}

export async function getSource(id: string): Promise<SheetSource> {
  if (USE_MOCK) {
    const s = mockState.sources.find((s) => s._id === id);
    if (!s) throw new ApiError(404, { message: "Source not found" });
    return mockDelay(s, 200);
  }
  return request<SheetSource>(`/sources/${id}`);
}

export async function previewSource(sheetUrl: string): Promise<SourcePreviewResponse> {
  if (USE_MOCK) {
    if (!sheetUrl.includes("docs.google.com/spreadsheets")) {
      throw new ApiError(400, {
        message:
          'Sheet not accessible — make sure link sharing is set to "Anyone with the link"',
      });
    }
    const headers = [
      "Date", "Priority", "Lead Name", "City", "Phone", "WhatsApp", "Email",
      "Source", "Campaign", "Service Interested", "Requirement", "Lead Status",
      "Assigned To", "Follow-up Date", "Last Follow-up", "Next Action",
      "Expected Value", "Remarks",
    ];
    return mockDelay({
      headers,
      sampleRows: [
        {
          Date: "2026-08-01", Priority: "High", "Lead Name": "Sample Lead",
          City: "Meerut", Phone: "9876543210", WhatsApp: "9876543210",
          Email: "sample@lead.com", Source: "Facebook", Campaign: "Diwali Offer",
          "Service Interested": "Balloon Decoration", Requirement: "100 guests",
          "Lead Status": "New", "Assigned To": "Priya", "Follow-up Date": "2026-08-05",
          "Last Follow-up": "", "Next Action": "Send quote", "Expected Value": "25000",
          Remarks: "",
        },
      ],
      detectedMapping: {
        date: "Date", priority: "Priority", name: "Lead Name", city: "City",
        phone: "Phone", whatsapp: "WhatsApp", email: "Email", source: "Source",
        campaign: "Campaign", serviceInterested: "Service Interested",
        requirement: "Requirement", leadStatus: "Lead Status",
        assignedTo: "Assigned To", followUpDate: "Follow-up Date",
        lastFollowUp: "Last Follow-up", nextAction: "Next Action",
        expectedValue: "Expected Value", remarks: "Remarks",
      },
    }, 700);
  }
  return request<SourcePreviewResponse>("/sources/preview", {
    method: "POST",
    body: JSON.stringify({ sheetUrl }),
  });
}

export async function createSource(data: {
  name: string;
  sheetUrl: string;
  tags: string[];
  columnMapping: SheetSource["columnMapping"];
  syncIntervalMinutes?: number;
}): Promise<SheetSource> {
  if (USE_MOCK) {
    const now = new Date().toISOString();
    const idMatch = data.sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const source: SheetSource = {
      _id: nextId("source"),
      name: data.name,
      sheetUrl: data.sheetUrl,
      sheetId: idMatch ? idMatch[1] : "unknown",
      gid: "0",
      tags: data.tags,
      status: "active",
      lastSyncAt: null,
      lastSyncStatus: "never_synced",
      lastSyncError: null,
      rowsImported: 0,
      columnMapping: data.columnMapping,
      syncIntervalMinutes: data.syncIntervalMinutes || 30,
      createdBy: MOCK_USER.id,
      createdAt: now,
      updatedAt: now,
    };
    mockState.sources.unshift(source);
    setTimeout(() => {
      source.lastSyncAt = new Date().toISOString();
      source.lastSyncStatus = "success";
      source.rowsImported = Math.floor(10 + Math.random() * 50);
    }, 2000);
    return mockDelay(source);
  }
  return request<SheetSource>("/sources", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSource(
  id: string,
  data: Partial<
    Pick<SheetSource, "name" | "tags" | "columnMapping" | "syncIntervalMinutes" | "status">
  >
): Promise<SheetSource> {
  if (USE_MOCK) {
    const idx = mockState.sources.findIndex((s) => s._id === id);
    if (idx === -1) throw new ApiError(404, { message: "Source not found" });
    mockState.sources[idx] = {
      ...mockState.sources[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockDelay(mockState.sources[idx]);
  }
  return request<SheetSource>(`/sources/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteSource(id: string) {
  if (USE_MOCK) {
    mockState.sources = mockState.sources.filter((s) => s._id !== id);
    return mockDelay({ message: "Source deleted" });
  }
  return request<{ message: string }>(`/sources/${id}`, { method: "DELETE" });
}

export async function syncSourceNow(id: string) {
  if (USE_MOCK) {
    const source = mockState.sources.find((s) => s._id === id);
    setTimeout(() => {
      if (source) {
        source.lastSyncAt = new Date().toISOString();
        source.lastSyncStatus = "success";
        source.rowsImported += Math.floor(1 + Math.random() * 5);
      }
    }, 1500);
    return mockDelay({ message: "Sync started" });
  }
  return request<{ message: string }>(`/sources/${id}/sync-now`, {
    method: "POST",
  });
}

// ---------------- Dashboard ----------------

export async function getDashboardOverview(): Promise<DashboardOverview> {
  if (USE_MOCK) return mockDelay(buildMockOverview(), 500);
  return request<DashboardOverview>("/dashboard/overview");
}

export async function getDashboardFollowUps(
  type: "today" | "missed" | "upcoming"
): Promise<{ followUps: DashboardFollowUp[] }> {
  if (USE_MOCK)
    return mockDelay({ followUps: buildMockFollowUps(type) }, 300);
  return request(`/dashboard/follow-ups${qs({ type })}`);
}

// ---------------- Users ----------------

export async function getUsers(): Promise<{ users: User[] }> {
  if (USE_MOCK) return mockDelay({ users: mockState.users });
  return request<{ users: User[] }>("/users");
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<User> {
  if (USE_MOCK) {
    const user: User = {
      id: nextId("user"),
      name: data.name,
      email: data.email,
      role: data.role as User["role"],
    };
    mockState.users.push(user);
    return mockDelay(user);
  }
  return request<User>("/users", { method: "POST", body: JSON.stringify(data) });
}

export async function updateUser(
  id: string,
  data: Partial<{ name: string; email: string; role: string }>
): Promise<User> {
  if (USE_MOCK) {
    const idx = mockState.users.findIndex((u) => u.id === id);
    if (idx === -1) throw new ApiError(404, { message: "User not found" });
    mockState.users[idx] = { ...mockState.users[idx], ...data } as User;
    return mockDelay(mockState.users[idx]);
  }
  return request<User>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: string) {
  if (USE_MOCK) {
    mockState.users = mockState.users.filter((u) => u.id !== id);
    return mockDelay({ message: "User deleted" });
  }
  return request<{ message: string }>(`/users/${id}`, { method: "DELETE" });
}

// ---------------- Notifications ----------------

export async function getNotifications(): Promise<{
  notifications: Notification[];
}> {
  if (USE_MOCK) return mockDelay({ notifications: mockState.notifications });
  return request("/notifications");
}

export async function markNotificationRead(id: string) {
  if (USE_MOCK) {
    const n = mockState.notifications.find((n) => n._id === id);
    if (n) n.read = true;
    return mockDelay({ message: "Marked read" });
  }
  return request<{ message: string }>(`/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export { ApiError };
