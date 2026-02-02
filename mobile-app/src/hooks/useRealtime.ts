
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { Platform } from 'react-native';

// For Android Emulator: 10.0.2.2
// For Physical Device: Your LAN IP (192.168.16.108 from your supabase.ts)
// For iOS Simulator: localhost
// Ideally this should be an environment variable
const SOCKET_URL = 'http://192.168.16.108:3000';

export const useRealtime = (table: string, onUpdate: () => void) => {
    useEffect(() => {
        const socket = io(SOCKET_URL);

        socket.on('connect', () => {
            console.log('Mobile Socket connected');
        });

        socket.on('db-change', (payload: any) => {
            // If table matches or if we want to be generous with updates
            if (payload.table === table) {
                console.log('Mobile Realtime Update:', payload);
                onUpdate();
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [table, onUpdate]);
};
