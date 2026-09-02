// // Types mirroring 01-API-CONTRACT.md exactly.

// // export type Role = "admin" | "agent";
// export type Role = "admin" | "agent" | "client" | "team_member";

// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: Role;
// }

// export type LeadStatus =
//   | "new"
//   | "contacted"
//   | "follow_up"
//   | "qualified"
//   | "converted"
//   | "lost"
//   | "junk";

// export type Priority = "low" | "medium" | "high";

// export interface LeadNote {
//   _id: string;
//   text: string;
//   createdBy: string;
//   createdAt: string;
// }

// export type FollowUpStatus = "pending" | "done" | "missed";

// export interface FollowUp {
//   _id: string;
//   dueDate: string;
//   note: string;
//   status: FollowUpStatus;
//   reminderSent: boolean;
//   createdAt: string;
// }

// export interface Lead {
//   _id: string;
//   name: string;
//   projectName: string | null;
//   phone: string;
//   whatsapp: string | null;
//   email: string | null;
//   city: string | null;
//   sourceSheetId: string;
//   sourceSheetName: string;
//   sourceRowId: string;
//   campaign: string | null;
//   serviceInterested: string | null;
//   requirement: string | null;
//   status: LeadStatus;
//   priority: Priority | null;
//   assignedTo: string | null;
//   expectedValue: number | null;
//   remarks: string | null;
//   nextAction: string | null;
//   originalDate: string | null;
//   notes: LeadNote[];
//   followUps: FollowUp[];
//   tags: string[];
//   createdAt: string;
//   updatedAt: string;
// }

// export interface Pagination {
//   page: number;
//   limit: number;
//   total: number;
//   totalPages: number;
// }

// export interface LeadsResponse {
//   leads: Lead[];
//   pagination: Pagination;
// }

// export interface LeadsQuery {
//   page?: number;
//   limit?: number;
//   status?: LeadStatus;
//   priority?: Priority;
//   sourceSheetId?: string;
//   tag?: string;
//   assignedTo?: string;
//   search?: string;
//   sortBy?: string;
//   sortOrder?: "asc" | "desc";
//   dateFrom?: string;
//   dateTo?: string;
// }

// export type SourceSyncStatus = "success" | "partial" | "failed" | "never_synced";
// export type SourceStatus = "active" | "paused" | "error";

// export interface ColumnMapping {
//   date: string | null;
//   priority: string | null;
//   name: string;
//   city: string | null;
//   phone: string;
//   whatsapp: string | null;
//   email: string | null;
//   source: string | null;
//   campaign: string | null;
//   serviceInterested: string | null;
//   requirement: string | null;
//   leadStatus: string | null;
//   assignedTo: string | null;
//   followUpDate: string | null;
//   lastFollowUp: string | null;
//   nextAction: string | null;
//   expectedValue: string | null;
//   remarks: string | null;
// }

// export interface SheetSource {
//   _id: string;
//   name: string;
//   sheetUrl: string;
//   sheetId: string;
//   gid: string;
//   tags: string[];
//   status: SourceStatus;
//   lastSyncAt: string | null;
//   lastSyncStatus: SourceSyncStatus;
//   lastSyncError: string | null;
//   rowsImported: number;
//   columnMapping: ColumnMapping;
//   syncIntervalMinutes: number;
//   createdBy: string;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface SourcePreviewResponse {
//   headers: string[];
//   sampleRows: Record<string, string>[];
//   detectedMapping: Partial<ColumnMapping>;
// }

// export interface DashboardOverview {
//   totalLeads: number;
//   newLeadsToday: number;
//   pendingLeads: number;
//   missedFollowUps: number;
//   upcomingFollowUps24h: number;
//   conversionRate: number;
//   leadsBySource: { sourceSheetName: string; count: number }[];
//   leadsByStatus: { status: LeadStatus; count: number }[];
//   leadsByTag: { tag: string; count: number }[];
//   leadsTrend: { date: string; count: number }[];
//   sourcesNeedingAttention: {
//     sourceId: string;
//     sourceName: string;
//     lastSyncStatus: SourceSyncStatus;
//   }[];
// }

// export interface DashboardFollowUp {
//   leadId: string;
//   leadName: string;
//   phone: string;
//   dueDate: string;
//   note: string;
//   status: FollowUpStatus;
// }

// // export type NotificationType =
// //   | "follow_up_due"
// //   | "new_lead"
// //   | "source_sync_failed";

// // export interface Notification {
// //   _id: string;
// //   type: NotificationType;
// //   message: string;
// //   read: boolean;
// //   createdAt: string;
// //   leadId?: string;
// //   sourceId?: string;
// // }

// export type NotificationType =
//   | "follow_up_due"
//   | "new_lead"
//   | "source_sync_failed"
//   | "task_assigned"
//   | "task_due"
//   | "project_status_changed";

// export interface Notification {
//   _id: string;
//   type: NotificationType;
//   message: string;
//   read: boolean;
//   createdAt: string;
//   leadId?: string;
//   sourceId?: string;
//   projectId?: string;
//   taskId?: string;
// }

// export interface ApiErrorShape {
//   message: string;
//   errors?: { field: string; message: string }[];
// }

