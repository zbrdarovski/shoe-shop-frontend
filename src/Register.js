import React, { useState, useEffect } from 'react';
import './Form.css';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        repeatPassword: ''
    });

    const [formErrors, setFormErrors] = useState({
        username: '',
        password: '',
        repeatPassword: ''
    });

    const [highestUserId, setHighestUserId] = useState(0);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setFormErrors({ ...formErrors, [name]: '' }); // Clear the error when user starts typing
    };

    const navigate = useNavigate();

    const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:1181' : 'deployment_url';

    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const response = await fetch(`${baseUrl}/api/users`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.length > 0) {
                        const maxId = Math.max(...data.map(user => user.id));
                        setHighestUserId(maxId);
                    } else {
                        setHighestUserId(0);
                    }
                } else {
                    console.error('Failed to fetch all users:', response.statusText);
                }
            } catch (error) {
                console.error('Failed to fetch all users:', error.message);
            }
        };

        fetchAllUsers();
    }, []); // Fetch all users once when the component mounts

    const handleRegister = async (e) => {
        e.preventDefault();

        // Validate form fields
        let errors = {};
        if (formData.username.length < 6) {
            errors.username = 'Username must be at least 6 characters';
        }
        if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        if (formData.password !== formData.repeatPassword) {
            errors.repeatPassword = 'Passwords do not match';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            const response = await fetch(`${baseUrl}/api/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: (highestUserId + 1).toString(),
                    username: formData.username,
                    password: formData.password
                }),
            });

            if (!response.ok) {
                console.error('Registration failed:', response.statusText);
                return;
            } else {
                console.log('Registration successful');
                navigate('/');
            }
        } catch (error) {
            console.error('Registration failed:', error.message);
        }
    };

    const handleClick = () => {
        navigate('/');
    };

    return (
        <div className='container'>
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Enter username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                />
                {formErrors.username && <div className="error">{formErrors.username}</div>}
                <input
                    type="password"
                    placeholder="Enter password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                />
                {formErrors.password && <div className="error">{formErrors.password}</div>}
                <input
                    type="password"
                    placeholder="Repeat password"
                    name="repeatPassword"
                    value={formData.repeatPassword}
                    onChange={handleInputChange}
                />
                {formErrors.repeatPassword && <div className="error">{formErrors.repeatPassword}</div>}
                <button type="submit">Register</button>
            </form>
            <p onClick={handleClick} style={{ cursor: 'pointer' }}>
                Login
            </p>
        </div>
    );
};

export default Register;
