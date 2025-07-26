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
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDepartures = async (latitude: number, longitude: number) => {
        try {
            setLoading(true);
            setStatus('Finding nearest station...');
            const res = await fetch(
                `/api/departures?lat=${latitude}&lon=${longitude}`
            );
            const data = await res.json();
            setStationName(data.closestStation.stop_name);
            setDepartures(data.departures);
            setLastUpdated(new Date());
            setStatus('');
        } catch (error) {
            setStatus('Failed to load departures.');
        } finally {
            setLoading(false);
        }
    };

    const getUserLocationAndFetch = () => {
        if (!navigator.geolocation) {
            setStatus('Geolocation is not supported by your browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchDepartures(latitude, longitude);
            },
            () => setStatus('Unable to retrieve your location.')
        );
    };

    useEffect(() => {
        getUserLocationAndFetch();
    }, []);

    return (
        <main className="min-h-screen flex flex-col items-center justify-start px-4 py-10 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white font-mono">
            <div className="w-full max-w-xl animate-fade-in">
                <h1 className="text-4xl text-center font-bold tracking-widest text-yellow-400 mb-6">
                    Departures Board
                </h1>

                {status && (
                    <div className="text-center text-base text-yellow-300 mb-4">
                        {status}
                    </div>
                )}

                {stationName && (
                    <div className="flex flex-col items-center gap-y-3 mb-4">
                        <span className="relative inline-flex items-center px-3 py-1 text-xs font-medium text-yellow-100 bg-yellow-600 rounded-full shadow shadow-yellow-900 uppercase tracking-widest animate-pulse">
                            Closest Station
                        </span>
                        <div className="text-3xl sm:text-4xl font-bold tracking-wider text-white drop-shadow-lg">
                            {stationName.toUpperCase()}
                        </div>
                    </div>
                )}

                {lastUpdated && (
                    <div className="text-center text-xs text-gray-400 mb-6">
                        Updated at {lastUpdated.toLocaleTimeString()}{' '}
                        <button
                            onClick={getUserLocationAndFetch}
                            className="ml-2 px-2 py-1 border border-yellow-400 text-yellow-300 rounded hover:bg-yellow-400 hover:text-black transition"
                        >
                            Refresh
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="w-full divide-y divide-yellow-300 border border-yellow-500 rounded shadow-lg overflow-hidden animate-pulse p-6 space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex justify-between">
                                <div className="h-4 bg-gray-700 w-24 rounded" />
                                <div className="h-4 bg-gray-700 w-32 rounded" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {departures.map((group, idx) => (
                            <div
                                key={idx}
                                className="border border-yellow-500 rounded-sm overflow-hidden shadow-xl"
                            >
                                <div className="bg-yellow-500 text-black px-4 py-2 font-bold text-sm uppercase tracking-wider shadow-inner">
                                    Platform {idx + 1}
                                </div>
                                <div className="bg-black text-yellow-300 divide-y divide-yellow-700">
                                    <div className="grid grid-cols-3 gap-2 font-bold px-4 py-2 text-xs sm:text-sm uppercase text-yellow-400 bg-neutral-900">
                                        <span>Time</span>
                                        <span className="col-span-2">
                                            Destination
                                        </span>
                                    </div>
                                    {group.map((dep, i) => (
                                        <div
                                            key={`${idx}-${i}`}
                                            className="grid grid-cols-3 gap-2 px-4 py-2 text-sm sm:text-base transition-all duration-150 ease-in-out hover:bg-yellow-100 hover:text-black"
                                        >
                                            <div className="font-mono text-yellow-200 tracking-wider">
                                                {dep.departure_time}
                                            </div>
                                            <div className="col-span-2 uppercase text-yellow-100 tracking-wide">
                                                {dep.stop_headsign}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
