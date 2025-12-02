import Cookies from 'js-cookie';
import React, { useState } from 'react';

export default function ProductReviewForm() {
    const [form, setForm] = useState({
        user_id: '',
        product_id: '',
        rating: '5',
        comment: '',
    });
    const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
        {},
    );
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
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
            const res = await fetch('/api/product-reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': csrf || '',
                    Accept: 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    user_id: Number(form.user_id),
                    product_id: Number(form.product_id),
                    rating: Number(form.rating),
                    comment: form.comment || null,
                }),
            });

            if (res.status === 201) {
                const body = await res.json();
                setSuccess(`Review posted (id: ${body.id})`);
                setForm({
                    user_id: '',
                    product_id: '',
                    rating: '5',
                    comment: '',
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
                <label className="block text-sm">Rating</label>
                <select
                    name="rating"
                    value={form.rating}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded border px-3 py-2"
                >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
            </div>

            <div>
                <label className="block text-sm">Comment</label>
                <textarea
                    name="comment"
                    value={form.comment}
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
                    {loading ? 'Posting...' : 'Post Review'}
                </button>
            </div>
        </form>
    );
}