// export class ApiError extends Error {
//   status: number;
//   errors?: { field: string; message: string }[];
//   constructor(status: number, body: ApiErrorShape) {
//     super(body.message || "Request failed");
//     this.status = status;
//     this.errors = body.errors;
//   }
// }


// Types mirroring 01-API-CONTRACT.md exactly.

export type Role = "admin" | "agent" | "client" | "team_member";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type LeadStatus =
  | "new"
  | "contacted"
  | "follow_up"
  | "qualified"
  | "converted"
  | "lost"
  | "junk";

export type Priority = "low" | "medium" | "high";

export interface LeadNote {
  _id: string;
  text: string;
  createdBy: string;
  createdAt: string;
}

export type FollowUpStatus = "pending" | "done" | "missed";

export interface FollowUp {
  _id: string;
  dueDate: string;
  note: string;
  status: FollowUpStatus;
  reminderSent: boolean;
  createdAt: string;
}

export interface Lead {
  _id: string;
  name: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  city: string | null;
  sourceSheetId: string;
  sourceSheetName: string;
  sourceRowId: string;
  campaign: string | null;
  serviceInterested: string | null;
  requirement: string | null;
  status: LeadStatus;
  priority: Priority | null;
  assignedTo: string | null;
  expectedValue: number | null;
  remarks: string | null;
  nextAction: string | null;
  originalDate: string | null;
  notes: LeadNote[];
  followUps: FollowUp[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LeadsResponse {
  leads: Lead[];
  pagination: Pagination;
}

export interface LeadsQuery {
  page?: number;
  limit?: number;
  status?: LeadStatus;
  priority?: Priority;
  sourceSheetId?: string;
  tag?: string;
  assignedTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
}

export type SourceSyncStatus = "success" | "partial" | "failed" | "never_synced";
export type SourceStatus = "active" | "paused" | "error";

export interface ColumnMapping {
  date: string | null;
  priority: string | null;
  name: string;
  city: string | null;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  source: string | null;
  campaign: string | null;
  serviceInterested: string | null;
  requirement: string | null;
  leadStatus: string | null;
  assignedTo: string | null;
  followUpDate: string | null;
  lastFollowUp: string | null;
  nextAction: string | null;
  expectedValue: string | null;
  remarks: string | null;
}

export interface SheetSource {
  _id: string;
  name: string;
  sheetUrl: string;
  sheetId: string;
  gid: string;
  tags: string[];
  status: SourceStatus;
  lastSyncAt: string | null;
  lastSyncStatus: SourceSyncStatus;
  lastSyncError: string | null;
  rowsImported: number;
  columnMapping: ColumnMapping;
  syncIntervalMinutes: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SourcePreviewResponse {
  headers: string[];
  sampleRows: Record<string, string>[];
  detectedMapping: Partial<ColumnMapping>;
}

export interface DashboardOverview {
  totalLeads: number;
  newLeadsToday: number;
  pendingLeads: number;
  missedFollowUps: number;
  upcomingFollowUps24h: number;
  conversionRate: number;
  leadsBySource: { sourceSheetName: string; count: number }[];
  leadsByStatus: { status: LeadStatus; count: number }[];
  leadsByTag: { tag: string; count: number }[];
  leadsTrend: { date: string; count: number }[];
  sourcesNeedingAttention: {
    sourceId: string;
    sourceName: string;
    lastSyncStatus: SourceSyncStatus;
  }[];
}

export interface DashboardFollowUp {
  leadId: string;
  leadName: string;
  phone: string;
  dueDate: string;
  note: string;
  status: FollowUpStatus;
}

export type NotificationType =
  | "follow_up_due"
  | "new_lead"
  | "source_sync_failed"
  | "task_assigned"
  | "task_due"
  | "project_status_changed";

export interface Notification {
  _id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
  leadId?: string;
  sourceId?: string;
  projectId?: string;
  taskId?: string;
}

// ---------------- Phase 2: Projects / Tasks ----------------

export type ProjectStatus = "active" | "on_hold" | "completed" | "cancelled";

export interface DocLink {
  _id: string;
  label: string;
  url: string;
}

export interface Project {
  _id: string;
  name: string;
  clientId: string | null;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  description: string | null;
  status: ProjectStatus;
  docLinks: DocLink[];
  teamMembers: string[];
  sourceLeadId: string | null;
  startDate: string | null;
  dueDate: string | null;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsQuery {
  status?: ProjectStatus;
  clientId?: string;
  teamMember?: string;
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProjectsResponse {
  projects: Project[];
  pagination: Pagination;
}

export type TaskStatus = "todo" | "in_progress" | "review" | "done" | "blocked";

export interface TaskComment {
  _id: string;
  text: string;
  createdBy: string;
  createdAt: string;
}

export interface Task {
  _id: string;
  projectId: string;
  title: string;
  description: string | null;
  assignees: string[];
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  comments: TaskComment[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TasksQuery {
  projectId?: string;
  status?: TaskStatus;
  priority?: Priority;
  assignee?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TasksResponse {
  tasks: Task[];
  pagination: Pagination;
}

export interface ApiErrorShape {
  message: string;
  errors?: { field: string; message: string }[];
}

export class ApiError extends Error {
  status: number;
  errors?: { field: string; message: string }[];
  constructor(status: number, body: ApiErrorShape) {
    super(body.message || "Request failed");
    this.status = status;
    this.errors = body.errors;
  }
}
