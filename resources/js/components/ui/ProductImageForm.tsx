import Cookies from 'js-cookie';
import React, { useState } from 'react';

export default function ProductImageForm() {
    const [form, setForm] = useState({
        product_id: '',
        image_url: '',
        is_primary: false,
    });
    const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
        {},
    );
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({
            ...f,
            [name]: type === 'checkbox' ? checked : value,
        }));
        setErrors((p) => ({ ...p, [name]: undefined }));
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setSuccess(null);
        try {
            const csrf = Cookies.get('XSRF-TOKEN');
            const res = await fetch('/api/product-images', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': csrf || '',
                    Accept: 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    product_id: Number(form.product_id),
                    image_url: form.image_url,
                    is_primary: Boolean(form.is_primary),
                }),
            });

            if (res.status === 201) {
                const body = await res.json();
                setSuccess(`Image saved (id: ${body.id})`);
                setForm({ product_id: '', image_url: '', is_primary: false });
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
                <label className="block text-sm">Product ID</label>
                <input
                    name="product_id"
                    value={form.product_id}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded border px-3 py-2"
                />
            </div>

            <div>
                <label className="block text-sm">Image URL</label>
                <input
                    name="image_url"
                    value={form.image_url}
                    onChange={handleChange}
                    required
                    type="url"
                    className="mt-1 block w-full rounded border px-3 py-2"
                />
            </div>

            <div className="flex items-center gap-2">
                <input
                    id="is_primary"
                    name="is_primary"
                    type="checkbox"
                    checked={form.is_primary}
                    onChange={handleChange}
                />
                <label htmlFor="is_primary" className="text-sm">
                    Is Primary
                </label>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save Image'}
                </button>
            </div>
        </form>
    );
}
