import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2, CheckCircle, XCircle, Clock, Plane, FileText, Save, Coffee, Gift, Table, FileSpreadsheet, UserCheck, ChevronDown, ChevronUp, Download, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

const Attendance = () => {
    const [workers, setWorkers] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    // View state: 'grid' | 'report' | 'history'
    const [viewMode, setViewMode] = useState('grid');

    // Report View states
    const [expandedWorkerId, setExpandedWorkerId] = useState(null);

    // Worker History View states
    const [selectedWorkerId, setSelectedWorkerId] = useState('');

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

            if (workersList.length > 0 && !selectedWorkerId) {
                setSelectedWorkerId(workersList[0].WorkerId.toString());
            }

            // Fetch attendance for this month
            const pad = (n) => n.toString().padStart(2, '0');
            const startDate = `${year}-${pad(month + 1)}-01`;
            const endDate = `${year}-${pad(month + 1)}-${pad(daysInMonth)}`;

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

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCell, setSelectedCell] = useState(null); // { worker, day, targetDate }
    const [formData, setFormData] = useState({ Status: 'Present', CheckInTime: '', CheckOutTime: '', Notes: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Find a specific record in loaded state
    const getAttendanceRecord = (workerId, day) => {
        const pad = (n) => n.toString().padStart(2, '0');
        const targetDate = `${year}-${pad(month + 1)}-${pad(day)}`;
        return attendanceData.find(a =>
            a.WorkerId === workerId &&
            a.AttendanceDate &&
            a.AttendanceDate.startsWith(targetDate)
        );
    };

    const handleCellClick = (worker, day, record) => {
        const pad = (n) => n.toString().padStart(2, '0');
        const targetDate = `${year}-${pad(month + 1)}-${pad(day)}`;
        const isSunday = new Date(year, month, day).getDay() === 0;

        setSelectedCell({ worker, day, targetDate });
        setFormData({
            Status: record?.Status || (isSunday ? 'Week off' : 'Present'),
            CheckInTime: record?.CheckInTime || '',
            CheckOutTime: record?.CheckOutTime || '',
            Notes: record?.Notes || ''
        });
        setIsModalOpen(true);
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { worker, targetDate } = selectedCell;

        try {
            const res = await fetch(`${apiUrl}/attendance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    WorkerId: worker.WorkerId,
                    AttendanceDate: targetDate,
                    Status: formData.Status,
                    CheckInTime: formData.CheckInTime,
                    CheckOutTime: formData.CheckOutTime,
                    Notes: formData.Notes
                })
            });
            if (!res.ok) throw new Error('Failed to update attendance');
            toast.success(`Attendance updated`);
            setIsModalOpen(false);
            fetchData(); // Refresh grid
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Present': return <CheckCircle size={18} className="text-green-500" />;
            case 'Absent': return <XCircle size={18} className="text-red-500" />;
            case 'Half Day': return <Clock size={18} className="text-yellow-500" />;
            case 'Field Work': return <Plane size={18} className="text-blue-500" />;
            case 'On Leave': return <FileText size={18} className="text-purple-500" />;
            case 'Week off': return <Coffee size={18} className="text-slate-500" />;
            case 'Holiday': return <Gift size={18} className="text-pink-500" />;
            default: return <div className="w-[18px] h-[18px] rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />;
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'Present':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle size={12}/> Present</span>;
            case 'Absent':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"><XCircle size={12}/> Absent</span>;
            case 'Half Day':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"><Clock size={12}/> Half Day</span>;
            case 'Field Work':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"><Plane size={12}/> Field Work</span>;
            case 'On Leave':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"><FileText size={12}/> On Leave</span>;
            case 'Week off':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"><Coffee size={12}/> Week off</span>;
            case 'Holiday':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400"><Gift size={12}/> Holiday</span>;
            default:
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Unmarked</span>;
        }
    };

    // Calculate worker monthly statistics
    const getWorkerStats = (workerId) => {
        let presentCount = 0;
        let absentCount = 0;
        let halfDayCount = 0;
        let fieldWorkCount = 0;
        let onLeaveCount = 0;
        let weekOffCount = 0;
        let holidayCount = 0;

        daysArray.forEach(day => {
            const record = getAttendanceRecord(workerId, day);
            const isSunday = new Date(year, month, day).getDay() === 0;
            const status = record?.Status || (isSunday ? 'Week off' : null);

            switch(status) {
                case 'Present': presentCount++; break;
                case 'Absent': absentCount++; break;
                case 'Half Day': halfDayCount++; break;
                case 'Field Work': fieldWorkCount++; break;
                case 'On Leave': onLeaveCount++; break;
                case 'Week off': weekOffCount++; break;
                case 'Holiday': holidayCount++; break;
                default: break;
            }
        });

        // Days Present formula: Present + Field Work + (0.5 * Half Day)
        const totalEffectivePresent = presentCount + fieldWorkCount + (halfDayCount * 0.5);

        // Working days exclude Week Offs and Holidays
        const totalNonWorkingDays = weekOffCount + holidayCount;
        const totalWorkingDays = daysInMonth - totalNonWorkingDays;

        const attendanceRate = totalWorkingDays > 0
            ? Math.round((totalEffectivePresent / totalWorkingDays) * 1000) / 10
            : 0;

        return {
            presentCount,
            absentCount,
            halfDayCount,
            fieldWorkCount,
            onLeaveCount,
            weekOffCount,
            holidayCount,
            totalEffectivePresent,
            totalWorkingDays,
            attendanceRate
        };
    };

    // Helper to compute working hours between CheckInTime and CheckOutTime
    const calculateHours = (inTime, outTime) => {
        if (!inTime || !outTime) return '-';
        const [inH, inM] = inTime.split(':').map(Number);
        const [outH, outM] = outTime.split(':').map(Number);
        let diffMinutes = (outH * 60 + outM) - (inH * 60 + inM);
        if (diffMinutes < 0) diffMinutes += 24 * 60; // crossover midnight
        const hrs = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        return `${hrs}h ${mins}m`;
    };

    // CSV Exporters
    const exportSummaryCSV = () => {
        const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        let csvContent = `Attendance Report Summary - ${monthName}\n`;
        csvContent += `Worker Name,Days Present (inc FW & HD),Field Work Days,Half Days,On Leave Days,Absent Days,Week Offs & Holidays,Attendance Rate (%)\n`;

        workers.forEach(worker => {
            const stats = getWorkerStats(worker.WorkerId);
            const line = [
                `"${worker.WorkerName}"`,
                stats.totalEffectivePresent,
                stats.fieldWorkCount,
                stats.halfDayCount,
                stats.onLeaveCount,
                stats.absentCount,
                stats.weekOffCount + stats.holidayCount,
                `${stats.attendanceRate}%`
            ].join(',');
            csvContent += line + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Attendance_Summary_${year}_${month + 1}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportDetailedLogCSV = () => {
        const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        let csvContent = `Detailed Attendance Log - ${monthName}\n`;
        csvContent += `Worker Name,Date,Day,Status,Check-In Time,Check-Out Time,Working Hours,Notes\n`;

        workers.forEach(worker => {
            daysArray.forEach(day => {
                const pad = (n) => n.toString().padStart(2, '0');
                const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
                const record = getAttendanceRecord(worker.WorkerId, day);
                const dateObj = new Date(year, month, day);
                const dayName = dateObj.toLocaleDateString('default', { weekday: 'short' });
                const isSunday = dateObj.getDay() === 0;
                const status = record?.Status || (isSunday ? 'Week off' : 'Unmarked');

                const line = [
                    `"${worker.WorkerName}"`,
                    dateStr,
                    dayName,
                    `"${status}"`,
                    `"${record?.CheckInTime || '-'}"`,
                    `"${record?.CheckOutTime || '-'}"`,
                    `"${calculateHours(record?.CheckInTime, record?.CheckOutTime)}"`,
                    `"${(record?.Notes || '').replace(/"/g, '""')}"`
                ].join(',');
                csvContent += line + '\n';
            });
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Detailed_Attendance_Log_${year}_${month + 1}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportWorkerLogCSV = (worker) => {
        if (!worker) return;
        const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        let csvContent = `Attendance Log - ${worker.WorkerName} - ${monthName}\n`;
        csvContent += `Date,Day,Status,Check-In Time,Check-Out Time,Working Hours,Notes\n`;

        daysArray.forEach(day => {
            const pad = (n) => n.toString().padStart(2, '0');
            const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
            const record = getAttendanceRecord(worker.WorkerId, day);
            const dateObj = new Date(year, month, day);
            const dayName = dateObj.toLocaleDateString('default', { weekday: 'short' });
            const isSunday = dateObj.getDay() === 0;
            const status = record?.Status || (isSunday ? 'Week off' : 'Unmarked');

            const line = [
                dateStr,
                dayName,
                `"${status}"`,
                `"${record?.CheckInTime || '-'}"`,
                `"${record?.CheckOutTime || '-'}"`,
                `"${calculateHours(record?.CheckInTime, record?.CheckOutTime)}"`,
                `"${(record?.Notes || '').replace(/"/g, '""')}"`
            ].join(',');
            csvContent += line + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Attendance_${worker.WorkerName.replace(/\s+/g, '_')}_${year}_${month + 1}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const activeWorker = workers.find(w => w.WorkerId.toString() === selectedWorkerId) || workers[0];
    const activeWorkerStats = activeWorker ? getWorkerStats(activeWorker.WorkerId) : null;

    return (
        <>
        <div className="space-y-6">
            {/* Header & Date controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <CalendarIcon className="text-emerald-600" />
                        Staff Attendance
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Monthly employee check-ins, reports, and attendance records.</p>
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

            {/* View Mode Switcher Tabs */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 w-fit">
                <button
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        viewMode === 'grid'
                            ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                    <Table size={16} />
                    Grid View (Normal)
                </button>
                <button
                    onClick={() => setViewMode('report')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        viewMode === 'report'
                            ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                    <FileSpreadsheet size={16} />
                    Report View
                </button>
                <button
                    onClick={() => setViewMode('history')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        viewMode === 'history'
                            ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                    <UserCheck size={16} />
                    Worker History View
                </button>
            </div>

            {/* View 1: Grid View (Normal) */}
            {viewMode === 'grid' && (
                <>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-500" /> Present</div>
                        <div className="flex items-center gap-1.5"><XCircle size={14} className="text-red-500" /> Absent</div>
                        <div className="flex items-center gap-1.5"><Clock size={14} className="text-yellow-500" /> Half Day</div>
                        <div className="flex items-center gap-1.5"><Plane size={14} className="text-blue-500" /> Field Work</div>
                        <div className="flex items-center gap-1.5"><FileText size={14} className="text-purple-500" /> On Leave</div>
                        <div className="flex items-center gap-1.5"><Coffee size={14} className="text-slate-500" /> Week off</div>
                        <div className="flex items-center gap-1.5"><Gift size={14} className="text-pink-500" /> Holiday</div>
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
                                                        const record = getAttendanceRecord(worker.WorkerId, day);
                                                        const isSunday = new Date(year, month, day).getDay() === 0;
                                                        const status = record?.Status || (isSunday ? 'Week off' : null);

                                                        let tooltip = `${worker.WorkerName} - ${new Date(year, month, day).toLocaleDateString()}`;
                                                        if (status) tooltip += `\nStatus: ${status}`;
                                                        if (record?.CheckInTime) tooltip += `\nIn: ${record.CheckInTime}`;
                                                        if (record?.CheckOutTime) tooltip += `\nOut: ${record.CheckOutTime}`;

                                                        return (
                                                            <td key={day} className="p-1 text-center border-l border-slate-50 dark:border-slate-800/50">
                                                                <button
                                                                    onClick={() => handleCellClick(worker, day, record)}
                                                                    className="w-full h-full flex flex-col items-center justify-center p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer relative group"
                                                                    title={tooltip}
                                                                >
                                                                    {getStatusIcon(status)}
                                                                    {(record?.CheckInTime || record?.CheckOutTime) && (
                                                                        <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                                                    )}
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
                </>
            )}

            {/* View 2: Report View */}
            {viewMode === 'report' && (
                <div className="space-y-4">
                    {/* Action Bar */}
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" onClick={exportSummaryCSV} className="w-auto flex items-center justify-center gap-2 text-xs">
                            <Download size={14} /> Export Summary CSV
                        </Button>
                        <Button variant="outline" onClick={exportDetailedLogCSV} className="w-auto flex items-center justify-center gap-2 text-xs">
                            <Download size={14} /> Export Detailed Log CSV
                        </Button>
                    </div>

                    {/* Report Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        {loading ? (
                            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
                        ) : (
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                                            <th className="p-4 w-12"></th>
                                            <th className="p-4 font-semibold">Employee Name</th>
                                            <th className="p-4 font-semibold text-center bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400">
                                                Days Present <span className="text-[10px] lowercase text-emerald-600 font-normal">(inc. field work)</span>
                                            </th>
                                            <th className="p-4 font-semibold text-center">Field Work Days</th>
                                            <th className="p-4 font-semibold text-center">Half Days</th>
                                            <th className="p-4 font-semibold text-center">On Leave Days</th>
                                            <th className="p-4 font-semibold text-center">Absent Days</th>
                                            <th className="p-4 font-semibold text-center">Week Offs & Holidays</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {workers.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="p-8 text-center text-slate-500">No workers found.</td>
                                            </tr>
                                        ) : (
                                            workers.map(worker => {
                                                const stats = getWorkerStats(worker.WorkerId);
                                                const isExpanded = expandedWorkerId === worker.WorkerId;

                                                return (
                                                    <React.Fragment key={worker.WorkerId}>
                                                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                            <td className="p-4 text-center">
                                                                <button
                                                                    onClick={() => setExpandedWorkerId(isExpanded ? null : worker.WorkerId)}
                                                                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-500"
                                                                    title="Toggle daily check-in log"
                                                                >
                                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                                </button>
                                                            </td>
                                                            <td className="p-4 font-medium text-slate-900 dark:text-white">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                                                        {worker.WorkerName.charAt(0)}
                                                                    </div>
                                                                    {worker.WorkerName}
                                                                </div>
                                                            </td>
                                                            <td className="p-4 text-center font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/10">
                                                                {stats.totalEffectivePresent}
                                                            </td>
                                                            <td className="p-4 text-center text-blue-600 dark:text-blue-400 font-medium">
                                                                {stats.fieldWorkCount}
                                                            </td>
                                                            <td className="p-4 text-center text-amber-600 dark:text-amber-400 font-medium">
                                                                {stats.halfDayCount}
                                                            </td>
                                                            <td className="p-4 text-center text-purple-600 dark:text-purple-400 font-medium">
                                                                {stats.onLeaveCount}
                                                            </td>
                                                            <td className="p-4 text-center text-red-600 dark:text-red-400 font-medium">
                                                                {stats.absentCount}
                                                            </td>
                                                            <td className="p-4 text-center text-slate-500">
                                                                {stats.weekOffCount + stats.holidayCount}
                                                            </td>
                                                        </tr>

                                                        {/* Expanded Daily Details */}
                                                        {isExpanded && (
                                                            <tr className="bg-slate-50/70 dark:bg-slate-900/40">
                                                                <td colSpan={8} className="p-4 border-t border-b border-slate-200 dark:border-slate-700">
                                                                    <div className="space-y-3">
                                                                        <div className="flex justify-between items-center px-2">
                                                                            <h4 className="font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                                                                Daily Check-In/Out Log - {worker.WorkerName}
                                                                            </h4>
                                                                            <span className="text-xs text-slate-500">
                                                                                Showing {daysInMonth} days for {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                                                            </span>
                                                                        </div>
                                                                        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                                                                            <table className="w-full text-left text-xs">
                                                                                <thead>
                                                                                    <tr className="bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                                                                                        <th className="p-2.5">Date</th>
                                                                                        <th className="p-2.5">Day</th>
                                                                                        <th className="p-2.5">Status</th>
                                                                                        <th className="p-2.5">Check-In</th>
                                                                                        <th className="p-2.5">Check-Out</th>
                                                                                        <th className="p-2.5">Working Hours</th>
                                                                                        <th className="p-2.5">Notes</th>
                                                                                        <th className="p-2.5 text-right">Action</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                                                                    {daysArray.map(day => {
                                                                                        const pad = (n) => n.toString().padStart(2, '0');
                                                                                        const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
                                                                                        const record = getAttendanceRecord(worker.WorkerId, day);
                                                                                        const dateObj = new Date(year, month, day);
                                                                                        const dayName = dateObj.toLocaleDateString('default', { weekday: 'short' });
                                                                                        const isSunday = dateObj.getDay() === 0;
                                                                                        const status = record?.Status || (isSunday ? 'Week off' : null);

                                                                                        return (
                                                                                            <tr key={day} className="hover:bg-slate-50 dark:hover:bg-slate-700/20">
                                                                                                <td className="p-2.5 font-mono text-slate-700 dark:text-slate-300">{dateStr}</td>
                                                                                                <td className="p-2.5 text-slate-500">{dayName}</td>
                                                                                                <td className="p-2.5">{getStatusBadge(status)}</td>
                                                                                                <td className="p-2.5 font-mono text-slate-700 dark:text-slate-300">{record?.CheckInTime || '-'}</td>
                                                                                                <td className="p-2.5 font-mono text-slate-700 dark:text-slate-300">{record?.CheckOutTime || '-'}</td>
                                                                                                <td className="p-2.5 font-mono text-slate-600 dark:text-slate-400">
                                                                                                    {calculateHours(record?.CheckInTime, record?.CheckOutTime)}
                                                                                                </td>
                                                                                                <td className="p-2.5 text-slate-500 max-w-[200px] truncate">{record?.Notes || '-'}</td>
                                                                                                <td className="p-2.5 text-right">
                                                                                                    <button
                                                                                                        onClick={() => handleCellClick(worker, day, record)}
                                                                                                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"
                                                                                                        title="Edit record"
                                                                                                    >
                                                                                                        <Edit2 size={14} />
                                                                                                    </button>
                                                                                                </td>
                                                                                            </tr>
                                                                                        );
                                                                                    })}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* View 3: Worker History View */}
            {viewMode === 'history' && (
                <div className="space-y-6">
                    {/* Worker Selector Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Select Employee:
                            </label>
                            <select
                                value={selectedWorkerId}
                                onChange={(e) => setSelectedWorkerId(e.target.value)}
                                className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-900 dark:text-white"
                            >
                                {workers.map(w => (
                                    <option key={w.WorkerId} value={w.WorkerId}>{w.WorkerName}</option>
                                ))}
                            </select>
                        </div>

                        {activeWorker && (
                            <Button variant="outline" onClick={() => exportWorkerLogCSV(activeWorker)} className="w-auto flex items-center justify-center gap-2 text-xs">
                                <Download size={14} /> Export Worker Log CSV
                            </Button>
                        )}
                    </div>

                    {activeWorker && activeWorkerStats && (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-1">
                                    <div className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Attendance Rate</div>
                                    <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                        {activeWorkerStats.attendanceRate}%
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        {activeWorkerStats.totalEffectivePresent} / {activeWorkerStats.totalWorkingDays} working days
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-1">
                                    <div className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Days Present</div>
                                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                                        {activeWorkerStats.totalEffectivePresent}
                                    </div>
                                    <div className="text-xs text-slate-400">Standard office/workshop check-ins</div>
                                </div>

                                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-1">
                                    <div className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Field Work & Half Days</div>
                                    <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 flex items-baseline gap-2">
                                        {activeWorkerStats.fieldWorkCount} <span className="text-xs font-medium text-amber-500">({activeWorkerStats.halfDayCount} HD)</span>
                                    </div>
                                    <div className="text-xs text-slate-400">On-site assignments & half shifts</div>
                                </div>

                                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-1">
                                    <div className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Absences & Leaves</div>
                                    <div className="text-3xl font-extrabold text-red-600 dark:text-red-400 flex items-baseline gap-2">
                                        {activeWorkerStats.absentCount} <span className="text-xs font-medium text-purple-500">({activeWorkerStats.onLeaveCount} Leave)</span>
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        {activeWorkerStats.weekOffCount + activeWorkerStats.holidayCount} Week offs & Holidays
                                    </div>
                                </div>
                            </div>

                            {/* Activity Log Table */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden space-y-4 p-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-slate-900 dark:text-white text-base flex items-center gap-2">
                                        <CalendarIcon size={18} className="text-emerald-600" />
                                        Monthly Activity Log - {activeWorker.WorkerName}
                                    </h3>
                                    <span className="text-xs text-slate-500">
                                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    </span>
                                </div>

                                <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-700">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                                                <th className="p-3">Date</th>
                                                <th className="p-3">Day</th>
                                                <th className="p-3">Status</th>
                                                <th className="p-3">Check-In Time</th>
                                                <th className="p-3">Check-Out Time</th>
                                                <th className="p-3">Working Hours</th>
                                                <th className="p-3">Notes</th>
                                                <th className="p-3 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {daysArray.map(day => {
                                                const pad = (n) => n.toString().padStart(2, '0');
                                                const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
                                                const record = getAttendanceRecord(activeWorker.WorkerId, day);
                                                const dateObj = new Date(year, month, day);
                                                const dayName = dateObj.toLocaleDateString('default', { weekday: 'long' });
                                                const isSunday = dateObj.getDay() === 0;
                                                const status = record?.Status || (isSunday ? 'Week off' : null);

                                                return (
                                                    <tr key={day} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                        <td className="p-3 font-mono font-medium text-slate-900 dark:text-white">{dateStr}</td>
                                                        <td className="p-3 text-slate-500">{dayName}</td>
                                                        <td className="p-3">{getStatusBadge(status)}</td>
                                                        <td className="p-3 font-mono text-slate-700 dark:text-slate-300">{record?.CheckInTime || '-'}</td>
                                                        <td className="p-3 font-mono text-slate-700 dark:text-slate-300">{record?.CheckOutTime || '-'}</td>
                                                        <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                                                            {calculateHours(record?.CheckInTime, record?.CheckOutTime)}
                                                        </td>
                                                        <td className="p-3 text-slate-500 max-w-[200px] truncate">{record?.Notes || '-'}</td>
                                                        <td className="p-3 text-right">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleCellClick(activeWorker, day, record)}
                                                                className="w-auto py-1 px-3 text-xs inline-flex items-center justify-center"
                                                            >
                                                                <Edit2 size={12} className="mr-1" /> Edit
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>

        {/* Detail/Edit Modal */}
        <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={`Attendance for ${selectedCell?.worker?.WorkerName}`}
        >
            <div className="text-sm text-slate-500 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                Date: {selectedCell && new Date(year, month, selectedCell.day).toLocaleDateString()}
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Status</label>
                    <select
                        value={formData.Status}
                        onChange={(e) => setFormData({...formData, Status: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                    >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Half Day">Half Day</option>
                        <option value="Field Work">Field Work</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Week off">Week off</option>
                        <option value="Holiday">Holiday</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Check-in Time"
                        type="time"
                        value={formData.CheckInTime}
                        onChange={(e) => setFormData({...formData, CheckInTime: e.target.value})}
                    />
                    <Input
                        label="Check-out Time"
                        type="time"
                        value={formData.CheckOutTime}
                        onChange={(e) => setFormData({...formData, CheckOutTime: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Notes</label>
                    <Input
                        type="text"
                        placeholder="Optional notes or reasons"
                        value={formData.Notes}
                        onChange={(e) => setFormData({...formData, Notes: e.target.value})}
                    />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="w-auto">Cancel</Button>
                    <Button type="submit" disabled={isSubmitting} className="w-auto flex items-center justify-center gap-2">
                        {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                        Save Attendance
                    </Button>
                </div>
            </form>
        </Modal>
        </>
    );
};

export default Attendance;
