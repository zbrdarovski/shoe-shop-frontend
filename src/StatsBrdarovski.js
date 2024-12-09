import './StatsBrdarovski.css';
import Dashboard from './Dashboard';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StatsBrdarovski = () => {
    const [lastCalledEndpoint, setLastCalledEndpoint] = useState("");
    const [mostFrequentEndpoint, setMostFrequentEndpoint] = useState("");
    const [callsPerEndpoint, setCallsPerEndpoint] = useState([]);

    const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:1187' 
        : 'deployment_url';

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([
                fetchLastCalledEndpoint(),
                fetchMostFrequentlyCalledEndpoint(),
                fetchCallsPerEndpoint()
            ]);
        };

        fetchData();
    }, []);

    const fetchLastCalledEndpoint = async () => {
        try {
            const { data } = await axios.get(`${baseUrl}/StatsBrdarovski/GetLastEndpoint`);
            console.log('Last Called Endpoint:', data);  // Debugging log
            setLastCalledEndpoint(data.endpoint);
        } catch (error) {
            console.error('Error fetching last called endpoint:', error);
        }
    };

    const fetchMostFrequentlyCalledEndpoint = async () => {
        try {
            const { data } = await axios.get(`${baseUrl}/StatsBrdarovski/GetMostCalledEndpoint`);
            console.log('Most Frequently Called Endpoint:', data);  // Debugging log
            setMostFrequentEndpoint(data.endpoint);
        } catch (error) {
            console.error('Error fetching most frequently called endpoint:', error);
        }
    };

    const fetchCallsPerEndpoint = async () => {
        try {
            const { data } = await axios.get(`${baseUrl}/StatsBrdarovski/GetCallsPerEndpoint`);
            console.log('Calls Per Endpoint:', data);  // Debugging log
            setCallsPerEndpoint(data);  // Directly set the array
        } catch (error) {
            console.error('Error fetching calls per endpoint:', error);
        }
    };

    const refreshStatistics = () => {
        fetchLastCalledEndpoint();
        fetchMostFrequentlyCalledEndpoint();
        fetchCallsPerEndpoint();
    };

    useEffect(() => {
        console.log('Updated callsPerEndpoint:', callsPerEndpoint);
    }, [callsPerEndpoint]);

    return (
        <div className="brdarovski">
            <Dashboard />
            <p>Last Called Endpoint: {lastCalledEndpoint}</p>
            <p>Most Frequently Called Endpoint: {mostFrequentEndpoint}</p>
            <p>
                Calls Per Endpoint:{" "}
                {callsPerEndpoint &&
                    callsPerEndpoint
                        .map((endpointData) => `${endpointData.endpoint}: ${endpointData.count}`)
                        .join(", ")}
            </p>
            <div className="buttons">
                <button onClick={refreshStatistics}>Refresh Statistics</button>
            </div>
        </div>
    );
};

export default StatsBrdarovski;
