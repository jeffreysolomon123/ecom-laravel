import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/getproducts', {
                    credentials: 'include',
                    headers: { Accept: 'application/json' },
                });
                if (!res.ok)
                    throw new Error((await res.text()) || res.statusText);
                const data = await res.json();
                setProducts(Array.isArray(data) ? data : []);
            } catch (err: any) {
                setError(err?.message || 'Network error');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const currency = (v: number) =>
        new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(v);

    function ProductCard({ p }: { p: any }) {
        return (
            <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md">
                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-50">
                    <img
                        src={p.image_url || '/placeholder.png'}
                        alt={p.name}
                        onError={(e) =>
                            ((e.target as HTMLImageElement).src =
                                '/placeholder.png')
                        }
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>

                <div className="flex flex-1 flex-col p-4">
                    <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
                        {p.name}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                        {p.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-lg font-semibold text-gray-900">
                            {typeof p.price === 'number'
                                ? currency(p.price)
                                : `Rs. ${p.price}`}
                        </div>
                        <Link
                            href={dashboard()}
                            className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                        >
                            View
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <div className="flex min-h-screen flex-col items-center bg-[#dbdbdb] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#ebebeb]">
                <header className="mb-6 w-full max-w-[335px] text-sm lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-block rounded-sm px-5 py-1.5 text-sm"
                                >
                                    Log in
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm"
                                    >
                                        Register
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </header>

                <div className="w-full max-w-6xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-3xl font-bold">Products</h1>
                        <div className="text-sm text-gray-600">
                            {loading
                                ? 'Loading…'
                                : `${products.length} product${products.length !== 1 ? 's' : ''}`}
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-red-700">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="animate-pulse rounded-lg border bg-white p-4"
                                />
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="rounded border border-dashed border-gray-300 bg-white p-8 text-center">
                            <p className="text-lg font-medium">
                                No products found
                            </p>
                            <p className="mt-2 text-sm text-gray-600">
                                Try adding some products from the dashboard.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {products.map((p) => (
                                <ProductCard key={p.id ?? p.name} p={p} />
                            ))}
                        </div>
                    )}
                </div>

                <div className="hidden h-14.5 lg:block" />
            </div>
        </>
    );
}
