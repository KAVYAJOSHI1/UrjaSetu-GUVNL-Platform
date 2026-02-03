import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ReportStatus = 'Resolved' | 'In Progress' | 'Acknowledged' | 'Submitted';
export type Priority = 'High' | 'Medium' | 'Low';

export interface StatusHistory {
  status: ReportStatus;
  date: string;
  comment: string;
}

export interface Report {
  id: string;
  priority: Priority;
  type: string;
  description: string;
  status: ReportStatus;
  date: string;
  imageUrl?: string;
  location: string;
  statusHistory: StatusHistory[];
  isSuggestion?: boolean;
}

interface ReportsContextType {
  reports: Report[];
  addReport: (report: Omit<Report, 'id' | 'date' | 'status' | 'statusHistory'>) => void;
  addSuggestion: (description: string) => void;
}

const initialReports: Report[] = [
  {
    id: 'RPT-1023',
    priority: 'High',
    type: 'Power Outage',
    description: 'Complete power failure in the entire Sector 12 area since last night.',
    status: 'Resolved',
    date: '2025-10-10',
    imageUrl: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=600&h=400&fit=crop',
    location: 'Sector 12, Ahmedabad',
    statusHistory: [
      { status: 'Resolved', date: '2025-10-11', comment: 'Line repaired and power restored.' },
      { status: 'In Progress', date: '2025-10-10', comment: 'Team dispatched for repairs.' },
      { status: 'Acknowledged', date: '2025-10-10', comment: 'Issue confirmed.' },
      { status: 'Submitted', date: '2025-10-10', comment: 'Report received.' },
    ],
  },
  {
    id: 'SUG-0045',
    priority: 'Low',
    type: 'New Idea / Suggestion',
    description: 'Consider installing solar panels on government buildings.',
    status: 'In Progress',
    date: '2025-10-05',
    isSuggestion: true,
    location: 'N/A',
    statusHistory: [
      { status: 'In Progress', date: '2025-10-06', comment: 'Feasibility study is underway.' },
      { status: 'Submitted', date: '2025-10-05', comment: 'Suggestion received.' },
    ],
  },
  {
    id: 'RPT-1024',
    priority: 'Medium',
    type: 'Voltage Fluctuation',
    description: 'Frequent voltage fluctuations are damaging appliances.',
    status: 'Acknowledged',
    date: '2025-10-14',
    location: 'Vastrapur, Ahmedabad',
    statusHistory: [
      { status: 'Acknowledged', date: '2025-10-14', comment: 'Team will investigate.' },
      { status: 'Submitted', date: '2025-10-14', comment: 'Report received.' },
    ],
  },
];

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export const ReportsProvider = ({ children }: { children: ReactNode }) => {
  const [reports, setReports] = useState<Report[]>(initialReports);

  const addReport = (report: Omit<Report, 'id' | 'date' | 'status' | 'statusHistory'>) => {
    const newId = `RPT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReport: Report = {
      ...report,
      id: newId,
      date: new Date().toISOString().split('T')[0],
      status: 'Submitted',
      statusHistory: [
        {
          status: 'Submitted',
          date: new Date().toISOString().split('T')[0],
          comment: 'Report received via citizen portal.',
        },
      ],
    };
    setReports((prev) => [newReport, ...prev]);
  };

  const addSuggestion = (description: string) => {
    const newId = `SUG-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSuggestion: Report = {
      id: newId,
      type: 'New Idea / Suggestion',
      description,
      status: 'Submitted',
      date: new Date().toISOString().split('T')[0],
      isSuggestion: true,
      priority: 'Low',
      location: 'N/A',
      statusHistory: [
        {
          status: 'Submitted',
          date: new Date().toISOString().split('T')[0],
          comment: 'Suggestion received via citizen portal.',
        },
      ],
    };
    setReports((prev) => [newSuggestion, ...prev]);
  };

  return (
    <ReportsContext.Provider value={{ reports, addReport, addSuggestion }}>
      {children}
    </ReportsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useReports = () => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};
