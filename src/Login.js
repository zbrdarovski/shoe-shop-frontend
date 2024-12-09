import React, { useState } from 'react';
import './Form.css';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [formErrors, setFormErrors] = useState({ username: '', password: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setFormErrors({ ...formErrors, [name]: '' }); // Clear the error when user starts typing
    };

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        // Validate form fields
        let errors = {};
        if (formData.username.trim() === '') {
            errors.username = 'Username is required';
        }
        if (formData.password.trim() === '') {
            errors.password = 'Password is required';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:1181' : 'deployment_url';

            const response = await fetch(`${baseUrl}/api/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                }),
            });

            if (!response.ok) {
                // Handle specific error cases
                if (response.status === 401) {
                    setFormErrors({ ...formErrors, username: 'Invalid username or password' });
                } else {
                    console.error('Login failed:', response.statusText);
                }
                return;
            }

            // Parse the response JSON
            const responseBody = await response.json();

            // Access Token and UserId properties directly from the parsed JSON
            const { token, userId } = responseBody;

            // Store token in localStorage or a secure storage
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);

            // Navigate to '/shop' or another route
            navigate('/shop');
        } catch (error) {
            console.error('Login failed:', error.message);
        }
    };

    const handleClick = () => {
        navigate('/register');
    };

    return (
        <div className='container'>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleInputChange}
                />
                {formErrors.username && <div className="error">{formErrors.username}</div>}
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                />
                {formErrors.password && <div className="error">{formErrors.password}</div>}
                <button type="submit">Login</button>
            </form>
            <p onClick={handleClick} style={{ cursor: 'pointer' }}>
                Register
            </p>
        </div>
    );
}

export default Login;
