// import {
//   ColumnMapping,
//   DashboardFollowUp,
//   DashboardOverview,
//   Lead,
//   Notification,
//   SheetSource,
//   User,
// } from "./types";

// export const MOCK_USER: User = {
//   id: "u1",
//   name: "Abhay Sharma",
//   email: "admin@gowappily.com",
//   role: "admin",
// };

// export const MOCK_USERS: User[] = [
//   MOCK_USER,
//   { id: "u2", name: "Priya Nair", email: "priya@gowappily.com", role: "agent" },
//   { id: "u3", name: "Rahul Verma", email: "rahul@gowappily.com", role: "agent" },
// ];

// const defaultMapping: ColumnMapping = {
//   date: "Date",
//   priority: "Priority",
//   name: "Lead Name",
//   city: "City",
//   phone: "Phone",
//   whatsapp: "WhatsApp",
//   email: "Email",
//   source: "Source",
//   campaign: "Campaign",
//   serviceInterested: "Service Interested",
//   requirement: "Requirement",
//   leadStatus: "Lead Status",
//   assignedTo: "Assigned To",
//   followUpDate: "Follow-up Date",
//   lastFollowUp: "Last Follow-up",
//   nextAction: "Next Action",
//   expectedValue: "Expected Value",
//   remarks: "Remarks",
// };

// export const MOCK_SOURCES: SheetSource[] = [
//   {
//     _id: "s1",
//     name: "August FB Sheet",
//     sheetUrl: "https://docs.google.com/spreadsheets/d/1abcXYZ/edit",
//     sheetId: "1abcXYZ",
//     gid: "0",
//     tags: ["facebook", "instagram"],
//     status: "active",
//     lastSyncAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
//     lastSyncStatus: "success",
//     lastSyncError: null,
//     rowsImported: 210,
//     columnMapping: defaultMapping,
//     syncIntervalMinutes: 30,
//     createdBy: "u1",
//     createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
//     updatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
//   },
//   {
//     _id: "s2",
//     name: "Website Contact Form",
//     sheetUrl: "https://docs.google.com/spreadsheets/d/2defUVW/edit",
//     sheetId: "2defUVW",
//     gid: "0",
//     tags: ["website", "organic"],
//     status: "active",
//     lastSyncAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
//     lastSyncStatus: "failed",
//     lastSyncError:
//       'Sheet not accessible — make sure link sharing is set to "Anyone with the link"',
//     rowsImported: 88,
//     columnMapping: defaultMapping,
//     syncIntervalMinutes: 60,
//     createdBy: "u1",
//     createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
//     updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
//   },
//   {
//     _id: "s3",
//     name: "Referral Partners",
//     sheetUrl: "https://docs.google.com/spreadsheets/d/3ghiRST/edit",
//     sheetId: "3ghiRST",
//     gid: "0",
//     tags: ["referral"],
//     status: "paused",
//     lastSyncAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
//     lastSyncStatus: "partial",
//     lastSyncError: "3 rows skipped — missing phone number",
//     rowsImported: 22,
//     columnMapping: defaultMapping,
//     syncIntervalMinutes: 120,
//     createdBy: "u1",
//     createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
//     updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
//   },
// ];

// const NAMES = [
//   "Aarav Mehta", "Ishita Kapoor", "Vivaan Singh", "Diya Patel", "Kabir Sharma",
//   "Anaya Gupta", "Reyansh Rao", "Myra Nair", "Arjun Malhotra", "Saanvi Iyer",
//   "Vihaan Joshi", "Aadhya Reddy", "Advait Chawla", "Kiara Bose", "Ayaan Khan",
// ];
// const CITIES = ["Meerut", "Delhi", "Mumbai", "Bengaluru", "Pune", "Jaipur", "Lucknow"];
// const SERVICES = ["Balloon Decoration", "Event Styling", "Wedding Planning", "Birthday Setup", "Corporate Event"];
// const STATUSES: Lead["status"][] = ["new", "contacted", "follow_up", "qualified", "converted", "lost", "junk"];
// const PRIORITIES: Lead["priority"][] = ["low", "medium", "high"];
// const TAGS_POOL = ["facebook", "instagram", "website", "organic", "referral"];

