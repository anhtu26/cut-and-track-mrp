import { Customer } from "@/types/customer";
import { Part, PartDocument } from "@/types/part";
import { WorkOrder } from "@/types/work-order";

// Helper function to generate a random date between two dates
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Mock Customers
export const mockCustomers: Customer[] = [
  {
    id: "c1",
    name: "Aerospace Innovations",
    company: "Aerospace Innovations Inc.",
    email: "orders@aeroinnovate.com",
    phone: "(555) 123-4567",
    address: "123 Flight Way, Aviation Park, CA 90001",
    active: true,
    notes: "High-priority aerospace client. Requires AS9100 certification for all parts.",
    createdAt: "2023-01-15T08:00:00Z",
    updatedAt: "2025-03-22T15:30:00Z",
    orderCount: 24,
  },
  {
    id: "c2",
    name: "Medical Devices Co.",
    company: "Medical Devices & Equipment",
    email: "procurement@meddevices.com",
    phone: "(555) 234-5678",
    address: "456 Health Blvd, Medtown, NY 10001",
    active: true,
    notes: "ISO 13485 certification required. Strict quality control protocols.",
    createdAt: "2023-03-10T10:15:00Z",
    updatedAt: "2025-04-01T09:45:00Z",
    orderCount: 18,
  },
  {
    id: "c3",
    name: "Industrial Solutions",
    company: "Industrial Solutions Group",
    email: "purchasing@indsolutions.com",
    phone: "(555) 345-6789",
    address: "789 Factory Rd, Industry City, TX 75001",
    active: true,
    notes: "Bulk orders, typically with longer lead times.",
    createdAt: "2023-05-22T14:30:00Z",
    updatedAt: "2025-04-05T11:20:00Z",
    orderCount: 31,
  },
  {
    id: "c4",
    name: "Defense Systems",
    company: "Defense Systems Ltd.",
    email: "procurement@defensesys.com",
    phone: "(555) 456-7890",
    address: "101 Security Ave, Defenseville, VA 22150",
    active: true,
    notes: "ITAR registered. Special handling procedures required.",
    createdAt: "2023-02-18T09:45:00Z",
    updatedAt: "2025-03-28T16:15:00Z",
    orderCount: 15,
  },
  {
    id: "c5",
    name: "Automotive Components",
    company: "Precision Auto Parts",
    email: "orders@precisionauto.com",
    phone: "(555) 567-8901",
    address: "202 Motor Drive, Cartown, MI 48201",
    active: true,
    notes: "IATF 16949 certified. Just-in-time delivery requirements.",
    createdAt: "2023-07-05T11:20:00Z",
    updatedAt: "2025-04-10T14:50:00Z",
    orderCount: 42,
  },
  {
    id: "c6",
    name: "Oil & Gas Equipment",
    company: "Petrol Equipment Services",
    email: "supply@petroequip.com",
    phone: "(555) 678-9012",
    address: "303 Rig Road, Oilcity, TX 77001",
    active: false,
    notes: "API standards compliance required. Corrosion-resistant materials only.",
    createdAt: "2023-04-12T13:40:00Z",
    updatedAt: "2024-12-15T10:25:00Z",
    orderCount: 9,
  }
];

// Mock Parts
const mockDocuments: PartDocument[] = [
  {
    id: "d1",
    name: "Technical Drawing Rev A",
    url: "#",
    uploadedAt: "2023-06-10T14:30:00Z",
    type: "drawing"
  },
  {
    id: "d2",
    name: "Inspection Criteria",
    url: "#",
    uploadedAt: "2023-06-12T09:15:00Z",
    type: "document"
  },
  {
    id: "d3",
    name: "Material Certification",
    url: "#",
    uploadedAt: "2023-07-05T11:45:00Z",
    type: "certification"
  }
];

