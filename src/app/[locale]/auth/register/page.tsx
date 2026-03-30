"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { register as registerApi, sendOtp } from "@/lib/apiClient";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
    const t = useTranslations("auth");
    const router = useRouter();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        countryCode: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function updateField(field: string, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            await registerApi({
                username: form.username,
                email: form.email,
                password: form.password,
                confirmPassword: form.confirmPassword,
                firstName: form.firstName,
                lastName: form.lastName,
                phoneNumber: form.phoneNumber,
                countryCode: form.countryCode,
            });

            await sendOtp(form.email, "registration");

            router.push(
                `/auth/verify-otp?email=${encodeURIComponent(form.email)}`,
            );
        } catch (err: any) {
            setError(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md bg-bg-card rounded-xl border border-border p-8">
                <h1 className="text-2xl font-semibold text-text-primary text-center mb-6">
                    {t("register_cta")}
                </h1>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="firstName"
                                className="block text-sm font-medium text-text-primary mb-1"
                            >
                                {t("first_name")}
                            </label>
                            <input
                                id="firstName"
                                type="text"
                                value={form.firstName}
                                onChange={(e) =>
                                    updateField("firstName", e.target.value)
                                }
                                className="w-full px-3 py-2 border border-border rounded-md text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="lastName"
                                className="block text-sm font-medium text-text-primary mb-1"
                            >
                                {t("last_name")}
                            </label>
                            <input
                                id="lastName"
                                type="text"
                                value={form.lastName}
                                onChange={(e) =>
                                    updateField("lastName", e.target.value)
                                }
                                className="w-full px-3 py-2 border border-border rounded-md text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-text-primary mb-1"
                        >
                            {t("username")}
                        </label>
                        <input
                            id="username"
                            type="text"
                            required
                            value={form.username}
                            onChange={(e) =>
                                updateField("username", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-border rounded-md text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-text-primary mb-1"
                        >
                            {t("email")}
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) =>
                                updateField("email", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-border rounded-md text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-text-primary mb-1"
                        >
                            {t("phone")}
                        </label>
                        <div className="flex gap-2">
                            <select
                                id="countryCode"
                                value={form.countryCode}
                                onChange={(e) =>
                                    updateField("countryCode", e.target.value)
                                }
                                className="w-28 shrink-0 px-2 py-2 border border-border rounded-md text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">Code</option>
                                <option value="+91">+91 IN</option>
                                <option value="+1">+1 US</option>
                                <option value="+44">+44 UK</option>
                                <option value="+61">+61 AU</option>
                                <option value="+81">+81 JP</option>
                                <option value="+49">+49 DE</option>
                                <option value="+33">+33 FR</option>
                                <option value="+86">+86 CN</option>
                                <option value="+971">+971 AE</option>
                                <option value="+966">+966 SA</option>
                                <option value="+65">+65 SG</option>
                                <option value="+60">+60 MY</option>
                                <option value="+62">+62 ID</option>
                                <option value="+55">+55 BR</option>
                                <option value="+27">+27 ZA</option>
                            </select>
                            <input
                                id="phone"
                                type="tel"
                                value={form.phoneNumber}
                                onChange={(e) =>
                                    updateField("phoneNumber", e.target.value)
                                }
                                className="flex-1 px-3 py-2 border border-border rounded-md text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="98765 43210"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-text-primary mb-1"
                        >
                            {t("password")}
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={form.password}
                            onChange={(e) =>
                                updateField("password", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-border rounded-md text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-text-primary mb-1"
                        >
                            {t("confirm_password")}
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            required
                            value={form.confirmPassword}
                            onChange={(e) =>
                                updateField("confirmPassword", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-border rounded-md text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <Button type="submit" fullWidth loading={loading} size="lg">
                        {t("register_cta")}
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-text-secondary">
                    {t("has_account")}{" "}
                    <Link
                        href="/auth/login"
                        className="text-primary hover:text-primary-hover font-medium"
                    >
                        {t("login")}
                    </Link>
                </p>
            </div>
        </div>
    );
}
