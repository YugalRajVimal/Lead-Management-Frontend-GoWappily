// // // // import {
// // // //   ApiError,
// // // //   DashboardFollowUp,
// // // //   DashboardOverview,
// // // //   Lead,
// // // //   LeadNote,
// // // //   LeadsQuery,
// // // //   LeadsResponse,
// // // //   FollowUp,
// // // //   Notification,
// // // //   SheetSource,
// // // //   SourcePreviewResponse,
// // // //   User,
// // // // } from "./types";
// // // // import {
// // // //   MOCK_LEADS,
// // // //   MOCK_NOTIFICATIONS,
// // // //   MOCK_SOURCES,
// // // //   MOCK_USER,
// // // //   MOCK_USERS,
// // // //   buildMockFollowUps,
// // // //   buildMockOverview,
// // // // } from "./mock-data";

// // // // const API_BASE_URL =
// // // //   process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
// // // // const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

// // // // const TOKEN_KEY = "gowappily_token";

// // // // export function getToken(): string | null {
// // // //   if (typeof window === "undefined") return null;
// // // //   return localStorage.getItem(TOKEN_KEY);
// // // // }

// // // // export function setToken(token: string) {
// // // //   if (typeof window === "undefined") return;
// // // //   localStorage.setItem(TOKEN_KEY, token);
// // // // }

// // // // export function clearToken() {
// // // //   if (typeof window === "undefined") return;
// // // //   localStorage.removeItem(TOKEN_KEY);
// // // // }

// // // // async function mockDelay<T>(value: T, ms = 400): Promise<T> {
// // // //   await new Promise((r) => setTimeout(r, ms));
// // // //   return value;
// // // // }

// // // // async function request<T>(
// // // //   path: string,
// // // //   options: RequestInit = {}
// // // // ): Promise<T> {
// // // //   const token = getToken();
// // // //   const res = await fetch(`${API_BASE_URL}${path}`, {
// // // //     ...options,
// // // //     headers: {
// // // //       "Content-Type": "application/json",
// // // //       ...(token ? { Authorization: `Bearer ${token}` } : {}),
// // // //       ...(options.headers || {}),
// // // //     },
// // // //   });

// // // //   let body: unknown = null;
// // // //   const text = await res.text();
// // // //   if (text) {
// // // //     try {
// // // //       body = JSON.parse(text);
// // // //     } catch {
// // // //       body = { message: text };
// // // //     }
// // // //   }

// // // //   if (!res.ok) {
// // // //     throw new ApiError(
// // // //       res.status,
// // // //       (body as { message: string; errors?: { field: string; message: string }[] }) || {
// // // //         message: "Request failed",
// // // //       }
// // // //     );
// // // //   }
// // // //   return body as T;
// // // // }

// // // // function qs(params: Record<string, unknown>): string {
// // // //   const usp = new URLSearchParams();
// // // //   Object.entries(params).forEach(([k, v]) => {
// // // //     if (v !== undefined && v !== null && v !== "") usp.set(k, String(v));
// // // //   });
// // // //   const s = usp.toString();
// // // //   return s ? `?${s}` : "";
// // // // }

// // // // // In-memory mutable mock store (persists for the session only)
// // // // const mockState = {
// // // //   leads: [...MOCK_LEADS],
// // // //   sources: [...MOCK_SOURCES],
// // // //   notifications: [...MOCK_NOTIFICATIONS],
// // // //   users: [...MOCK_USERS],
// // // // };

// // // // let idCounter = 10000;
// // // // const nextId = (prefix: string) => `${prefix}_${idCounter++}`;

// // // // // ---------------- Auth ----------------

// // // // export async function login(email: string, password: string) {
// // // //   if (USE_MOCK) {
// // // //     if (!email || !password) {
// // // //       throw new ApiError(401, { message: "Invalid credentials" });
// // // //     }
// // // //     return mockDelay({ token: "mock-jwt-token", user: MOCK_USER });
// // // //   }
// // // //   return request<{ token: string; user: User }>("/auth/login", {
// // // //     method: "POST",
// // // //     body: JSON.stringify({ email, password }),
// // // //   });
// // // // }

// // // // export async function getMe() {
// // // //   if (USE_MOCK) return mockDelay(MOCK_USER, 150);
// // // //   return request<User>("/auth/me");
// // // // }

// // // // export async function logout() {
// // // //   if (USE_MOCK) return mockDelay({ message: "Logged out" }, 100);
// // // //   return request<{ message: string }>("/auth/logout", { method: "POST" });
// // // // }

// // // // // ---------------- Leads ----------------

// // // // export async function getLeads(query: LeadsQuery): Promise<LeadsResponse> {
// // // //   if (USE_MOCK) {
// // // //     let items = [...mockState.leads];
// // // //     if (query.status) items = items.filter((l) => l.status === query.status);
// // // //     if (query.priority) items = items.filter((l) => l.priority === query.priority);
// // // //     if (query.sourceSheetId)
// // // //       items = items.filter((l) => l.sourceSheetId === query.sourceSheetId);
// // // //     if (query.tag) items = items.filter((l) => l.tags.includes(query.tag!));
// // // //     if (query.assignedTo)
// // // //       items = items.filter((l) => l.assignedTo === query.assignedTo);
// // // //     if (query.search) {
// // // //       const s = query.search.toLowerCase();
// // // //       items = items.filter(
// // // //         (l) =>
// // // //           l.name.toLowerCase().includes(s) ||
// // // //           l.phone.includes(s) ||
// // // //           (l.email || "").toLowerCase().includes(s)
// // // //       );
// // // //     }
// // // //     if (query.dateFrom)
// // // //       items = items.filter((l) => l.createdAt >= query.dateFrom!);
// // // //     if (query.dateTo) items = items.filter((l) => l.createdAt <= query.dateTo!);

// // // //     const sortBy = query.sortBy || "createdAt";
// // // //     const dir = query.sortOrder === "asc" ? 1 : -1;
// // // //     items.sort((a, b) => {
// // // //       const av = (a as unknown as Record<string, unknown>)[sortBy];
// // // //       const bv = (b as unknown as Record<string, unknown>)[sortBy];
// // // //       if (av === bv) return 0;
// // // //       return av! > bv! ? dir : -dir;
// // // //     });

// // // //     const page = query.page || 1;
// // // //     const limit = query.limit || 20;
// // // //     const total = items.length;
// // // //     const start = (page - 1) * limit;
// // // //     const leads = items.slice(start, start + limit);
// // // //     return mockDelay({
// // // //       leads,
// // // //       pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
// // // //     });
// // // //   }
// // // //   return request<LeadsResponse>(`/leads${qs(query as Record<string, unknown>)}`);
// // // // }

// // // // export async function getLead(id: string): Promise<Lead> {
// // // //   if (USE_MOCK) {
// // // //     const lead = mockState.leads.find((l) => l._id === id);
// // // //     if (!lead) throw new ApiError(404, { message: "Lead not found" });
// // // //     return mockDelay(lead, 200);
// // // //   }
// // // //   return request<Lead>(`/leads/${id}`);
// // // // }

// // // // export async function createLead(
// // // //   data: Partial<Lead>
// // // // ): Promise<Lead> {
// // // //   if (USE_MOCK) {
// // // //     const now = new Date().toISOString();
// // // //     const lead: Lead = {
// // // //       _id: nextId("lead"),
// // // //       name: data.name || "",
// // // //       phone: data.phone || "",
// // // //       whatsapp: data.whatsapp ?? null,
// // // //       email: data.email ?? null,
// // // //       city: data.city ?? null,
// // // //       projectName: data.projectName || "", // <-- Added to satisfy required property
// // // //       sourceSheetId: "",
// // // //       sourceSheetName: "Manual entry",
// // // //       sourceRowId: "",
// // // //       campaign: null,
// // // //       serviceInterested: null,
// // // //       requirement: null,
// // // //       status: data.status || "new",
// // // //       priority: data.priority ?? null,
// // // //       assignedTo: data.assignedTo ?? null,
// // // //       expectedValue: null,
// // // //       remarks: null,
// // // //       nextAction: null,
// // // //       originalDate: now,
// // // //       notes: [],
// // // //       followUps: [],
// // // //       tags: data.tags || [],
// // // //       createdAt: now,
// // // //       updatedAt: now,
// // // //     };
// // // //     mockState.leads.unshift(lead);
// // // //     return mockDelay(lead);
// // // //   }
// // // //   return request<Lead>("/leads", { method: "POST", body: JSON.stringify(data) });
// // // // }

// // // // export async function updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
// // // //   if (USE_MOCK) {
// // // //     const idx = mockState.leads.findIndex((l) => l._id === id);
// // // //     if (idx === -1) throw new ApiError(404, { message: "Lead not found" });
// // // //     mockState.leads[idx] = {
// // // //       ...mockState.leads[idx],
// // // //       ...data,
// // // //       updatedAt: new Date().toISOString(),
// // // //     };
// // // //     return mockDelay(mockState.leads[idx]);
// // // //   }
// // // //   return request<Lead>(`/leads/${id}`, {
// // // //     method: "PATCH",
// // // //     body: JSON.stringify(data),
// // // //   });
// // // // }

// // // // export async function deleteLead(id: string): Promise<{ message: string }> {
// // // //   if (USE_MOCK) {
// // // //     mockState.leads = mockState.leads.filter((l) => l._id !== id);
// // // //     return mockDelay({ message: "Lead deleted" });
// // // //   }
// // // //   return request(`/leads/${id}`, { method: "DELETE" });
// // // // }

// // // // export async function addNote(leadId: string, text: string): Promise<LeadNote> {
// // // //   if (USE_MOCK) {
// // // //     const note: LeadNote = {
// // // //       _id: nextId("note"),
// // // //       text,
// // // //       createdBy: MOCK_USER.id,
// // // //       createdAt: new Date().toISOString(),
// // // //     };
// // // //     const lead = mockState.leads.find((l) => l._id === leadId);
// // // //     if (lead) lead.notes.unshift(note);
// // // //     return mockDelay(note);
// // // //   }
// // // //   return request<LeadNote>(`/leads/${leadId}/notes`, {
// // // //     method: "POST",
// // // //     body: JSON.stringify({ text }),
// // // //   });
// // // // }

// // // // export async function deleteNote(leadId: string, noteId: string) {
// // // //   if (USE_MOCK) {
// // // //     const lead = mockState.leads.find((l) => l._id === leadId);
// // // //     if (lead) lead.notes = lead.notes.filter((n) => n._id !== noteId);
// // // //     return mockDelay({ message: "Note deleted" });
// // // //   }
// // // //   return request<{ message: string }>(`/leads/${leadId}/notes/${noteId}`, {
// // // //     method: "DELETE",
// // // //   });
// // // // }

// // // // export async function addFollowUp(
// // // //   leadId: string,
// // // //   data: { dueDate: string; note: string }
// // // // ): Promise<FollowUp> {
// // // //   if (USE_MOCK) {
// // // //     const fu: FollowUp = {
// // // //       _id: nextId("fu"),
// // // //       dueDate: data.dueDate,
// // // //       note: data.note,
// // // //       status: "pending",
// // // //       reminderSent: false,
// // // //       createdAt: new Date().toISOString(),
// // // //     };
// // // //     const lead = mockState.leads.find((l) => l._id === leadId);
// // // //     if (lead) lead.followUps.unshift(fu);
// // // //     return mockDelay(fu);
// // // //   }
// // // //   return request<FollowUp>(`/leads/${leadId}/follow-ups`, {
// // // //     method: "POST",
// // // //     body: JSON.stringify(data),
// // // //   });
// // // // }

// // // // export async function updateFollowUp(
// // // //   leadId: string,
// // // //   followUpId: string,
// // // //   data: Partial<Pick<FollowUp, "status" | "note" | "dueDate">>
// // // // ): Promise<FollowUp> {
// // // //   if (USE_MOCK) {
// // // //     const lead = mockState.leads.find((l) => l._id === leadId);
// // // //     const fu = lead?.followUps.find((f) => f._id === followUpId);
// // // //     if (!fu) throw new ApiError(404, { message: "Follow-up not found" });
// // // //     Object.assign(fu, data);
// // // //     return mockDelay(fu);
// // // //   }
// // // //   return request<FollowUp>(`/leads/${leadId}/follow-ups/${followUpId}`, {
// // // //     method: "PATCH",
// // // //     body: JSON.stringify(data),
// // // //   });
// // // // }

// // // // export async function deleteFollowUp(leadId: string, followUpId: string) {
// // // //   if (USE_MOCK) {
// // // //     const lead = mockState.leads.find((l) => l._id === leadId);
// // // //     if (lead) lead.followUps = lead.followUps.filter((f) => f._id !== followUpId);
// // // //     return mockDelay({ message: "Follow-up deleted" });
// // // //   }
// // // //   return request<{ message: string }>(
// // // //     `/leads/${leadId}/follow-ups/${followUpId}`,
// // // //     { method: "DELETE" }
// // // //   );
// // // // }

// // // // // ---------------- Sources ----------------

// // // // export async function getSources(params: {
// // // //   tag?: string;
// // // //   status?: string;
// // // // }): Promise<{ sources: SheetSource[] }> {
// // // //   if (USE_MOCK) {
// // // //     let items = [...mockState.sources];
// // // //     if (params.tag) items = items.filter((s) => s.tags.includes(params.tag!));
// // // //     if (params.status) items = items.filter((s) => s.status === params.status);
// // // //     return mockDelay({ sources: items });
// // // //   }
// // // //   return request(`/sources${qs(params)}`);
// // // // }

// // // // export async function getSource(id: string): Promise<SheetSource> {
// // // //   if (USE_MOCK) {
// // // //     const s = mockState.sources.find((s) => s._id === id);
// // // //     if (!s) throw new ApiError(404, { message: "Source not found" });
// // // //     return mockDelay(s, 200);
// // // //   }
// // // //   return request<SheetSource>(`/sources/${id}`);
// // // // }

// // // // export async function previewSource(sheetUrl: string): Promise<SourcePreviewResponse> {
// // // //   if (USE_MOCK) {
// // // //     if (!sheetUrl.includes("docs.google.com/spreadsheets")) {
// // // //       throw new ApiError(400, {
// // // //         message:
// // // //           'Sheet not accessible — make sure link sharing is set to "Anyone with the link"',
// // // //       });
// // // //     }
// // // //     const headers = [
// // // //       "Date", "Priority", "Lead Name", "City", "Phone", "WhatsApp", "Email",
// // // //       "Source", "Campaign", "Service Interested", "Requirement", "Lead Status",
// // // //       "Assigned To", "Follow-up Date", "Last Follow-up", "Next Action",
// // // //       "Expected Value", "Remarks",
// // // //     ];
// // // //     return mockDelay({
// // // //       headers,
// // // //       sampleRows: [
// // // //         {
// // // //           Date: "2026-08-01", Priority: "High", "Lead Name": "Sample Lead",
// // // //           City: "Meerut", Phone: "9876543210", WhatsApp: "9876543210",
// // // //           Email: "sample@lead.com", Source: "Facebook", Campaign: "Diwali Offer",
// // // //           "Service Interested": "Balloon Decoration", Requirement: "100 guests",
// // // //           "Lead Status": "New", "Assigned To": "Priya", "Follow-up Date": "2026-08-05",
// // // //           "Last Follow-up": "", "Next Action": "Send quote", "Expected Value": "25000",
// // // //           Remarks: "",
// // // //         },
// // // //       ],
// // // //       detectedMapping: {
// // // //         date: "Date", priority: "Priority", name: "Lead Name", city: "City",
// // // //         phone: "Phone", whatsapp: "WhatsApp", email: "Email", source: "Source",
// // // //         campaign: "Campaign", serviceInterested: "Service Interested",
// // // //         requirement: "Requirement", leadStatus: "Lead Status",
// // // //         assignedTo: "Assigned To", followUpDate: "Follow-up Date",
// // // //         lastFollowUp: "Last Follow-up", nextAction: "Next Action",
// // // //         expectedValue: "Expected Value", remarks: "Remarks",
// // // //       },
// // // //     }, 700);
// // // //   }
// // // //   return request<SourcePreviewResponse>("/sources/preview", {
// // // //     method: "POST",
// // // //     body: JSON.stringify({ sheetUrl }),
// // // //   });
// // // // }

// // // // export async function createSource(data: {
// // // //   name: string;
// // // //   sheetUrl: string;
// // // //   tags: string[];
// // // //   columnMapping: SheetSource["columnMapping"];
// // // //   syncIntervalMinutes?: number;
// // // // }): Promise<SheetSource> {
// // // //   if (USE_MOCK) {
// // // //     const now = new Date().toISOString();
// // // //     const idMatch = data.sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
// // // //     const source: SheetSource = {
// // // //       _id: nextId("source"),
// // // //       name: data.name,
// // // //       sheetUrl: data.sheetUrl,
// // // //       sheetId: idMatch ? idMatch[1] : "unknown",
// // // //       gid: "0",
// // // //       tags: data.tags,
// // // //       status: "active",
// // // //       lastSyncAt: null,
// // // //       lastSyncStatus: "never_synced",
// // // //       lastSyncError: null,
// // // //       rowsImported: 0,
// // // //       columnMapping: data.columnMapping,
// // // //       syncIntervalMinutes: data.syncIntervalMinutes || 30,
// // // //       createdBy: MOCK_USER.id,
// // // //       createdAt: now,
// // // //       updatedAt: now,
// // // //     };
// // // //     mockState.sources.unshift(source);
// // // //     setTimeout(() => {
// // // //       source.lastSyncAt = new Date().toISOString();
// // // //       source.lastSyncStatus = "success";
// // // //       source.rowsImported = Math.floor(10 + Math.random() * 50);
// // // //     }, 2000);
// // // //     return mockDelay(source);
// // // //   }
// // // //   return request<SheetSource>("/sources", {
// // // //     method: "POST",
// // // //     body: JSON.stringify(data),
// // // //   });
// // // // }

