import React, { useState, useEffect } from 'react';
import './CommentsRatings.css';
import Dashboard from './Dashboard';

const CommentsRatings = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const [availableQuantities, setAvailableQuantities] = useState({});
    const [products, setProducts] = useState([]);
    const [comments, setComments] = useState({});
    const [ratings, setRatings] = useState({});
    const [newComment, setNewComment] = useState({});
    const [newRating, setNewRating] = useState({});
    const [highestCommentId, setHighestCommentId] = useState(0);
    const [highestRatingId, setHighestRatingId] = useState(0);

    useEffect(() => {
        const fetchAllShoes = async () => {
            try {
                const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:1184' : 'deployment_url';
                const allShoesResponse = await fetch(`${baseUrl}/Inventory`);
                
                if (!allShoesResponse.ok) {
                    const errorText = await allShoesResponse.text();
                    console.error('Failed to fetch all shoes:', errorText);
                    setErrorMessage('Failed to fetch shoes. See console for details.');
                    return;
                }
                
                const allShoesData = await allShoesResponse.json();
                const filteredShoes = allShoesData.filter((shoe) => shoe.id >= 3);
                setProducts(filteredShoes);

                const commentsData = {};
                const ratingsData = {};
                let highestComment = 0;
                let highestRating = 0;

                for (const shoe of filteredShoes) {
                    const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:1185' : 'deployment_url';
                    
                    const commentsResponse = await fetch(`${baseUrl}/CommentsRatings/comments/${shoe.id}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    if (!commentsResponse.ok) {
                        console.error(`Failed to fetch comments for shoe ${shoe.id}:`, await commentsResponse.text());
                        continue;
                    }
                    
                    const commentsJson = await commentsResponse.json();
                    commentsData[shoe.id] = commentsJson;

                    commentsJson.forEach(comment => {
                        const commentId = parseInt(comment.id, 10);
                        highestComment = Math.max(highestComment, commentId);
                    });

                    const ratingsResponse = await fetch(`${baseUrl}/CommentsRatings/ratings/${shoe.id}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    if (!ratingsResponse.ok) {
                        console.error(`Failed to fetch ratings for shoe ${shoe.id}:`, await ratingsResponse.text());
                        continue;
                    }

                    const ratingsJson = await ratingsResponse.json();
                    ratingsData[shoe.id] = ratingsJson;

                    ratingsJson.forEach(rating => {
                        const ratingId = parseInt(rating.id, 10);
                        highestRating = Math.max(highestRating, ratingId);
                    });
                }

                setComments(commentsData);
                setRatings(ratingsData);
                setHighestCommentId(highestComment);
                setHighestRatingId(highestRating);

                const quantities = {};
                filteredShoes.forEach((shoe) => {
                    quantities[shoe.id] = shoe.quantity;
                });
                setAvailableQuantities(quantities);
                
                // Initialize newComment and newRating state objects
                const initialNewComment = {};
                const initialNewRating = {};
                filteredShoes.forEach((shoe) => {
                    initialNewComment[shoe.id] = '';
                    initialNewRating[shoe.id] = 1;
                });
                setNewComment(initialNewComment);
                setNewRating(initialNewRating);
            } catch (error) {
                console.error('Error fetching all shoes:', error);
                setErrorMessage('Failed to fetch shoes. See console for details.');
            }
        };

        fetchAllShoes();
    }, []);

    const handleCommentSubmit = async (productId) => {
        if (newComment[productId] === '') return; // Prevent empty comment submissions
        
        try {
            const requestBody = JSON.stringify({
                id: (highestCommentId + 1).toString(),
                itemId: productId,
                userId: localStorage.getItem('userId'),
                content: newComment[productId],
                timestamp: new Date().toISOString(),
            });

            const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:1185' : 'deployment_url';

            const response = await fetch(`${baseUrl}/CommentsRatings/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: requestBody,
            });

            if (response.ok) {
                setNewComment((prev) => ({ ...prev, [productId]: '' }));
                setHighestCommentId(highestCommentId + 1);
                const commentsResponse = await fetch(`${baseUrl}/CommentsRatings/comments/${productId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const commentsJson = await commentsResponse.json();
                setComments((prevComments) => ({ ...prevComments, [productId]: commentsJson }));
            } else {
                console.error('Failed to submit comment:', response.statusText);
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    };

    const handleCommentDelete = async (productId, commentId) => {
        try {
            const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:1185' : 'deployment_url';

            const response = await fetch(`${baseUrl}/CommentsRatings/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const commentsResponse = await fetch(`${baseUrl}/CommentsRatings/comments/${productId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const commentsJson = await commentsResponse.json();
                setComments((prevComments) => ({ ...prevComments, [productId]: commentsJson }));
            } else {
                console.error('Failed to delete comment:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const handleRatingSubmit = async (productId) => {
        try {
            const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:1185' : 'deployment_url';

            const response = await fetch(`${baseUrl}/CommentsRatings/ratings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    id: (highestRatingId + 1).toString(),
                    itemId: productId,
                    userId: localStorage.getItem('userId'),
                    value: newRating[productId],
                    timestamp: new Date().toISOString(),
                }),
            });

            if (response.ok) {
                setHighestRatingId(highestRatingId + 1);
                const ratingsResponse = await fetch(`${baseUrl}/CommentsRatings/ratings/${productId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const ratingsJson = await ratingsResponse.json();
                setRatings((prevRatings) => ({ ...prevRatings, [productId]: ratingsJson }));
            } else {
                console.error('Failed to submit rating:', response.statusText);
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
        }
    };

    const handleRatingDelete = async (productId, ratingId) => {
        try {
            const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:1185' : 'deployment_url';

            const response = await fetch(`${baseUrl}/CommentsRatings/ratings/${ratingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const ratingsResponse = await fetch(`${baseUrl}/CommentsRatings/ratings/${productId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const ratingsJson = await ratingsResponse.json();
                setRatings((prevRatings) => ({ ...prevRatings, [productId]: ratingsJson }));
            } else {
                console.error('Failed to delete rating:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting rating:', error);
        }
    };

    const calculateAverageRating = (productId) => {
        const ratingsArray = ratings[productId] || [];
        const totalRating = ratingsArray.reduce((sum, rating) => sum + rating.value, 0);
        const averageRating = totalRating / ratingsArray.length || 0;
        return averageRating.toFixed(2);
    };

    const hasUserCommented = (productId) => {
        return comments[productId]?.some(comment => comment.userId === localStorage.getItem('userId'));
    };

    const hasUserRated = (productId) => {
        return ratings[productId]?.some(rating => rating.userId === localStorage.getItem('userId'));
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
                                {comments[product.id]?.map((comment) => (
                                    <div key={comment.id} className="comment">
                                        <p>{comment.content}</p>
                                        {hasUserCommented(product.id) && (
                                            <button 
                                                onClick={() => handleCommentDelete(product.id, comment.id)}
                                                disabled={!comments[product.id]?.length}
                                            >
                                                Delete Comment
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <textarea
                                    placeholder="Add/Edit Comment"
                                    value={newComment[product.id] || ''}
                                    onChange={(e) => setNewComment((prev) => ({ ...prev, [product.id]: e.target.value }))}
                                />
                                <button 
                                    onClick={() => handleCommentSubmit(product.id)}
                                    disabled={hasUserCommented(product.id)}
                                >
                                    Comment
                                </button>
                            </div>

                            <div>
                                <h3>Rating: {calculateAverageRating(product.id)}</h3>
                                <select
                                    value={newRating[product.id] || 1}
                                    onChange={(e) => setNewRating((prev) => ({ ...prev, [product.id]: Number(e.target.value) }))}
                                >
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <option key={value} value={value}>{value}</option>
                                    ))}
                                </select>
                                <button 
                                    onClick={() => handleRatingSubmit(product.id)}
                                    disabled={hasUserRated(product.id)}
                                >
                                    Rate
                                </button>
                                {ratings[product.id]?.length > 0 && (
                                    <button 
                                        onClick={() => handleRatingDelete(product.id, ratings[product.id][0]?.id)}
                                    >
                                        Delete Rating
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommentsRatings;
