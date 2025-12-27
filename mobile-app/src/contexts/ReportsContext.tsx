import React, { createContext, ReactNode, useContext } from 'react';

// Define the structure of a single report
export interface Report {
  id: string;
  type: string;
  location: string;
  description: string;
  imageUrl?: string;
  status: 'Submitted' | 'In Progress' | 'Resolved';
  statusHistory: {
    status: string;
    date: string;
    comment: string;
  }[];
}

// Define what the context will provide
interface ReportsContextType {
  reports: Report[];
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

// Sample data for demonstration purposes
const mockReports: Report[] = [
  {
    id: 'GUVNL-25-001',
    type: 'Streetlight Not Working',
    location: 'Near GLS University, Ahmedabad',
    description: 'The streetlight on the main road has been flickering for three days and is now completely off. It is very dark at night.',
    imageUrl: 'https://images.unsplash.com/photo-1600115528243-93668351b655?w=600&h=400&fit=crop',
    status: 'Resolved',
    statusHistory: [
        { status: 'Resolved', date: '18-Oct-2025', comment: 'Technician replaced the faulty bulb. Issue resolved.' },
        { status: 'In Progress', date: '17-Oct-2025', comment: 'Complaint assigned to local maintenance team.' },
        { status: 'Submitted', date: '16-Oct-2025', comment: 'Complaint successfully registered by citizen.' },
    ],
  },
  {
    id: 'GUVNL-25-002',
    type: 'Exposed Wiring',
    location: 'Manek Chowk, Old City',
    description: 'An electrical box near the food stalls has a broken cover with wires exposed. This is dangerous for the public.',
    imageUrl: 'https://images.unsplash.com/photo-1616627780424-7954316b629a?w=600&h=400&fit=crop',
    status: 'In Progress',
    statusHistory: [
        { status: 'In Progress', date: '19-Oct-2025', comment: 'A safety team has been dispatched to secure the area.' },
        { status: 'Submitted', date: '19-Oct-2025', comment: 'Complaint registered. Marked as high priority.' },
    ],
  },
];

// The provider component
export const ReportsProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ReportsContext.Provider value={{ reports: mockReports }}>
      {children}
    </ReportsContext.Provider>
  );
};

// Custom hook for easy access
export const useReports = () => {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};