// // // // export async function updateSource(
// // // //   id: string,
// // // //   data: Partial<
// // // //     Pick<SheetSource, "name" | "tags" | "columnMapping" | "syncIntervalMinutes" | "status">
// // // //   >
// // // // ): Promise<SheetSource> {
// // // //   if (USE_MOCK) {
// // // //     const idx = mockState.sources.findIndex((s) => s._id === id);
// // // //     if (idx === -1) throw new ApiError(404, { message: "Source not found" });
// // // //     mockState.sources[idx] = {
// // // //       ...mockState.sources[idx],
// // // //       ...data,
// // // //       updatedAt: new Date().toISOString(),
// // // //     };
// // // //     return mockDelay(mockState.sources[idx]);
// // // //   }
// // // //   return request<SheetSource>(`/sources/${id}`, {
// // // //     method: "PATCH",
// // // //     body: JSON.stringify(data),
// // // //   });
// // // // }

// // // // export async function deleteSource(id: string) {
// // // //   if (USE_MOCK) {
// // // //     mockState.sources = mockState.sources.filter((s) => s._id !== id);
// // // //     return mockDelay({ message: "Source deleted" });
// // // //   }
// // // //   return request<{ message: string }>(`/sources/${id}`, { method: "DELETE" });
// // // // }

// // // // export async function syncSourceNow(id: string) {
// // // //   if (USE_MOCK) {
// // // //     const source = mockState.sources.find((s) => s._id === id);
// // // //     setTimeout(() => {
// // // //       if (source) {
// // // //         source.lastSyncAt = new Date().toISOString();
// // // //         source.lastSyncStatus = "success";
// // // //         source.rowsImported += Math.floor(1 + Math.random() * 5);
// // // //       }
// // // //     }, 1500);
// // // //     return mockDelay({ message: "Sync started" });
// // // //   }
// // // //   return request<{ message: string }>(`/sources/${id}/sync-now`, {
// // // //     method: "POST",
// // // //   });
// // // // }

// // // // // ---------------- Dashboard ----------------

// // // // export async function getDashboardOverview(): Promise<DashboardOverview> {
// // // //   if (USE_MOCK) return mockDelay(buildMockOverview(), 500);
// // // //   return request<DashboardOverview>("/dashboard/overview");
// // // // }

// // // // export async function getDashboardFollowUps(
// // // //   type: "today" | "missed" | "upcoming"
// // // // ): Promise<{ followUps: DashboardFollowUp[] }> {
// // // //   if (USE_MOCK)
// // // //     return mockDelay({ followUps: buildMockFollowUps(type) }, 300);
// // // //   return request(`/dashboard/follow-ups${qs({ type })}`);
// // // // }

// // // // // ---------------- Users ----------------

// // // // export async function getUsers(): Promise<{ users: User[] }> {
// // // //   if (USE_MOCK) return mockDelay({ users: mockState.users });
// // // //   return request<{ users: User[] }>("/users");
// // // // }

// // // // export async function createUser(data: {
// // // //   name: string;
// // // //   email: string;
// // // //   password: string;
// // // //   role: string;
// // // // }): Promise<User> {
// // // //   if (USE_MOCK) {
// // // //     const user: User = {
// // // //       id: nextId("user"),
// // // //       name: data.name,
// // // //       email: data.email,
// // // //       role: data.role as User["role"],
// // // //     };
// // // //     mockState.users.push(user);
// // // //     return mockDelay(user);
// // // //   }
// // // //   return request<User>("/users", { method: "POST", body: JSON.stringify(data) });
// // // // }

// // // // export async function updateUser(
// // // //   id: string,
// // // //   data: Partial<{ name: string; email: string; role: string }>
// // // // ): Promise<User> {
// // // //   if (USE_MOCK) {
// // // //     const idx = mockState.users.findIndex((u) => u.id === id);
// // // //     if (idx === -1) throw new ApiError(404, { message: "User not found" });
// // // //     mockState.users[idx] = { ...mockState.users[idx], ...data } as User;
// // // //     return mockDelay(mockState.users[idx]);
// // // //   }
// // // //   return request<User>(`/users/${id}`, {
// // // //     method: "PATCH",
// // // //     body: JSON.stringify(data),
// // // //   });
// // // // }

// // // // export async function deleteUser(id: string) {
// // // //   if (USE_MOCK) {
// // // //     mockState.users = mockState.users.filter((u) => u.id !== id);
// // // //     return mockDelay({ message: "User deleted" });
// // // //   }
// // // //   return request<{ message: string }>(`/users/${id}`, { method: "DELETE" });
// // // // }

// // // // // ---------------- Notifications ----------------

// // // // export async function getNotifications(): Promise<{
// // // //   notifications: Notification[];
// // // // }> {
// // // //   if (USE_MOCK) return mockDelay({ notifications: mockState.notifications });
// // // //   return request("/notifications");
// // // // }

// // // // export async function markNotificationRead(id: string) {
// // // //   if (USE_MOCK) {
// // // //     const n = mockState.notifications.find((n) => n._id === id);
// // // //     if (n) n.read = true;
// // // //     return mockDelay({ message: "Marked read" });
// // // //   }
// // // //   return request<{ message: string }>(`/notifications/${id}/read`, {
// // // //     method: "PATCH",
// // // //   });
// // // // }

// // // // export { ApiError };


// // // import {
// // //   ApiError,
// // //   DashboardFollowUp,
// // //   DashboardOverview,
// // //   Lead,
// // //   LeadNote,
// // //   LeadsQuery,
// // //   LeadsResponse,
// // //   FollowUp,
// // //   Notification,
// // //   SheetSource,
// // //   SourcePreviewResponse,
// // //   User,
// // //   Project,
// // //   ProjectsQuery,
// // //   ProjectsResponse,
// // //   DocLink,
// // // } from "./types";
// // // import {
// // //   MOCK_LEADS,
// // //   MOCK_NOTIFICATIONS,
// // //   MOCK_PROJECTS,
// // //   MOCK_SOURCES,
// // //   MOCK_USER,
// // //   MOCK_USERS,
// // //   buildMockFollowUps,
// // //   buildMockOverview,
// // // } from "./mock-data";

// // // const API_BASE_URL =
// // //   process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
// // // const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

// // // const TOKEN_KEY = "gowappily_token";

// // // export function getToken(): string | null {
// // //   if (typeof window === "undefined") return null;
// // //   return localStorage.getItem(TOKEN_KEY);
// // // }

// // // export function setToken(token: string) {
// // //   if (typeof window === "undefined") return;
// // //   localStorage.setItem(TOKEN_KEY, token);
// // // }

// // // export function clearToken() {
// // //   if (typeof window === "undefined") return;
// // //   localStorage.removeItem(TOKEN_KEY);
// // // }

// // // async function mockDelay<T>(value: T, ms = 400): Promise<T> {
// // //   await new Promise((r) => setTimeout(r, ms));
// // //   return value;
// // // }

// // // async function request<T>(
// // //   path: string,
// // //   options: RequestInit = {}
// // // ): Promise<T> {
// // //   const token = getToken();
// // //   const res = await fetch(`${API_BASE_URL}${path}`, {
// // //     ...options,
// // //     headers: {
// // //       "Content-Type": "application/json",
// // //       ...(token ? { Authorization: `Bearer ${token}` } : {}),
// // //       ...(options.headers || {}),
// // //     },
// // //   });

// // //   let body: unknown = null;
// // //   const text = await res.text();
// // //   if (text) {
// // //     try {
// // //       body = JSON.parse(text);
// // //     } catch {
// // //       body = { message: text };
// // //     }
// // //   }

// // //   if (!res.ok) {
// // //     throw new ApiError(
// // //       res.status,
// // //       (body as { message: string; errors?: { field: string; message: string }[] }) || {
// // //         message: "Request failed",
// // //       }
// // //     );
// // //   }
// // //   return body as T;
// // // }

// // // function qs(params: Record<string, unknown>): string {
// // //   const usp = new URLSearchParams();
// // //   Object.entries(params).forEach(([k, v]) => {
// // //     if (v !== undefined && v !== null && v !== "") usp.set(k, String(v));
// // //   });
// // //   const s = usp.toString();
// // //   return s ? `?${s}` : "";
// // // }

// // // // In-memory mutable mock store (persists for the session only)
// // // const mockState = {
// // //   leads: [...MOCK_LEADS],
// // //   sources: [...MOCK_SOURCES],
// // //   notifications: [...MOCK_NOTIFICATIONS],
// // //   users: [...MOCK_USERS],
// // //   projects: [...MOCK_PROJECTS],
// // // };

// // // let idCounter = 10000;
// // // const nextId = (prefix: string) => `${prefix}_${idCounter++}`;

// // // // ---------------- Auth ----------------

// // // export async function login(email: string, password: string) {
// // //   if (USE_MOCK) {
// // //     if (!email || !password) {
// // //       throw new ApiError(401, { message: "Invalid credentials" });
// // //     }
// // //     return mockDelay({ token: "mock-jwt-token", user: MOCK_USER });
// // //   }
// // //   return request<{ token: string; user: User }>("/auth/login", {
// // //     method: "POST",
// // //     body: JSON.stringify({ email, password }),
// // //   });
// // // }

// // // export async function getMe() {
// // //   if (USE_MOCK) return mockDelay(MOCK_USER, 150);
// // //   return request<User>("/auth/me");
// // // }

// // // export async function logout() {
// // //   if (USE_MOCK) return mockDelay({ message: "Logged out" }, 100);
// // //   return request<{ message: string }>("/auth/logout", { method: "POST" });
// // // }

// // // // ---------------- Leads ----------------

// // // export async function getLeads(query: LeadsQuery): Promise<LeadsResponse> {
// // //   if (USE_MOCK) {
// // //     let items = [...mockState.leads];
// // //     if (query.status) items = items.filter((l) => l.status === query.status);
// // //     if (query.priority) items = items.filter((l) => l.priority === query.priority);
// // //     if (query.sourceSheetId)
// // //       items = items.filter((l) => l.sourceSheetId === query.sourceSheetId);
// // //     if (query.tag) items = items.filter((l) => l.tags.includes(query.tag!));
// // //     if (query.assignedTo)
// // //       items = items.filter((l) => l.assignedTo === query.assignedTo);
// // //     if (query.search) {
// // //       const s = query.search.toLowerCase();
// // //       items = items.filter(
// // //         (l) =>
// // //           l.name.toLowerCase().includes(s) ||
// // //           l.phone.includes(s) ||
// // //           (l.email || "").toLowerCase().includes(s)
// // //       );
// // //     }
// // //     if (query.dateFrom)
// // //       items = items.filter((l) => l.createdAt >= query.dateFrom!);
// // //     if (query.dateTo) items = items.filter((l) => l.createdAt <= query.dateTo!);

// // //     const sortBy = query.sortBy || "createdAt";
// // //     const dir = query.sortOrder === "asc" ? 1 : -1;
// // //     items.sort((a, b) => {
// // //       const av = (a as unknown as Record<string, unknown>)[sortBy];
// // //       const bv = (b as unknown as Record<string, unknown>)[sortBy];
// // //       if (av === bv) return 0;
// // //       return av! > bv! ? dir : -dir;
// // //     });

// // //     const page = query.page || 1;
// // //     const limit = query.limit || 20;
// // //     const total = items.length;
// // //     const start = (page - 1) * limit;
// // //     const leads = items.slice(start, start + limit);
// // //     return mockDelay({
// // //       leads,
// // //       pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
// // //     });
// // //   }
// // //   return request<LeadsResponse>(`/leads${qs(query as Record<string, unknown>)}`);
// // // }

// // // export async function getLead(id: string): Promise<Lead> {
// // //   if (USE_MOCK) {
// // //     const lead = mockState.leads.find((l) => l._id === id);
// // //     if (!lead) throw new ApiError(404, { message: "Lead not found" });
// // //     return mockDelay(lead, 200);
// // //   }
// // //   return request<Lead>(`/leads/${id}`);
// // // }

// // // export async function createLead(
// // //   data: Partial<Lead>
// // // ): Promise<Lead> {
// // //   if (USE_MOCK) {
// // //     const now = new Date().toISOString();
// // //     const lead: Lead = {
// // //       _id: nextId("lead"),
// // //       name: data.name || "",
// // //       phone: data.phone || "",
// // //       whatsapp: data.whatsapp ?? null,
// // //       email: data.email ?? null,
// // //       city: data.city ?? null,
// // //       sourceSheetId: "",
// // //       sourceSheetName: "Manual entry",
// // //       sourceRowId: "",
// // //       campaign: null,
// // //       serviceInterested: null,
// // //       requirement: null,
// // //       status: data.status || "new",
// // //       priority: data.priority ?? null,
// // //       assignedTo: data.assignedTo ?? null,
// // //       expectedValue: null,
// // //       remarks: null,
// // //       nextAction: null,
// // //       originalDate: now,
// // //       notes: [],
// // //       followUps: [],
// // //       tags: data.tags || [],
// // //       createdAt: now,
// // //       updatedAt: now,
// // //     };
// // //     mockState.leads.unshift(lead);
// // //     return mockDelay(lead);
// // //   }
// // //   return request<Lead>("/leads", { method: "POST", body: JSON.stringify(data) });
// // // }

// // // export async function updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
// // //   if (USE_MOCK) {
// // //     const idx = mockState.leads.findIndex((l) => l._id === id);
// // //     if (idx === -1) throw new ApiError(404, { message: "Lead not found" });
// // //     mockState.leads[idx] = {
// // //       ...mockState.leads[idx],
// // //       ...data,
// // //       updatedAt: new Date().toISOString(),
// // //     };
// // //     return mockDelay(mockState.leads[idx]);
// // //   }
// // //   return request<Lead>(`/leads/${id}`, {
// // //     method: "PATCH",
// // //     body: JSON.stringify(data),
// // //   });
// // // }

// // // export async function deleteLead(id: string): Promise<{ message: string }> {
// // //   if (USE_MOCK) {
// // //     mockState.leads = mockState.leads.filter((l) => l._id !== id);
// // //     return mockDelay({ message: "Lead deleted" });
// // //   }
// // //   return request(`/leads/${id}`, { method: "DELETE" });
// // // }

// // // export async function addNote(leadId: string, text: string): Promise<LeadNote> {
// // //   if (USE_MOCK) {
// // //     const note: LeadNote = {
// // //       _id: nextId("note"),
// // //       text,
// // //       createdBy: MOCK_USER.id,
// // //       createdAt: new Date().toISOString(),
// // //     };
// // //     const lead = mockState.leads.find((l) => l._id === leadId);
// // //     if (lead) lead.notes.unshift(note);
// // //     return mockDelay(note);
// // //   }
// // //   return request<LeadNote>(`/leads/${leadId}/notes`, {
// // //     method: "POST",
// // //     body: JSON.stringify({ text }),
// // //   });
// // // }

// // // export async function deleteNote(leadId: string, noteId: string) {
// // //   if (USE_MOCK) {
// // //     const lead = mockState.leads.find((l) => l._id === leadId);
// // //     if (lead) lead.notes = lead.notes.filter((n) => n._id !== noteId);
// // //     return mockDelay({ message: "Note deleted" });
// // //   }
// // //   return request<{ message: string }>(`/leads/${leadId}/notes/${noteId}`, {
// // //     method: "DELETE",
// // //   });
// // // }

// // // export async function addFollowUp(
// // //   leadId: string,
// // //   data: { dueDate: string; note: string }
// // // ): Promise<FollowUp> {
// // //   if (USE_MOCK) {
// // //     const fu: FollowUp = {
// // //       _id: nextId("fu"),
// // //       dueDate: data.dueDate,
// // //       note: data.note,
// // //       status: "pending",
// // //       reminderSent: false,
// // //       createdAt: new Date().toISOString(),
// // //     };
// // //     const lead = mockState.leads.find((l) => l._id === leadId);
// // //     if (lead) lead.followUps.unshift(fu);
// // //     return mockDelay(fu);
// // //   }
// // //   return request<FollowUp>(`/leads/${leadId}/follow-ups`, {
// // //     method: "POST",
// // //     body: JSON.stringify(data),
// // //   });
// // // }

// // // export async function updateFollowUp(
// // //   leadId: string,
// // //   followUpId: string,
// // //   data: Partial<Pick<FollowUp, "status" | "note" | "dueDate">>
// // // ): Promise<FollowUp> {
// // //   if (USE_MOCK) {
// // //     const lead = mockState.leads.find((l) => l._id === leadId);
// // //     const fu = lead?.followUps.find((f) => f._id === followUpId);
// // //     if (!fu) throw new ApiError(404, { message: "Follow-up not found" });
// // //     Object.assign(fu, data);
// // //     return mockDelay(fu);
// // //   }
// // //   return request<FollowUp>(`/leads/${leadId}/follow-ups/${followUpId}`, {
// // //     method: "PATCH",
// // //     body: JSON.stringify(data),
// // //   });
// // // }