// function randomFrom<T>(arr: T[]): T {
//   return arr[Math.floor(Math.random() * arr.length)];
// }

// function seedLeads(): Lead[] {
//   const leads: Lead[] = [];
//   for (let i = 0; i < 143; i++) {
//     const source = randomFrom(MOCK_SOURCES);
//     const createdDaysAgo = Math.floor(Math.random() * 30);
//     const createdAt = new Date(Date.now() - createdDaysAgo * 86400000).toISOString();
//     const status = randomFrom(STATUSES);

//     // Assuming 'projectName' should either be derived, random, or nullable--picking random for demo
//     const projectNames = ["Emerald Banquet", "Sunset Lawn", "Bliss Venue", "Royal Palace", "None"];
//     const projectName =
//       Math.random() > 0.7
//         ? projectNames[Math.floor(Math.random() * (projectNames.length - 1))]
//         : null;

//     leads.push({
//       _id: `lead_${i + 1}`,
//       name: randomFrom(NAMES),
//       phone: `9${Math.floor(100000000 + Math.random() * 899999999)}`,
//       whatsapp: Math.random() > 0.3 ? `9${Math.floor(100000000 + Math.random() * 899999999)}` : null,
//       email: Math.random() > 0.4 ? `lead${i + 1}@example.com` : null,
//       city: randomFrom(CITIES),
//       sourceSheetId: source._id,
//       sourceSheetName: source.name,
//       sourceRowId: `row_${i + 2}`,
//       campaign: Math.random() > 0.5 ? "Diwali Offer" : null,
//       serviceInterested: randomFrom(SERVICES),
//       requirement: "Looking for a package for ~100 guests",
//       status,
//       priority: Math.random() > 0.2 ? randomFrom(PRIORITIES) : null,
//       assignedTo: Math.random() > 0.3 ? randomFrom(MOCK_USERS).id : null,
//       expectedValue: Math.random() > 0.3 ? Math.floor(5000 + Math.random() * 95000) : null,
//       remarks: Math.random() > 0.6 ? "Called once, asked to call back next week." : null,
//       nextAction: Math.random() > 0.5 ? "Send quotation" : null,
//       originalDate: createdAt,
//       projectName: projectName, // <-- Add projectName here
//       notes:
//         Math.random() > 0.5
//           ? [
//               {
//                 _id: `note_${i}_1`,
//                 text: "Spoke with the lead, interested but comparing quotes.",
//                 createdBy: MOCK_USER.id,
//                 createdAt,
//               },
//             ]
//           : [],
//       followUps:
//         Math.random() > 0.4
//           ? [
//               {
//                 _id: `fu_${i}_1`,
//                 dueDate: new Date(Date.now() + (Math.random() > 0.5 ? 1 : -1) * Math.random() * 5 * 86400000).toISOString(),
//                 note: "Follow up on quotation",
//                 status: randomFrom(["pending", "done", "missed"] as const),
//                 reminderSent: Math.random() > 0.5,
//                 createdAt,
//               },
//             ]
//           : [],
//       tags: [randomFrom(TAGS_POOL), ...(Math.random() > 0.7 ? [randomFrom(TAGS_POOL)] : [])].filter(
//         (v, idx, arr) => arr.indexOf(v) === idx
//       ),
//       createdAt,
//       updatedAt: createdAt,
//     });
//   }
//   return leads;
// }

// export const MOCK_LEADS: Lead[] = seedLeads();

// export const MOCK_NOTIFICATIONS: Notification[] = [
//   {
//     _id: "n1",
//     type: "source_sync_failed",
//     message: 'Sync failed for "Website Contact Form" — sheet not accessible',
//     read: false,
//     createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
//     sourceId: "s2",
//   },
//   {
//     _id: "n2",
//     type: "follow_up_due",
//     message: `Follow-up due today for ${MOCK_LEADS[0]?.name ?? "a lead"}`,
//     read: false,
//     createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
//     leadId: MOCK_LEADS[0]?._id,
//   },
//   {
//     _id: "n3",
//     type: "new_lead",
//     message: `New lead imported: ${MOCK_LEADS[1]?.name ?? "a lead"}`,
//     read: true,
//     createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
//     leadId: MOCK_LEADS[1]?._id,
//   },
// ];

