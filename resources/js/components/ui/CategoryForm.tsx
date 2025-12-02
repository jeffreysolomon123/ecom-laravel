import Cookies from 'js-cookie';
import React, { useState } from 'react';

export default function CategoryForm() {
    const [form, setForm] = useState({ name: '', description: '' });
    const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
        {},
    );
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
        setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setSuccessMsg(null);

        try {
            const csrf = Cookies.get('XSRF-TOKEN') || '';

            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': csrf,
                    Accept: 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: form.name,
                    description: form.description || null,
                }),
            });

            if (res.status === 201) {
                const body = await res.json().catch(() => ({}));
                setSuccessMsg(
                    `Category created${body.id ? ` (id: ${body.id})` : ''}`,
                );
                setForm({ name: '', description: '' });
            } else if (res.status === 422) {
                const body = await res.json().catch(() => ({}));
                setErrors(body.errors || {});
            } else {
                const text = await res.text().catch(() => 'Unexpected error');
                setErrors({ general: [text || 'Unexpected error'] });
            }
        } catch (err: any) {
            setErrors({ general: [err?.message || 'Network error'] });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
            {successMsg && <div className="text-green-600">{successMsg}</div>}
            {errors.general && (
                <div className="text-red-600">{errors.general[0]}</div>
            )}

            <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded border px-3 py-2"
                    placeholder="Category name"
                />
                {errors.name && (
                    <div className="text-sm text-red-600">{errors.name[0]}</div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded border px-3 py-2"
                    placeholder="Optional description"
                />
                {errors.description && (
                    <div className="text-sm text-red-600">
                        {errors.description[0]}
                    </div>
                )}
            </div>

            <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Create Category'}
                </button>
            </div>
        </form>
    );
}