export const mockParts: Part[] = [
  {
    id: "p1",
    name: "Turbine Blade Mounting Bracket",
    partNumber: "TB-2025-A",
    description: "High-temperature resistant mounting bracket for gas turbine blade assembly. Precision machined from Inconel 718 with tight tolerances.",
    active: true,
    materials: ["Inconel 718", "Stainless Steel 316"],
    setupInstructions: "1. Use 5-axis fixture #TB27\n2. Reference datum A for primary alignment\n3. Use high-pressure coolant for all operations\n4. Ensure thermal compensation is active during machining",
    machiningMethods: "Operation 1: Face milling with M42 end mill\nOperation 2: Contour milling with 0.125\" ball end mill\nOperation 3: Precision boring of mounting holes\nOperation 4: Chamfering of all edges",
    revisionNumber: "C",
    createdAt: "2023-06-10T08:00:00Z",
    updatedAt: "2025-03-15T14:30:00Z",
    documents: mockDocuments,
    archived: false,
  },
  {
    id: "p2",
    name: "Hydraulic Manifold Block",
    partNumber: "HM-1042-B",
    description: "Precision machined hydraulic manifold with complex internal channels and ports. Used in aerospace hydraulic systems.",
    active: true,
    materials: ["Aluminum 6061-T6", "Aluminum 7075-T6"],
    setupInstructions: "1. Use tombstone fixture #HT15\n2. Ensure all tooling is pre-set and verified\n3. Use flood coolant for all operations\n4. Pressure test at 1500 PSI after machining",
    machiningMethods: "Operation 1: Rough milling of outer contour\nOperation 2: Precision boring of valve ports\nOperation 3: Gun drilling of internal channels\nOperation 4: Tapping of threaded ports",
    revisionNumber: "B",
    createdAt: "2023-08-22T10:15:00Z",
    updatedAt: "2025-02-28T09:45:00Z",
    documents: mockDocuments.slice(0, 2),
    archived: false,
  },
  {
    id: "p3",
    name: "Medical Implant Component",
    partNumber: "MI-3078",
    description: "Titanium implant component for orthopedic applications. Requires mirror finish and biocompatible surface treatment.",
    active: true,
    materials: ["Titanium Grade 5 (Ti-6Al-4V)", "Titanium Grade 23 (ELI)"],
    setupInstructions: "1. Use dedicated titanium machining center\n2. Ensure all tooling is clean and dedicated for titanium\n3. Use low-pressure coolant to avoid thermal damage\n4. Clean thoroughly between operations",
    machiningMethods: "Operation 1: Rough turning with PCD inserts\nOperation 2: Finish turning with CBN inserts\nOperation 3: 5-axis contouring of anatomical surface\nOperation 4: Surface polishing to Ra 0.1μm",
    revisionNumber: "A",
    createdAt: "2023-11-05T14:30:00Z",
    updatedAt: "2025-03-20T11:20:00Z",
    documents: mockDocuments.slice(1),
    archived: false,
  },
  {
    id: "p4",
    name: "Satellite Component Housing",
    partNumber: "SC-5142",
    description: "Lightweight housing for satellite electronics. Requires tight dimensional control and thermal stability.",
    active: true,
    materials: ["Aluminum 7075-T6", "Titanium Grade 5"],
    setupInstructions: "1. Use vacuum fixture #SV22\n2. Reference optical alignment points\n3. Perform in-process inspection after each operation\n4. Control temperature to ±1°C during entire process",
    machiningMethods: "Operation 1: High-speed roughing with ceramic inserts\nOperation 2: Finish milling with diamond-coated tools\nOperation 3: Micro-drilling of vent holes\nOperation 4: CMM verification before release",
    revisionNumber: "D",
    createdAt: "2023-09-18T09:45:00Z",
    updatedAt: "2025-04-05T16:15:00Z",
    documents: mockDocuments.slice(0, 1),
    archived: false,
  },
  {
    id: "p5",
    name: "Transmission Gear Shaft",
    partNumber: "TG-7293",
    description: "Hardened steel gear shaft for heavy equipment transmissions. Requires precision gear tooth profiles and heat treatment.",
    active: true,
    materials: ["AISI 4340", "AISI 8620"],
    setupInstructions: "1. Use between-centers setup with tailstock support\n2. Pre-machine before heat treatment\n3. Post-machine after heat treatment for final dimensions\n4. Use high-frequency chatter monitoring",
    machiningMethods: "Operation 1: CNC turning of basic profile\nOperation 2: Gear hobbing of tooth profiles\nOperation 3: Heat treatment to 58-62 HRC\nOperation 4: Precision grinding of bearing surfaces",
    revisionNumber: "B",
    createdAt: "2024-01-25T11:20:00Z",
    updatedAt: "2025-03-10T14:50:00Z",
    documents: [],
    archived: false,
  },
  {
    id: "p6",
    name: "Underwater Valve Body",
    partNumber: "UV-9458",
    description: "Corrosion-resistant valve body for deep-sea applications. Requires pressure testing and special surface treatments.",
    active: false,
    materials: ["Duplex Stainless Steel", "Monel 400"],
    setupInstructions: "1. Use hydraulic fixture #UF35\n2. Machine in one setup if possible\n3. Use oil-based coolant for all operations\n4. Pressure test to 5000 PSI",
    machiningMethods: "Operation 1: Rough boring of internal cavities\nOperation 2: Finish milling of sealing surfaces\nOperation 3: Thread milling of connection ports\nOperation 4: Surface passivation after machining",
    revisionNumber: "A",
    createdAt: "2023-12-30T13:40:00Z",
    updatedAt: "2024-10-15T10:25:00Z",
    documents: mockDocuments,
    archived: true,
  }
];

