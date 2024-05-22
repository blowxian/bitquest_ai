// context/sessionContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';

const SessionContext = createContext({
    data: null, // Initially, there's no session data
    status: 'loading', // Initial status is loading
    refreshSession: () => {},  // Function to manually refresh session
});

export const useSessionContext = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSession();
    }, []);

    const fetchSession = async () => {
        setLoading(true);
        try {
            const sessionData = await getSession();
            setSession(sessionData);
            console.log('Session data:', sessionData);
        } catch (error) {
            console.error('Failed to fetch session:', error);
        }
        setLoading(false);
    };

    return (
        <SessionContext.Provider value={{ data: session, status: loading ? 'loading' : 'authenticated', refreshSession: fetchSession }}>
            {children}
        </SessionContext.Provider>
    );
};
