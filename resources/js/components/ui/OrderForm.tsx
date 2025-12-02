import Cookies from 'js-cookie';
import React, { useState } from 'react';

export default function OrderForm() {
    const [form, setForm] = useState({
        user_id: '',
        address_id: '',
        total_amount: '',
        status: 'pending',
        payment_method: '',
        payment_reference: '',
    });
    const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
        {},
    );
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
        setErrors((p) => ({ ...p, [e.target.name]: undefined }));
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setSuccess(null);
        try {
            const csrf = Cookies.get('XSRF-TOKEN');
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': csrf || '',
                    Accept: 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    user_id: Number(form.user_id),
                    address_id: form.address_id
                        ? Number(form.address_id)
                        : null,
                    total_amount: Number(form.total_amount),
                    status: form.status,
                    payment_method: form.payment_method || null,
                    payment_reference: form.payment_reference || null,
                }),
            });

            if (res.status === 201) {
                const body = await res.json();
                setSuccess(`Order created (id: ${body.id})`);
                setForm({
                    user_id: '',
                    address_id: '',
                    total_amount: '',
                    status: 'pending',
                    payment_method: '',
                    payment_reference: '',
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
        <form onSubmit={submit} className="max-w-lg space-y-3">
            {success && <div className="text-green-600">{success}</div>}
            {errors.general && (
                <div className="text-red-600">{errors.general[0]}</div>
            )}

            <div>
                <label className="block text-sm">User ID</label>
                <input
                    name="user_id"
                    value={form.user_id}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded border px-3 py-2"
                />
            </div>

            <div>
                <label className="block text-sm">Address ID (optional)</label>
                <input
                    name="address_id"
                    value={form.address_id}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded border px-3 py-2"
                />
            </div>

            <div>
                <label className="block text-sm">Total Amount</label>
                <input
                    name="total_amount"
                    value={form.total_amount}
                    onChange={handleChange}
                    required
                    type="number"
                    step="0.01"
                    className="mt-1 block w-full rounded border px-3 py-2"
                />
            </div>

            <div>
                <label className="block text-sm">Status</label>
                <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded border px-3 py-2"
                >
                    <option value="pending">pending</option>
                    <option value="paid">paid</option>
                    <option value="shipped">shipped</option>
                    <option value="delivered">delivered</option>
                    <option value="cancelled">cancelled</option>
                </select>
            </div>

            <div>
                <label className="block text-sm">Payment Method</label>
                <input
                    name="payment_method"
                    value={form.payment_method}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded border px-3 py-2"
                />
            </div>

            <div>
                <label className="block text-sm">Payment Reference</label>
                <input
                    name="payment_reference"
                    value={form.payment_reference}
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
                    {loading ? 'Creating...' : 'Create Order'}
                </button>
            </div>
        </form>
    );
}
