// src/main.tsx
import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import { convertServiceTimeToClockTime } from '@/lib/time-utils';
import { TEST_COORDS } from './lib/constants';

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
            () => {
                setStatus('Unable to retrieve your location.');
                fetchDepartures(TEST_COORDS.lat, TEST_COORDS.lon);
            }
        );
    };

    useEffect(() => {
        getUserLocationAndFetch();
    }, []);

    return (
        <main className="min-h-dvh overflow-y-auto overscroll-none sm:min-h-screen sm:overflow-visible sm:overscroll-auto w-full flex flex-col items-center justify-center px-4 sm:py-10 bg-gradient-to-l from-black via-black to-black text-white font-mono">
            <div className="w-full px-4 sm:my-auto max-w-xl animate-fade-in">
                {/* <h1 className="text-4xl text-center font-bold tracking-widest text-orange-400 mb-6">
                    Departures Board
                </h1> */}

                {status && (
                    <div className="text-center text-base text-orange-300 mb-4">
                        {status}
                    </div>
                )}

                <div className="px-2 sm:px-8">
                    {/* bg-radial-[at_25%_100%] from-amber-700/10 via-orange-500/10 to-zinc-700/20 to-200% */}
                    {/* <div className="border-2 border-b-0 border-dotted border-neutral-500/25 bg-radial-[at_50%_150%] from-neutral-900/50 to-neutral-400/10 rounded-t-sm  p-4 "> */}
                    <div className="p-4">
                        {stationName && (
                            <div className="flex flex-col sm:gap-y-2 items-center justify-around">
                                <span className="relative text-sm inline-flex text-orange-300 bg-gradient-to-r from-gray-700/0 via-slate-700/0 to-gray-800/0  uppercase tracking-widest">
                                    Closest Station:
                                </span>

                                <div className="text-2xl sm:text-2xl font-sans font-bold tracking-normal text-orange-200 drop-shadow-lg">
                                    {stationName.toUpperCase()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {loading ? (
                    <div className="w-full divide-y divide-orange-300 border border-orange-400/50 overflow-hidden  animate-pulse delay-200 p-6 space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex justify-between">
                                <div className="h-4 bg-gray-700 w-24 rounded" />
                                <div className="h-4 bg-gray-700 w-32 rounded" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-0 border-2 border-orange-400/50 divide-orange-400/50 divide-y-2 bg-orange-100/10  ">
                        {departures.map((group, idx) => (
                            <div
                                key={idx}
                                className=" divide-y w-full  divide-dotted divide-orange-300/30 flex items-stretch"
                            >
                                {/* Label column */}
                                <div className="flex flex-col justify-center items-center border-r w-8 border-solid border-b-0 border-zinc-800 relative">
                                    <span className="rotate-[-90deg] font-light text-xs sm:text-md uppercase tracking-widest text-amber-100/90 whitespace-nowrap ">
                                        Platform {idx + 1}
                                    </span>
                                </div>

                                {/* Content column */}
                                <div className="bg-zinc-950/70 text-orange-300 divide-y divide-orange-100/20 divide-dotted flex-1">
                                    <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs sm:text-sm uppercase text-orange-300">
                                        <span>Time</span>
                                        <span className="col-span-2">
                                            Destination
                                        </span>
                                    </div>
                                    {group.map((dep, i) => (
                                        <div
                                            key={`${idx}-${i}`}
                                            className="grid grid-cols-3 gap-1 px-4 py-1 sm:py-2 text-sm sm:text-sm transition-all duration-150 ease-in-out hover:bg-zinc-900 hover:cursor-pointer hover:text-black"
                                        >
                                            <div className="font-mono my-auto text-orange-100 tracking-wide">
                                                {convertServiceTimeToClockTime(
                                                    dep.departure_time
                                                )}
                                            </div>
                                            <div className="col-span-2 truncate font-normal uppercase text-orange-100 tracking-wide">
                                                {dep.stop_headsign}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="px-0 sm:px-0">
                    {lastUpdated && (
                        <div className="flex justify-between items-center  text-orange-100/90 rounded-b-xs border-2 border-neutral-700 border-t-0 bg-neutral-900">
                            <span className="text-xs sm:text-sm w-full text-center sm:text-left sm:px-4 uppercase font-semibold">
                                <span className="font-normal text-orange-100/70">
                                    Updated at{' '}
                                </span>
                                {lastUpdated.toLocaleTimeString()}{' '}
                            </span>
                            <button
                                onClick={getUserLocationAndFetch}
                                className="border-l-0 border-neutral-700 flex text-xs items-center px-4 gap-x-3 py-2 sm:py-3 uppercase tracking-wide sm:text-base   text-orange-300 bg-neutral-800  hover:bg-orange-500 hover:cursor-pointer hover:text-black transition"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="size-4 sm:size-5 "
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                                    />
                                </svg>
                                <span className="text-amber-200">Refresh</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
