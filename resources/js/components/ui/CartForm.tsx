import Cookies from 'js-cookie';
import React, { useState } from 'react';

export default function CartForm() {
    const [form, setForm] = useState({ user_id: '' });
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
            const res = await fetch('/api/carts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': csrf || '',
                    Accept: 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    user_id: form.user_id ? Number(form.user_id) : null,
                }),
            });

            if (res.status === 201) {
                const body = await res.json();
                setSuccess(`Cart created (id: ${body.id})`);
                setForm({ user_id: '' });
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
                <label className="block text-sm">User ID (optional)</label>
                <input
                    name="user_id"
                    value={form.user_id}
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
                    {loading ? 'Creating...' : 'Create Cart'}
                </button>
            </div>
        </form>
    );
}
