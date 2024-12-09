import React, { useState, useEffect } from 'react';
import './Payments.css';
import Dashboard from './Dashboard';

const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:1183' : 'deployment_url';

                const response = await fetch(`${baseUrl}/CartPayment/payments/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`, // Include the token in the request headers
                    },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error('Unauthorized: Please log in again.');
                    }
                    throw new Error('Failed to fetch payments');
                }

                const data = await response.json();
                setPayments(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (userId && token) {
            fetchPayments();
        } else {
            setIsLoading(false);
            setError('User is not logged in or missing token');
        }
    }, [userId, token]);

    if (error) {
        console.log(`Error: ${error}`);
    }

    return (
        <div className="Payment">
            <Dashboard />
            <div className="payment-container">
                <h2>Payment History</h2>
                {payments.length > 0 ? (
                    <ul>
                        {payments.map(payment => (
                            <li key={payment.id} className="paymentItem">
                                <p>Payment ID: {payment.id}</p>
                                <p>Amount: ${payment.amount}</p>
                                <p>Date: {new Date(payment.paymentDate).toLocaleDateString()}</p>
                                {/* Add more payment details as needed */}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No payments found.</p>
                )}
            </div>
        </div>
    );
};

export default PaymentHistory;