// export function buildMockOverview(): DashboardOverview {
//   const byStatus: Record<string, number> = {};
//   const bySource: Record<string, number> = {};
//   const byTag: Record<string, number> = {};
//   let pending = 0;
//   let converted = 0;
//   MOCK_LEADS.forEach((l) => {
//     byStatus[l.status] = (byStatus[l.status] || 0) + 1;
//     bySource[l.sourceSheetName] = (bySource[l.sourceSheetName] || 0) + 1;
//     l.tags.forEach((t) => (byTag[t] = (byTag[t] || 0) + 1));
//     if (["new", "contacted", "follow_up"].includes(l.status)) pending++;
//     if (l.status === "converted") converted++;
//   });

//   const trend = Array.from({ length: 14 }).map((_, idx) => {
//     const d = new Date(Date.now() - (13 - idx) * 86400000);
//     return {
//       date: d.toISOString().slice(0, 10),
//       count: Math.floor(5 + Math.random() * 15),
//     };
//   });

//   return {
//     totalLeads: MOCK_LEADS.length,
//     newLeadsToday: MOCK_LEADS.filter(
//       (l) => new Date(l.createdAt).toDateString() === new Date().toDateString()
//     ).length,
//     pendingLeads: pending,
//     missedFollowUps: MOCK_LEADS.reduce(
//       (acc, l) => acc + l.followUps.filter((f) => f.status === "missed").length,
//       0
//     ),
//     upcomingFollowUps24h: MOCK_LEADS.reduce(
//       (acc, l) =>
//         acc +
//         l.followUps.filter((f) => {
//           const due = new Date(f.dueDate).getTime();
//           return f.status === "pending" && due > Date.now() && due < Date.now() + 86400000;
//         }).length,
//       0
//     ),
//     conversionRate: Number(((converted / MOCK_LEADS.length) * 100).toFixed(1)),
//     leadsBySource: Object.entries(bySource).map(([sourceSheetName, count]) => ({
//       sourceSheetName,
//       count,
//     })),
//     leadsByStatus: Object.entries(byStatus).map(([status, count]) => ({
//       status: status as Lead["status"],
//       count,
//     })),
//     leadsByTag: Object.entries(byTag).map(([tag, count]) => ({ tag, count })),
//     leadsTrend: trend,
//     sourcesNeedingAttention: MOCK_SOURCES.filter((s) => s.lastSyncStatus === "failed").map(
//       (s) => ({ sourceId: s._id, sourceName: s.name, lastSyncStatus: s.lastSyncStatus })
//     ),
//   };
// }

// export function buildMockFollowUps(
//   type: "today" | "missed" | "upcoming"
// ): DashboardFollowUp[] {
//   const result: DashboardFollowUp[] = [];
//   MOCK_LEADS.forEach((l) => {
//     l.followUps.forEach((f) => {
//       const due = new Date(f.dueDate);
//       const isToday = due.toDateString() === new Date().toDateString();
//       const matches =
//         (type === "today" && isToday && f.status === "pending") ||
//         (type === "missed" && f.status === "missed") ||
//         (type === "upcoming" &&
//           f.status === "pending" &&
//           due.getTime() > Date.now() &&
//           due.getTime() < Date.now() + 86400000);
//       if (matches) {
//         result.push({
//           leadId: l._id,
//           leadName: l.name,
//           phone: l.phone,
//           dueDate: f.dueDate,
//           note: f.note,
//           status: f.status,
//         });
//       }
//     });
//   });
//   return result;
// }


import {
  ColumnMapping,
  DashboardFollowUp,
  DashboardOverview,
  Lead,
  Notification,
  Project,
  SheetSource,
  User,
} from "./types";

