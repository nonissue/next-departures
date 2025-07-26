// src/main.tsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';

interface Departure {
    stop_id: string;
    trip_id: string;
    stop_headsign: string;
    departure_time: string;
    departure_timestamp: number;
}

const App = () => {
    const [status, setStatus] = useState('Requesting location...');
    const [stationName, setStationName] = useState('');
    const [departures, setDepartures] = useState<Departure[][]>([]);

    useEffect(() => {
        if (!navigator.geolocation) {
            setStatus('Geolocation is not supported by your browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                setStatus('Finding nearest station...');
                const { latitude, longitude } = position.coords;

                try {
                    const res = await fetch(
                        `/api/departures?lat=${latitude}&lon=${longitude}`
                    );
                    const data = await res.json();

                    setStationName(data.closestStation.stop_name);
                    setDepartures(data.departures);
                    setStatus('');
                } catch (error) {
                    setStatus('Failed to load departures.');
                }
            },
            () => setStatus('Unable to retrieve your location.')
        );
    }, []);

    return (
        <main className="min-h-screen flex flex-col items-center justify-start px-4 py-10 bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900">
            <div className="w-full max-w-xl">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-indigo-700 mb-6">
                    Next Train Departures
                </h1>

                {status && (
                    <div className="text-center text-base text-gray-500 mb-4">
                        {status}
                    </div>
                )}

                {stationName && (
                    <div className="text-center text-xl font-semibold text-indigo-800 mb-6">
                        Closest Station:{' '}
                        <span className="underline underline-offset-4">
                            {stationName}
                        </span>
                    </div>
                )}

                <div className="grid gap-6">
                    {departures.map((group, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-2xl shadow-lg px-5 py-4 ring-1 ring-gray-200"
                        >
                            <h2 className="text-md font-bold text-indigo-600 mb-3">
                                {idx === 0 ? 'Northbound' : 'Southbound'}{' '}
                                Departures
                            </h2>
                            <ul className="space-y-2">
                                {group.map((dep, i) => (
                                    <li
                                        key={i}
                                        className="flex justify-between text-sm text-gray-800"
                                    >
                                        <span className="font-medium text-gray-900">
                                            {dep.departure_time}
                                        </span>
                                        <span className="italic">
                                            {dep.stop_headsign}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