// // // export async function deleteFollowUp(leadId: string, followUpId: string) {
// // //   if (USE_MOCK) {
// // //     const lead = mockState.leads.find((l) => l._id === leadId);
// // //     if (lead) lead.followUps = lead.followUps.filter((f) => f._id !== followUpId);
// // //     return mockDelay({ message: "Follow-up deleted" });
// // //   }
// // //   return request<{ message: string }>(
// // //     `/leads/${leadId}/follow-ups/${followUpId}`,
// // //     { method: "DELETE" }
// // //   );
// // // }

// // // // ---------------- Sources ----------------

// // // export async function getSources(params: {
// // //   tag?: string;
// // //   status?: string;
// // // }): Promise<{ sources: SheetSource[] }> {
// // //   if (USE_MOCK) {
// // //     let items = [...mockState.sources];
// // //     if (params.tag) items = items.filter((s) => s.tags.includes(params.tag!));
// // //     if (params.status) items = items.filter((s) => s.status === params.status);
// // //     return mockDelay({ sources: items });
// // //   }
// // //   return request(`/sources${qs(params)}`);
// // // }

// // // export async function getSource(id: string): Promise<SheetSource> {
// // //   if (USE_MOCK) {
// // //     const s = mockState.sources.find((s) => s._id === id);
// // //     if (!s) throw new ApiError(404, { message: "Source not found" });
// // //     return mockDelay(s, 200);
// // //   }
// // //   return request<SheetSource>(`/sources/${id}`);
// // // }

// // // export async function previewSource(sheetUrl: string): Promise<SourcePreviewResponse> {
// // //   if (USE_MOCK) {
// // //     if (!sheetUrl.includes("docs.google.com/spreadsheets")) {
// // //       throw new ApiError(400, {
// // //         message:
// // //           'Sheet not accessible — make sure link sharing is set to "Anyone with the link"',
// // //       });
// // //     }
// // //     const headers = [
// // //       "Date", "Priority", "Lead Name", "City", "Phone", "WhatsApp", "Email",
// // //       "Source", "Campaign", "Service Interested", "Requirement", "Lead Status",
// // //       "Assigned To", "Follow-up Date", "Last Follow-up", "Next Action",
// // //       "Expected Value", "Remarks",
// // //     ];
// // //     return mockDelay({
// // //       headers,
// // //       sampleRows: [
// // //         {
// // //           Date: "2026-08-01", Priority: "High", "Lead Name": "Sample Lead",
// // //           City: "Meerut", Phone: "9876543210", WhatsApp: "9876543210",
// // //           Email: "sample@lead.com", Source: "Facebook", Campaign: "Diwali Offer",
// // //           "Service Interested": "Balloon Decoration", Requirement: "100 guests",
// // //           "Lead Status": "New", "Assigned To": "Priya", "Follow-up Date": "2026-08-05",
// // //           "Last Follow-up": "", "Next Action": "Send quote", "Expected Value": "25000",
// // //           Remarks: "",
// // //         },
// // //       ],
// // //       detectedMapping: {
// // //         date: "Date", priority: "Priority", name: "Lead Name", city: "City",
// // //         phone: "Phone", whatsapp: "WhatsApp", email: "Email", source: "Source",
// // //         campaign: "Campaign", serviceInterested: "Service Interested",
// // //         requirement: "Requirement", leadStatus: "Lead Status",
// // //         assignedTo: "Assigned To", followUpDate: "Follow-up Date",
// // //         lastFollowUp: "Last Follow-up", nextAction: "Next Action",
// // //         expectedValue: "Expected Value", remarks: "Remarks",
// // //       },
// // //     }, 700);
// // //   }
// // //   return request<SourcePreviewResponse>("/sources/preview", {
// // //     method: "POST",
// // //     body: JSON.stringify({ sheetUrl }),
// // //   });
// // // }

// // // export async function createSource(data: {
// // //   name: string;
// // //   sheetUrl: string;
// // //   tags: string[];
// // //   columnMapping: SheetSource["columnMapping"];
// // //   syncIntervalMinutes?: number;
// // // }): Promise<SheetSource> {
// // //   if (USE_MOCK) {
// // //     const now = new Date().toISOString();
// // //     const idMatch = data.sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
// // //     const source: SheetSource = {
// // //       _id: nextId("source"),
// // //       name: data.name,
// // //       sheetUrl: data.sheetUrl,
// // //       sheetId: idMatch ? idMatch[1] : "unknown",
// // //       gid: "0",
// // //       tags: data.tags,
// // //       status: "active",
// // //       lastSyncAt: null,
// // //       lastSyncStatus: "never_synced",
// // //       lastSyncError: null,
// // //       rowsImported: 0,
// // //       columnMapping: data.columnMapping,
// // //       syncIntervalMinutes: data.syncIntervalMinutes || 30,
// // //       createdBy: MOCK_USER.id,
// // //       createdAt: now,
// // //       updatedAt: now,
// // //     };
// // //     mockState.sources.unshift(source);
// // //     setTimeout(() => {
// // //       source.lastSyncAt = new Date().toISOString();
// // //       source.lastSyncStatus = "success";
// // //       source.rowsImported = Math.floor(10 + Math.random() * 50);
// // //     }, 2000);
// // //     return mockDelay(source);
// // //   }
// // //   return request<SheetSource>("/sources", {
// // //     method: "POST",
// // //     body: JSON.stringify(data),
// // //   });
// // // }

// // // export async function updateSource(
// // //   id: string,
// // //   data: Partial<
// // //     Pick<SheetSource, "name" | "tags" | "columnMapping" | "syncIntervalMinutes" | "status">
// // //   >
// // // ): Promise<SheetSource> {
// // //   if (USE_MOCK) {
// // //     const idx = mockState.sources.findIndex((s) => s._id === id);
// // //     if (idx === -1) throw new ApiError(404, { message: "Source not found" });
// // //     mockState.sources[idx] = {
// // //       ...mockState.sources[idx],
// // //       ...data,
// // //       updatedAt: new Date().toISOString(),
// // //     };
// // //     return mockDelay(mockState.sources[idx]);
// // //   }
// // //   return request<SheetSource>(`/sources/${id}`, {
// // //     method: "PATCH",
// // //     body: JSON.stringify(data),
// // //   });
// // // }

// // // export async function deleteSource(id: string) {
// // //   if (USE_MOCK) {
// // //     mockState.sources = mockState.sources.filter((s) => s._id !== id);
// // //     return mockDelay({ message: "Source deleted" });
// // //   }
// // //   return request<{ message: string }>(`/sources/${id}`, { method: "DELETE" });
// // // }

// // // export async function syncSourceNow(id: string) {
// // //   if (USE_MOCK) {
// // //     const source = mockState.sources.find((s) => s._id === id);
// // //     setTimeout(() => {
// // //       if (source) {
// // //         source.lastSyncAt = new Date().toISOString();
// // //         source.lastSyncStatus = "success";
// // //         source.rowsImported += Math.floor(1 + Math.random() * 5);
// // //       }
// // //     }, 1500);
// // //     return mockDelay({ message: "Sync started" });
// // //   }
// // //   return request<{ message: string }>(`/sources/${id}/sync-now`, {
// // //     method: "POST",
// // //   });
// // // }

// // // // ---------------- Dashboard ----------------

// // // export async function getDashboardOverview(): Promise<DashboardOverview> {
// // //   if (USE_MOCK) return mockDelay(buildMockOverview(), 500);
// // //   return request<DashboardOverview>("/dashboard/overview");
// // // }

// // // export async function getDashboardFollowUps(
// // //   type: "today" | "missed" | "upcoming"
// // // ): Promise<{ followUps: DashboardFollowUp[] }> {
// // //   if (USE_MOCK)
// // //     return mockDelay({ followUps: buildMockFollowUps(type) }, 300);
// // //   return request(`/dashboard/follow-ups${qs({ type })}`);
// // // }

// // // // ---------------- Users ----------------

// // // export async function getUsers(): Promise<{ users: User[] }> {
// // //   if (USE_MOCK) return mockDelay({ users: mockState.users });
// // //   return request("/users");
// // // }

// // // export async function createUser(data: {
// // //   name: string;
// // //   email: string;
// // //   password: string;
// // //   role: string;
// // // }): Promise<User> {
// // //   if (USE_MOCK) {
// // //     const user: User = {
// // //       id: nextId("user"),
// // //       name: data.name,
// // //       email: data.email,
// // //       role: data.role as User["role"],
// // //     };
// // //     mockState.users.push(user);
// // //     return mockDelay(user);
// // //   }
// // //   return request<User>("/users", { method: "POST", body: JSON.stringify(data) });
// // // }

// // // export async function updateUser(
// // //   id: string,
// // //   data: Partial<{ name: string; email: string; role: string }>
// // // ): Promise<User> {
// // //   if (USE_MOCK) {
// // //     const idx = mockState.users.findIndex((u) => u.id === id);
// // //     if (idx === -1) throw new ApiError(404, { message: "User not found" });
// // //     mockState.users[idx] = { ...mockState.users[idx], ...data } as User;
// // //     return mockDelay(mockState.users[idx]);
// // //   }
// // //   return request<User>(`/users/${id}`, {
// // //     method: "PATCH",
// // //     body: JSON.stringify(data),
// // //   });
// // // }

// // // export async function deleteUser(id: string) {
// // //   if (USE_MOCK) {
// // //     mockState.users = mockState.users.filter((u) => u.id !== id);
// // //     return mockDelay({ message: "User deleted" });
// // //   }
// // //   return request<{ message: string }>(`/users/${id}`, { method: "DELETE" });
// // // }

// // // // ---------------- Notifications ----------------

// // // export async function getNotifications(): Promise<{
// // //   notifications: Notification[];
// // // }> {
// // //   if (USE_MOCK) return mockDelay({ notifications: mockState.notifications });
// // //   return request("/notifications");
// // // }

// // // export async function markNotificationRead(id: string) {
// // //   if (USE_MOCK) {
// // //     const n = mockState.notifications.find((n) => n._id === id);
// // //     if (n) n.read = true;
// // //     return mockDelay({ message: "Marked read" });
// // //   }
// // //   return request<{ message: string }>(`/notifications/${id}/read`, {
// // //     method: "PATCH",
// // //   });
// // // }

// // // // ---------------- Phase 2: Projects ----------------
// // // // Additive module — mirrors 04-PHASE2-API-CONTRACT.md section 2.
// // // // Kept in this same file to match the existing single-api-client-module
// // // // convention from Phase 1 (see lead/source methods above).

// // // export async function getProjects(query: ProjectsQuery): Promise<ProjectsResponse> {
// // //   if (USE_MOCK) {
// // //     let items = [...mockState.projects];
// // //     if (query.status) items = items.filter((p) => p.status === query.status);
// // //     if (query.clientId) items = items.filter((p) => p.clientId === query.clientId);
// // //     if (query.teamMember)
// // //       items = items.filter((p) => p.teamMembers.includes(query.teamMember!));
// // //     if (query.tag) items = items.filter((p) => p.tags.includes(query.tag!));
// // //     if (query.search) {
// // //       const s = query.search.toLowerCase();
// // //       items = items.filter(
// // //         (p) =>
// // //           p.name.toLowerCase().includes(s) || p.clientName.toLowerCase().includes(s)
// // //       );
// // //     }
// // //     const page = query.page || 1;
// // //     const limit = query.limit || 20;
// // //     const total = items.length;
// // //     const start = (page - 1) * limit;
// // //     const projects = items.slice(start, start + limit);
// // //     return mockDelay({
// // //       projects,
// // //       pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
// // //     });
// // //   }
// // //   return request<ProjectsResponse>(`/projects${qs(query as Record<string, unknown>)}`);
// // // }

// // // export async function getProject(id: string): Promise<Project> {
// // //   if (USE_MOCK) {
// // //     const project = mockState.projects.find((p) => p._id === id);
// // //     if (!project) throw new ApiError(404, { message: "Project not found" });
// // //     return mockDelay(project, 200);
// // //   }
// // //   return request<Project>(`/projects/${id}`);
// // // }

// // // export async function createProject(data: {
// // //   name: string;
// // //   clientName: string;
// // //   clientEmail?: string | null;
// // //   clientPhone?: string | null;
// // //   clientId?: string | null;
// // //   description?: string | null;
// // //   teamMembers?: string[];
// // //   docLinks?: { label: string; url: string }[];
// // //   startDate?: string | null;
// // //   dueDate?: string | null;
// // //   tags?: string[];
// // //   sourceLeadId?: string | null;
// // // }): Promise<Project> {
// // //   if (USE_MOCK) {
// // //     const now = new Date().toISOString();
// // //     const project: Project = {
// // //       _id: nextId("project"),
// // //       name: data.name,
// // //       clientId: data.clientId ?? null,
// // //       clientName: data.clientName,
// // //       clientEmail: data.clientEmail ?? null,
// // //       clientPhone: data.clientPhone ?? null,
// // //       description: data.description ?? null,
// // //       status: "active",
// // //       docLinks: (data.docLinks || []).map((d) => ({ ...d, _id: nextId("dl") })),
// // //       teamMembers: data.teamMembers || [],
// // //       sourceLeadId: data.sourceLeadId ?? null,
// // //       startDate: data.startDate ?? null,
// // //       dueDate: data.dueDate ?? null,
// // //       tags: data.tags || [],
// // //       createdBy: MOCK_USER.id,
// // //       createdAt: now,
// // //       updatedAt: now,
// // //     };
// // //     mockState.projects.unshift(project);
// // //     return mockDelay(project);
// // //   }
// // //   return request<Project>("/projects", { method: "POST", body: JSON.stringify(data) });
// // // }

// // // export async function createProjectFromLead(
// // //   leadId: string,
// // //   data: {
// // //     name?: string;
// // //     teamMembers?: string[];
// // //     docLinks?: { label: string; url: string }[];
// // //   }
// // // ): Promise<Project> {
// // //   if (USE_MOCK) {
// // //     const lead = mockState.leads.find((l) => l._id === leadId);
// // //     if (!lead) throw new ApiError(404, { message: "Lead not found" });
// // //     const now = new Date().toISOString();
// // //     const project: Project = {
// // //       _id: nextId("project"),
// // //       name: data.name || `${lead.name} Project`,
// // //       clientId: null,
// // //       clientName: lead.name,
// // //       clientEmail: lead.email,
// // //       clientPhone: lead.phone,
// // //       description: null,
// // //       status: "active",
// // //       docLinks: (data.docLinks || []).map((d) => ({ ...d, _id: nextId("dl") })),
// // //       teamMembers: data.teamMembers || [],
// // //       sourceLeadId: lead._id,
// // //       startDate: null,
// // //       dueDate: null,
// // //       tags: [],
// // //       createdBy: MOCK_USER.id,
// // //       createdAt: now,
// // //       updatedAt: now,
// // //     };
// // //     mockState.projects.unshift(project);
// // //     return mockDelay(project);
// // //   }
// // //   return request<Project>(`/projects/from-lead/${leadId}`, {
// // //     method: "POST",
// // //     body: JSON.stringify(data),
// // //   });
// // // }

// // // export async function updateProject(
// // //   id: string,
// // //   data: Partial<
// // //     Pick<
// // //       Project,
// // //       | "name"
// // //       | "clientName"
// // //       | "clientEmail"
// // //       | "clientPhone"
// // //       | "clientId"
// // //       | "description"
// // //       | "status"
// // //       | "startDate"
// // //       | "dueDate"
// // //       | "tags"
// // //     >
// // //   >
// // // ): Promise<Project> {
// // //   if (USE_MOCK) {
// // //     const idx = mockState.projects.findIndex((p) => p._id === id);
// // //     if (idx === -1) throw new ApiError(404, { message: "Project not found" });
// // //     mockState.projects[idx] = {
// // //       ...mockState.projects[idx],
// // //       ...data,
// // //       updatedAt: new Date().toISOString(),
// // //     };
// // //     return mockDelay(mockState.projects[idx]);
// // //   }
// // //   return request<Project>(`/projects/${id}`, {
// // //     method: "PATCH",
// // //     body: JSON.stringify(data),
// // //   });
// // // }

// // // export async function deleteProject(
// // //   id: string
// // // ): Promise<{ message: string; tasksDeleted: number }> {
// // //   if (USE_MOCK) {
// // //     mockState.projects = mockState.projects.filter((p) => p._id !== id);
// // //     return mockDelay({ message: "Project deleted", tasksDeleted: 0 });
// // //   }
// // //   return request(`/projects/${id}`, { method: "DELETE" });
// // // }

// // // export async function addDocLink(
// // //   projectId: string,
// // //   data: { label: string; url: string }
// // // ): Promise<DocLink> {
// // //   if (USE_MOCK) {
// // //     const link: DocLink = { _id: nextId("dl"), ...data };
// // //     const project = mockState.projects.find((p) => p._id === projectId);
// // //     if (project) project.docLinks.push(link);
// // //     return mockDelay(link);
// // //   }
// // //   return request<DocLink>(`/projects/${projectId}/doc-links`, {
// // //     method: "POST",
// // //     body: JSON.stringify(data),
// // //   });
// // // }

// // // export async function deleteDocLink(projectId: string, linkId: string) {
// // //   if (USE_MOCK) {
// // //     const project = mockState.projects.find((p) => p._id === projectId);
// // //     if (project) project.docLinks = project.docLinks.filter((d) => d._id !== linkId);
// // //     return mockDelay({ message: "Doc link removed" });
// // //   }
// // //   return request<{ message: string }>(`/projects/${projectId}/doc-links/${linkId}`, {
// // //     method: "DELETE",
// // //   });
// // // }

