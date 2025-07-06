import React, { useEffect, useState } from 'react';
import useAuth from 'src/hooks/useAuth';
import { useLocation, Navigate } from 'react-router-dom';
import Loading from 'src/components/Loading';
import { PATHS } from 'src/constants/paths';
import { Outlet } from 'react-router-dom';

export default function NonAuthed() {
    const { authed, refresh } = useAuth();
    const location = useLocation();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let mounted = true;

        const refreshAuth = async () => {
            if (!authed) return; // Don't refresh if not authenticated
            
            try {
                setLoading(true);
                await refresh();
            } catch (error) {
                console.error('Auth refresh failed:', error);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        refreshAuth();

        return () => {
            mounted = false;
        };
    }, [refresh, authed]);

    // Only show loading when we're actually refreshing auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    // If authenticated, redirect to projects
    if (authed) {
        return (
            <Navigate
                to={PATHS.PROJECTS}
                replace
                state={{ path: location.pathname }}
            />
        );
    }

    // Not authenticated, show the requested page
    return <Outlet />;
}
