"use client"

import React, { useState, ChangeEvent, FormEvent } from 'react';

const FactoryWorkerForm: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: '',
    contact: '',
    email: '',
    jobRole: '',
    resume: null as File | null,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'resume' && e.target instanceof HTMLInputElement && e.target.type === 'file' && e.target.files) {
      setFormData({ ...formData, resume: e.target.files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log(formData);
    // You can handle API submission here
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Factory Worker Application Form</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Basic Details */}
        <div>
          <label className="block mb-1">Full Name</label>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
            className="w-full border rounded px-3 py-2" required />
        </div>

        <div>
          <label className="block mb-1">Date of Birth / Age</label>
          <input type="date" name="dob" value={formData.dob} onChange={handleChange}
            className="w-full border rounded px-3 py-2" required />
        </div>

        <div>
          <label className="block mb-1">Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange}
            className="w-full border rounded px-3 py-2" required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Contact Number</label>
          <input type="tel" name="contact" value={formData.contact} onChange={handleChange}
            className="w-full border rounded px-3 py-2" required />
        </div>

        <div>
          <label className="block mb-1">Email ID (Optional)</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange}
            className="w-full border rounded px-3 py-2" />
        </div>

        {/* Job Role */}
        <div>
          <label className="block mb-1">Job Role Interested</label>
          <input type="text" name="jobRole" value={formData.jobRole} onChange={handleChange}
            className="w-full border rounded px-3 py-2" required />
        </div>

        {/* Resume Upload */}
        <div>
          <label className="block mb-1">Upload Resume (PDF, JPG, PNG, DOC - Max 5MB)</label>
          <input type="file" name="resume" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleChange} className="w-full" required />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Submit Application
        </button>
      </form>
    </div>
  );
};

export default FactoryWorkerForm;
