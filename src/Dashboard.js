import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear relevant items from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('userId');

        // Redirect to the login page or another appropriate route
        navigate('/');
    };

    return (
        <div className="dashboard">
            <Link to="/shop">
                <button>Shop</button>
            </Link>
            <Link to="/preview">
                <button>Preview</button>
            </Link>
            <Link to="/profile">
                <button>Profile</button>
            </Link>
            <Link to="/review">
                <button>Review</button>
            </Link>
            <Link to="/payments">
                <button>Payments</button>
            </Link>
            <Link to="/rabbit">
                <button>RabbitMQ</button>
            </Link>
            <Link to="/statsbrdarovski">
                <button>Stats Brdarovski</button>
            </Link>
            <Link to="/statsharamija">
                <button>Stats Haramija</button>
            </Link>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default Dashboard;