export const MOCK_USER: User = {
  id: "u1",
  name: "Abhay Sharma",
  email: "admin@gowappily.com",
  role: "admin",
};

export const MOCK_USERS: User[] = [
  MOCK_USER,
  { id: "u2", name: "Priya Nair", email: "priya@gowappily.com", role: "agent" },
  { id: "u3", name: "Rahul Verma", email: "rahul@gowappily.com", role: "agent" },
  { id: "u4", name: "Sanya Kapoor", email: "sanya@gowappily.com", role: "team_member" },
  { id: "u5", name: "Dev Malik", email: "dev@gowappily.com", role: "team_member" },
  { id: "u6", name: "Neha Bhatt", email: "neha.client@example.com", role: "client" },
];

const defaultMapping: ColumnMapping = {
  date: "Date",
  priority: "Priority",
  name: "Lead Name",
  city: "City",
  phone: "Phone",
  whatsapp: "WhatsApp",
  email: "Email",
  source: "Source",
  campaign: "Campaign",
  serviceInterested: "Service Interested",
  requirement: "Requirement",
  leadStatus: "Lead Status",
  assignedTo: "Assigned To",
  followUpDate: "Follow-up Date",
  lastFollowUp: "Last Follow-up",
  nextAction: "Next Action",
  expectedValue: "Expected Value",
  remarks: "Remarks",
};