// // // export async function getProjectTeam(
// // //   projectId: string
// // // ): Promise<{ team: Pick<User, "id" | "name" | "email" | "role">[] }> {
// // //   if (USE_MOCK) {
// // //     const project = mockState.projects.find((p) => p._id === projectId);
// // //     const team = (project?.teamMembers || [])
// // //       .map((uid) => mockState.users.find((u) => u.id === uid))
// // //       .filter((u): u is User => !!u)
// // //       .map(({ id, name, email, role }) => ({ id, name, email, role }));
// // //     return mockDelay({ team }, 200);
// // //   }
// // //   return request(`/projects/${projectId}/team`);
// // // }

// // // export async function addProjectTeamMember(
// // //   projectId: string,
// // //   userId: string
// // // ): Promise<Project> {
// // //   if (USE_MOCK) {
// // //     const project = mockState.projects.find((p) => p._id === projectId);
// // //     if (!project) throw new ApiError(404, { message: "Project not found" });
// // //     if (!project.teamMembers.includes(userId)) project.teamMembers.push(userId);
// // //     return mockDelay(project);
// // //   }
// // //   return request<Project>(`/projects/${projectId}/team`, {
// // //     method: "POST",
// // //     body: JSON.stringify({ userId }),
// // //   });
// // // }

// // // export async function removeProjectTeamMember(projectId: string, userId: string) {
// // //   if (USE_MOCK) {
// // //     const project = mockState.projects.find((p) => p._id === projectId);
// // //     if (project) project.teamMembers = project.teamMembers.filter((u) => u !== userId);
// // //     return mockDelay({ message: "Member removed" });
// // //   }
// // //   return request<{ message: string }>(`/projects/${projectId}/team/${userId}`, {
// // //     method: "DELETE",
// // //   });
// // // }

// // // export { ApiError };


// // import {
// //   ApiError,
// //   DashboardFollowUp,
// //   DashboardOverview,
// //   Lead,
// //   LeadNote,
// //   LeadsQuery,
// //   LeadsResponse,
// //   FollowUp,
// //   Notification,
// //   SheetSource,
// //   SourcePreviewResponse,
// //   User,
// //   Project,
// //   ProjectsQuery,
// //   ProjectsResponse,
// //   DocLink,
// //   Task,
// //   TasksQuery,
// //   TasksResponse,
// //   TaskComment,
// // } from "./types";
// // import {
// //   MOCK_LEADS,
// //   MOCK_NOTIFICATIONS,
// //   MOCK_PROJECTS,
// //   MOCK_SOURCES,
// //   MOCK_TASKS,
// //   MOCK_USER,
// //   MOCK_USERS,
// //   buildMockFollowUps,
// //   buildMockOverview,
// // } from "./mock-data";

// // const API_BASE_URL =
// //   process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
// // const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

// // const TOKEN_KEY = "gowappily_token";

// // export function getToken(): string | null {
// //   if (typeof window === "undefined") return null;
// //   return localStorage.getItem(TOKEN_KEY);
// // }

// // export function setToken(token: string) {
// //   if (typeof window === "undefined") return;
// //   localStorage.setItem(TOKEN_KEY, token);
// // }

// // export function clearToken() {
// //   if (typeof window === "undefined") return;
// //   localStorage.removeItem(TOKEN_KEY);
// // }

// // async function mockDelay<T>(value: T, ms = 400): Promise<T> {
// //   await new Promise((r) => setTimeout(r, ms));
// //   return value;
// // }

// // async function request<T>(
// //   path: string,
// //   options: RequestInit = {}
// // ): Promise<T> {
// //   const token = getToken();
// //   const res = await fetch(`${API_BASE_URL}${path}`, {
// //     ...options,
// //     headers: {
// //       "Content-Type": "application/json",
// //       ...(token ? { Authorization: `Bearer ${token}` } : {}),
// //       ...(options.headers || {}),
// //     },
// //   });

// //   let body: unknown = null;
// //   const text = await res.text();
// //   if (text) {
// //     try {
// //       body = JSON.parse(text);
// //     } catch {
// //       body = { message: text };
// //     }
// //   }

// //   if (!res.ok) {
// //     throw new ApiError(
// //       res.status,
// //       (body as { message: string; errors?: { field: string; message: string }[] }) || {
// //         message: "Request failed",
// //       }
// //     );
// //   }
// //   return body as T;
// // }

// // function qs(params: Record<string, unknown>): string {
// //   const usp = new URLSearchParams();
// //   Object.entries(params).forEach(([k, v]) => {
// //     if (v !== undefined && v !== null && v !== "") usp.set(k, String(v));
// //   });
// //   const s = usp.toString();
// //   return s ? `?${s}` : "";
// // }

// // // In-memory mutable mock store (persists for the session only)
// // const mockState = {
// //   leads: [...MOCK_LEADS],
// //   sources: [...MOCK_SOURCES],
// //   notifications: [...MOCK_NOTIFICATIONS],
// //   users: [...MOCK_USERS],
// //   projects: [...MOCK_PROJECTS],
// //   tasks: [...MOCK_TASKS],
// // };

// // let idCounter = 10000;
// // const nextId = (prefix: string) => `${prefix}_${idCounter++}`;

// // // ---------------- Auth ----------------

// // export async function login(email: string, password: string) {
// //   if (USE_MOCK) {
// //     if (!email || !password) {
// //       throw new ApiError(401, { message: "Invalid credentials" });
// //     }
// //     return mockDelay({ token: "mock-jwt-token", user: MOCK_USER });
// //   }
// //   return request<{ token: string; user: User }>("/auth/login", {
// //     method: "POST",
// //     body: JSON.stringify({ email, password }),
// //   });
// // }

// // export async function getMe() {
// //   if (USE_MOCK) return mockDelay(MOCK_USER, 150);
// //   return request<User>("/auth/me");
// // }

// // export async function logout() {
// //   if (USE_MOCK) return mockDelay({ message: "Logged out" }, 100);
// //   return request<{ message: string }>("/auth/logout", { method: "POST" });
// // }

// // // ---------------- Leads ----------------

// // export async function getLeads(query: LeadsQuery): Promise<LeadsResponse> {
// //   if (USE_MOCK) {
// //     let items = [...mockState.leads];
// //     if (query.status) items = items.filter((l) => l.status === query.status);
// //     if (query.priority) items = items.filter((l) => l.priority === query.priority);
// //     if (query.sourceSheetId)
// //       items = items.filter((l) => l.sourceSheetId === query.sourceSheetId);
// //     if (query.tag) items = items.filter((l) => l.tags.includes(query.tag!));
// //     if (query.assignedTo)
// //       items = items.filter((l) => l.assignedTo === query.assignedTo);
// //     if (query.search) {
// //       const s = query.search.toLowerCase();
// //       items = items.filter(
// //         (l) =>
// //           l.name.toLowerCase().includes(s) ||
// //           l.phone.includes(s) ||
// //           (l.email || "").toLowerCase().includes(s)
// //       );
// //     }
// //     if (query.dateFrom)
// //       items = items.filter((l) => l.createdAt >= query.dateFrom!);
// //     if (query.dateTo) items = items.filter((l) => l.createdAt <= query.dateTo!);

// //     const sortBy = query.sortBy || "createdAt";
// //     const dir = query.sortOrder === "asc" ? 1 : -1;
// //     items.sort((a, b) => {
// //       const av = (a as unknown as Record<string, unknown>)[sortBy];
// //       const bv = (b as unknown as Record<string, unknown>)[sortBy];
// //       if (av === bv) return 0;
// //       return av! > bv! ? dir : -dir;
// //     });

// //     const page = query.page || 1;
// //     const limit = query.limit || 20;
// //     const total = items.length;
// //     const start = (page - 1) * limit;
// //     const leads = items.slice(start, start + limit);
// //     return mockDelay({
// //       leads,
// //       pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
// //     });
// //   }
// //   return request<LeadsResponse>(`/leads${qs(query as Record<string, unknown>)}`);
// // }

// // export async function getLead(id: string): Promise<Lead> {
// //   if (USE_MOCK) {
// //     const lead = mockState.leads.find((l) => l._id === id);
// //     if (!lead) throw new ApiError(404, { message: "Lead not found" });
// //     return mockDelay(lead, 200);
// //   }
// //   return request<Lead>(`/leads/${id}`);
// // }

// // export async function createLead(
// //   data: Partial<Lead>
// // ): Promise<Lead> {
// //   if (USE_MOCK) {
// //     const now = new Date().toISOString();
// //     const lead: Lead = {
// //       _id: nextId("lead"),
// //       name: data.name || "",
// //       phone: data.phone || "",
// //       whatsapp: data.whatsapp ?? null,
// //       email: data.email ?? null,
// //       city: data.city ?? null,
// //       sourceSheetId: "",
// //       sourceSheetName: "Manual entry",
// //       sourceRowId: "",
// //       campaign: null,
// //       serviceInterested: null,
// //       requirement: null,
// //       status: data.status || "new",
// //       priority: data.priority ?? null,
// //       assignedTo: data.assignedTo ?? null,
// //       expectedValue: null,
// //       remarks: null,
// //       nextAction: null,
// //       originalDate: now,
// //       notes: [],
// //       followUps: [],
// //       tags: data.tags || [],
// //       createdAt: now,
// //       updatedAt: now,
// //     };
// //     mockState.leads.unshift(lead);
// //     return mockDelay(lead);
// //   }
// //   return request<Lead>("/leads", { method: "POST", body: JSON.stringify(data) });
// // }

// // export async function updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
// //   if (USE_MOCK) {
// //     const idx = mockState.leads.findIndex((l) => l._id === id);
// //     if (idx === -1) throw new ApiError(404, { message: "Lead not found" });
// //     mockState.leads[idx] = {
// //       ...mockState.leads[idx],
// //       ...data,
// //       updatedAt: new Date().toISOString(),
// //     };
// //     return mockDelay(mockState.leads[idx]);
// //   }
// //   return request<Lead>(`/leads/${id}`, {
// //     method: "PATCH",
// //     body: JSON.stringify(data),
// //   });
// // }

// // export async function deleteLead(id: string): Promise<{ message: string }> {
// //   if (USE_MOCK) {
// //     mockState.leads = mockState.leads.filter((l) => l._id !== id);
// //     return mockDelay({ message: "Lead deleted" });
// //   }
// //   return request(`/leads/${id}`, { method: "DELETE" });
// // }

// // export async function addNote(leadId: string, text: string): Promise<LeadNote> {
// //   if (USE_MOCK) {
// //     const note: LeadNote = {
// //       _id: nextId("note"),
// //       text,
// //       createdBy: MOCK_USER.id,
// //       createdAt: new Date().toISOString(),
// //     };
// //     const lead = mockState.leads.find((l) => l._id === leadId);
// //     if (lead) lead.notes.unshift(note);
// //     return mockDelay(note);
// //   }
// //   return request<LeadNote>(`/leads/${leadId}/notes`, {
// //     method: "POST",
// //     body: JSON.stringify({ text }),
// //   });
// // }

// // export async function deleteNote(leadId: string, noteId: string) {
// //   if (USE_MOCK) {
// //     const lead = mockState.leads.find((l) => l._id === leadId);
// //     if (lead) lead.notes = lead.notes.filter((n) => n._id !== noteId);
// //     return mockDelay({ message: "Note deleted" });
// //   }
// //   return request<{ message: string }>(`/leads/${leadId}/notes/${noteId}`, {
// //     method: "DELETE",
// //   });
// // }

// // export async function addFollowUp(
// //   leadId: string,
// //   data: { dueDate: string; note: string }
// // ): Promise<FollowUp> {
// //   if (USE_MOCK) {
// //     const fu: FollowUp = {
// //       _id: nextId("fu"),
// //       dueDate: data.dueDate,
// //       note: data.note,
// //       status: "pending",
// //       reminderSent: false,
// //       createdAt: new Date().toISOString(),
// //     };
// //     const lead = mockState.leads.find((l) => l._id === leadId);
// //     if (lead) lead.followUps.unshift(fu);
// //     return mockDelay(fu);
// //   }
// //   return request<FollowUp>(`/leads/${leadId}/follow-ups`, {
// //     method: "POST",
// //     body: JSON.stringify(data),
// //   });
// // }

// // export async function updateFollowUp(
// //   leadId: string,
// //   followUpId: string,
// //   data: Partial<Pick<FollowUp, "status" | "note" | "dueDate">>
// // ): Promise<FollowUp> {
// //   if (USE_MOCK) {
// //     const lead = mockState.leads.find((l) => l._id === leadId);
// //     const fu = lead?.followUps.find((f) => f._id === followUpId);
// //     if (!fu) throw new ApiError(404, { message: "Follow-up not found" });
// //     Object.assign(fu, data);
// //     return mockDelay(fu);
// //   }
// //   return request<FollowUp>(`/leads/${leadId}/follow-ups/${followUpId}`, {
// //     method: "PATCH",
// //     body: JSON.stringify(data),
// //   });
// // }

// // export async function deleteFollowUp(leadId: string, followUpId: string) {
// //   if (USE_MOCK) {
// //     const lead = mockState.leads.find((l) => l._id === leadId);
// //     if (lead) lead.followUps = lead.followUps.filter((f) => f._id !== followUpId);
// //     return mockDelay({ message: "Follow-up deleted" });
// //   }
// //   return request<{ message: string }>(
// //     `/leads/${leadId}/follow-ups/${followUpId}`,
// //     { method: "DELETE" }
// //   );
// // }

// // // ---------------- Sources ----------------

// // export async function getSources(params: {
// //   tag?: string;
// //   status?: string;
// // }): Promise<{ sources: SheetSource[] }> {
// //   if (USE_MOCK) {
// //     let items = [...mockState.sources];
// //     if (params.tag) items = items.filter((s) => s.tags.includes(params.tag!));
// //     if (params.status) items = items.filter((s) => s.status === params.status);
// //     return mockDelay({ sources: items });
// //   }
// //   return request(`/sources${qs(params)}`);
// // }

// // export async function getSource(id: string): Promise<SheetSource> {
// //   if (USE_MOCK) {
// //     const s = mockState.sources.find((s) => s._id === id);
// //     if (!s) throw new ApiError(404, { message: "Source not found" });
// //     return mockDelay(s, 200);
// //   }
// //   return request<SheetSource>(`/sources/${id}`);
// // }

// // export async function previewSource(sheetUrl: string): Promise<SourcePreviewResponse> {
// //   if (USE_MOCK) {
// //     if (!sheetUrl.includes("docs.google.com/spreadsheets")) {
// //       throw new ApiError(400, {
// //         message:
// //           'Sheet not accessible — make sure link sharing is set to "Anyone with the link"',
// //       });
// //     }
// //     const headers = [
// //       "Date", "Priority", "Lead Name", "City", "Phone", "WhatsApp", "Email",
// //       "Source", "Campaign", "Service Interested", "Requirement", "Lead Status",
// //       "Assigned To", "Follow-up Date", "Last Follow-up", "Next Action",
// //       "Expected Value", "Remarks",
// //     ];
// //     return mockDelay({
// //       headers,
// //       sampleRows: [
// //         {
// //           Date: "2026-08-01", Priority: "High", "Lead Name": "Sample Lead",
// //           City: "Meerut", Phone: "9876543210", WhatsApp: "9876543210",
// //           Email: "sample@lead.com", Source: "Facebook", Campaign: "Diwali Offer",
// //           "Service Interested": "Balloon Decoration", Requirement: "100 guests",
// //           "Lead Status": "New", "Assigned To": "Priya", "Follow-up Date": "2026-08-05",
// //           "Last Follow-up": "", "Next Action": "Send quote", "Expected Value": "25000",
// //           Remarks: "",
// //         },
// //       ],
// //       detectedMapping: {
// //         date: "Date", priority: "Priority", name: "Lead Name", city: "City",
// //         phone: "Phone", whatsapp: "WhatsApp", email: "Email", source: "Source",
// //         campaign: "Campaign", serviceInterested: "Service Interested",
// //         requirement: "Requirement", leadStatus: "Lead Status",
// //         assignedTo: "Assigned To", followUpDate: "Follow-up Date",
// //         lastFollowUp: "Last Follow-up", nextAction: "Next Action",
// //         expectedValue: "Expected Value", remarks: "Remarks",
// //       },
// //     }, 700);
// //   }
// //   return request<SourcePreviewResponse>("/sources/preview", {
// //     method: "POST",
// //     body: JSON.stringify({ sheetUrl }),
// //   });
// // }

// // export async function createSource(data: {
// //   name: string;
// //   sheetUrl: string;
// //   tags: string[];
// //   columnMapping: SheetSource["columnMapping"];
// //   syncIntervalMinutes?: number;
// // }): Promise<SheetSource> {
// //   if (USE_MOCK) {
// //     const now = new Date().toISOString();
// //     const idMatch = data.sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
// //     const source: SheetSource = {
// //       _id: nextId("source"),
// //       name: data.name,
// //       sheetUrl: data.sheetUrl,
// //       sheetId: idMatch ? idMatch[1] : "unknown",
// //       gid: "0",
// //       tags: data.tags,
// //       status: "active",
// //       lastSyncAt: null,
// //       lastSyncStatus: "never_synced",
// //       lastSyncError: null,
// //       rowsImported: 0,
// //       columnMapping: data.columnMapping,
// //       syncIntervalMinutes: data.syncIntervalMinutes || 30,
// //       createdBy: MOCK_USER.id,
// //       createdAt: now,
// //       updatedAt: now,
// //     };
// //     mockState.sources.unshift(source);
// //     setTimeout(() => {
// //       source.lastSyncAt = new Date().toISOString();
// //       source.lastSyncStatus = "success";
// //       source.rowsImported = Math.floor(10 + Math.random() * 50);
// //     }, 2000);
// //     return mockDelay(source);
// //   }
// //   return request<SheetSource>("/sources", {
// //     method: "POST",
// //     body: JSON.stringify(data),
// //   });
// // }

