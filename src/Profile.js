import Dashboard from './Dashboard';
import React, { useState } from 'react';
import './Form.css';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const [formData, setFormData] = useState({
        username: '',
        currentPassword: '',
        newPassword: '',
        repeatNewPassword: ''
    });

    const [formErrors, setFormErrors] = useState({
        username: '',
        currentPassword: '',
        newPassword: '',
        repeatNewPassword: ''
    });

    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setFormErrors({ ...formErrors, [name]: '' }); // Clear the error when user starts typing
    };

    const handleChangePassword = async () => {
        // Validate form fields
        let errors = {};
        if (formData.username.trim() === '') {
            errors.username = 'Username is required';
        }
        if (formData.currentPassword.trim() === '') {
            errors.currentPassword = 'Current password is required';
        }
        if (formData.newPassword.trim() === '') {
            errors.newPassword = 'New password is required';
        } else if (formData.newPassword.length < 6) {
            errors.newPassword = 'Password must be at least 6 characters';
        }
        if (formData.repeatNewPassword.trim() === '') {
            errors.repeatNewPassword = 'Repeat new password is required';
        } else if (formData.newPassword !== formData.repeatNewPassword) {
            errors.repeatNewPassword = 'Passwords do not match';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            // Retrieve token from storage
            const token = localStorage.getItem('token');

            const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:1181' : 'deployment_url';

            const response = await fetch(`${baseUrl}/api/users/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    username: formData.username,
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                }),
            });

            if (!response.ok) {
                // Handle error cases
                if (response.status === 401) {
                    setFormErrors({ ...formErrors, username: 'Invalid username or password' });
                } else {
                    const errorMessage = await response.text();
                    setFormErrors({ ...formErrors, newPassword: `Password change failed: ${errorMessage}` });
                }
                console.log(formErrors); // Log form errors to the console
                return;
            }

            // Assuming successful response handling
            navigate('/shop');
        } catch (error) {
            setFormErrors({ ...formErrors, newPassword: `Password change failed: ${error.message}` });
            console.log(formErrors); // Log form errors to the console
        }
    };

    return (
        <div className="Profile">
            <Dashboard />
            <div className="container">
                <h2>Password</h2>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    autoComplete="on"
                />
                {formErrors.username && <div className="error">{formErrors.username}</div>}
                <input
                    type="password"
                    name="currentPassword"
                    placeholder="Current password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    autoComplete="off"
                />
                {formErrors.currentPassword && <div className="error">{formErrors.currentPassword}</div>}
                <input
                    type="password"
                    name="newPassword"
                    placeholder="New password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    autoComplete="off"
                />
                {formErrors.newPassword && <div className="error">{formErrors.newPassword}</div>}
                <input
                    type="password"
                    name="repeatNewPassword"
                    placeholder="Repeat new password"
                    value={formData.repeatNewPassword}
                    onChange={handleInputChange}
                    autoComplete="off"
                />
                {formErrors.repeatNewPassword && <div className="error">{formErrors.repeatNewPassword}</div>}
                <button
                    onClick={handleChangePassword}
                >
                    Change
                </button>
            </div>
        </div>
    );
}

export default Profile;
