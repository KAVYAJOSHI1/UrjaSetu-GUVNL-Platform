
import { useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

export const useRealtime = (table: string, onUpdate: () => void) => {
    useEffect(() => {
        const socket = io(SOCKET_URL);

        socket.on('connect', () => {
            console.log('Web Socket connected');
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socket.on('db-change', (payload: any) => {
            if (payload.table === table) {
                console.log('Web Realtime Update:', payload);
                onUpdate();
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [table, onUpdate]);
};
