import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Hammer, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { parseJwt } from '../../utils/auth';

// Validation
const workLogSchema = z.object({
  JobNumber: z.string().min(1, 'Job Number is required'),
  SubStatus: z.string().min(1, 'Status is required'),
  WorkDescription: z.string().optional(),
  StartTime: z.string().optional(),
  EndTime: z.string().optional(),
});

const WorkLogs = () => {
  const [activeTab, setActiveTab] = useState('logs'); // logs, attendance
  const [logs, setLogs] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('token');

  const user = parseJwt(token);
  const workerId = user?.WorkerId;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(workLogSchema)
  });

  const fetchData = async () => {
      if (!workerId) return;
      setLoading(true);
      try {
          // Fetch Work Logs
          const resLogs = await fetch(`${apiUrl}/worklogs`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          const dataLogs = await resLogs.json();
          // Filter strictly for this worker if backend returns all
          setLogs(dataLogs.data ? dataLogs.data.filter(l => l.AssignedWorker === workerId) : []);

          // Fetch Attendance
          const resAtt = await fetch(`${apiUrl}/attendance?workerId=${workerId}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          const dataAtt = await resAtt.json();
          setAttendance(Array.isArray(dataAtt) ? dataAtt : []);

      } catch (err) {
          toast.error(err.message);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchData();
  }, [workerId]);

  const onSubmitLog = async (data) => {
      try {
          const payload = {
              ...data,
              AssignedWorker: workerId,
              WorkerName: user.Username // Approximate
          };
          const res = await fetch(`${apiUrl}/worklogs`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error('Failed to add log');
          toast.success('Work log added');
          setIsLogModalOpen(false);
          reset();
          fetchData();
      } catch (err) {
          toast.error(err.message);
      }
  };

  const markAttendance = async (status) => {
      try {
          const payload = {
              WorkerId: workerId,
              AttendanceDate: new Date().toISOString().split('T')[0],
              Status: status,
              CheckInTime: status === 'Present' ? new Date().toLocaleTimeString() : null
          };
          const res = await fetch(`${apiUrl}/attendance`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error('Failed to mark attendance');
          toast.success(`Marked as ${status}`);
          fetchData();
      } catch (err) {
          toast.error(err.message);
      }
  };

  if (!workerId) return (
      <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-red-200 dark:border-red-900/30">
          <h2 className="text-lg font-bold text-red-600 mb-2">Access Restricted</h2>
          <p className="text-slate-600 dark:text-slate-400">No Worker Profile is linked to your account.</p>
      </div>
  );

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Hammer className="text-blue-600" />
                    Work Center
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Track your daily tasks and attendance.</p>
            </div>

            <div className="flex gap-2">
                {activeTab === 'logs' && (
                    <Button onClick={() => setIsLogModalOpen(true)} className="flex items-center gap-2">
                        <Plus size={18} /> Log Work
                    </Button>
                )}
                {activeTab === 'attendance' && (
                    <>
                        <Button onClick={() => markAttendance('Present')} className="bg-green-600 hover:bg-green-700">Check In</Button>
                        <Button onClick={() => markAttendance('Absent')} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Absent</Button>
                    </>
                )}
            </div>
       </div>

       {/* Tabs */}
       <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="-mb-px flex space-x-8">
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`${activeTab === 'logs' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                    Job Logs
                </button>
                <button
                    onClick={() => setActiveTab('attendance')}
                    className={`${activeTab === 'attendance' ? 'border-purple-500 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                    Attendance
                </button>
            </nav>
       </div>

       {loading ? (
           <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-slate-400" /></div>
       ) : (
           <>
               {activeTab === 'logs' && (
                   <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                       <table className="w-full text-left text-sm">
                           <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 uppercase text-xs">
                               <tr>
                                   <th className="p-4">Job #</th>
                                   <th className="p-4">Action</th>
                                   <th className="p-4">Description</th>
                                   <th className="p-4">Time</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                               {logs.length === 0 ? (
                                   <tr><td colSpan="4" className="p-8 text-center text-slate-500">No logs found.</td></tr>
                               ) : (
                                   logs.map((log) => (
                                       <tr key={log.WorkLogId} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                           <td className="p-4 font-medium text-slate-900 dark:text-white">{log.JobNumber}</td>
                                           <td className="p-4"><span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">{log.SubStatus}</span></td>
                                           <td className="p-4 text-slate-600 dark:text-slate-300">{log.WorkDescription || '-'}</td>
                                           <td className="p-4 text-slate-500 text-xs">
                                               {new Date(log.StartTime || log.CreatedAt).toLocaleString()}
                                           </td>
                                       </tr>
                                   ))
                               )}
                           </tbody>
                       </table>
                   </div>
               )}

               {activeTab === 'attendance' && (
                   <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                       <table className="w-full text-left text-sm">
                           <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 uppercase text-xs">
                               <tr>
                                   <th className="p-4">Date</th>
                                   <th className="p-4">Status</th>
                                   <th className="p-4">Check In</th>
                                   <th className="p-4">Check Out</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                               {attendance.length === 0 ? (
                                   <tr><td colSpan="4" className="p-8 text-center text-slate-500">No attendance records.</td></tr>
                               ) : (
                                   attendance.map((att) => (
                                       <tr key={att.AttendanceId} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                           <td className="p-4 font-medium text-slate-900 dark:text-white">{new Date(att.AttendanceDate).toLocaleDateString()}</td>
                                           <td className="p-4">
                                               <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                   att.Status === 'Present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                   att.Status === 'Absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-yellow-100 text-yellow-700'
                                               }`}>
                                                   {att.Status}
                                               </span>
                                           </td>
                                           <td className="p-4 text-slate-600 dark:text-slate-300">{att.CheckInTime || '-'}</td>
                                           <td className="p-4 text-slate-600 dark:text-slate-300">{att.CheckOutTime || '-'}</td>
                                       </tr>
                                   ))
                               )}
                           </tbody>
                       </table>
                   </div>
               )}
           </>
       )}

       <Modal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} title="Log Work">
           <form onSubmit={handleSubmit(onSubmitLog)} className="space-y-4">
               <Input label="Job Number *" {...register('JobNumber')} error={errors.JobNumber?.message} />
               <Input label="Status / Action *" {...register('SubStatus')} placeholder="e.g. Disassembly, Cleaning, Winding" error={errors.SubStatus?.message} />
               <Input label="Description" {...register('WorkDescription')} />
               <div className="grid grid-cols-2 gap-4">
                   <Input label="Start Time" type="datetime-local" {...register('StartTime')} />
                   <Input label="End Time" type="datetime-local" {...register('EndTime')} />
               </div>
               <div className="flex justify-end gap-2 pt-4">
                   <Button variant="outline" onClick={() => setIsLogModalOpen(false)}>Cancel</Button>
                   <Button type="submit">Save Log</Button>
               </div>
           </form>
       </Modal>
    </div>
  );
};

export default WorkLogs;
