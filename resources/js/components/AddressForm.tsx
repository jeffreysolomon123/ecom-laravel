import Cookies from 'js-cookie';
import React, { useState } from 'react';

export default function AddressForm() {
    const [form, setForm] = useState({
        user_id: '',
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
    });
    const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
        {},
    );
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
        setErrors((p) => ({ ...p, [e.target.name]: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setSuccess(null);
        try {
            const csrf = Cookies.get('XSRF-TOKEN');
            const res = await fetch('/api/addresses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': csrf || '',
                    Accept: 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    user_id: form.user_id ? Number(form.user_id) : null,
                    full_name: form.full_name,
                    phone: form.phone,
                    address_line1: form.address_line1,
                    address_line2: form.address_line2,
                    city: form.city,
                    state: form.state,
                    pincode: form.pincode,
                    country: form.country,
                }),
            });

            if (res.status === 201) {
                const body = await res.json();
                setSuccess(`Address created (id: ${body.id})`);
                setForm({
                    user_id: '',
                    full_name: '',
                    phone: '',
                    address_line1: '',
                    address_line2: '',
                    city: '',
                    state: '',
                    pincode: '',
                    country: 'India',
                });
            } else if (res.status === 422) {
                const body = await res.json();
                setErrors(body.errors || {});
            } else {
                const text = await res.text();
                setErrors({ general: [text || 'Unexpected error'] });
            }
        } catch (err: any) {
            setErrors({ general: [err.message || 'Network error'] });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg space-y-3">
            {success && <div className="text-green-600">{success}</div>}
            {errors.general && (
                <div className="text-red-600">{errors.general[0]}</div>
            )}

            <div>
                <label className="block text-sm">User ID (optional)</label>
                <input
                    name="user_id"
                    value={form.user_id}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded border px-3 py-2"
                />
            </div>

            <div>
                <label className="block text-sm">Full Name</label>
                <input
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded border px-3 py-2"
                />
                {errors.full_name && (
                    <div className="text-sm text-red-600">
                        {errors.full_name[0]}
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm">Phone</label>
                <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded border px-3 py-2"
                />
            </div>

            <div>
                <label className="block text-sm">Address Line 1</label>
                <input
                    name="address_line1"
                    value={form.address_line1}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded border px-3 py-2"
                />
            </div>

            <div>
                <label className="block text-sm">Address Line 2</label>
                <input
                    name="address_line2"
                    value={form.address_line2}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded border px-3 py-2"
                />
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="block text-sm">City</label>
                    <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded border px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block text-sm">State</label>
                    <input
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded border px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block text-sm">Pincode</label>
                    <input
                        name="pincode"
                        value={form.pincode}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded border px-3 py-2"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm">Country</label>
                <input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded border px-3 py-2"
                />
            </div>

            <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Create Address'}
                </button>
            </div>
        </form>
    );
}
