import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2, CheckCircle, XCircle, Clock, Plane, FileText, Save, Coffee, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

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

            // Fetch attendance for this month (avoid timezone shifts by explicitly formatting locally)
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
    const [selectedCell, setSelectedCell] = useState(null); // { worker, day, record }
    const [formData, setFormData] = useState({ Status: 'Present', CheckInTime: '', CheckOutTime: '', Notes: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Find a specific record in our loaded state
    const getAttendanceRecord = (workerId, day) => {
        const targetDate = new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];
        return attendanceData.find(a =>
            a.WorkerId === workerId &&
            a.AttendanceDate &&
            a.AttendanceDate.startsWith(targetDate)
        );
    };

    const handleCellClick = (worker, day, record) => {
        const targetDate = new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];
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

    return (
        <>
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

                                                // Build tooltip string
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

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
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
