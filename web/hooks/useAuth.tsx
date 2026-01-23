import { useState, useEffect, useCallback } from 'react';
import Router from 'next/router';
import { verifyCustomerDriverByToken } from '@/pages/api/customer';
import { useCustomerContext } from '@/context/userContext';


const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const { setCustomerDetail } = useCustomerContext();

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) { 
            setIsAuthenticated(false);
            setCustomerDetail(null);
            // Router.push('/login');
        } else {
            try {
                const response = await verifyCustomerDriverByToken(token) as any;
                if (response.status === true) {
                    setIsAuthenticated(true);
                    setCustomerDetail(response.data);
                } else {
                    localStorage.removeItem('token');
                    setIsAuthenticated(false);
                    setCustomerDetail(null);
                    // Router.push('/login');
                }
            } catch (error) {
                console.error("Error verifying token:", error);
                localStorage.removeItem('token');
                setIsAuthenticated(false);
                setCustomerDetail(null);
                // Router.push('/login');
            }
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return { isAuthenticated, checkAuth };
};


export default useAuth;
