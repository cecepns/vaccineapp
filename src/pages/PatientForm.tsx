import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Calendar, MapPin, User, Bookmark, Building } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface PatientFormData {
  name: string;
  address: string;
  birth_date: string;
  sex: string;
  nationality: string;
  national_id: string;
  doctor_name: string;
  vaccine_type: string;
  vaccine_date: string;
  valid_until: string;
  administration_location: string;
  vaccine_batch_number: string;
  disease_targeted: string;
  disease_date: string;
  manufacture_brand_batch: string;
  next_booster_date: string;
  official_stamp_signature: string;
}

const PatientForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { 
    register, 
    handleSubmit,
    reset,
    formState: { errors } 
  } = useForm<PatientFormData>();

  useEffect(() => {
    const fetchPatient = async () => {
      if (isEditMode) {
        try {
          setLoading(true);
          const response = await axios.get(`https://api-pickpoint.isavralabel.com/api/patients/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Format dates for the form
          const patient = response.data;
          patient.birth_date = patient.birth_date.split('T')[0];
          patient.vaccine_date = patient.vaccine_date.split('T')[0];
          patient.valid_until = patient.valid_until.split('T')[0];
          patient.disease_date = patient.disease_date.split('T')[0];
          patient.next_booster_date = patient.next_booster_date.split('T')[0];
          
          reset(patient);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching patient:', err);
          setError('Failed to load patient data');
          setLoading(false);
        }
      }
    };

    fetchPatient();
  }, [id, token, isEditMode, reset]);

  const onSubmit: SubmitHandler<PatientFormData> = async (data) => {
    try {
      setLoading(true);
      setError('');
      
      if (isEditMode) {
        await axios.put(`https://api-pickpoint.isavralabel.com/api/patients/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Patient updated successfully!');
      } else {
        await axios.post('https://api-pickpoint.isavralabel.com/api/patients', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Patient added successfully!');
        reset(); // Clear the form
      }
      
      // Redirect after a short delay to show the success message
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('Error saving patient:', err);
      setError('Failed to save patient data');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditMode ? 'Edit Patient' : 'Add New Patient'}
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  className={`pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 border p-2 ${
                    errors.name ? 'border-red-500' : ''
                  }`}
                  placeholder="John Doe"
                  {...register('name', { required: 'Full name is required' })}
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="address"
                  rows={3}
                  className={`pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 ${
                    errors.address ? 'border-red-500' : ''
                  }`}
                  placeholder="123 Main St, City, Country"
                  {...register('address', { required: 'Address is required' })}
                />
              </div>
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="birth_date"
                    className={`pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 border p-2 ${
                      errors.birth_date ? 'border-red-500' : ''
                    }`}
                    {...register('birth_date', { required: 'Date of birth is required' })}
                  />
                </div>
                {errors.birth_date && <p className="mt-1 text-sm text-red-600">{errors.birth_date.message}</p>}
              </div>

              <div>
                <label htmlFor="sex" className="block text-sm font-medium text-gray-700 mb-1">
                  Sex
                </label>
                <select
                  id="sex"
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 border p-2 ${errors.sex ? 'border-red-500' : ''}`}
                  {...register('sex', { required: 'Sex is required' })}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                {errors.sex && <p className="mt-1 text-sm text-red-600">{errors.sex.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-1">
                  Nationality
                </label>
                <input
                  type="text"
                  id="nationality"
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 border p-2 ${errors.nationality ? 'border-red-500' : ''}`}
                  placeholder="INDONESIA"
                  defaultValue="INDONESIA"
                  {...register('nationality', { required: 'Nationality is required' })}
                />
                {errors.nationality && <p className="mt-1 text-sm text-red-600">{errors.nationality.message}</p>}
              </div>
              <div>
                <label htmlFor="national_id" className="block text-sm font-medium text-gray-700 mb-1">
                  National Identification Document
                </label>
                <input
                  type="text"
                  id="national_id"
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 border p-2 ${errors.national_id ? 'border-red-500' : ''}`}
                  placeholder="e.g. KTP/Passport Number"
                  {...register('national_id', { required: 'National ID is required' })}
                />
                {errors.national_id && <p className="mt-1 text-sm text-red-600">{errors.national_id.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="doctor_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor Name
                </label>
                <input
                  type="text"
                  id="doctor_name"
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 border p-2 ${errors.doctor_name ? 'border-red-500' : ''}`}
                  placeholder="e.g. dr. Putri Balqis"
                  {...register('doctor_name', { required: 'Doctor name is required' })}
                />
                {errors.doctor_name && <p className="mt-1 text-sm text-red-600">{errors.doctor_name.message}</p>}
              </div>
              <div>
                <label htmlFor="vaccine_batch_number" className="block text-sm font-medium text-gray-700 mb-1">
                  Vaccine Batch Number
                </label>
                <input
                  type="text"
                  id="vaccine_batch_number"
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 border p-2 ${errors.vaccine_batch_number ? 'border-red-500' : ''}`}
                  placeholder="e.g. MERSI E3202403001"
                  {...register('vaccine_batch_number', { required: 'Vaccine batch number is required' })}
                />
                {errors.vaccine_batch_number && <p className="mt-1 text-sm text-red-600">{errors.vaccine_batch_number.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="vaccine_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Vaccine or Prophylaxis
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Bookmark className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="vaccine_type"
                    className={`pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 border p-2 ${
                      errors.vaccine_type ? 'border-red-500' : ''
                    }`}
                    placeholder="COVID-19 mRNA Vaccine"
                    {...register('vaccine_type', { required: 'Vaccine type is required' })}
                  />
                </div>
                {errors.vaccine_type && <p className="mt-1 text-sm text-red-600">{errors.vaccine_type.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="vaccine_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Vaccination Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="vaccine_date"
                    className={`pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 border p-2 ${
                      errors.vaccine_date ? 'border-red-500' : ''
                    }`}
                    {...register('vaccine_date', { required: 'Vaccination date is required' })}
                  />
                </div>
                {errors.vaccine_date && <p className="mt-1 text-sm text-red-600">{errors.vaccine_date.message}</p>}
              </div>

              <div>
                <label htmlFor="valid_until" className="block text-sm font-medium text-gray-700 mb-1">
                  Valid Until
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="valid_until"
                    className={`pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 border p-2 ${
                      errors.valid_until ? 'border-red-500' : ''
                    }`}
                    {...register('valid_until', { required: 'Valid until date is required' })}
                  />
                </div>
                {errors.valid_until && <p className="mt-1 text-sm text-red-600">{errors.valid_until.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="administration_location" className="block text-sm font-medium text-gray-700 mb-1">
                Administration Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="administration_location"
                  className={`pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 border p-2 ${
                    errors.administration_location ? 'border-red-500' : ''
                  }`}
                  placeholder="City Hospital"
                  {...register('administration_location', { required: 'Administration location is required' })}
                />
              </div>
              {errors.administration_location && (
                <p className="mt-1 text-sm text-red-600">{errors.administration_location.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="disease_targeted" className="block text-sm font-medium text-gray-700 mb-1">
                  Disease Targeted
                </label>
                <input
                  type="text"
                  id="disease_targeted"
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 border p-2 ${errors.disease_targeted ? 'border-red-500' : ''}`}
                  placeholder="e.g. COVID-19"
                  {...register('disease_targeted', { required: 'Disease targeted is required' })}
                />
                {errors.disease_targeted && <p className="mt-1 text-sm text-red-600">{errors.disease_targeted.message}</p>}
              </div>
              <div>
                <label htmlFor="disease_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Disease Date
                </label>
                <input
                  type="date"
                  id="disease_date"
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 border p-2 ${errors.disease_date ? 'border-red-500' : ''}`}
                  {...register('disease_date', { required: 'Disease date is required' })}
                />
                {errors.disease_date && <p className="mt-1 text-sm text-red-600">{errors.disease_date.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="manufacture_brand_batch" className="block text-sm font-medium text-gray-700 mb-1">
                  Manufacture, Brand Name and Batch No. of Vaccine
                </label>
                <input
                  type="text"
                  id="manufacture_brand_batch"
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 border p-2 ${errors.manufacture_brand_batch ? 'border-red-500' : ''}`}
                  placeholder="e.g. Pfizer, ABC123"
                  {...register('manufacture_brand_batch', { required: 'Manufacture, brand name and batch no. is required' })}
                />
                {errors.manufacture_brand_batch && <p className="mt-1 text-sm text-red-600">{errors.manufacture_brand_batch.message}</p>}
              </div>
              <div>
                <label htmlFor="next_booster_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Next Booster (date)
                </label>
                <input
                  type="date"
                  id="next_booster_date"
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 border p-2 ${errors.next_booster_date ? 'border-red-500' : ''}`}
                  {...register('next_booster_date', { required: 'Next booster date is required' })}
                />
                {errors.next_booster_date && <p className="mt-1 text-sm text-red-600">{errors.next_booster_date.message}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="official_stamp_signature" className="block text-sm font-medium text-gray-700 mb-1">
                Official Stamp and Signature
              </label>
              <input
                type="text"
                id="official_stamp_signature"
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 border p-2 ${errors.official_stamp_signature ? 'border-red-500' : ''}`}
                placeholder="e.g. Prima Medical Center III, Dr. John Doe"
                {...register('official_stamp_signature', { required: 'Official stamp and signature is required' })}
              />
              {errors.official_stamp_signature && <p className="mt-1 text-sm text-red-600">{errors.official_stamp_signature.message}</p>}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : isEditMode ? 'Update Patient' : 'Add Patient'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;