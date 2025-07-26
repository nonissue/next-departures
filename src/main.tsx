// src/main.tsx
import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import { convertServiceTimeToClockTime } from './lib/time-utils';

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
        <main className="min-h-screen flex flex-col items-center justify-start px-4 py-10 bg-gradient-to-l from-black via-black to-black text-white font-mono">
            <div className="w-full max-w-xl animate-fade-in">
                {/* <h1 className="text-4xl text-center font-bold tracking-widest text-orange-400 mb-6">
                    Departures Board
                </h1> */}

                {status && (
                    <div className="text-center text-base text-orange-300 mb-4">
                        {status}
                    </div>
                )}

                <div className="border-2 border-dotted border-orange-300/25 p-4  ">
                    {stationName && (
                        <div className="flex flex-col gap-y-2">
                            <span className="relative inline-flex text-xs text-orange-300 bg-gradient-to-r from-gray-700/0 via-slate-700/0 to-gray-800/0 rounded-xs uppercase tracking-widest">
                                Closest Station:
                            </span>
                            <div className="text-xl sm:text-2xl font-bold tracking-wider text-orange-200 drop-shadow-lg">
                                {stationName.toUpperCase()}
                            </div>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="w-full divide-y divide-orange-300 border border-orange-500 overflow-hidden  animate-pulse delay-200 p-6 space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex justify-between">
                                <div className="h-4 bg-gray-700 w-24 rounded" />
                                <div className="h-4 bg-gray-700 w-32 rounded" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-0 border-2 border-orange-400/50 divide-orange-400/50 divide-y-2 bg-orange-100/10">
                        {departures.map((group, idx) => (
                            <div
                                key={idx}
                                className="overflow-hidden divide-y divide-dotted divide-orange-300/30"
                            >
                                <div className=" text-orange-50 px-4 py-2 text-sm uppercase tracking-wider shadow-inner">
                                    Platform {idx + 1}
                                </div>
                                <div className="bg-gray-950/70 text-orange-300 divide-y divide-orange-100/20 divide-dotted">
                                    <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs sm:text-sm uppercase text-orange-300">
                                        <span>Time</span>
                                        <span className="col-span-2">
                                            Destination
                                        </span>
                                    </div>
                                    {group.map((dep, i) => (
                                        <div
                                            key={`${idx}-${i}`}
                                            className="grid grid-cols-3 gap-2 px-4 py-3 text-sm sm:text-base transition-all duration-150 ease-in-out hover:bg-gray-900 hover:cursor-pointer hover:text-black"
                                        >
                                            <div className="font-mono font-light my-auto  text-orange-100 tracking-wide">
                                                {/* {dep.departure_time} */}
                                                {convertServiceTimeToClockTime(
                                                    dep.departure_time
                                                )}
                                            </div>
                                            <div className="col-span-2 font-normal uppercase text-orange-100 tracking-wide">
                                                {dep.stop_headsign}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {lastUpdated && (
                    <div className="text-xs text-orange-100/90  p-4 border-2 border-dotted border-orange-300/25 text-right">
                        Last Updated at {lastUpdated.toLocaleTimeString()}{' '}
                        <button
                            onClick={getUserLocationAndFetch}
                            className="ml-2 px-2 py-1 border border-orange-100 text-gray-600 bg-orange-300 rounded hover:bg-orange-100 hover:cursor-pointer hover:text-black transition"
                        >
                            Refresh
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
