import { useCustomerContext } from "@/context/userContext";
import useAuth from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { getAllTransactions, getTransactionById } from "./api/transaction";
import { useRouter } from "next/router";
import { Modal } from "react-bootstrap";
import moment from "moment";
import Head from "next/head";

export default function DriverProfile() {
    const { isAuthenticated, checkAuth } = useAuth();
    const { customerDetail } = useCustomerContext();

    const router = useRouter();

    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        if (!isChecked) {
            const timer = setTimeout(() => {
                setIsChecked(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isChecked]);

    useEffect(() => {
        if (isChecked && isAuthenticated === false) {
            setIsChecked(false);
            router.push('/driver-login');
        }
    }, [isChecked, isAuthenticated]);

    return (
        <>
            <Head>
                <title>{'Driver Transactions'}</title>
            </Head>
            <div className="container" style={{ marginTop: "80px" }}>
                <div className="py-5">
                    <h2 className="text-center">Driver Transactions</h2>
                </div>
            </div>
        </>

    );
}
