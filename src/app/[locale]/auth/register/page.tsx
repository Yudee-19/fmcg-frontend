"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { register as registerApi } from "@/services/authService";
import Button from "@/components/ui/Button";
import {
    getCityOptions,
    getCountryName,
    getPhoneCodeOptions,
    getStateName,
    getStateOptions,
    isValidPostalCode,
} from "@/lib/location";
import {
    ArrowRight,
    BadgeCheck,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    MessageCircle,
    Phone,
    UserRound,
} from "lucide-react";

const inputClass =
    "w-full rounded-xl border border-border bg-white/90 py-3 pl-11 pr-12 text-sm text-text-primary shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

// Address country is locked to Kuwait (ISO code). State/city options cascade from it.
const LOCKED_COUNTRY_CODE = "KW";
const DEFAULT_DIAL_CODE = "+965";

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
        countryCode: DEFAULT_DIAL_CODE,
        whatsappNumber: "",
    });
    const [address, setAddress] = useState({
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: LOCKED_COUNTRY_CODE,
        addressType: "home" as "home" | "work",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [postalError, setPostalError] = useState("");
    const [loading, setLoading] = useState(false);

    const phoneCodeOptions = useMemo(() => getPhoneCodeOptions(), []);
    const stateOptions = useMemo(
        () => getStateOptions(LOCKED_COUNTRY_CODE),
        [],
    );
    const cityOptions = useMemo(
        () => getCityOptions(LOCKED_COUNTRY_CODE, address.state),
        [address.state],
    );

    function updateField(field: string, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function updateAddress(field: string, value: string) {
        setAddress((prev) => ({ ...prev, [field]: value }));
    }

    function buildPayload() {
        // Backend requires: username, email, password, confirmPassword,
        // firstName, lastName, phoneNumber, countryCode, address.
        // Optional: whatsappNumber.
        const payload: Record<string, any> = {
            username: form.username,
            email: form.email,
            password: form.password,
            confirmPassword: form.confirmPassword,
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            phoneNumber: form.phoneNumber.trim(),
            countryCode: form.countryCode,
            address: {
                street: address.street.trim(),
                city: address.city.trim(),
                state: getStateName(LOCKED_COUNTRY_CODE, address.state),
                postalCode: address.postalCode.trim(),
                country: getCountryName(LOCKED_COUNTRY_CODE),
                isDefault: true,
                addressType: address.addressType,
            },
        };

        const whatsapp = form.whatsappNumber.trim();
        if (whatsapp) payload.whatsappNumber = whatsapp;

        return payload;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setPostalError("");

        if (!isValidPostalCode(address.postalCode, address.country)) {
            setPostalError(t("invalid_postal_code"));
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError(t("passwords_do_not_match"));
            return;
        }

        setLoading(true);

        try {
            await registerApi(buildPayload());

            // Backend auto-sends OTP on registration — no explicit sendOtp needed
            router.push(
                `/auth/verify-otp?email=${encodeURIComponent(form.email)}`,
            );
        } catch (err: any) {
            setError(err.message || t("register_failed"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative min-h-[calc(100vh-13rem)] overflow-hidden px-4 py-12 sm:px-6 lg:py-16">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(196,30,58,0.16),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(195,58,88,0.15),_transparent_32%)]" />

            <div className="relative mx-auto grid w-full max-w-6xl items-start gap-8 xl:grid-cols-[minmax(0,32rem)_minmax(0,1fr)]">
                <aside className="rounded-[28px] border border-white/70 bg-white/84 p-6 shadow-[0_24px_80px_rgba(95,20,34,0.12)] backdrop-blur sm:p-8 xl:sticky xl:top-24">
                    <span className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        <BadgeCheck className="h-4 w-4" />
                        {t("register_badge")}
                    </span>

                    <div className="mt-5 space-y-4">
                        <h1 className="font-poppins text-3xl font-semibold leading-tight text-text-primary sm:text-4xl">
                            {t("register_heading")}
                        </h1>
                        <p className="text-sm leading-7 text-text-secondary sm:text-base">
                            {t("register_subtitle")}
                        </p>
                    </div>

                    <div className="mt-8 space-y-3">
                        {[t("register_feature_fast"), t("register_feature_saved"), t("register_feature_support")].map((item) => (
                            <div
                                key={item}
                                className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-medium text-text-primary shadow-sm"
                            >
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary">
                                    <BadgeCheck className="h-4.5 w-4.5" />
                                </span>
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 rounded-2xl bg-primary px-5 py-5 text-white shadow-lg">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/75">
                            {t("register_panel_label")}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/90">
                            {t("register_panel_copy")}
                        </p>
                    </div>
                </aside>

                <div className="w-full rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_rgba(95,20,34,0.12)] backdrop-blur sm:p-8">
                    <div className="mb-8 space-y-3 text-center xl:text-left">
                        <span className="inline-flex items-center justify-center rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                            {t("register_cta")}
                        </span>
                        <h2 className="font-poppins text-3xl font-semibold text-text-primary">
                            {t("register_card_title")}
                        </h2>
                        <p className="text-sm leading-6 text-text-secondary">
                            {t("register_card_subtitle")}
                        </p>
                    </div>

                {error && (
                    <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="firstName"
                                className="mb-1.5 block text-sm font-medium text-text-primary"
                            >
                                {t("first_name")}
                            </label>
                            <div className="relative">
                                <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted" />
                                <input
                                    id="firstName"
                                    type="text"
                                    required
                                    value={form.firstName}
                                    onChange={(e) =>
                                        updateField("firstName", e.target.value)
                                    }
                                    className={inputClass}
                                />
                            </div>
                        </div>
                        <div>
                            <label
                                htmlFor="lastName"
                                className="mb-1.5 block text-sm font-medium text-text-primary"
                            >
                                {t("last_name")}
                            </label>
                            <div className="relative">
                                <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted" />
                                <input
                                    id="lastName"
                                    type="text"
                                    required
                                    value={form.lastName}
                                    onChange={(e) =>
                                        updateField("lastName", e.target.value)
                                    }
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Username */}
                    <div>
                        <label
                            htmlFor="username"
                            className="mb-1.5 block text-sm font-medium text-text-primary"
                        >
                            {t("username")}
                        </label>
                        <div className="relative">
                            <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted" />
                            <input
                                id="username"
                                type="text"
                                required
                                value={form.username}
                                onChange={(e) =>
                                    updateField("username", e.target.value)
                                }
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-1.5 block text-sm font-medium text-text-primary"
                        >
                            {t("email")}
                        </label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted" />
                            <input
                                id="email"
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) =>
                                    updateField("email", e.target.value)
                                }
                                className={inputClass}
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label
                            htmlFor="phone"
                            className="mb-1.5 block text-sm font-medium text-text-primary"
                        >
                            {t("phone")}
                        </label>
                        <div className="flex gap-2">
                            <select
                                id="countryCode"
                                required
                                value={form.countryCode}
                                onChange={(e) =>
                                    updateField("countryCode", e.target.value)
                                }
                                className="w-28 shrink-0 rounded-xl border border-border bg-white px-3 py-3 text-sm text-text-primary shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                            >
                                {phoneCodeOptions.map((option) => (
                                    <option
                                        key={option.iso}
                                        value={option.dialCode}
                                    >
                                        {option.dialCode} {option.iso}
                                    </option>
                                ))}
                            </select>
                            <div className="relative flex-1">
                                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted" />
                                <input
                                    id="phone"
                                    type="tel"
                                    required
                                    value={form.phoneNumber}
                                    onChange={(e) =>
                                        updateField("phoneNumber", e.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="98765 43210"
                                />
                            </div>
                        </div>
                    </div>

                    {/* WhatsApp number (optional) */}
                    <div>
                        <label
                            htmlFor="whatsappNumber"
                            className="mb-1.5 block text-sm font-medium text-text-primary"
                        >
                            {t("whatsapp_number")}
                        </label>
                        <div className="relative">
                            <MessageCircle className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted" />
                            <input
                                id="whatsappNumber"
                                type="tel"
                                value={form.whatsappNumber}
                                onChange={(e) =>
                                    updateField("whatsappNumber", e.target.value)
                                }
                                className={inputClass}
                                placeholder="51234567"
                            />
                        </div>
                        <p className="mt-1 text-xs text-text-muted">
                            {t("whatsapp_hint")}
                        </p>
                    </div>

                    {/* Password */}
                    <div>
                        <label
                            htmlFor="password"
                            className="mb-1.5 block text-sm font-medium text-text-primary"
                        >
                            {t("password")}
                        </label>
                        <div className="relative">
                            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted" />
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={form.password}
                                onChange={(e) =>
                                    updateField("password", e.target.value)
                                }
                                className={inputClass}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-text-muted transition hover:bg-primary-light hover:text-primary"
                                aria-label={showPassword ? t("hide_password") : t("show_password")}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4.5 w-4.5" />
                                ) : (
                                    <Eye className="h-4.5 w-4.5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="mb-1.5 block text-sm font-medium text-text-primary"
                        >
                            {t("confirm_password")}
                        </label>
                        <div className="relative">
                            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted" />
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={form.confirmPassword}
                                onChange={(e) =>
                                    updateField("confirmPassword", e.target.value)
                                }
                                className={inputClass}
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword((prev) => !prev)
                                }
                                className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-text-muted transition hover:bg-primary-light hover:text-primary"
                                aria-label={showConfirmPassword ? t("hide_password") : t("show_password")}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4.5 w-4.5" />
                                ) : (
                                    <Eye className="h-4.5 w-4.5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Address (required) */}
                    <div className="border-t border-border pt-4">
                        <h3 className="text-sm font-semibold text-text-primary">
                            {t("address_section")}
                        </h3>
                    </div>

                    <div className="space-y-3 pl-1 border-l-2 border-primary/20 ml-1 pl-4">
                            <div>
                                <label
                                    htmlFor="street"
                                    className="block text-sm font-medium text-text-primary mb-1"
                                >
                                    {t("street")}
                                </label>
                                <input
                                    id="street"
                                    type="text"
                                    required
                                    value={address.street}
                                    onChange={(e) =>
                                        updateAddress("street", e.target.value)
                                    }
                                    className={inputClass}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label
                                        htmlFor="state"
                                        className="block text-sm font-medium text-text-primary mb-1"
                                    >
                                        {t("state")}
                                    </label>
                                    <select
                                        id="state"
                                        required
                                        value={address.state}
                                        onChange={(e) => {
                                            updateAddress(
                                                "state",
                                                e.target.value,
                                            );
                                            updateAddress("city", "");
                                        }}
                                        className={inputClass}
                                    >
                                        <option value="">
                                            {t("select_state")}
                                        </option>
                                        {stateOptions.map((option) => (
                                            <option
                                                key={option.code}
                                                value={option.code}
                                            >
                                                {option.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label
                                        htmlFor="city"
                                        className="block text-sm font-medium text-text-primary mb-1"
                                    >
                                        {t("city")}
                                    </label>
                                    <select
                                        id="city"
                                        required
                                        disabled={!address.state}
                                        value={address.city}
                                        onChange={(e) =>
                                            updateAddress(
                                                "city",
                                                e.target.value,
                                            )
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">
                                            {t("select_city")}
                                        </option>
                                        {cityOptions.map((option) => (
                                            <option
                                                key={option.name}
                                                value={option.name}
                                            >
                                                {option.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label
                                        htmlFor="postalCode"
                                        className="block text-sm font-medium text-text-primary mb-1"
                                    >
                                        {t("postal_code")}
                                    </label>
                                    <input
                                        id="postalCode"
                                        type="text"
                                        required
                                        value={address.postalCode}
                                        onChange={(e) => {
                                            if (postalError) {
                                                setPostalError("");
                                            }
                                            updateAddress(
                                                "postalCode",
                                                e.target.value,
                                            );
                                        }}
                                        className={inputClass}
                                    />
                                    {postalError ? (
                                        <p className="mt-1 text-xs text-red-600">
                                            {postalError}
                                        </p>
                                    ) : null}
                                </div>
                                <div>
                                    <label
                                        htmlFor="country"
                                        className="block text-sm font-medium text-text-primary mb-1"
                                    >
                                        {t("country")}
                                    </label>
                                    <select
                                        id="country"
                                        required
                                        disabled
                                        value={address.country}
                                        className={inputClass}
                                    >
                                        <option value={LOCKED_COUNTRY_CODE}>
                                            {getCountryName(LOCKED_COUNTRY_CODE)}
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="addressType"
                                    className="block text-sm font-medium text-text-primary mb-1"
                                >
                                    {t("address_type")}
                                </label>
                                <select
                                    id="addressType"
                                    value={address.addressType}
                                    onChange={(e) =>
                                        updateAddress(
                                            "addressType",
                                            e.target.value,
                                        )
                                    }
                                    className={inputClass}
                                >
                                    <option value="home">
                                        {t("address_type_home")}
                                    </option>
                                    <option value="work">
                                        {t("address_type_work")}
                                    </option>
                                </select>
                            </div>
                        </div>

                    <Button
                        type="submit"
                        fullWidth
                        loading={loading}
                        size="lg"
                        className="rounded-xl shadow-[0_14px_34px_rgba(196,30,58,0.22)]"
                    >
                        <span className="inline-flex items-center gap-2">
                            {t("register_cta")}
                            <ArrowRight className="h-4.5 w-4.5" />
                        </span>
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
        </div>
    );
}
