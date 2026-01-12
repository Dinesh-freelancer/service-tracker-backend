import React from 'react';
import { useForm } from 'react-hook-form';

const PickupForm = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [status, setStatus] = React.useState(null); // 'success', 'error', 'loading'

  const onSubmit = async (data) => {
    setStatus('loading');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/leads/pickup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setStatus('success');
        reset();
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
      <h3 className="text-2xl font-bold text-primary mb-4">Schedule a Pickup</h3>
      {status === 'success' && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Request sent successfully! We will contact you shortly.
        </div>
      )}
      {status === 'error' && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          Something went wrong. Please try again.
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            {...register('name', { required: 'Name is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
            placeholder="Your Name / Company"
          />
          {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            {...register('phone', { required: 'Phone is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
            placeholder="+91"
          />
          {errors.phone && <span className="text-red-500 text-sm">{errors.phone.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Pump Type</label>
          <select
             {...register('pumpType')}
             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
          >
            <option value="">Select Type</option>
            <option value="Borewell">Borewell Pump</option>
            <option value="Dewatering">Dewatering Pump</option>
            <option value="Sewage">Sewage Pump</option>
            <option value="Pressure">Pressure Pump</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Approx Weight (kg)</label>
          <input
            {...register('approxWeight')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
            placeholder="e.g. 50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            {...register('location', { required: 'Location is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
            placeholder="Area / Street"
          />
          {errors.location && <span className="text-red-500 text-sm">{errors.location.message}</span>}
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-primary text-white font-bold py-2 px-4 rounded hover:bg-opacity-90 transition-colors"
        >
          {status === 'loading' ? 'Sending...' : 'Request Pickup'}
        </button>
      </form>
    </div>
  );
};

export default PickupForm;
