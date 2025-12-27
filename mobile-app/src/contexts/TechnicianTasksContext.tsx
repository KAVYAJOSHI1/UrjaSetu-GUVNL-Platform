import React, { createContext, ReactNode, useContext, useState } from 'react';

// Define the types for a technician's task and status
export type TaskStatus = 'Pending' | 'In Progress' | 'Pending Verification';
export type Priority = 'High' | 'Medium' | 'Low';

export interface TechnicianTask {
  id: string;
  type: string;
  location: string;
  priority: Priority;
  description: string;
  imageUrl: string; // The "before" photo
  coords: { latitude: number; longitude: number };
  status: TaskStatus;
}

interface TechnicianTasksContextType {
  tasks: TechnicianTask[];
  getTaskById: (id: string) => TechnicianTask | undefined;
  startWork: (taskId: string) => void;
  submitForVerification: (taskId: string, afterPhotoUri: string, notes: string) => void;
}

const TechnicianTasksContext = createContext<TechnicianTasksContextType | undefined>(undefined);

// Initial mock data with statuses that can be changed globally
const initialTasks: TechnicianTask[] = [
  { id: 'GUV-00781', type: 'Transformer Sparks', location: 'Maninagar', priority: 'High', status: 'Pending', coords: { latitude: 22.9961, longitude: 72.6019 }, description: 'The transformer is emitting loud noises and sparks.', imageUrl: 'https://i.imgur.com/gO2n5V5.jpeg' },
  { id: 'GUV-00779', type: 'Streetlight Outage', location: 'Bodakdev', priority: 'Medium', status: 'Pending', coords: { latitude: 23.0368, longitude: 72.5085 }, description: 'Streetlight on the main road is not working.', imageUrl: 'https://i.imgur.com/8k3Aa2V.jpeg' },
  { id: 'GUV-00778', type: 'Exposed Wires', location: 'SG Highway', priority: 'High', status: 'In Progress', coords: { latitude: 23.0539, longitude: 72.5082 }, description: 'Live wires are exposed from a damaged junction box.', imageUrl: 'https://i.imgur.com/gO2n5V5.jpeg' },
];

export const TechnicianTasksProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<TechnicianTask[]>(initialTasks);

  const getTaskById = (id: string) => tasks.find(task => task.id === id);

  const startWork = (taskId: string) => {
    console.log(`Starting work on task: ${taskId}`);
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: 'In Progress' } : task
      )
    );
  };

  const submitForVerification = (taskId: string, afterPhotoUri: string, notes: string) => {
    console.log(`Submitting task ${taskId} for verification. Notes: ${notes}`);
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: 'Pending Verification' } : task
      )
    );
  };

  return (
    <TechnicianTasksContext.Provider value={{ tasks, getTaskById, startWork, submitForVerification }}>
      {children}
    </TechnicianTasksContext.Provider>
  );
};

export const useTechnicianTasks = () => {
  const context = useContext(TechnicianTasksContext);
  if (context === undefined) {
    throw new Error('useTechnicianTasks must be used within a TechnicianTasksProvider');
  }
  return context;
};