// // export async function updateSource(
// //   id: string,
// //   data: Partial<
// //     Pick<SheetSource, "name" | "tags" | "columnMapping" | "syncIntervalMinutes" | "status">
// //   >
// // ): Promise<SheetSource> {
// //   if (USE_MOCK) {
// //     const idx = mockState.sources.findIndex((s) => s._id === id);
// //     if (idx === -1) throw new ApiError(404, { message: "Source not found" });
// //     mockState.sources[idx] = {
// //       ...mockState.sources[idx],
// //       ...data,
// //       updatedAt: new Date().toISOString(),
// //     };
// //     return mockDelay(mockState.sources[idx]);
// //   }
// //   return request<SheetSource>(`/sources/${id}`, {
// //     method: "PATCH",
// //     body: JSON.stringify(data),
// //   });
// // }

// // export async function deleteSource(id: string) {
// //   if (USE_MOCK) {
// //     mockState.sources = mockState.sources.filter((s) => s._id !== id);
// //     return mockDelay({ message: "Source deleted" });
// //   }
// //   return request<{ message: string }>(`/sources/${id}`, { method: "DELETE" });
// // }

// // export async function syncSourceNow(id: string) {
// //   if (USE_MOCK) {
// //     const source = mockState.sources.find((s) => s._id === id);
// //     setTimeout(() => {
// //       if (source) {
// //         source.lastSyncAt = new Date().toISOString();
// //         source.lastSyncStatus = "success";
// //         source.rowsImported += Math.floor(1 + Math.random() * 5);
// //       }
// //     }, 1500);
// //     return mockDelay({ message: "Sync started" });
// //   }
// //   return request<{ message: string }>(`/sources/${id}/sync-now`, {
// //     method: "POST",
// //   });
// // }

// // // ---------------- Dashboard ----------------

// // export async function getDashboardOverview(): Promise<DashboardOverview> {
// //   if (USE_MOCK) return mockDelay(buildMockOverview(), 500);
// //   return request<DashboardOverview>("/dashboard/overview");
// // }

// // export async function getDashboardFollowUps(
// //   type: "today" | "missed" | "upcoming"
// // ): Promise<{ followUps: DashboardFollowUp[] }> {
// //   if (USE_MOCK)
// //     return mockDelay({ followUps: buildMockFollowUps(type) }, 300);
// //   return request(`/dashboard/follow-ups${qs({ type })}`);
// // }

// // // ---------------- Users ----------------

// // export async function getUsers(): Promise<{ users: User[] }> {
// //   if (USE_MOCK) return mockDelay({ users: mockState.users });
// //   return request("/users");
// // }

// // export async function createUser(data: {
// //   name: string;
// //   email: string;
// //   password: string;
// //   role: string;
// // }): Promise<User> {
// //   if (USE_MOCK) {
// //     const user: User = {
// //       id: nextId("user"),
// //       name: data.name,
// //       email: data.email,
// //       role: data.role as User["role"],
// //     };
// //     mockState.users.push(user);
// //     return mockDelay(user);
// //   }
// //   return request<User>("/users", { method: "POST", body: JSON.stringify(data) });
// // }

// // export async function updateUser(
// //   id: string,
// //   data: Partial<{ name: string; email: string; role: string }>
// // ): Promise<User> {
// //   if (USE_MOCK) {
// //     const idx = mockState.users.findIndex((u) => u.id === id);
// //     if (idx === -1) throw new ApiError(404, { message: "User not found" });
// //     mockState.users[idx] = { ...mockState.users[idx], ...data } as User;
// //     return mockDelay(mockState.users[idx]);
// //   }
// //   return request<User>(`/users/${id}`, {
// //     method: "PATCH",
// //     body: JSON.stringify(data),
// //   });
// // }

// // export async function deleteUser(id: string) {
// //   if (USE_MOCK) {
// //     mockState.users = mockState.users.filter((u) => u.id !== id);
// //     return mockDelay({ message: "User deleted" });
// //   }
// //   return request<{ message: string }>(`/users/${id}`, { method: "DELETE" });
// // }

// // // ---------------- Notifications ----------------

// // export async function getNotifications(): Promise<{
// //   notifications: Notification[];
// // }> {
// //   if (USE_MOCK) return mockDelay({ notifications: mockState.notifications });
// //   return request("/notifications");
// // }

// // export async function markNotificationRead(id: string) {
// //   if (USE_MOCK) {
// //     const n = mockState.notifications.find((n) => n._id === id);
// //     if (n) n.read = true;
// //     return mockDelay({ message: "Marked read" });
// //   }
// //   return request<{ message: string }>(`/notifications/${id}/read`, {
// //     method: "PATCH",
// //   });
// // }

// // // ---------------- Phase 2: Projects ----------------
// // // Additive module — mirrors 04-PHASE2-API-CONTRACT.md section 2.
// // // Kept in this same file to match the existing single-api-client-module
// // // convention from Phase 1 (see lead/source methods above).

// // export async function getProjects(query: ProjectsQuery): Promise<ProjectsResponse> {
// //   if (USE_MOCK) {
// //     let items = [...mockState.projects];
// //     if (query.status) items = items.filter((p) => p.status === query.status);
// //     if (query.clientId) items = items.filter((p) => p.clientId === query.clientId);
// //     if (query.teamMember)
// //       items = items.filter((p) => p.teamMembers.includes(query.teamMember!));
// //     if (query.tag) items = items.filter((p) => p.tags.includes(query.tag!));
// //     if (query.search) {
// //       const s = query.search.toLowerCase();
// //       items = items.filter(
// //         (p) =>
// //           p.name.toLowerCase().includes(s) || p.clientName.toLowerCase().includes(s)
// //       );
// //     }
// //     const page = query.page || 1;
// //     const limit = query.limit || 20;
// //     const total = items.length;
// //     const start = (page - 1) * limit;
// //     const projects = items.slice(start, start + limit);
// //     return mockDelay({
// //       projects,
// //       pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
// //     });
// //   }
// //   return request<ProjectsResponse>(`/projects${qs(query as Record<string, unknown>)}`);
// // }

// // export async function getProject(id: string): Promise<Project> {
// //   if (USE_MOCK) {
// //     const project = mockState.projects.find((p) => p._id === id);
// //     if (!project) throw new ApiError(404, { message: "Project not found" });
// //     return mockDelay(project, 200);
// //   }
// //   return request<Project>(`/projects/${id}`);
// // }

// // export async function createProject(data: {
// //   name: string;
// //   clientName: string;
// //   clientEmail?: string | null;
// //   clientPhone?: string | null;
// //   clientId?: string | null;
// //   description?: string | null;
// //   teamMembers?: string[];
// //   docLinks?: { label: string; url: string }[];
// //   startDate?: string | null;
// //   dueDate?: string | null;
// //   tags?: string[];
// //   sourceLeadId?: string | null;
// // }): Promise<Project> {
// //   if (USE_MOCK) {
// //     const now = new Date().toISOString();
// //     const project: Project = {
// //       _id: nextId("project"),
// //       name: data.name,
// //       clientId: data.clientId ?? null,
// //       clientName: data.clientName,
// //       clientEmail: data.clientEmail ?? null,
// //       clientPhone: data.clientPhone ?? null,
// //       description: data.description ?? null,
// //       status: "active",
// //       docLinks: (data.docLinks || []).map((d) => ({ ...d, _id: nextId("dl") })),
// //       teamMembers: data.teamMembers || [],
// //       sourceLeadId: data.sourceLeadId ?? null,
// //       startDate: data.startDate ?? null,
// //       dueDate: data.dueDate ?? null,
// //       tags: data.tags || [],
// //       createdBy: MOCK_USER.id,
// //       createdAt: now,
// //       updatedAt: now,
// //     };
// //     mockState.projects.unshift(project);
// //     return mockDelay(project);
// //   }
// //   return request<Project>("/projects", { method: "POST", body: JSON.stringify(data) });
// // }

// // export async function createProjectFromLead(
// //   leadId: string,
// //   data: {
// //     name?: string;
// //     teamMembers?: string[];
// //     docLinks?: { label: string; url: string }[];
// //   }
// // ): Promise<Project> {
// //   if (USE_MOCK) {
// //     const lead = mockState.leads.find((l) => l._id === leadId);
// //     if (!lead) throw new ApiError(404, { message: "Lead not found" });
// //     const now = new Date().toISOString();
// //     const project: Project = {
// //       _id: nextId("project"),
// //       name: data.name || `${lead.name} Project`,
// //       clientId: null,
// //       clientName: lead.name,
// //       clientEmail: lead.email,
// //       clientPhone: lead.phone,
// //       description: null,
// //       status: "active",
// //       docLinks: (data.docLinks || []).map((d) => ({ ...d, _id: nextId("dl") })),
// //       teamMembers: data.teamMembers || [],
// //       sourceLeadId: lead._id,
// //       startDate: null,
// //       dueDate: null,
// //       tags: [],
// //       createdBy: MOCK_USER.id,
// //       createdAt: now,
// //       updatedAt: now,
// //     };
// //     mockState.projects.unshift(project);
// //     return mockDelay(project);
// //   }
// //   return request<Project>(`/projects/from-lead/${leadId}`, {
// //     method: "POST",
// //     body: JSON.stringify(data),
// //   });
// // }

// // export async function updateProject(
// //   id: string,
// //   data: Partial<
// //     Pick<
// //       Project,
// //       | "name"
// //       | "clientName"
// //       | "clientEmail"
// //       | "clientPhone"
// //       | "clientId"
// //       | "description"
// //       | "status"
// //       | "startDate"
// //       | "dueDate"
// //       | "tags"
// //     >
// //   >
// // ): Promise<Project> {
// //   if (USE_MOCK) {
// //     const idx = mockState.projects.findIndex((p) => p._id === id);
// //     if (idx === -1) throw new ApiError(404, { message: "Project not found" });
// //     mockState.projects[idx] = {
// //       ...mockState.projects[idx],
// //       ...data,
// //       updatedAt: new Date().toISOString(),
// //     };
// //     return mockDelay(mockState.projects[idx]);
// //   }
// //   return request<Project>(`/projects/${id}`, {
// //     method: "PATCH",
// //     body: JSON.stringify(data),
// //   });
// // }

// // export async function deleteProject(
// //   id: string
// // ): Promise<{ message: string; tasksDeleted: number }> {
// //   if (USE_MOCK) {
// //     mockState.projects = mockState.projects.filter((p) => p._id !== id);
// //     return mockDelay({ message: "Project deleted", tasksDeleted: 0 });
// //   }
// //   return request(`/projects/${id}`, { method: "DELETE" });
// // }

// // export async function addDocLink(
// //   projectId: string,
// //   data: { label: string; url: string }
// // ): Promise<DocLink> {
// //   if (USE_MOCK) {
// //     const link: DocLink = { _id: nextId("dl"), ...data };
// //     const project = mockState.projects.find((p) => p._id === projectId);
// //     if (project) project.docLinks.push(link);
// //     return mockDelay(link);
// //   }
// //   return request<DocLink>(`/projects/${projectId}/doc-links`, {
// //     method: "POST",
// //     body: JSON.stringify(data),
// //   });
// // }

// // export async function deleteDocLink(projectId: string, linkId: string) {
// //   if (USE_MOCK) {
// //     const project = mockState.projects.find((p) => p._id === projectId);
// //     if (project) project.docLinks = project.docLinks.filter((d) => d._id !== linkId);
// //     return mockDelay({ message: "Doc link removed" });
// //   }
// //   return request<{ message: string }>(`/projects/${projectId}/doc-links/${linkId}`, {
// //     method: "DELETE",
// //   });
// // }

// // export async function getProjectTeam(
// //   projectId: string
// // ): Promise<{ team: Pick<User, "id" | "name" | "email" | "role">[] }> {
// //   if (USE_MOCK) {
// //     const project = mockState.projects.find((p) => p._id === projectId);
// //     const team = (project?.teamMembers || [])
// //       .map((uid) => mockState.users.find((u) => u.id === uid))
// //       .filter((u): u is User => !!u)
// //       .map(({ id, name, email, role }) => ({ id, name, email, role }));
// //     return mockDelay({ team }, 200);
// //   }
// //   return request(`/projects/${projectId}/team`);
// // }

// // export async function addProjectTeamMember(
// //   projectId: string,
// //   userId: string
// // ): Promise<Project> {
// //   if (USE_MOCK) {
// //     const project = mockState.projects.find((p) => p._id === projectId);
// //     if (!project) throw new ApiError(404, { message: "Project not found" });
// //     if (!project.teamMembers.includes(userId)) project.teamMembers.push(userId);
// //     return mockDelay(project);
// //   }
// //   return request<Project>(`/projects/${projectId}/team`, {
// //     method: "POST",
// //     body: JSON.stringify({ userId }),
// //   });
// // }

// // export async function removeProjectTeamMember(projectId: string, userId: string) {
// //   if (USE_MOCK) {
// //     const project = mockState.projects.find((p) => p._id === projectId);
// //     if (project) project.teamMembers = project.teamMembers.filter((u) => u !== userId);
// //     return mockDelay({ message: "Member removed" });
// //   }
// //   return request<{ message: string }>(`/projects/${projectId}/team/${userId}`, {
// //     method: "DELETE",
// //   });
// // }

// // // ---------------- Phase 2: Tasks ----------------
// // // Additive module — mirrors 04-PHASE2-API-CONTRACT.md section 3.

// // export async function getTasks(query: TasksQuery): Promise<TasksResponse> {
// //   if (USE_MOCK) {
// //     let items = [...mockState.tasks];
// //     if (query.projectId) items = items.filter((t) => t.projectId === query.projectId);
// //     if (query.status) items = items.filter((t) => t.status === query.status);
// //     if (query.priority) items = items.filter((t) => t.priority === query.priority);
// //     if (query.assignee)
// //       items = items.filter((t) => t.assignees.includes(query.assignee!));
// //     if (query.search) {
// //       const s = query.search.toLowerCase();
// //       items = items.filter((t) => t.title.toLowerCase().includes(s));
// //     }
// //     const page = query.page || 1;
// //     const limit = query.limit || 100;
// //     const total = items.length;
// //     const start = (page - 1) * limit;
// //     const tasks = items.slice(start, start + limit);
// //     return mockDelay({
// //       tasks,
// //       pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
// //     });
// //   }
// //   return request<TasksResponse>(`/tasks${qs(query as Record<string, unknown>)}`);
// // }

// // export async function getTask(id: string): Promise<Task> {
// //   if (USE_MOCK) {
// //     const task = mockState.tasks.find((t) => t._id === id);
// //     if (!task) throw new ApiError(404, { message: "Task not found" });
// //     return mockDelay(task, 150);
// //   }
// //   return request<Task>(`/tasks/${id}`);
// // }

// // export async function createTask(data: {
// //   projectId: string;
// //   title: string;
// //   description?: string | null;
// //   assignees?: string[];
// //   priority?: string;
// //   dueDate?: string | null;
// // }): Promise<Task> {
// //   if (USE_MOCK) {
// //     const now = new Date().toISOString();
// //     const task: Task = {
// //       _id: nextId("task"),
// //       projectId: data.projectId,
// //       title: data.title,
// //       description: data.description ?? null,
// //       assignees: data.assignees || [],
// //       status: "todo",
// //       priority: (data.priority as Task["priority"]) || "medium",
// //       dueDate: data.dueDate ?? null,
// //       comments: [],
// //       createdBy: MOCK_USER.id,
// //       createdAt: now,
// //       updatedAt: now,
// //     };
// //     mockState.tasks.unshift(task);
// //     return mockDelay(task);
// //   }
// //   return request<Task>("/tasks", { method: "POST", body: JSON.stringify(data) });
// // }

// // export async function updateTask(
// //   id: string,
// //   data: Partial<
// //     Pick<Task, "title" | "description" | "assignees" | "status" | "priority" | "dueDate">
// //   >
// // ): Promise<Task> {
// //   if (USE_MOCK) {
// //     const idx = mockState.tasks.findIndex((t) => t._id === id);
// //     if (idx === -1) throw new ApiError(404, { message: "Task not found" });
// //     mockState.tasks[idx] = {
// //       ...mockState.tasks[idx],
// //       ...data,
// //       updatedAt: new Date().toISOString(),
// //     };
// //     return mockDelay(mockState.tasks[idx]);
// //   }
// //   return request<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) });
// // }

// // export async function deleteTask(id: string) {
// //   if (USE_MOCK) {
// //     mockState.tasks = mockState.tasks.filter((t) => t._id !== id);
// //     return mockDelay({ message: "Task deleted" });
// //   }
// //   return request<{ message: string }>(`/tasks/${id}`, { method: "DELETE" });
// // }

