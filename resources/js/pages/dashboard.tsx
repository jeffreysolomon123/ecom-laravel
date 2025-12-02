import AddressForm from '@/components/AddressForm';
import CartForm from '@/components/ui/CartForm';
import CartItemForm from '@/components/ui/CartItemForm';
import CategoryForm from '@/components/ui/CategoryForm';
import OrderForm from '@/components/ui/OrderForm';
import OrderItemForm from '@/components/ui/OrderItemForm';
import PaymentForm from '@/components/ui/PaymentForm';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import ProductImageForm from '@/components/ui/ProductImageForm';
import ProductReviewForm from '@/components/ui/ProductReviewForm';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import Cookies from 'js-cookie';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        image_url: '',
    });

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

    function getCsrfToken() {
        return document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content');
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setSuccessMsg(null);

        try {
            const csrf = Cookies.get('XSRF-TOKEN'); // <-- GET TOKEN FROM COOKIE

            const res = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': csrf, // <-- IMPORTANT: USE THIS HEADER
                    Accept: 'application/json',
                },
                credentials: 'include', // <-- SEND COOKIES WITH REQUEST
                body: JSON.stringify({
                    name: form.name,
                    description: form.description,
                    price: parseFloat(form.price),
                    stock: parseInt(form.stock),
                    image_url: form.image_url,
                }),
            });

            if (res.status === 201) {
                const body = await res.json();
                setSuccessMsg('Product created (id: ' + body.id + ')');
                setForm({
                    name: '',
                    description: '',
                    price: '',
                    stock: '',
                    image_url: '',
                });
            } else if (res.status === 422) {
                const body = await res.json();
                // Laravel returns validation errors under `errors`
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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>

                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>

                <div className="w-full max-w-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {successMsg && (
                            <div className="text-green-600">{successMsg}</div>
                        )}
                        {errors.general && (
                            <div className="text-red-600">
                                {errors.general[0]}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium">
                                Name
                            </label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded border px-3 py-2"
                                placeholder="Product Name"
                            />
                            {errors.name && (
                                <div className="text-sm text-red-600">
                                    {errors.name[0]}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded border px-3 py-2"
                                placeholder="Description"
                            />
                            {errors.description && (
                                <div className="text-sm text-red-600">
                                    {errors.description[0]}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium">
                                    Price
                                </label>
                                <input
                                    name="price"
                                    value={form.price}
                                    onChange={handleChange}
                                    required
                                    type="number"
                                    step="0.01"
                                    className="mt-1 block w-full rounded border px-3 py-2"
                                    placeholder="Price"
                                />
                                {errors.price && (
                                    <div className="text-sm text-red-600">
                                        {errors.price[0]}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium">
                                    Stock
                                </label>
                                <input
                                    name="stock"
                                    value={form.stock}
                                    onChange={handleChange}
                                    required
                                    type="number"
                                    className="mt-1 block w-full rounded border px-3 py-2"
                                    placeholder="Stock"
                                />
                                {errors.stock && (
                                    <div className="text-sm text-red-600">
                                        {errors.stock[0]}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                Image URL
                            </label>
                            <input
                                name="image_url"
                                value={form.image_url}
                                onChange={handleChange}
                                required
                                type="url"
                                className="mt-1 block w-full rounded border px-3 py-2"
                                placeholder="Image URL"
                            />
                            {errors.image_url && (
                                <div className="text-sm text-red-600">
                                    {errors.image_url[0]}
                                </div>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
                <AddressForm />
                <CartForm />
                <CartItemForm />
                <OrderForm />
                <OrderItemForm />
                <PaymentForm />
                <ProductImageForm />
                <ProductReviewForm />
                <CategoryForm />
            </div>
        </AppLayout>
    );
}
