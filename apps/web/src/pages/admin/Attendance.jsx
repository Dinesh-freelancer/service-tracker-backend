import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2, CheckCircle, XCircle, Clock, Plane, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';

const Attendance = () => {
    const [workers, setWorkers] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    const apiUrl = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('token');

    // Calendar logic
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    useEffect(() => {
        fetchData();
    }, [year, month]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch all workers
            const workersRes = await fetch(`${apiUrl}/workers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!workersRes.ok) throw new Error('Failed to fetch workers');
            const workersList = await workersRes.json();
            setWorkers(workersList);

            // Fetch attendance for this month
            const startDate = new Date(year, month, 1).toISOString().split('T')[0];
            const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

            const attRes = await fetch(`${apiUrl}/attendance?dateFrom=${startDate}&dateTo=${endDate}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!attRes.ok) throw new Error('Failed to fetch attendance');
            const attData = await attRes.json();
            setAttendanceData(attData);

        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    // Find a specific record in our loaded state
    const getAttendanceStatus = (workerId, day) => {
        // Date format: YYYY-MM-DD
        const targetDate = new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];

        // Find matching record
        // The API returns UTC dates, we need to match the YYYY-MM-DD prefix.
        const record = attendanceData.find(a =>
            a.WorkerId === workerId &&
            a.AttendanceDate &&
            a.AttendanceDate.startsWith(targetDate)
        );

        return record ? record.Status : null;
    };

    const cycleStatus = async (workerId, day, currentStatus) => {
        const statuses = ['Present', 'Absent', 'Half Day', 'Field Work', 'On Leave'];
        let nextStatusIndex = 0;

        if (currentStatus) {
            const currentIndex = statuses.indexOf(currentStatus);
            nextStatusIndex = (currentIndex + 1) % statuses.length;
        }

        const newStatus = statuses[nextStatusIndex];
        const targetDate = new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];

        // Optimistic UI Update
        const newRecord = { WorkerId: workerId, AttendanceDate: targetDate, Status: newStatus };

        setAttendanceData(prev => {
            const filtered = prev.filter(a => !(a.WorkerId === workerId && a.AttendanceDate.startsWith(targetDate)));
            return [...filtered, newRecord];
        });

        try {
            const res = await fetch(`${apiUrl}/attendance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    WorkerId: workerId,
                    AttendanceDate: targetDate,
                    Status: newStatus
                })
            });
            if (!res.ok) throw new Error('Failed to update status');
            toast.success(`Marked as ${newStatus}`);
        } catch (err) {
            toast.error(err.message);
            // Revert on failure (reload data)
            fetchData();
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Present': return <CheckCircle size={18} className="text-green-500" />;
            case 'Absent': return <XCircle size={18} className="text-red-500" />;
            case 'Half Day': return <Clock size={18} className="text-yellow-500" />;
            case 'Field Work': return <Plane size={18} className="text-blue-500" />;
            case 'On Leave': return <FileText size={18} className="text-purple-500" />;
            default: return <div className="w-[18px] h-[18px] rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <CalendarIcon className="text-emerald-600" />
                        Staff Attendance
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Monthly overview of employee check-ins.</p>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <button onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors text-slate-600 dark:text-slate-300">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="font-semibold text-slate-900 dark:text-white min-w-[120px] text-center">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </div>
                    <button onClick={handleNextMonth} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors text-slate-600 dark:text-slate-300">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-500" /> Present</div>
                <div className="flex items-center gap-1.5"><XCircle size={14} className="text-red-500" /> Absent</div>
                <div className="flex items-center gap-1.5"><Clock size={14} className="text-yellow-500" /> Half Day</div>
                <div className="flex items-center gap-1.5"><Plane size={14} className="text-blue-500" /> Field Work</div>
                <div className="flex items-center gap-1.5"><FileText size={14} className="text-purple-500" /> On Leave</div>
                <div className="text-slate-400 ml-auto italic">Click a cell to override status.</div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs">
                                    <th className="p-4 font-semibold sticky left-0 z-10 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 min-w-[150px]">
                                        Worker
                                    </th>
                                    {daysArray.map(day => (
                                        <th key={day} className="p-2 text-center font-medium min-w-[40px] border-b border-slate-200 dark:border-slate-700">
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                                {workers.length === 0 ? (
                                    <tr>
                                        <td colSpan={daysInMonth + 1} className="p-8 text-center text-slate-500">No workers found.</td>
                                    </tr>
                                ) : (
                                    workers.map(worker => (
                                        <tr key={worker.WorkerId} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="p-4 font-medium text-slate-900 dark:text-white sticky left-0 z-10 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 group-hover:bg-slate-50 dark:group-hover:bg-slate-700/30">
                                                {worker.WorkerName}
                                            </td>
                                            {daysArray.map(day => {
                                                const status = getAttendanceStatus(worker.WorkerId, day);
                                                return (
                                                    <td key={day} className="p-1 text-center border-l border-slate-50 dark:border-slate-800/50">
                                                        <button
                                                            onClick={() => cycleStatus(worker.WorkerId, day, status)}
                                                            className="w-full h-full flex items-center justify-center p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                                            title={`${worker.WorkerName} - ${new Date(year, month, day).toLocaleDateString()} ${status ? `(${status})` : ''}`}
                                                        >
                                                            {getStatusIcon(status)}
                                                        </button>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Attendance;
