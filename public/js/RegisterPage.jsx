import React, { useState } from 'react';
import DistancePicker from './DistancePicker.jsx';
import axios from 'axios';

export default function RegisterPage() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        type_id: '', // 1: mahasiswa_putri, 2: mahasiswa_putra, 3: non_mahasiswa
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
        // Validasi NIM wajib jika mahasiswa
        if ((form.type_id === '1' || form.type_id === '2') && !form.nim) {
            setError('NIM wajib diisi untuk mahasiswa.');
            setLoading(false);
            return;
        }
        // Validasi type_id wajib
        if (!form.type_id) {
            setError('Jenis Tenant wajib dipilih.');
            setLoading(false);
            return;
        }
        // Validasi gender wajib
        if (!form.gender) {
            setError('Gender wajib dipilih.');
            setLoading(false);
            return;
        }
        // Map type_id ke tenant_type string sesuai proto
        let tenant_type = '';
        if (form.type_id === '1') tenant_type = 'mahasiswa_putri';
        else if (form.type_id === '2') tenant_type = 'mahasiswa_putra';
        else if (form.type_id === '3') tenant_type = 'non_mahasiswa';
        // Ambil latitude/longitude dari lokasi
        let home_latitude = null, home_longitude = null;
        if (form.location) {
            home_latitude = form.location.lat;
            home_longitude = form.location.lng;
        }
        try {
            const res = await axios.post('http://localhost:8001/v1/tenant/auth/register', {
                name: form.name,
                email: form.email,
                password: form.password,
                password_confirmation: form.password_confirmation,
                tenant_type,
                nim: form.nim,
                gender: form.gender,
                phone: form.phone,
                address: form.address,
                home_latitude,
                home_longitude
            });
            setSuccess('Registration successful!');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
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
                        <option value="1">Mahasiswa Putri</option>
                        <option value="2">Mahasiswa Putra</option>
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
                {(form.type_id === '1' || form.type_id === '2') && (
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
                    <label className="form-label">Home Location (click on map to set)</label>
                    <DistancePicker onLocationSelect={handleLocation} />
                    {form.location && (
                        <div className="mt-2 text-success">
                            Selected: {form.location.lat.toFixed(5)}, {form.location.lng.toFixed(5)}
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
