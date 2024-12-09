import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Delivery.css';

const Delivery = () => {
    const [highestDeliveryId, setHighestDeliveryId] = useState(0);
    const [lastAddress, setLastAddress] = useState('');

    const [inputAddress, setInputAddress] = useState('');
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchAllDeliveries = async () => {
            try {
                const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:1182' : 'deployment_url';
                
                const allDeliveriesResponse = await fetch(`${baseUrl}/api/deliveries`);
                if (!allDeliveriesResponse.ok) {
                    console.error('Failed to fetch all deliveries:', allDeliveriesResponse.statusText);
                    return;
                }
                const allDeliveriesData = await allDeliveriesResponse.json();

                if (allDeliveriesData.length > 0) {
                    const maxId = Math.max(...allDeliveriesData.map(delivery => delivery.id));
                    setHighestDeliveryId(maxId);

                    const userDeliveries = allDeliveriesData.filter(delivery => delivery.userId === userId);
                    const deliveryWithMaxAddress = userDeliveries.reduce((maxAddressDelivery, delivery) => {
                        return delivery.address > maxAddressDelivery.address ? delivery : maxAddressDelivery;
                    }, userDeliveries[0] || null);

                    setLastAddress(deliveryWithMaxAddress ? deliveryWithMaxAddress.address : '');
                    setInputAddress(deliveryWithMaxAddress ? deliveryWithMaxAddress.address : '');
                } else {
                    setHighestDeliveryId(0);
                    setLastAddress('');
                    setInputAddress('');
                }
            } catch (error) {
                console.error('Failed to fetch deliveries:', error.message);
            }
        };

        fetchAllDeliveries();
    }, [userId]);

    const location = useLocation();
    const navigate = useNavigate();
    const { cart } = location.state || { cart: [] };

    const [isAddressValid, setIsAddressValid] = useState(true);

    const handleOrder = async () => {
        if (inputAddress.trim() === '') {
            setIsAddressValid(false);
        } else {
            try {
                const geoX = Math.random();
                const geoY = Math.random();
                const deliveryTime = new Date().toISOString();
                const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:1183' : 'deployment_url';
                const token = localStorage.getItem('token');  // Fetch the token from local storage
    
                // Create a new payment first
                const paymentResponse = await fetch(`${baseUrl}/CartPayment/payment/add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,  // Add Authorization header
                    },
                    body: JSON.stringify({
                        id: (highestDeliveryId + 1).toString(),
                        cartId: userId,
                        userId,
                        amount: calculateTotalAmount(),
                        inventoryItems: cart.map(item => ({
                            id: item.id,
                            price: item.price,
                            name: item.name,
                            color: item.color,
                            size: item.size,
                            description: item.description,
                            image: item.image,
                            quantity: item.amount,
                            comments: item.comments,
                            ratings: item.ratings,
                        })),
                        paymentDate: deliveryTime,
                    }),
                });
    
                if (!paymentResponse.ok) {
                    console.error('Failed to create payment');
                    return;
                }
    
                try {
                    const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:1182' : 'deployment_url';
                    
                    const deliveryResponse = await fetch(`${baseUrl}/api/deliveries`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,  // Add Authorization header
                        },
                        body: JSON.stringify({
                            id: (highestDeliveryId + 1).toString(),
                            userId,
                            paymentId: (highestDeliveryId + 1).toString(),
                            address: inputAddress,
                            deliveryTime,
                            geoX,
                            geoY,
                        }),
                    });
    
                    const basedUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:1184' : 'deployment_url';
    
                    if (deliveryResponse.ok) {
                        // Update inventory items and navigate accordingly
                        for (const item of cart) {
                            const inventoryUpdateResponse = await fetch(`${basedUrl}/Inventory/${item.id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`,  // Add Authorization header
                                },
                                body: JSON.stringify({
                                    id: item.id,
                                    price: item.price,
                                    name: item.name,
                                    color: item.color,
                                    size: item.size,
                                    description: item.description,
                                    image: item.image,
                                    quantity: item.quantity - item.amount,
                                    comments: item.comments,
                                    ratings: item.ratings,
                                }),
                            });
    
                            if (!inventoryUpdateResponse.ok) {
                                console.error(`Failed to update inventory for item ${item.id}`);
                                navigate('/shop');
                                return;
                            }
                        }
    
                        console.log('Order placed successfully');
                        navigate('/preview');
                    } else {
                        console.error('Failed to add delivery');
                    }
                } catch (jsonError) {
                    console.error('Error parsing payment JSON:', jsonError);
                    return;
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    const handleCancel = () => {
        navigate('/shop');
        console.log('Order cancelled');
    };

    const calculateTotalAmount = () => {
        return cart.reduce((total, item) => total + item.amount * item.price, 0);
    };

    return (
        <div className="Delivery">
            <h2>Delivery Page</h2>
            {cart.length > 0 ? (
                <div className="cart-container">
                    <h3>Your Cart:</h3>
                    {cart.map((item) => (
                        <div key={item.id} className="cart-item">
                            <p>
                                {item.name} - ${item.price} - Amount: {item.amount}
                            </p>
                        </div>
                    ))}
                    <p>Total Amount: ${calculateTotalAmount()}</p>
                    <div className="address-input">
                        <p>Address:</p>
                        <input
                            type="text"
                            value={inputAddress}
                            onChange={(e) => {
                                setInputAddress(e.target.value);
                                setIsAddressValid(true);
                            }}
                        />
                    </div>
                    {!isAddressValid && <p className="validation-message">Please enter a non-empty address.</p>}
                    <div className="button-container">
                        <div className="cancel-button">
                            <button onClick={handleCancel}>Cancel</button>
                        </div>
                        <div className="order-button">
                            <button onClick={handleOrder} disabled={!isAddressValid}>
                                Order
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <p>Your cart is empty. Add items to proceed to checkout.</p>
            )}
        </div>
    );
};

export default Delivery;