// // export async function addTaskComment(taskId: string, text: string): Promise<TaskComment> {
// //   if (USE_MOCK) {
// //     const comment: TaskComment = {
// //       _id: nextId("comment"),
// //       text,
// //       createdBy: MOCK_USER.id,
// //       createdAt: new Date().toISOString(),
// //     };
// //     const task = mockState.tasks.find((t) => t._id === taskId);
// //     if (task) task.comments.unshift(comment);
// //     return mockDelay(comment);
// //   }
// //   return request<TaskComment>(`/tasks/${taskId}/comments`, {
// //     method: "POST",
// //     body: JSON.stringify({ text }),
// //   });
// // }

// // export async function deleteTaskComment(taskId: string, commentId: string) {
// //   if (USE_MOCK) {
// //     const task = mockState.tasks.find((t) => t._id === taskId);
// //     if (task) task.comments = task.comments.filter((c) => c._id !== commentId);
// //     return mockDelay({ message: "Comment deleted" });
// //   }
// //   return request<{ message: string }>(`/tasks/${taskId}/comments/${commentId}`, {
// //     method: "DELETE",
// //   });
// // }

// // export { ApiError };


// import {
//   ApiError,
//   DashboardFollowUp,
//   DashboardOverview,
//   Lead,
//   LeadNote,
//   LeadsQuery,
//   LeadsResponse,
//   FollowUp,
//   Notification,
//   SheetSource,
//   SourcePreviewResponse,
//   User,
//   Project,
//   ProjectsQuery,
//   ProjectsResponse,
//   DocLink,
//   Task,
//   TasksQuery,
//   TasksResponse,
//   TaskComment,
// } from "./types";
// import {
//   MOCK_LEADS,
//   MOCK_NOTIFICATIONS,
//   MOCK_PROJECTS,
//   MOCK_SOURCES,
//   MOCK_TASKS,
//   MOCK_USER,
//   MOCK_USERS,
//   buildMockFollowUps,
//   buildMockOverview,
// } from "./mock-data";

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
// const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

// const TOKEN_KEY = "gowappily_token";

// export function getToken(): string | null {
//   if (typeof window === "undefined") return null;
//   return localStorage.getItem(TOKEN_KEY);
// }

// export function setToken(token: string) {
//   if (typeof window === "undefined") return;
//   localStorage.setItem(TOKEN_KEY, token);
// }

// export function clearToken() {
//   if (typeof window === "undefined") return;
//   localStorage.removeItem(TOKEN_KEY);
// }

// async function mockDelay<T>(value: T, ms = 400): Promise<T> {
//   await new Promise((r) => setTimeout(r, ms));
//   return value;
// }

// async function request<T>(
//   path: string,
//   options: RequestInit = {}
// ): Promise<T> {
//   const token = getToken();
//   const res = await fetch(`${API_BASE_URL}${path}`, {
//     ...options,
//     headers: {
//       "Content-Type": "application/json",
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//       ...(options.headers || {}),
//     },
//   });

//   let body: unknown = null;
//   const text = await res.text();
//   if (text) {
//     try {
//       body = JSON.parse(text);
//     } catch {
//       body = { message: text };
//     }
//   }

//   if (!res.ok) {
//     throw new ApiError(
//       res.status,
//       (body as { message: string; errors?: { field: string; message: string }[] }) || {
//         message: "Request failed",
//       }
//     );
//   }
//   return body as T;
// }

// function qs(params: Record<string, unknown>): string {
//   const usp = new URLSearchParams();
//   Object.entries(params).forEach(([k, v]) => {
//     if (v !== undefined && v !== null && v !== "") usp.set(k, String(v));
//   });
//   const s = usp.toString();
//   return s ? `?${s}` : "";
// }

// // In-memory mutable mock store (persists for the session only)
// const mockState = {
//   leads: [...MOCK_LEADS],
//   sources: [...MOCK_SOURCES],
//   notifications: [...MOCK_NOTIFICATIONS],
//   users: [...MOCK_USERS],
//   projects: [...MOCK_PROJECTS],
//   tasks: [...MOCK_TASKS],
// };

// let idCounter = 10000;
// const nextId = (prefix: string) => `${prefix}_${idCounter++}`;

// // ---------------- Auth ----------------

// export async function login(email: string, password: string) {
//   if (USE_MOCK) {
//     if (!email || !password) {
//       throw new ApiError(401, { message: "Invalid credentials" });
//     }
//     return mockDelay({ token: "mock-jwt-token", user: MOCK_USER });
//   }
//   return request<{ token: string; user: User }>("/auth/login", {
//     method: "POST",
//     body: JSON.stringify({ email, password }),
//   });
// }

// export async function getMe() {
//   if (USE_MOCK) return mockDelay(MOCK_USER, 150);
//   return request<User>("/auth/me");
// }

// export async function logout() {
//   if (USE_MOCK) return mockDelay({ message: "Logged out" }, 100);
//   return request<{ message: string }>("/auth/logout", { method: "POST" });
// }

// // ---------------- Leads ----------------

// export async function getLeads(query: LeadsQuery): Promise<LeadsResponse> {
//   if (USE_MOCK) {
//     let items = [...mockState.leads];
//     if (query.status) items = items.filter((l) => l.status === query.status);
//     if (query.priority) items = items.filter((l) => l.priority === query.priority);
//     if (query.sourceSheetId)
//       items = items.filter((l) => l.sourceSheetId === query.sourceSheetId);
//     if (query.tag) items = items.filter((l) => l.tags.includes(query.tag!));
//     if (query.assignedTo)
//       items = items.filter((l) => l.assignedTo === query.assignedTo);
//     if (query.search) {
//       const s = query.search.toLowerCase();
//       items = items.filter(
//         (l) =>
//           l.name.toLowerCase().includes(s) ||
//           l.phone.includes(s) ||
//           (l.email || "").toLowerCase().includes(s)
//       );
//     }
//     if (query.dateFrom)
//       items = items.filter((l) => l.createdAt >= query.dateFrom!);
//     if (query.dateTo) items = items.filter((l) => l.createdAt <= query.dateTo!);

//     const sortBy = query.sortBy || "createdAt";
//     const dir = query.sortOrder === "asc" ? 1 : -1;
//     items.sort((a, b) => {
//       const av = (a as unknown as Record<string, unknown>)[sortBy];
//       const bv = (b as unknown as Record<string, unknown>)[sortBy];
//       if (av === bv) return 0;
//       return av! > bv! ? dir : -dir;
//     });

//     const page = query.page || 1;
//     const limit = query.limit || 20;
//     const total = items.length;
//     const start = (page - 1) * limit;
//     const leads = items.slice(start, start + limit);
//     return mockDelay({
//       leads,
//       pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
//     });
//   }
//   return request<LeadsResponse>(`/leads${qs(query as Record<string, unknown>)}`);
// }

// export async function getLead(id: string): Promise<Lead> {
//   if (USE_MOCK) {
//     const lead = mockState.leads.find((l) => l._id === id);
//     if (!lead) throw new ApiError(404, { message: "Lead not found" });
//     return mockDelay(lead, 200);
//   }
//   return request<Lead>(`/leads/${id}`);
// }

// export async function createLead(
//   data: Partial<Lead>
// ): Promise<Lead> {
//   if (USE_MOCK) {
//     const now = new Date().toISOString();
//     const lead: Lead = {
//       _id: nextId("lead"),
//       name: data.name || "",
//       phone: data.phone || "",
//       whatsapp: data.whatsapp ?? null,
//       email: data.email ?? null,
//       city: data.city ?? null,
//       sourceSheetId: "",
//       sourceSheetName: "Manual entry",
//       sourceRowId: "",
//       campaign: null,
//       serviceInterested: null,
//       requirement: null,
//       status: data.status || "new",
//       priority: data.priority ?? null,
//       assignedTo: data.assignedTo ?? null,
//       expectedValue: null,
//       remarks: null,
//       nextAction: null,
//       originalDate: now,
//       notes: [],
//       followUps: [],
//       tags: data.tags || [],
//       createdAt: now,
//       updatedAt: now,
//     };
//     mockState.leads.unshift(lead);
//     return mockDelay(lead);
//   }
//   return request<Lead>("/leads", { method: "POST", body: JSON.stringify(data) });
// }

// export async function updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
//   if (USE_MOCK) {
//     const idx = mockState.leads.findIndex((l) => l._id === id);
//     if (idx === -1) throw new ApiError(404, { message: "Lead not found" });
//     mockState.leads[idx] = {
//       ...mockState.leads[idx],
//       ...data,
//       updatedAt: new Date().toISOString(),
//     };
//     return mockDelay(mockState.leads[idx]);
//   }
//   return request<Lead>(`/leads/${id}`, {
//     method: "PATCH",
//     body: JSON.stringify(data),
//   });
// }

// export async function deleteLead(id: string): Promise<{ message: string }> {
//   if (USE_MOCK) {
//     mockState.leads = mockState.leads.filter((l) => l._id !== id);
//     return mockDelay({ message: "Lead deleted" });
//   }
//   return request(`/leads/${id}`, { method: "DELETE" });
// }

// export async function addNote(leadId: string, text: string): Promise<LeadNote> {
//   if (USE_MOCK) {
//     const note: LeadNote = {
//       _id: nextId("note"),
//       text,
//       createdBy: MOCK_USER.id,
//       createdAt: new Date().toISOString(),
//     };
//     const lead = mockState.leads.find((l) => l._id === leadId);
//     if (lead) lead.notes.unshift(note);
//     return mockDelay(note);
//   }
//   return request<LeadNote>(`/leads/${leadId}/notes`, {
//     method: "POST",
//     body: JSON.stringify({ text }),
//   });
// }

// export async function deleteNote(leadId: string, noteId: string) {
//   if (USE_MOCK) {
//     const lead = mockState.leads.find((l) => l._id === leadId);
//     if (lead) lead.notes = lead.notes.filter((n) => n._id !== noteId);
//     return mockDelay({ message: "Note deleted" });
//   }
//   return request<{ message: string }>(`/leads/${leadId}/notes/${noteId}`, {
//     method: "DELETE",
//   });
// }

// export async function addFollowUp(
//   leadId: string,
//   data: { dueDate: string; note: string }
// ): Promise<FollowUp> {
//   if (USE_MOCK) {
//     const fu: FollowUp = {
//       _id: nextId("fu"),
//       dueDate: data.dueDate,
//       note: data.note,
//       status: "pending",
//       reminderSent: false,
//       createdAt: new Date().toISOString(),
//     };
//     const lead = mockState.leads.find((l) => l._id === leadId);
//     if (lead) lead.followUps.unshift(fu);
//     return mockDelay(fu);
//   }
//   return request<FollowUp>(`/leads/${leadId}/follow-ups`, {
//     method: "POST",
//     body: JSON.stringify(data),
//   });
// }

// export async function updateFollowUp(
//   leadId: string,
//   followUpId: string,
//   data: Partial<Pick<FollowUp, "status" | "note" | "dueDate">>
// ): Promise<FollowUp> {
//   if (USE_MOCK) {
//     const lead = mockState.leads.find((l) => l._id === leadId);
//     const fu = lead?.followUps.find((f) => f._id === followUpId);
//     if (!fu) throw new ApiError(404, { message: "Follow-up not found" });
//     Object.assign(fu, data);
//     return mockDelay(fu);
//   }
//   return request<FollowUp>(`/leads/${leadId}/follow-ups/${followUpId}`, {
//     method: "PATCH",
//     body: JSON.stringify(data),
//   });
// }

// export async function deleteFollowUp(leadId: string, followUpId: string) {
//   if (USE_MOCK) {
//     const lead = mockState.leads.find((l) => l._id === leadId);
//     if (lead) lead.followUps = lead.followUps.filter((f) => f._id !== followUpId);
//     return mockDelay({ message: "Follow-up deleted" });
//   }
//   return request<{ message: string }>(
//     `/leads/${leadId}/follow-ups/${followUpId}`,
//     { method: "DELETE" }
//   );
// }

// // ---------------- Sources ----------------

// export async function getSources(params: {
//   tag?: string;
//   status?: string;
// }): Promise<{ sources: SheetSource[] }> {
//   if (USE_MOCK) {
//     let items = [...mockState.sources];
//     if (params.tag) items = items.filter((s) => s.tags.includes(params.tag!));
//     if (params.status) items = items.filter((s) => s.status === params.status);
//     return mockDelay({ sources: items });
//   }
//   return request(`/sources${qs(params)}`);
// }

// export async function getSource(id: string): Promise<SheetSource> {
//   if (USE_MOCK) {
//     const s = mockState.sources.find((s) => s._id === id);
//     if (!s) throw new ApiError(404, { message: "Source not found" });
//     return mockDelay(s, 200);
//   }
//   return request<SheetSource>(`/sources/${id}`);
// }

// export async function previewSource(sheetUrl: string): Promise<SourcePreviewResponse> {
//   if (USE_MOCK) {
//     if (!sheetUrl.includes("docs.google.com/spreadsheets")) {
//       throw new ApiError(400, {
//         message:
//           'Sheet not accessible — make sure link sharing is set to "Anyone with the link"',
//       });
//     }
//     const headers = [
//       "Date", "Priority", "Lead Name", "City", "Phone", "WhatsApp", "Email",
//       "Source", "Campaign", "Service Interested", "Requirement", "Lead Status",
//       "Assigned To", "Follow-up Date", "Last Follow-up", "Next Action",
//       "Expected Value", "Remarks",
//     ];
//     return mockDelay({
//       headers,
//       sampleRows: [
//         {
//           Date: "2026-08-01", Priority: "High", "Lead Name": "Sample Lead",
//           City: "Meerut", Phone: "9876543210", WhatsApp: "9876543210",
//           Email: "sample@lead.com", Source: "Facebook", Campaign: "Diwali Offer",
//           "Service Interested": "Balloon Decoration", Requirement: "100 guests",
//           "Lead Status": "New", "Assigned To": "Priya", "Follow-up Date": "2026-08-05",
//           "Last Follow-up": "", "Next Action": "Send quote", "Expected Value": "25000",
//           Remarks: "",
//         },
//       ],
//       detectedMapping: {
//         date: "Date", priority: "Priority", name: "Lead Name", city: "City",
//         phone: "Phone", whatsapp: "WhatsApp", email: "Email", source: "Source",
//         campaign: "Campaign", serviceInterested: "Service Interested",
//         requirement: "Requirement", leadStatus: "Lead Status",
//         assignedTo: "Assigned To", followUpDate: "Follow-up Date",
//         lastFollowUp: "Last Follow-up", nextAction: "Next Action",
//         expectedValue: "Expected Value", remarks: "Remarks",
//       },
//     }, 700);
//   }
//   return request<SourcePreviewResponse>("/sources/preview", {
//     method: "POST",
//     body: JSON.stringify({ sheetUrl }),
//   });
// }

// export async function createSource(data: {
//   name: string;
//   sheetUrl: string;
//   tags: string[];
//   columnMapping: SheetSource["columnMapping"];
//   syncIntervalMinutes?: number;
// }): Promise<SheetSource> {
//   if (USE_MOCK) {
//     const now = new Date().toISOString();
//     const idMatch = data.sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
//     const source: SheetSource = {
//       _id: nextId("source"),
//       name: data.name,
//       sheetUrl: data.sheetUrl,
//       sheetId: idMatch ? idMatch[1] : "unknown",
//       gid: "0",
//       tags: data.tags,
//       status: "active",
//       lastSyncAt: null,
//       lastSyncStatus: "never_synced",
//       lastSyncError: null,
//       rowsImported: 0,
//       columnMapping: data.columnMapping,
//       syncIntervalMinutes: data.syncIntervalMinutes || 30,
//       createdBy: MOCK_USER.id,
//       createdAt: now,
//       updatedAt: now,
//     };
//     mockState.sources.unshift(source);
//     setTimeout(() => {
//       source.lastSyncAt = new Date().toISOString();
//       source.lastSyncStatus = "success";
//       source.rowsImported = Math.floor(10 + Math.random() * 50);
//     }, 2000);
//     return mockDelay(source);
//   }
//   return request<SheetSource>("/sources", {
//     method: "POST",
//     body: JSON.stringify(data),
//   });
// }

// export async function updateSource(
//   id: string,
//   data: Partial<
//     Pick<SheetSource, "name" | "tags" | "columnMapping" | "syncIntervalMinutes" | "status">
//   >
// ): Promise<SheetSource> {
//   if (USE_MOCK) {
//     const idx = mockState.sources.findIndex((s) => s._id === id);
//     if (idx === -1) throw new ApiError(404, { message: "Source not found" });
//     mockState.sources[idx] = {
//       ...mockState.sources[idx],
//       ...data,
//       updatedAt: new Date().toISOString(),
//     };
//     return mockDelay(mockState.sources[idx]);
//   }
//   return request<SheetSource>(`/sources/${id}`, {
//     method: "PATCH",
//     body: JSON.stringify(data),
//   });
// }

// export async function deleteSource(id: string) {
//   if (USE_MOCK) {
//     mockState.sources = mockState.sources.filter((s) => s._id !== id);
//     return mockDelay({ message: "Source deleted" });
//   }
//   return request<{ message: string }>(`/sources/${id}`, { method: "DELETE" });
// }

// export async function syncSourceNow(id: string) {
//   if (USE_MOCK) {
//     const source = mockState.sources.find((s) => s._id === id);
//     setTimeout(() => {
//       if (source) {
//         source.lastSyncAt = new Date().toISOString();
//         source.lastSyncStatus = "success";
//         source.rowsImported += Math.floor(1 + Math.random() * 5);
//       }
//     }, 1500);
//     return mockDelay({ message: "Sync started" });
//   }
//   return request<{ message: string }>(`/sources/${id}/sync-now`, {
//     method: "POST",
//   });
// }

