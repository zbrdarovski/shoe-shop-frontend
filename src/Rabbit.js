import React, { useState, useEffect } from 'react';
import './Rabbit.css';
import Dashboard from './Dashboard';

const Rabbit = () => {
    const [logsBetweenDates, setLogsBetweenDates] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:1186' : 'deployment_url';

    // Function to fetch logs based on start and end dates
    useEffect(() => {
        fetchLogsBetweenDates();
    }, [startDate, endDate]); // Dependency array includes startDate and endDate

    const fetchLogsBetweenDates = async () => {
        try {
            if (startDate && endDate) {
                const response = await fetch(`${baseUrl}/Logging/logs/${startDate}/${endDate}`, {
                    method: 'GET',
                    headers: {
                        'accept': '*/*'
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch logs between dates');
                }

                const data = await response.json();
                setLogsBetweenDates(data); // Update logsBetweenDates state
            } else {
                setLogsBetweenDates([]); // Update logsBetweenDates state
            }

        } catch (error) {
            console.error('Error:', error.message);
        }
    };

    const sendLogsToMongo = async () => {
        try {
            const response = await fetch(`${baseUrl}/Logging/postLogs`, {
                method: 'POST',
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({}),  // Replace with actual data if needed
            });

            if (!response.ok) {
                throw new Error('Failed to send logs to MongoDB');
            }

            // Handle success
            console.log('Logs sent successfully');
        } catch (error) {
            console.error('Error:', error.message);
        }
    };

    const deleteAllLogs = async () => {
        try {
            const response = await fetch(`${baseUrl}/Logging/clearLogs`, {
                method: 'DELETE',
                headers: {
                    'accept': '*/*'
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete all logs');
            }

            // Handle success
            console.log('All logs deleted successfully');

            // Clear logs and logsBetweenDates state after deletion
            setLogsBetweenDates([]);
        } catch (error) {
            console.error('Error:', error.message);
        }
    };

    return (
        <div className="Rabbit">
            <Dashboard />
            <div className="preview-container">
                <h2>Logs between dates</h2>
                {/* Display logs between dates if available */}
                {logsBetweenDates.length === 0 ? (
                    <p>No logs present.</p>
                ) : (
                    <div>
                        <ul>
                            {logsBetweenDates.map(log => (
                                <li key={log.id} className="logItem">
                                    {/* Dynamically display all log information */}
                                    {Object.entries(log).map(([key, value]) => (
                                        <p key={key}><strong>{key}:</strong> {value}</p>
                                    ))}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <button onClick={sendLogsToMongo}>Send Logs to MongoDB</button>
                <div>
                    <label>Start Date:</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <label>End Date:</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <button onClick={deleteAllLogs}>Delete All Logs</button>
            </div>
        </div>
    );
};

export default Rabbit;