// Mock Work Orders
export const mockWorkOrders: WorkOrder[] = [
  {
    id: "wo1",
    workOrderNumber: "WO-2025-0042",
    purchaseOrderNumber: "AI-PO-7752",
    customer: mockCustomers[0],
    part: mockParts[0],
    quantity: 25,
    status: "In Progress",
    priority: "High",
    createdAt: "2025-04-01T09:30:00Z",
    updatedAt: "2025-04-12T14:15:00Z",
    startDate: "2025-04-10T08:00:00Z",
    dueDate: "2025-04-25T17:00:00Z",
    assignedTo: {
      id: "u3",
      name: "Mike Johnson"
    },
    notes: "Customer requires expedited delivery. Quality inspection report required with shipment."
  },
  {
    id: "wo2",
    workOrderNumber: "WO-2025-0043",
    purchaseOrderNumber: "MD-PO-1235",
    customer: mockCustomers[1],
    part: mockParts[2],
    quantity: 100,
    status: "QC",
    priority: "Normal",
    createdAt: "2025-04-02T10:45:00Z",
    updatedAt: "2025-04-13T11:20:00Z",
    startDate: "2025-04-05T08:00:00Z",
    dueDate: "2025-04-20T17:00:00Z",
    assignedTo: {
      id: "u4",
      name: "Sarah Wilson"
    },
    notes: "Biocompatibility certification required. Handle with white gloves only."
  },
  {
    id: "wo3",
    workOrderNumber: "WO-2025-0044",
    purchaseOrderNumber: "IS-PO-3342",
    customer: mockCustomers[2],
    part: mockParts[4],
    quantity: 50,
    status: "Not Started",
    priority: "Normal",
    createdAt: "2025-04-05T14:20:00Z",
    updatedAt: "2025-04-05T14:20:00Z",
    dueDate: "2025-05-10T17:00:00Z",
    notes: "Standard production run. Use material from lot #L7742."
  },
  {
    id: "wo4",
    workOrderNumber: "WO-2025-0045",
    purchaseOrderNumber: "DS-PO-9981",
    customer: mockCustomers[3],
    part: mockParts[3],
    quantity: 10,
    status: "Complete",
    priority: "Critical",
    createdAt: "2025-03-28T11:10:00Z",
    updatedAt: "2025-04-11T16:30:00Z",
    startDate: "2025-03-30T08:00:00Z",
    dueDate: "2025-04-10T17:00:00Z",
    completedDate: "2025-04-09T15:45:00Z",
    assignedTo: {
      id: "u5",
      name: "Robert Chen"
    },
    notes: "ITAR controlled item. Secure handling required throughout production."
  },
  {
    id: "wo5",
    workOrderNumber: "WO-2025-0046",
    purchaseOrderNumber: "PA-PO-5521",
    customer: mockCustomers[4],
    part: mockParts[4],
    quantity: 200,
    status: "In Progress",
    priority: "High",
    createdAt: "2025-04-07T09:15:00Z",
    updatedAt: "2025-04-14T10:50:00Z",
    startDate: "2025-04-12T08:00:00Z",
    dueDate: "2025-04-30T17:00:00Z",
    assignedTo: {
      id: "u3",
      name: "Mike Johnson"
    },
    notes: "Production will pause for material QC check at 50% completion."
  },
  {
    id: "wo6",
    workOrderNumber: "WO-2025-0047",
    purchaseOrderNumber: "PE-PO-6675",
    customer: mockCustomers[5],
    part: mockParts[5],
    quantity: 5,
    status: "Not Started",
    priority: "Low",
    createdAt: "2025-04-10T15:40:00Z",
    updatedAt: "2025-04-10T15:40:00Z",
    dueDate: "2025-05-20T17:00:00Z",
    notes: "Special material order required before production can begin."
  }
];

// Dashboard KPI data
export const mockKpiData = {
  activeJobs: 12,
  completedThisMonth: 28,
  utilization: 78,
  monthlyRevenue: 154750,
};

// History data for part detail
export const getMockPartHistory = (partId: string) => {
  // Generate some mock history entries based on part ID
  return Array(4).fill(null).map((_, index) => ({
    id: `h${partId.substring(1)}-${index + 1}`,
    workOrderNumber: `WO-${2024 - Math.floor(index/2)}-${1000 + index * 5}`,
    date: new Date(
      new Date().getTime() - (index * 30 + Math.random() * 15) * 24 * 60 * 60 * 1000
    ).toISOString(),
    customer: mockCustomers[index % mockCustomers.length].name,
    quantity: Math.floor(Math.random() * 50) + 10,
    status: index === 0 ? "In Progress" : "Complete"
  }));
};