// // ---------------- Dashboard ----------------

// export async function getDashboardOverview(): Promise<DashboardOverview> {
//   if (USE_MOCK) return mockDelay(buildMockOverview(), 500);
//   return request<DashboardOverview>("/dashboard/overview");
// }

// export async function getDashboardFollowUps(
//   type: "today" | "missed" | "upcoming"
// ): Promise<{ followUps: DashboardFollowUp[] }> {
//   if (USE_MOCK)
//     return mockDelay({ followUps: buildMockFollowUps(type) }, 300);
//   return request(`/dashboard/follow-ups${qs({ type })}`);
// }

// // ---------------- Users ----------------

// export async function getUsers(): Promise<{ users: User[] }> {
//   if (USE_MOCK) return mockDelay({ users: mockState.users });
//   return request("/users");
// }

// export async function createUser(data: {
//   name: string;
//   email: string;
//   password: string;
//   role: string;
// }): Promise<User> {
//   if (USE_MOCK) {
//     const user: User = {
//       id: nextId("user"),
//       name: data.name,
//       email: data.email,
//       role: data.role as User["role"],
//     };
//     mockState.users.push(user);
//     return mockDelay(user);
//   }
//   return request<User>("/users", { method: "POST", body: JSON.stringify(data) });
// }

// export async function updateUser(
//   id: string,
//   data: Partial<{ name: string; email: string; role: string }>
// ): Promise<User> {
//   if (USE_MOCK) {
//     const idx = mockState.users.findIndex((u) => u.id === id);
//     if (idx === -1) throw new ApiError(404, { message: "User not found" });
//     mockState.users[idx] = { ...mockState.users[idx], ...data } as User;
//     return mockDelay(mockState.users[idx]);
//   }
//   return request<User>(`/users/${id}`, {
//     method: "PATCH",
//     body: JSON.stringify(data),
//   });
// }

// export async function deleteUser(id: string) {
//   if (USE_MOCK) {
//     mockState.users = mockState.users.filter((u) => u.id !== id);
//     return mockDelay({ message: "User deleted" });
//   }
//   return request<{ message: string }>(`/users/${id}`, { method: "DELETE" });
// }

// // ---------------- Notifications ----------------

// export async function getNotifications(): Promise<{
//   notifications: Notification[];
// }> {
//   if (USE_MOCK) return mockDelay({ notifications: mockState.notifications });
//   return request("/notifications");
// }

// export async function markNotificationRead(id: string) {
//   if (USE_MOCK) {
//     const n = mockState.notifications.find((n) => n._id === id);
//     if (n) n.read = true;
//     return mockDelay({ message: "Marked read" });
//   }
//   return request<{ message: string }>(`/notifications/${id}/read`, {
//     method: "PATCH",
//   });
// }

// // ---------------- Phase 2: Projects ----------------
// // Additive module — mirrors 04-PHASE2-API-CONTRACT.md section 2.
// // Kept in this same file to match the existing single-api-client-module
// // convention from Phase 1 (see lead/source methods above).

// export async function getProjects(query: ProjectsQuery): Promise<ProjectsResponse> {
//   if (USE_MOCK) {
//     let items = [...mockState.projects];
//     if (query.status) items = items.filter((p) => p.status === query.status);
//     if (query.clientId) items = items.filter((p) => p.clientId === query.clientId);
//     if (query.teamMember)
//       items = items.filter((p) => p.teamMembers.includes(query.teamMember!));
//     if (query.tag) items = items.filter((p) => p.tags.includes(query.tag!));
//     if (query.search) {
//       const s = query.search.toLowerCase();
//       items = items.filter(
//         (p) =>
//           p.name.toLowerCase().includes(s) || p.clientName.toLowerCase().includes(s)
//       );
//     }
//     const page = query.page || 1;
//     const limit = query.limit || 20;
//     const total = items.length;
//     const start = (page - 1) * limit;
//     const projects = items.slice(start, start + limit);
//     return mockDelay({
//       projects,
//       pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
//     });
//   }
//   return request<ProjectsResponse>(`/projects${qs(query as Record<string, unknown>)}`);
// }

// export async function getProject(id: string): Promise<Project> {
//   if (USE_MOCK) {
//     const project = mockState.projects.find((p) => p._id === id);
//     if (!project) throw new ApiError(404, { message: "Project not found" });
//     return mockDelay(project, 200);
//   }
//   return request<Project>(`/projects/${id}`);
// }

// export async function createProject(data: {
//   name: string;
//   clientName: string;
//   clientEmail?: string | null;
//   clientPhone?: string | null;
//   clientId?: string | null;
//   description?: string | null;
//   teamMembers?: string[];
//   docLinks?: { label: string; url: string }[];
//   startDate?: string | null;
//   dueDate?: string | null;
//   tags?: string[];
//   sourceLeadId?: string | null;
// }): Promise<Project> {
//   if (USE_MOCK) {
//     const now = new Date().toISOString();
//     const project: Project = {
//       _id: nextId("project"),
//       name: data.name,
//       clientId: data.clientId ?? null,
//       clientName: data.clientName,
//       clientEmail: data.clientEmail ?? null,
//       clientPhone: data.clientPhone ?? null,
//       description: data.description ?? null,
//       status: "active",
//       docLinks: (data.docLinks || []).map((d) => ({ ...d, _id: nextId("dl") })),
//       teamMembers: data.teamMembers || [],
//       sourceLeadId: data.sourceLeadId ?? null,
//       startDate: data.startDate ?? null,
//       dueDate: data.dueDate ?? null,
//       tags: data.tags || [],
//       createdBy: MOCK_USER.id,
//       createdAt: now,
//       updatedAt: now,
//     };
//     mockState.projects.unshift(project);
//     return mockDelay(project);
//   }
//   return request<Project>("/projects", { method: "POST", body: JSON.stringify(data) });
// }

// export async function createProjectFromLead(
//   leadId: string,
//   data: {
//     name?: string;
//     teamMembers?: string[];
//     docLinks?: { label: string; url: string }[];
//   }
// ): Promise<Project> {
//   if (USE_MOCK) {
//     const lead = mockState.leads.find((l) => l._id === leadId);
//     if (!lead) throw new ApiError(404, { message: "Lead not found" });
//     const now = new Date().toISOString();
//     const project: Project = {
//       _id: nextId("project"),
//       name: data.name || `${lead.name} Project`,
//       clientId: null,
//       clientName: lead.name,
//       clientEmail: lead.email,
//       clientPhone: lead.phone,
//       description: null,
//       status: "active",
//       docLinks: (data.docLinks || []).map((d) => ({ ...d, _id: nextId("dl") })),
//       teamMembers: data.teamMembers || [],
//       sourceLeadId: lead._id,
//       startDate: null,
//       dueDate: null,
//       tags: [],
//       createdBy: MOCK_USER.id,
//       createdAt: now,
//       updatedAt: now,
//     };
//     mockState.projects.unshift(project);
//     return mockDelay(project);
//   }
//   return request<Project>(`/projects/from-lead/${leadId}`, {
//     method: "POST",
//     body: JSON.stringify(data),
//   });
// }

// export async function updateProject(
//   id: string,
//   data: Partial<
//     Pick<
//       Project,
//       | "name"
//       | "clientName"
//       | "clientEmail"
//       | "clientPhone"
//       | "clientId"
//       | "description"
//       | "status"
//       | "startDate"
//       | "dueDate"
//       | "tags"
//     >
//   >
// ): Promise<Project> {
//   if (USE_MOCK) {
//     const idx = mockState.projects.findIndex((p) => p._id === id);
//     if (idx === -1) throw new ApiError(404, { message: "Project not found" });
//     mockState.projects[idx] = {
//       ...mockState.projects[idx],
//       ...data,
//       updatedAt: new Date().toISOString(),
//     };
//     return mockDelay(mockState.projects[idx]);
//   }
//   return request<Project>(`/projects/${id}`, {
//     method: "PATCH",
//     body: JSON.stringify(data),
//   });
// }

// export async function deleteProject(
//   id: string
// ): Promise<{ message: string; tasksDeleted: number }> {
//   if (USE_MOCK) {
//     mockState.projects = mockState.projects.filter((p) => p._id !== id);
//     return mockDelay({ message: "Project deleted", tasksDeleted: 0 });
//   }
//   return request(`/projects/${id}`, { method: "DELETE" });
// }

// export async function addDocLink(
//   projectId: string,
//   data: { label: string; url: string }
// ): Promise<DocLink> {
//   if (USE_MOCK) {
//     const link: DocLink = { _id: nextId("dl"), ...data };
//     const project = mockState.projects.find((p) => p._id === projectId);
//     if (project) project.docLinks.push(link);
//     return mockDelay(link);
//   }
//   return request<DocLink>(`/projects/${projectId}/doc-links`, {
//     method: "POST",
//     body: JSON.stringify(data),
//   });
// }

// export async function deleteDocLink(projectId: string, linkId: string) {
//   if (USE_MOCK) {
//     const project = mockState.projects.find((p) => p._id === projectId);
//     if (project) project.docLinks = project.docLinks.filter((d) => d._id !== linkId);
//     return mockDelay({ message: "Doc link removed" });
//   }
//   return request<{ message: string }>(`/projects/${projectId}/doc-links/${linkId}`, {
//     method: "DELETE",
//   });
// }

// export async function getProjectTeam(
//   projectId: string
// ): Promise<{ team: Pick<User, "id" | "name" | "email" | "role">[] }> {
//   if (USE_MOCK) {
//     const project = mockState.projects.find((p) => p._id === projectId);
//     const team = (project?.teamMembers || [])
//       .map((uid) => mockState.users.find((u) => u.id === uid))
//       .filter((u): u is User => !!u)
//       .map(({ id, name, email, role }) => ({ id, name, email, role }));
//     return mockDelay({ team }, 200);
//   }
//   return request(`/projects/${projectId}/team`);
// }

// export async function addProjectTeamMember(
//   projectId: string,
//   userId: string
// ): Promise<Project> {
//   if (USE_MOCK) {
//     const project = mockState.projects.find((p) => p._id === projectId);
//     if (!project) throw new ApiError(404, { message: "Project not found" });
//     if (!project.teamMembers.includes(userId)) project.teamMembers.push(userId);
//     return mockDelay(project);
//   }
//   return request<Project>(`/projects/${projectId}/team`, {
//     method: "POST",
//     body: JSON.stringify({ userId }),
//   });
// }

// export async function removeProjectTeamMember(projectId: string, userId: string) {
//   if (USE_MOCK) {
//     const project = mockState.projects.find((p) => p._id === projectId);
//     if (project) project.teamMembers = project.teamMembers.filter((u) => u !== userId);
//     return mockDelay({ message: "Member removed" });
//   }
//   return request<{ message: string }>(`/projects/${projectId}/team/${userId}`, {
//     method: "DELETE",
//   });
// }

// // ---------------- Phase 2: Tasks ----------------
// // Additive module — mirrors 04-PHASE2-API-CONTRACT.md section 3.

// export async function getTasks(query: TasksQuery): Promise<TasksResponse> {
//   if (USE_MOCK) {
//     let items = [...mockState.tasks];
//     if (query.projectId) items = items.filter((t) => t.projectId === query.projectId);
//     if (query.status) items = items.filter((t) => t.status === query.status);
//     if (query.priority) items = items.filter((t) => t.priority === query.priority);
//     if (query.assignee)
//       items = items.filter((t) => t.assignees.includes(query.assignee!));
//     if (query.search) {
//       const s = query.search.toLowerCase();
//       items = items.filter((t) => t.title.toLowerCase().includes(s));
//     }
//     const page = query.page || 1;
//     const limit = query.limit || 100;
//     const total = items.length;
//     const start = (page - 1) * limit;
//     const tasks = items.slice(start, start + limit);
//     return mockDelay({
//       tasks,
//       pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
//     });
//   }
//   return request<TasksResponse>(`/tasks${qs(query as Record<string, unknown>)}`);
// }

// export async function getTask(id: string): Promise<Task> {
//   if (USE_MOCK) {
//     const task = mockState.tasks.find((t) => t._id === id);
//     if (!task) throw new ApiError(404, { message: "Task not found" });
//     return mockDelay(task, 150);
//   }
//   return request<Task>(`/tasks/${id}`);
// }

// export async function createTask(data: {
//   projectId: string;
//   title: string;
//   description?: string | null;
//   assignees?: string[];
//   priority?: string;
//   dueDate?: string | null;
// }): Promise<Task> {
//   if (USE_MOCK) {
//     const now = new Date().toISOString();
//     const task: Task = {
//       _id: nextId("task"),
//       projectId: data.projectId,
//       title: data.title,
//       description: data.description ?? null,
//       assignees: data.assignees || [],
//       status: "todo",
//       priority: (data.priority as Task["priority"]) || "medium",
//       dueDate: data.dueDate ?? null,
//       comments: [],
//       createdBy: MOCK_USER.id,
//       createdAt: now,
//       updatedAt: now,
//     };
//     mockState.tasks.unshift(task);
//     return mockDelay(task);
//   }
//   return request<Task>("/tasks", { method: "POST", body: JSON.stringify(data) });
// }

// export async function updateTask(
//   id: string,
//   data: Partial<
//     Pick<Task, "title" | "description" | "assignees" | "status" | "priority" | "dueDate">
//   >
// ): Promise<Task> {
//   if (USE_MOCK) {
//     const idx = mockState.tasks.findIndex((t) => t._id === id);
//     if (idx === -1) throw new ApiError(404, { message: "Task not found" });
//     mockState.tasks[idx] = {
//       ...mockState.tasks[idx],
//       ...data,
//       updatedAt: new Date().toISOString(),
//     };
//     return mockDelay(mockState.tasks[idx]);
//   }
//   return request<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) });
// }

// export async function deleteTask(id: string) {
//   if (USE_MOCK) {
//     mockState.tasks = mockState.tasks.filter((t) => t._id !== id);
//     return mockDelay({ message: "Task deleted" });
//   }
//   return request<{ message: string }>(`/tasks/${id}`, { method: "DELETE" });
// }

// export async function addTaskComment(taskId: string, text: string): Promise<TaskComment> {
//   if (USE_MOCK) {
//     const comment: TaskComment = {
//       _id: nextId("comment"),
//       text,
//       createdBy: MOCK_USER.id,
//       createdAt: new Date().toISOString(),
//     };
//     const task = mockState.tasks.find((t) => t._id === taskId);
//     if (task) task.comments.unshift(comment);
//     return mockDelay(comment);
//   }
//   return request<TaskComment>(`/tasks/${taskId}/comments`, {
//     method: "POST",
//     body: JSON.stringify({ text }),
//   });
// }

// export async function deleteTaskComment(taskId: string, commentId: string) {
//   if (USE_MOCK) {
//     const task = mockState.tasks.find((t) => t._id === taskId);
//     if (task) task.comments = task.comments.filter((c) => c._id !== commentId);
//     return mockDelay({ message: "Comment deleted" });
//   }
//   return request<{ message: string }>(`/tasks/${taskId}/comments/${commentId}`, {
//     method: "DELETE",
//   });
// }

// // ---------------- Phase 3: Forgot Password ----------------
// // Additive module — mirrors 09-PHASE3-API-CONTRACT.md section 1.
// // Mock behavior notes (USE_MOCK only):
// //   - forgotPassword always "succeeds" after a delay, matching the real
// //     backend's same-response-either-way behavior.
// //   - verifyOtp accepts "123456" as the valid mock OTP. Anything else counts
// //     as a wrong attempt; 5 wrong attempts for the same email locks it out
// //     until a new OTP is requested, mirroring the contract's lockout rule.
// //   - resetPassword accepts any resetToken that verifyOtp actually returned
// //     in this session and enforces the 8-char minimum from the contract.

// const mockOtpAttempts: Record<string, number> = {};
// const mockValidResetTokens = new Set<string>();
// const MOCK_OTP = "123456";

// export async function forgotPassword(email: string): Promise<{ message: string }> {
//   const message = "If an account exists for this email, an OTP has been sent.";
//   if (USE_MOCK) {
//     delete mockOtpAttempts[email];
//     return mockDelay({ message }, 500);
//   }
//   return request<{ message: string }>("/auth/forgot-password", {
//     method: "POST",
//     body: JSON.stringify({ email }),
//   });
// }

// export async function verifyOtp(
//   email: string,
//   otp: string
// ): Promise<{ resetToken: string }> {
//   if (USE_MOCK) {
//     const attempts = mockOtpAttempts[email] || 0;
//     if (attempts >= 5) {
//       throw new ApiError(400, {
//         message: "Too many incorrect attempts — request a new code.",
//       });
//     }
//     if (otp !== MOCK_OTP) {
//       mockOtpAttempts[email] = attempts + 1;
//       throw new ApiError(400, { message: "Invalid or expired OTP" });
//     }
//     delete mockOtpAttempts[email];
//     const resetToken = `mock-reset-token-${nextId("rt")}`;
//     mockValidResetTokens.add(resetToken);
//     return mockDelay({ resetToken }, 400);
//   }
//   return request<{ resetToken: string }>("/auth/verify-otp", {
//     method: "POST",
//     body: JSON.stringify({ email, otp }),
//   });
// }

