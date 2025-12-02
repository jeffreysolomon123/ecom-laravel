import Cookies from 'js-cookie';
import React, { useState } from 'react';

export default function CartItemForm() {
    const [form, setForm] = useState({
        cart_id: '',
        product_id: '',
        quantity: '1',
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
            const res = await fetch('/api/cart-items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': csrf || '',
                    Accept: 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    cart_id: Number(form.cart_id),
                    product_id: Number(form.product_id),
                    quantity: Number(form.quantity),
                }),
            });

            if (res.status === 201) {
                const body = await res.json();
                setSuccess(`Cart item added (id: ${body.id})`);
                setForm({ cart_id: '', product_id: '', quantity: '1' });
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

            <div className="grid grid-cols-3 gap-2">
                <input
                    name="cart_id"
                    value={form.cart_id}
                    onChange={handleChange}
                    placeholder="Cart ID"
                    className="mt-1 block w-full rounded border px-3 py-2"
                />
                <input
                    name="product_id"
                    value={form.product_id}
                    onChange={handleChange}
                    placeholder="Product ID"
                    className="mt-1 block w-full rounded border px-3 py-2"
                />
                <input
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    placeholder="Qty"
                    type="number"
                    min={1}
                    className="mt-1 block w-full rounded border px-3 py-2"
                />
            </div>

            <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                >
                    {loading ? 'Adding...' : 'Add to Cart'}
                </button>
            </div>
        </form>
    );
}
