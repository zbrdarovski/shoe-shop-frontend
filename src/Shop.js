import React, { useState, useEffect } from 'react';
import './Shop.css';
import Dashboard from './Dashboard';
import { useNavigate } from 'react-router-dom';

const Shop = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const [cart, setCart] = useState([]);
    const [availableQuantities, setAvailableQuantities] = useState({});
    const [products, setProducts] = useState([]);
    const [comments, setComments] = useState({});
    const [ratings, setRatings] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllShoes = async () => {
            try {
                const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:1184' : 'deployment_url';
                const token = localStorage.getItem('token'); // Retrieve the token from localStorage

                const allShoesResponse = await fetch(`${baseUrl}/Inventory`, {
                    headers: {
                        'Authorization': `Bearer ${token}` // Include the token in the Authorization header
                    }
                });

                if (!allShoesResponse.ok) {
                    console.error('Failed to fetch all shoes:', allShoesResponse.statusText);
                    const errorText = await allShoesResponse.text();
                    console.error('Response text:', errorText);
                    setErrorMessage('Failed to fetch shoes. See console for details.');
                    return;
                }
                const allShoesData = await allShoesResponse.json();

                if (allShoesData.length > 0) {
                    const filteredShoes = allShoesData.filter((shoe) => shoe.id >= 3);
                    setProducts(filteredShoes);

                    const commentsData = {};
                    const ratingsData = {};
                    for (const shoe of filteredShoes) {
                        const commentsUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:1185' : 'deployment_url';

                        const commentsResponse = await fetch(`${commentsUrl}/CommentsRatings/comments/${shoe.id}`, {
                            headers: {
                                'Authorization': `Bearer ${token}` // Include the token in the Authorization header
                            }
                        });
                        const commentsJson = await commentsResponse.json();
                        commentsData[shoe.id] = commentsJson;

                        const ratingsResponse = await fetch(`${commentsUrl}/CommentsRatings/ratings/${shoe.id}`, {
                            headers: {
                                'Authorization': `Bearer ${token}` // Include the token in the Authorization header
                            }
                        });
                        const ratingsJson = await ratingsResponse.json();
                        ratingsData[shoe.id] = ratingsJson;
                    }

                    setComments(commentsData);
                    setRatings(ratingsData);

                    const quantities = {};
                    filteredShoes.forEach((shoe) => {
                        quantities[shoe.id] = shoe.quantity;
                    });
                    setAvailableQuantities(quantities);
                }
            } catch (error) {
                console.error('Failed to fetch shoes:', error.message);
                setErrorMessage('Failed to fetch shoes. See console for details.');
            }
        };

        fetchAllShoes();
    }, []);

    const handleCheckout = () => {
        if (cart.length === 0) {
            setErrorMessage('Please fill your cart first.');
        } else {
            setErrorMessage('');
            navigate('/delivery', { state: { cart: cart } });
        }
    };

    const addToCart = (product) => {
        if (availableQuantities[product.id] > 0) {
            setErrorMessage('');

            const existingItem = cart.find((item) => item.id === product.id);

            if (existingItem) {
                setCart((prevCart) =>
                    prevCart.map((item) =>
                        item.id === product.id ? { ...item, amount: item.amount + 1 } : item
                    )
                );
            } else {
                setCart((prevCart) => [...prevCart, { ...product, amount: 1 }]);
            }

            setAvailableQuantities((prevQuantities) => ({
                ...prevQuantities,
                [product.id]: prevQuantities[product.id] - 1,
            }));
        }
    };

    const removeFromCart = (productId) => {
        const updatedCart = cart
            .map((item) =>
                item.id === productId ? { ...item, amount: item.amount - 1 } : item
            )
            .filter((item) => item.amount > 0);

        setCart(updatedCart);

        setAvailableQuantities((prevQuantities) => ({
            ...prevQuantities,
            [productId]: prevQuantities[productId] + 1,
        }));
    };

    const calculateTotalAmount = () => {
        return cart.reduce((total, item) => total + item.amount * item.price, 0);
    };

    const calculateAverageRating = (productId) => {
        const ratingsArray = ratings[productId] || [];
        const totalRating = ratingsArray.reduce((sum, rating) => sum + rating.value, 0);
        const averageRating = totalRating / ratingsArray.length || 0;
        return averageRating.toFixed(2);
    };

    return (
        <div className="Shop">
            <Dashboard />
            <div className="catalog">
                <h2>Product Catalog</h2>
                {products.map((product) => (
                    <div key={product.id} className="list">
                        <div className="card">
                            <p>{product.name} - ${product.price}</p>
                            <p>Amount Left: {availableQuantities[product.id]}</p>

                            <div>
                                <h3>Comments:</h3>
                                {comments[product.id]?.map(comment => (
                                    <p key={comment.id}>{comment.content}</p>
                                ))}
                            </div>

                            <div>
                                <h3>Ratings:</h3>
                                <p>Rating: {calculateAverageRating(product.id)}</p>
                            </div>

                            <div className='add-button'>
                                <button onClick={() => addToCart(product)}>Add to Cart</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="catalog">
                <h2>Shopping Cart</h2>
                {cart.map((item) => (
                    <div key={item.id} className="list">
                        <div className="card">
                            <p>{item.name} - ${item.price}</p>
                            <p>Amount: {item.amount}</p>
                            <div className="remove-button">
                                <button onClick={() => removeFromCart(item.id)}>Remove</button>
                            </div>
                        </div>
                    </div>
                ))}
                <p>Total Amount: ${calculateTotalAmount()}</p>
                <div className='checkout-button'>
                    <button onClick={handleCheckout}>
                        Checkout
                    </button>
                </div>
                {errorMessage && <p className="empty-cart-message" style={{ color: 'red' }}>{errorMessage}</p>}
            </div>
        </div>
    );
};

export default Shop;