export const MOCK_SOURCES: SheetSource[] = [
  {
    _id: "s1",
    name: "August FB Sheet",
    sheetUrl: "https://docs.google.com/spreadsheets/d/1abcXYZ/edit",
    sheetId: "1abcXYZ",
    gid: "0",
    tags: ["facebook", "instagram"],
    status: "active",
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    lastSyncStatus: "success",
    lastSyncError: null,
    rowsImported: 210,
    columnMapping: defaultMapping,
    syncIntervalMinutes: 30,
    createdBy: "u1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    _id: "s2",
    name: "Website Contact Form",
    sheetUrl: "https://docs.google.com/spreadsheets/d/2defUVW/edit",
    sheetId: "2defUVW",
    gid: "0",
    tags: ["website", "organic"],
    status: "active",
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    lastSyncStatus: "failed",
    lastSyncError:
      'Sheet not accessible — make sure link sharing is set to "Anyone with the link"',
    rowsImported: 88,
    columnMapping: defaultMapping,
    syncIntervalMinutes: 60,
    createdBy: "u1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    _id: "s3",
    name: "Referral Partners",
    sheetUrl: "https://docs.google.com/spreadsheets/d/3ghiRST/edit",
    sheetId: "3ghiRST",
    gid: "0",
    tags: ["referral"],
    status: "paused",
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    lastSyncStatus: "partial",
    lastSyncError: "3 rows skipped — missing phone number",
    rowsImported: 22,
    columnMapping: defaultMapping,
    syncIntervalMinutes: 120,
    createdBy: "u1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
];

const NAMES = [
  "Aarav Mehta", "Ishita Kapoor", "Vivaan Singh", "Diya Patel", "Kabir Sharma",
  "Anaya Gupta", "Reyansh Rao", "Myra Nair", "Arjun Malhotra", "Saanvi Iyer",
  "Vihaan Joshi", "Aadhya Reddy", "Advait Chawla", "Kiara Bose", "Ayaan Khan",
];
const CITIES = ["Meerut", "Delhi", "Mumbai", "Bengaluru", "Pune", "Jaipur", "Lucknow"];
const SERVICES = ["Balloon Decoration", "Event Styling", "Wedding Planning", "Birthday Setup", "Corporate Event"];
const STATUSES: Lead["status"][] = ["new", "contacted", "follow_up", "qualified", "converted", "lost", "junk"];
const PRIORITIES: Lead["priority"][] = ["low", "medium", "high"];
const TAGS_POOL = ["facebook", "instagram", "website", "organic", "referral"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function seedLeads(): Lead[] {
  const leads: Lead[] = [];
  for (let i = 0; i < 143; i++) {
    const source = randomFrom(MOCK_SOURCES);
    const createdDaysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(Date.now() - createdDaysAgo * 86400000).toISOString();
    const status = randomFrom(STATUSES);
    leads.push({
      _id: `lead_${i + 1}`,
      name: randomFrom(NAMES),
      phone: `9${Math.floor(100000000 + Math.random() * 899999999)}`,
      whatsapp: Math.random() > 0.3 ? `9${Math.floor(100000000 + Math.random() * 899999999)}` : null,
      email: Math.random() > 0.4 ? `lead${i + 1}@example.com` : null,
      city: randomFrom(CITIES),
      sourceSheetId: source._id,
      sourceSheetName: source.name,
      sourceRowId: `row_${i + 2}`,
      campaign: Math.random() > 0.5 ? "Diwali Offer" : null,
      serviceInterested: randomFrom(SERVICES),
      requirement: "Looking for a package for ~100 guests",
      status,
      priority: Math.random() > 0.2 ? randomFrom(PRIORITIES) : null,
      assignedTo: Math.random() > 0.3 ? randomFrom(MOCK_USERS).id : null,
      expectedValue: Math.random() > 0.3 ? Math.floor(5000 + Math.random() * 95000) : null,
      remarks: Math.random() > 0.6 ? "Called once, asked to call back next week." : null,
      nextAction: Math.random() > 0.5 ? "Send quotation" : null,
      originalDate: createdAt,
      notes:
        Math.random() > 0.5
          ? [
              {
                _id: `note_${i}_1`,
                text: "Spoke with the lead, interested but comparing quotes.",
                createdBy: MOCK_USER.id,
                createdAt,
              },
            ]
          : [],
      followUps:
        Math.random() > 0.4
          ? [
              {
                _id: `fu_${i}_1`,
                dueDate: new Date(Date.now() + (Math.random() > 0.5 ? 1 : -1) * Math.random() * 5 * 86400000).toISOString(),
                note: "Follow up on quotation",
                status: randomFrom(["pending", "done", "missed"] as const),
                reminderSent: Math.random() > 0.5,
                createdAt,
              },
            ]
          : [],
      tags: [randomFrom(TAGS_POOL), ...(Math.random() > 0.7 ? [randomFrom(TAGS_POOL)] : [])].filter(
        (v, idx, arr) => arr.indexOf(v) === idx
      ),
      createdAt,
      updatedAt: createdAt,
    });
  }
  return leads;
}

export const MOCK_LEADS: Lead[] = seedLeads();

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    _id: "n1",
    type: "source_sync_failed",
    message: 'Sync failed for "Website Contact Form" — sheet not accessible',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    sourceId: "s2",
  },
  {
    _id: "n2",
    type: "follow_up_due",
    message: `Follow-up due today for ${MOCK_LEADS[0]?.name ?? "a lead"}`,
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    leadId: MOCK_LEADS[0]?._id,
  },
  {
    _id: "n3",
    type: "new_lead",
    message: `New lead imported: ${MOCK_LEADS[1]?.name ?? "a lead"}`,
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    leadId: MOCK_LEADS[1]?._id,
  },
];

