"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { BellRing, BellPlus, Loader2, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { subscribeRestock } from "@/services/notifyService";
import { ApiError } from "@/services/apiError";
import Button from "@/components/ui/Button";

interface NotifyRestockButtonProps {
    productId: string;
    className?: string;
}

type Feedback =
    | { type: "success"; message: string }
    | { type: "info"; message: string; cta?: { label: string; href: string } }
    | { type: "error"; message: string }
    | null;

export default function NotifyRestockButton({
    productId,
    className,
}: NotifyRestockButtonProps) {
    const t = useTranslations("product");
    const router = useRouter();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const [loading, setLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [feedback, setFeedback] = useState<Feedback>(null);

    async function handleClick() {
        if (loading || subscribed) return;

        if (!isAuthenticated) {
            router.push("/auth/login");
            return;
        }

        setFeedback(null);
        setLoading(true);
        try {
            await subscribeRestock(productId);
            setSubscribed(true);
            setFeedback({
                type: "success",
                message: t("notify_restock_success"),
            });
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.code === "ALREADY_SUBSCRIBED") {
                    setSubscribed(true);
                    setFeedback({
                        type: "info",
                        message: t("notify_restock_already"),
                    });
                } else if (err.code === "NO_WHATSAPP_NUMBER") {
                    setFeedback({
                        type: "info",
                        message: t("notify_restock_no_whatsapp"),
                        cta: {
                            label: t("notify_restock_add_whatsapp"),
                            href: "/profile",
                        },
                    });
                } else if (err.code === "PRODUCT_IN_STOCK") {
                    setFeedback({
                        type: "info",
                        message: t("notify_restock_in_stock"),
                    });
                } else if (err.statusCode === 401) {
                    router.push("/auth/login");
                    return;
                } else {
                    setFeedback({
                        type: "error",
                        message: err.message || t("notify_restock_failed"),
                    });
                }
            } else {
                setFeedback({
                    type: "error",
                    message: t("notify_restock_failed"),
                });
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={className}>
            <Button
                variant={subscribed ? "outline" : "primary"}
                size="lg"
                fullWidth
                onClick={handleClick}
                disabled={loading || subscribed}
            >
                <span className="inline-flex items-center justify-center gap-2">
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : subscribed ? (
                        <CheckCircle2 className="h-4 w-4" />
                    ) : (
                        <BellPlus className="h-4 w-4" />
                    )}
                    {subscribed
                        ? t("notify_restock_subscribed")
                        : loading
                          ? t("notify_restock_subscribing")
                          : t("notify_restock_cta")}
                </span>
            </Button>

            {feedback && (
                <div
                    className={`mt-2 flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
                        feedback.type === "success"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : feedback.type === "error"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                >
                    <BellRing className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <div className="flex-1">
                        <p>{feedback.message}</p>
                        {feedback.type === "info" && feedback.cta && (
                            <Link
                                href={feedback.cta.href}
                                className="mt-1 inline-block font-medium underline hover:no-underline"
                            >
                                {feedback.cta.label}
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
