import Cookies from 'js-cookie';
import React, { useState } from 'react';

export default function PaymentForm() {
    const [form, setForm] = useState({
        order_id: '',
        amount: '',
        provider: '',
        status: '',
        transaction_id: '',
    });
    const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
        {},
    );
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            const res = await fetch('/api/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': csrf || '',
                    Accept: 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    order_id: Number(form.order_id),
                    amount: Number(form.amount),
                    provider: form.provider || null,
                    status: form.status || null,
                    transaction_id: form.transaction_id || null,
                }),
            });

            if (res.status === 201) {
                const body = await res.json();
                setSuccess(`Payment recorded (id: ${body.id})`);
                setForm({
                    order_id: '',
                    amount: '',
                    provider: '',
                    status: '',
                    transaction_id: '',
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
        <form onSubmit={submit} className="max-w-md space-y-3">
            {success && <div className="text-green-600">{success}</div>}
            {errors.general && (
                <div className="text-red-600">{errors.general[0]}</div>
            )}

            <div>
                <label className="block text-sm">Order ID</label>
                <input
                    name="order_id"
                    value={form.order_id}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded border px-3 py-2"
                />
            </div>

            <div>
                <label className="block text-sm">Amount</label>
                <input
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    required
                    type="number"
                    step="0.01"
                    className="mt-1 block w-full rounded border px-3 py-2"
                />
            </div>

            <div>
                <label className="block text-sm">Provider</label>
                <input
                    name="provider"
                    value={form.provider}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded border px-3 py-2"
                />
            </div>

            <div>
                <label className="block text-sm">Status</label>
                <input
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded border px-3 py-2"
                />
            </div>

            <div>
                <label className="block text-sm">Transaction ID</label>
                <input
                    name="transaction_id"
                    value={form.transaction_id}
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
                    {loading ? 'Saving...' : 'Record Payment'}
                </button>
            </div>
        </form>
    );
}
