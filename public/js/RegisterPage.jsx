import React, { useState } from 'react';
import DistancePicker from './DistancePicker.jsx';
import axios from 'axios';

export default function RegisterPage() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        type_id: '', // 1: mahasiswa, 3: non_mahasiswa
        nim: '',
        gender: '',
        phone: '',
        address: '',
        location: null,
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLocation = loc => {
        setForm({ ...form, location: loc });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        
        // Validations remain the same
        if ((form.type_id === '1') && !form.nim) {
            setError('NIM wajib diisi untuk mahasiswa.');
            setLoading(false);
            return;
        }
        if (!form.type_id) {
            setError('Jenis Tenant wajib dipilih.');
            setLoading(false);
            return;
        }
        if (!form.gender) {
            setError('Gender wajib dipilih.');
            setLoading(false);
            return;
        }
        
        // Map type_id ke tenant_type string sesuai proto
        let tenantType = '';
        if (form.type_id === '1') {
            tenantType = 'mahasiswa';
        } else if (form.type_id === '3') {
            tenantType = 'non_mahasiswa';
        }
        
        // Use null if location not set
        const homeLatitude = form.location ? form.location.lat : null;
        const homeLongitude = form.location ? form.location.lng : null;
        
        try {
            // Construct request body to exactly match API expectations
            const requestBody = {
                email: form.email,
                password: form.password,
                password_confirm: form.password_confirmation, // Add this back - might be required
                name: form.name,
                tenant_type: tenantType,
                gender: form.gender,
                phone: form.phone,
                address: form.address,
                home_latitude: form.location ? Number(form.location.lat) : null,
                home_longitude: form.location ? Number(form.location.lng) : null,
                type_id: parseInt(form.type_id, 10)
            };
            
            // Only include NIM if it exists
            if (form.nim) {
                requestBody.nim = form.nim;
            }
            
            // Set appropriate headers
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };
            
            console.log('Sending registration request:', requestBody);
            
            // Use axios to post data to Laravel backend
            const response = await axios.post('/register', requestBody);
            
            if (response.status !== 200) {
                throw new Error(response.data.message || `Error ${response.status}: ${response.statusText}`);
            }
            
            console.log('Registration successful:', response.data);
            
            setSuccess('Registration successful! You can now login.');
            // Reset form on success
            setForm({
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
                type_id: '',
                nim: '',
                gender: '',
                phone: '',
                address: '',
                location: null,
            });
        } catch (err) {
            console.error('Registration error details:', err);
            setError(typeof err === 'object' && err.message ? err.message : 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <h2 className="mb-4">Register as Tenant</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
                <div className="mb-3">
                    <label className="form-label">Jenis Tenant</label>
                    <select className="form-select" name="type_id" value={form.type_id} onChange={handleChange} required>
                        <option value="">Pilih Jenis Tenant</option>
                        <option value="1">Mahasiswa</option>
                        <option value="3">Non Mahasiswa</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Gender</label>
                    <select className="form-select" name="gender" value={form.gender} onChange={handleChange} required>
                        <option value="">Pilih Gender</option>
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                    </select>
                </div>
                {(form.type_id === '1') && (
                    <div className="mb-3">
                        <label className="form-label">NIM</label>
                        <input type="text" className="form-control" name="nim" value={form.nim} onChange={handleChange} required />
                    </div>
                )}
                <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Confirm Password</label>
                    <input type="password" className="form-control" name="password_confirmation" value={form.password_confirmation} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Nomor Telepon</label>
                    <input type="text" className="form-control" name="phone" value={form.phone} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Alamat</label>
                    <input type="text" className="form-control" name="address" value={form.address} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Home Location (click on map to set)</label>                    <DistancePicker onLocationSelect={handleLocation} />
                    {form.location && (
                        <div className="mt-2">
                            <div className="text-success mb-2 text-center">Selected: {form.location.lat.toFixed(5)}, {form.location.lng.toFixed(5)}</div>
                            <div className="text-primary">Jarak ke Titibah: {form.location.distance ? form.location.distance.toLocaleString() : '-'} meter</div>
                        </div>
                    )}
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
        </div>
    );
}
