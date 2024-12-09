import React, { useState, useEffect } from 'react';
import './Preview.css';
import Dashboard from './Dashboard';
import { Link } from 'react-router-dom';

const DeliveryList = () => {
    const [deliveries, setDeliveries] = useState([]);
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token'); // Ensure you have the token

    useEffect(() => {
        const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:1182' : 'deployment_url';

        // Fetch data from the API endpoint with proper authorization
        fetch(`${baseUrl}/api/deliveries/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Include the token in the request headers
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Filter deliveries based on userId
            const userDeliveries = data.filter(delivery => delivery.userId === userId);

            // Update the state with the filtered data
            setDeliveries(userDeliveries);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
    }, [userId, token]); // Dependency array ensures the effect runs when userId or token changes

    // Function to format the delivery time
    const formatDeliveryTime = (timeString) => {
        const options = {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
        };

        const formattedTime = new Date(timeString).toLocaleString('sl-SI', options);
        return formattedTime;
    };

    return (
        <div className='Preview'>
            <Dashboard />
            <div className='preview-container'>
                <h2 className='header'>Deliveries</h2>
                {deliveries.length === 0 ? (
                    <p>
                        No deliveries present. Click{' '}
                        <Link to='/shop' className='shop-link'>
                             here
                        </Link>
                        {' '}to check our shop.
                    </p>
                ) : (
                    <ul>
                        {deliveries.map((item) => (
                            <li key={item.id} className='deliveryItem'>
                                <p>User ID: {item.userId}</p>
                                <p>Payment ID: {item.paymentId}</p>
                                <p>Address: {item.address}</p>
                                <p>Delivery Time: {formatDeliveryTime(item.deliveryTime)}</p>
                                <p>GeoX: {item.geoX}</p>
                                <p>GeoY: {item.geoY}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default DeliveryList;