export function buildMockOverview(): DashboardOverview {
  const byStatus: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  const byTag: Record<string, number> = {};
  let pending = 0;
  let converted = 0;
  MOCK_LEADS.forEach((l) => {
    byStatus[l.status] = (byStatus[l.status] || 0) + 1;
    bySource[l.sourceSheetName] = (bySource[l.sourceSheetName] || 0) + 1;
    l.tags.forEach((t) => (byTag[t] = (byTag[t] || 0) + 1));
    if (["new", "contacted", "follow_up"].includes(l.status)) pending++;
    if (l.status === "converted") converted++;
  });

  const trend = Array.from({ length: 14 }).map((_, idx) => {
    const d = new Date(Date.now() - (13 - idx) * 86400000);
    return {
      date: d.toISOString().slice(0, 10),
      count: Math.floor(5 + Math.random() * 15),
    };
  });

  return {
    totalLeads: MOCK_LEADS.length,
    newLeadsToday: MOCK_LEADS.filter(
      (l) => new Date(l.createdAt).toDateString() === new Date().toDateString()
    ).length,
    pendingLeads: pending,
    missedFollowUps: MOCK_LEADS.reduce(
      (acc, l) => acc + l.followUps.filter((f) => f.status === "missed").length,
      0
    ),
    upcomingFollowUps24h: MOCK_LEADS.reduce(
      (acc, l) =>
        acc +
        l.followUps.filter((f) => {
          const due = new Date(f.dueDate).getTime();
          return f.status === "pending" && due > Date.now() && due < Date.now() + 86400000;
        }).length,
      0
    ),
    conversionRate: Number(((converted / MOCK_LEADS.length) * 100).toFixed(1)),
    leadsBySource: Object.entries(bySource).map(([sourceSheetName, count]) => ({
      sourceSheetName,
      count,
    })),
    leadsByStatus: Object.entries(byStatus).map(([status, count]) => ({
      status: status as Lead["status"],
      count,
    })),
    leadsByTag: Object.entries(byTag).map(([tag, count]) => ({ tag, count })),
    leadsTrend: trend,
    sourcesNeedingAttention: MOCK_SOURCES.filter((s) => s.lastSyncStatus === "failed").map(
      (s) => ({ sourceId: s._id, sourceName: s.name, lastSyncStatus: s.lastSyncStatus })
    ),
  };
}

export function buildMockFollowUps(
  type: "today" | "missed" | "upcoming"
): DashboardFollowUp[] {
  const result: DashboardFollowUp[] = [];
  MOCK_LEADS.forEach((l) => {
    l.followUps.forEach((f) => {
      const due = new Date(f.dueDate);
      const isToday = due.toDateString() === new Date().toDateString();
      const matches =
        (type === "today" && isToday && f.status === "pending") ||
        (type === "missed" && f.status === "missed") ||
        (type === "upcoming" &&
          f.status === "pending" &&
          due.getTime() > Date.now() &&
          due.getTime() < Date.now() + 86400000);
      if (matches) {
        result.push({
          leadId: l._id,
          leadName: l.name,
          phone: l.phone,
          dueDate: f.dueDate,
          note: f.note,
          status: f.status,
        });
      }
    });
  });
  return result;
}

// ---------------- Phase 2: Projects ----------------

export const MOCK_PROJECTS: Project[] = [
  {
    _id: "p1",
    name: "Aditi Balloon Decor — Website Revamp",
    clientId: "u6",
    clientName: "Neha Bhatt",
    clientEmail: "neha.client@example.com",
    clientPhone: "9811122233",
    description: "Rebuild the landing site and add an inquiry form.",
    status: "active",
    docLinks: [
      { _id: "dl1", label: "Notion Workspace", url: "https://notion.so/example" },
      { _id: "dl2", label: "Figma", url: "https://figma.com/example" },
    ],
    teamMembers: ["u4", "u5"],
    sourceLeadId: MOCK_LEADS[0]?._id ?? null,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(),
    tags: ["website", "priority"],
    createdBy: "u1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    _id: "p2",
    name: "Diwali Offer Campaign Microsite",
    clientId: null,
    clientName: "Kabir Sharma",
    clientEmail: "kabir@example.com",
    clientPhone: "9876500011",
    description: null,
    status: "on_hold",
    docLinks: [],
    teamMembers: ["u4"],
    sourceLeadId: null,
    startDate: null,
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    tags: ["campaign"],
    createdBy: "u1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    _id: "p3",
    name: "Event Styling Portfolio Shoot",
    clientId: null,
    clientName: "Ishita Kapoor",
    clientEmail: null,
    clientPhone: "9822233344",
    description: "Photograph and catalog last quarter's events for the portfolio.",
    status: "completed",
    docLinks: [{ _id: "dl3", label: "Shared Drive", url: "https://drive.google.com/example" }],
    teamMembers: ["u5"],
    sourceLeadId: null,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    tags: [],
    createdBy: "u1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
];
