// main.tsx (React + TypeScript + Tailwind via Vite)
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

interface Departure {
    departure_time: string;
    stop_headsign: string;
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

                console.log('TRYING!');

                try {
                    const res = await fetch(
                        `/api/departures?lat=${latitude}&lon=${longitude}`
                    );

                    console.log(res);

                    const data = await res.json();

                    console.log(data);

                    setStationName(data.closestStation.stop_name);
                    setDepartures(data.departures);
                    setStatus('');
                } catch (error) {
                    console.log(error);
                    setStatus('Failed to load departures.');
                }
            },
            () => setStatus('Unable to retrieve your location.')
        );
    }, []);

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100 text-gray-900">
            <h1 className="text-2xl font-bold mb-4">Next Train Departures!</h1>
            {status && (
                <div className="text-sm text-gray-600 mb-2">{status}</div>
            )}
            {stationName && (
                <div className="text-lg font-medium mb-2">{stationName}</div>
            )}
            <ul className="space-y-1 w-full max-w-md">
                {departures.map((group, idx) => (
                    <div key={idx} className="bg-white rounded shadow p-4">
                        <h2 className="text-sm font-semibold mb-2">
                            {idx === 0 ? 'Northbound' : 'Southbound'}
                        </h2>
                        <ul className="space-y-1">
                            {group.map((dep, i) => (
                                <li key={i} className="text-sm">
                                    <span className="font-medium">
                                        {dep.departure_time}
                                    </span>{' '}
                                    — {dep.stop_headsign}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </ul>
        </main>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
