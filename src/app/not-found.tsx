import Link from "next/link";
import { ShoppingBag, Home } from "lucide-react";

export default function RootNotFound() {
    return (
        <div className="min-h-screen bg-bg-page flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="flex items-center justify-center gap-3 mb-8">
                    <span className="text-7xl font-bold leading-none text-primary">
                        4
                    </span>
                    <div className="w-20 h-20 rounded-full bg-primary-light border-4 border-primary flex items-center justify-center">
                        <ShoppingBag className="w-10 h-10 text-primary" />
                    </div>
                    <span className="text-7xl font-bold leading-none text-primary">
                        4
                    </span>
                </div>

                <h1 className="text-2xl font-bold text-text-primary mb-3">
                    Page Not Found
                </h1>
                <p className="text-text-secondary leading-relaxed mb-6">
                    The page you&apos;re looking for doesn&apos;t exist or has
                    been moved.
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
                >
                    <Home className="w-4 h-4" />
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