// export async function resetPassword(
//   resetToken: string,
//   newPassword: string
// ): Promise<{ message: string }> {
//   if (USE_MOCK) {
//     if (!mockValidResetTokens.has(resetToken)) {
//       throw new ApiError(400, { message: "Invalid or expired reset token" });
//     }
//     if (newPassword.length < 8) {
//       throw new ApiError(400, {
//         message: "Validation failed",
//         errors: [{ field: "newPassword", message: "Must be at least 8 characters" }],
//       });
//     }
//     mockValidResetTokens.delete(resetToken);
//     return mockDelay({ message: "Password reset successful" }, 400);
//   }
//   return request<{ message: string }>("/auth/reset-password", {
//     method: "POST",
//     body: JSON.stringify({ resetToken, newPassword }),
//   });
// }

// // ---------------- Phase 3: Admin "Login As" ----------------
// // Additive module — mirrors 09-PHASE3-API-CONTRACT.md section 2.

// export async function impersonateUser(userId: string): Promise<{
//   token: string;
//   user: User;
//   impersonation: { isImpersonating: true; adminId: string; adminName: string };
// }> {
//   if (USE_MOCK) {
//     const target = mockState.users.find((u) => u.id === userId);
//     if (!target) throw new ApiError(404, { message: "User not found" });
//     if (target.role === "admin") {
//       throw new ApiError(400, { message: "Cannot impersonate another admin" });
//     }
//     return mockDelay({
//       token: `mock-impersonation-token-${target.id}`,
//       user: target,
//       impersonation: {
//         isImpersonating: true,
//         adminId: MOCK_USER.id,
//         adminName: MOCK_USER.name,
//       },
//     });
//   }
//   return request(`/auth/impersonate/${userId}`, { method: "POST" });
// }

// export { ApiError };

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
  Project,
  ProjectsQuery,
  ProjectsResponse,
  DocLink,
  Task,
  TasksQuery,
  TasksResponse,
  TaskComment,
  AuthMeResponse,
  Impersonation,
} from "./types";
import {
  MOCK_LEADS,
  MOCK_NOTIFICATIONS,
  MOCK_PROJECTS,
  MOCK_SOURCES,
  MOCK_TASKS,
  MOCK_USER,
  MOCK_USERS,
  buildMockFollowUps,
  buildMockOverview,
} from "./mock-data";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

const TOKEN_KEY = "gowappily_token";
// Separate storage key for the admin's own token while impersonating
// someone else (Phase 3 "Login As") — kept apart from TOKEN_KEY so the
// active session's token can be swapped out and back in without losing it.
const ADMIN_TOKEN_KEY = "gowappily_admin_token";

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

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
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
  projects: [...MOCK_PROJECTS],
  tasks: [...MOCK_TASKS],
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

export async function getMe(): Promise<AuthMeResponse> {
  if (USE_MOCK) {
    // Mock impersonation detection: impersonateUser() issues tokens shaped
    // "mock-impersonation-token-<userId>". If that's the active token,
    // getMe() reports the impersonated user plus the impersonation object,
    // matching the real /auth/me behavior described in the contract.
    const token = getToken();
    if (token?.startsWith("mock-impersonation-token-")) {
      const userId = token.replace("mock-impersonation-token-", "");
      const target = mockState.users.find((u) => u.id === userId);
      if (target) {
        return mockDelay({
          ...target,
          impersonation: {
            isImpersonating: true,
            adminId: MOCK_USER.id,
            adminName: MOCK_USER.name,
          },
        });
      }
    }
    return mockDelay(MOCK_USER, 150);
  }
  return request<AuthMeResponse>("/auth/me");
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
  return request("/users");
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

// ---------------- Phase 2: Projects ----------------
// Additive module — mirrors 04-PHASE2-API-CONTRACT.md section 2.
// Kept in this same file to match the existing single-api-client-module
// convention from Phase 1 (see lead/source methods above).

export async function getProjects(query: ProjectsQuery): Promise<ProjectsResponse> {
  if (USE_MOCK) {
    let items = [...mockState.projects];
    if (query.status) items = items.filter((p) => p.status === query.status);
    if (query.clientId) items = items.filter((p) => p.clientId === query.clientId);
    if (query.teamMember)
      items = items.filter((p) => p.teamMembers.includes(query.teamMember!));
    if (query.tag) items = items.filter((p) => p.tags.includes(query.tag!));
    if (query.search) {
      const s = query.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(s) || p.clientName.toLowerCase().includes(s)
      );
    }
    const page = query.page || 1;
    const limit = query.limit || 20;
    const total = items.length;
    const start = (page - 1) * limit;
    const projects = items.slice(start, start + limit);
    return mockDelay({
      projects,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }
  return request<ProjectsResponse>(`/projects${qs(query as Record<string, unknown>)}`);
}

export async function getProject(id: string): Promise<Project> {
  if (USE_MOCK) {
    const project = mockState.projects.find((p) => p._id === id);
    if (!project) throw new ApiError(404, { message: "Project not found" });
    return mockDelay(project, 200);
  }
  return request<Project>(`/projects/${id}`);
}

export async function createProject(data: {
  name: string;
  clientName: string;
  clientEmail?: string | null;
  clientPhone?: string | null;
  clientId?: string | null;
  description?: string | null;
  teamMembers?: string[];
  docLinks?: { label: string; url: string }[];
  startDate?: string | null;
  dueDate?: string | null;
  tags?: string[];
  sourceLeadId?: string | null;
}): Promise<Project> {
  if (USE_MOCK) {
    const now = new Date().toISOString();
    const project: Project = {
      _id: nextId("project"),
      name: data.name,
      clientId: data.clientId ?? null,
      clientName: data.clientName,
      clientEmail: data.clientEmail ?? null,
      clientPhone: data.clientPhone ?? null,
      description: data.description ?? null,
      status: "active",
      docLinks: (data.docLinks || []).map((d) => ({ ...d, _id: nextId("dl") })),
      teamMembers: data.teamMembers || [],
      sourceLeadId: data.sourceLeadId ?? null,
      startDate: data.startDate ?? null,
      dueDate: data.dueDate ?? null,
      tags: data.tags || [],
      createdBy: MOCK_USER.id,
      createdAt: now,
      updatedAt: now,
    };
    mockState.projects.unshift(project);
    return mockDelay(project);
  }
  return request<Project>("/projects", { method: "POST", body: JSON.stringify(data) });
}

export async function createProjectFromLead(
  leadId: string,
  data: {
    name?: string;
    teamMembers?: string[];
    docLinks?: { label: string; url: string }[];
  }
): Promise<Project> {
  if (USE_MOCK) {
    const lead = mockState.leads.find((l) => l._id === leadId);
    if (!lead) throw new ApiError(404, { message: "Lead not found" });
    const now = new Date().toISOString();
    const project: Project = {
      _id: nextId("project"),
      name: data.name || `${lead.name} Project`,
      clientId: null,
      clientName: lead.name,
      clientEmail: lead.email,
      clientPhone: lead.phone,
      description: null,
      status: "active",
      docLinks: (data.docLinks || []).map((d) => ({ ...d, _id: nextId("dl") })),
      teamMembers: data.teamMembers || [],
      sourceLeadId: lead._id,
      startDate: null,
      dueDate: null,
      tags: [],
      createdBy: MOCK_USER.id,
      createdAt: now,
      updatedAt: now,
    };
    mockState.projects.unshift(project);
    return mockDelay(project);
  }
  return request<Project>(`/projects/from-lead/${leadId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProject(
  id: string,
  data: Partial<
    Pick<
      Project,
      | "name"
      | "clientName"
      | "clientEmail"
      | "clientPhone"
      | "clientId"
      | "description"
      | "status"
      | "startDate"
      | "dueDate"
      | "tags"
    >
  >
): Promise<Project> {
  if (USE_MOCK) {
    const idx = mockState.projects.findIndex((p) => p._id === id);
    if (idx === -1) throw new ApiError(404, { message: "Project not found" });
    mockState.projects[idx] = {
      ...mockState.projects[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockDelay(mockState.projects[idx]);
  }
  return request<Project>(`/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteProject(
  id: string
): Promise<{ message: string; tasksDeleted: number }> {
  if (USE_MOCK) {
    mockState.projects = mockState.projects.filter((p) => p._id !== id);
    return mockDelay({ message: "Project deleted", tasksDeleted: 0 });
  }
  return request(`/projects/${id}`, { method: "DELETE" });
}

export async function addDocLink(
  projectId: string,
  data: { label: string; url: string }
): Promise<DocLink> {
  if (USE_MOCK) {
    const link: DocLink = { _id: nextId("dl"), ...data };
    const project = mockState.projects.find((p) => p._id === projectId);
    if (project) project.docLinks.push(link);
    return mockDelay(link);
  }
  return request<DocLink>(`/projects/${projectId}/doc-links`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteDocLink(projectId: string, linkId: string) {
  if (USE_MOCK) {
    const project = mockState.projects.find((p) => p._id === projectId);
    if (project) project.docLinks = project.docLinks.filter((d) => d._id !== linkId);
    return mockDelay({ message: "Doc link removed" });
  }
  return request<{ message: string }>(`/projects/${projectId}/doc-links/${linkId}`, {
    method: "DELETE",
  });
}

export async function getProjectTeam(
  projectId: string
): Promise<{ team: Pick<User, "id" | "name" | "email" | "role">[] }> {
  if (USE_MOCK) {
    const project = mockState.projects.find((p) => p._id === projectId);
    const team = (project?.teamMembers || [])
      .map((uid) => mockState.users.find((u) => u.id === uid))
      .filter((u): u is User => !!u)
      .map(({ id, name, email, role }) => ({ id, name, email, role }));
    return mockDelay({ team }, 200);
  }
  return request(`/projects/${projectId}/team`);
}

export async function addProjectTeamMember(
  projectId: string,
  userId: string
): Promise<Project> {
  if (USE_MOCK) {
    const project = mockState.projects.find((p) => p._id === projectId);
    if (!project) throw new ApiError(404, { message: "Project not found" });
    if (!project.teamMembers.includes(userId)) project.teamMembers.push(userId);
    return mockDelay(project);
  }
  return request<Project>(`/projects/${projectId}/team`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export async function removeProjectTeamMember(projectId: string, userId: string) {
  if (USE_MOCK) {
    const project = mockState.projects.find((p) => p._id === projectId);
    if (project) project.teamMembers = project.teamMembers.filter((u) => u !== userId);
    return mockDelay({ message: "Member removed" });
  }
  return request<{ message: string }>(`/projects/${projectId}/team/${userId}`, {
    method: "DELETE",
  });
}

// ---------------- Phase 2: Tasks ----------------
// Additive module — mirrors 04-PHASE2-API-CONTRACT.md section 3.

export async function getTasks(query: TasksQuery): Promise<TasksResponse> {
  if (USE_MOCK) {
    let items = [...mockState.tasks];
    if (query.projectId) items = items.filter((t) => t.projectId === query.projectId);
    if (query.status) items = items.filter((t) => t.status === query.status);
    if (query.priority) items = items.filter((t) => t.priority === query.priority);
    if (query.assignee)
      items = items.filter((t) => t.assignees.includes(query.assignee!));
    if (query.search) {
      const s = query.search.toLowerCase();
      items = items.filter((t) => t.title.toLowerCase().includes(s));
    }
    const page = query.page || 1;
    const limit = query.limit || 100;
    const total = items.length;
    const start = (page - 1) * limit;
    const tasks = items.slice(start, start + limit);
    return mockDelay({
      tasks,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }
  return request<TasksResponse>(`/tasks${qs(query as Record<string, unknown>)}`);
}

export async function getTask(id: string): Promise<Task> {
  if (USE_MOCK) {
    const task = mockState.tasks.find((t) => t._id === id);
    if (!task) throw new ApiError(404, { message: "Task not found" });
    return mockDelay(task, 150);
  }
  return request<Task>(`/tasks/${id}`);
}

export async function createTask(data: {
  projectId: string;
  title: string;
  description?: string | null;
  assignees?: string[];
  priority?: string;
  dueDate?: string | null;
}): Promise<Task> {
  if (USE_MOCK) {
    const now = new Date().toISOString();
    const task: Task = {
      _id: nextId("task"),
      projectId: data.projectId,
      title: data.title,
      description: data.description ?? null,
      assignees: data.assignees || [],
      status: "todo",
      priority: (data.priority as Task["priority"]) || "medium",
      dueDate: data.dueDate ?? null,
      comments: [],
      createdBy: MOCK_USER.id,
      createdAt: now,
      updatedAt: now,
    };
    mockState.tasks.unshift(task);
    return mockDelay(task);
  }
  return request<Task>("/tasks", { method: "POST", body: JSON.stringify(data) });
}

export async function updateTask(
  id: string,
  data: Partial<
    Pick<Task, "title" | "description" | "assignees" | "status" | "priority" | "dueDate">
  >
): Promise<Task> {
  if (USE_MOCK) {
    const idx = mockState.tasks.findIndex((t) => t._id === id);
    if (idx === -1) throw new ApiError(404, { message: "Task not found" });
    mockState.tasks[idx] = {
      ...mockState.tasks[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockDelay(mockState.tasks[idx]);
  }
  return request<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function deleteTask(id: string) {
  if (USE_MOCK) {
    mockState.tasks = mockState.tasks.filter((t) => t._id !== id);
    return mockDelay({ message: "Task deleted" });
  }
  return request<{ message: string }>(`/tasks/${id}`, { method: "DELETE" });
}

export async function addTaskComment(taskId: string, text: string): Promise<TaskComment> {
  if (USE_MOCK) {
    const comment: TaskComment = {
      _id: nextId("comment"),
      text,
      createdBy: MOCK_USER.id,
      createdAt: new Date().toISOString(),
    };
    const task = mockState.tasks.find((t) => t._id === taskId);
    if (task) task.comments.unshift(comment);
    return mockDelay(comment);
  }
  return request<TaskComment>(`/tasks/${taskId}/comments`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function deleteTaskComment(taskId: string, commentId: string) {
  if (USE_MOCK) {
    const task = mockState.tasks.find((t) => t._id === taskId);
    if (task) task.comments = task.comments.filter((c) => c._id !== commentId);
    return mockDelay({ message: "Comment deleted" });
  }
  return request<{ message: string }>(`/tasks/${taskId}/comments/${commentId}`, {
    method: "DELETE",
  });
}

// ---------------- Phase 3: Forgot Password ----------------
// Additive module — mirrors 09-PHASE3-API-CONTRACT.md section 1.
// Mock behavior notes (USE_MOCK only):
//   - forgotPassword always "succeeds" after a delay, matching the real
//     backend's same-response-either-way behavior.
//   - verifyOtp accepts "123456" as the valid mock OTP. Anything else counts
//     as a wrong attempt; 5 wrong attempts for the same email locks it out
//     until a new OTP is requested, mirroring the contract's lockout rule.
//   - resetPassword accepts any resetToken that verifyOtp actually returned
//     in this session and enforces the 8-char minimum from the contract.

const mockOtpAttempts: Record<string, number> = {};
const mockValidResetTokens = new Set<string>();
const MOCK_OTP = "123456";

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const message = "If an account exists for this email, an OTP has been sent.";
  if (USE_MOCK) {
    delete mockOtpAttempts[email];
    return mockDelay({ message }, 500);
  }
  return request<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyOtp(
  email: string,
  otp: string
): Promise<{ resetToken: string }> {
  if (USE_MOCK) {
    const attempts = mockOtpAttempts[email] || 0;
    if (attempts >= 5) {
      throw new ApiError(400, {
        message: "Too many incorrect attempts — request a new code.",
      });
    }
    if (otp !== MOCK_OTP) {
      mockOtpAttempts[email] = attempts + 1;
      throw new ApiError(400, { message: "Invalid or expired OTP" });
    }
    delete mockOtpAttempts[email];
    const resetToken = `mock-reset-token-${nextId("rt")}`;
    mockValidResetTokens.add(resetToken);
    return mockDelay({ resetToken }, 400);
  }
  return request<{ resetToken: string }>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

export async function resetPassword(
  resetToken: string,
  newPassword: string
): Promise<{ message: string }> {
  if (USE_MOCK) {
    if (!mockValidResetTokens.has(resetToken)) {
      throw new ApiError(400, { message: "Invalid or expired reset token" });
    }
    if (newPassword.length < 8) {
      throw new ApiError(400, {
        message: "Validation failed",
        errors: [{ field: "newPassword", message: "Must be at least 8 characters" }],
      });
    }
    mockValidResetTokens.delete(resetToken);
    return mockDelay({ message: "Password reset successful" }, 400);
  }
  return request<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ resetToken, newPassword }),
  });
}

// ---------------- Phase 3: Admin "Login As" ----------------
// Additive module — mirrors 09-PHASE3-API-CONTRACT.md section 2.

export async function impersonateUser(userId: string): Promise<{
  token: string;
  user: User;
  impersonation: Impersonation;
}> {
  if (USE_MOCK) {
    const target = mockState.users.find((u) => u.id === userId);
    if (!target) throw new ApiError(404, { message: "User not found" });
    if (target.role === "admin") {
      throw new ApiError(400, { message: "Cannot impersonate another admin" });
    }
    return mockDelay({
      token: `mock-impersonation-token-${target.id}`,
      user: target,
      impersonation: {
        isImpersonating: true,
        adminId: MOCK_USER.id,
        adminName: MOCK_USER.name,
      },
    });
  }
  return request(`/auth/impersonate/${userId}`, { method: "POST" });
}

export { ApiError };
