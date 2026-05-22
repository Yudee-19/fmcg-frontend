'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  CloudUpload,
  Eye,
  EyeOff,
  Image as ImageIcon,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { Link } from '@/i18n/navigation';
import { useAuthStore } from '@/store/authStore';
import { ApiError } from '@/services/apiError';
import {
  deleteBanner,
  listBanners,
  toggleBannerStatus,
  updateBannerPosition,
  uploadBanner,
} from '@/services/admin/bannerService';
import type { Banner } from '@/types';

const REQUIRED_WIDTH = 1920;
const REQUIRED_HEIGHT = 1080;

interface PreviewState {
  file: File;
  url: string;
  width: number;
  height: number;
}

async function readImageDimensions(
  file: File,
): Promise<{ url: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve({ url, width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image-load-failed'));
    };
    img.src = url;
  });
}

export default function AdminBannersContent() {
  const t = useTranslations('admin_banners');
  const tCommon = useTranslations('common');

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  const [mounted, setMounted] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Banner | null>(null);
  const [positionDrafts, setPositionDrafts] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (!mounted || !isAuthenticated || !isAdmin) {
      setLoading(false);
      return;
    }
    void loadBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isAuthenticated, isAdmin]);

  // Clean up object URL when the preview changes/unmounts.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  async function loadBanners() {
    setLoading(true);
    setLoadError('');
    try {
      const data = await listBanners();
      setBanners(data.sort((a, b) => a.position - b.position));
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : t('load_failed');
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileSelected(file: File | null) {
    if (!file) {
      setPreview(null);
      return;
    }
    if (!/^image\/(png|jpeg|jpg|webp)$/i.test(file.type)) {
      toast.error(t('invalid_file_type'));
      return;
    }
    try {
      const { url, width, height } = await readImageDimensions(file);
      if (preview) URL.revokeObjectURL(preview.url);
      setPreview({ file, url, width, height });
    } catch {
      toast.error(t('image_read_failed'));
    }
  }

  function handleClearPreview() {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
  }

  async function handleUpload() {
    if (!preview) return;
    if (
      preview.width !== REQUIRED_WIDTH ||
      preview.height !== REQUIRED_HEIGHT
    ) {
      toast.error(
        t('invalid_dimensions', {
          required: `${REQUIRED_WIDTH}x${REQUIRED_HEIGHT}`,
          actual: `${preview.width}x${preview.height}`,
        }),
      );
      return;
    }
    setUploading(true);
    try {
      const res = await uploadBanner(preview.file);
      const created = res.data;
      if (created) {
        setBanners((prev) =>
          [...prev, created].sort((a, b) => a.position - b.position),
        );
      }
      toast.success(t('upload_success'));
      handleClearPreview();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.code === 'INVALID_DIMENSIONS'
            ? t('invalid_dimensions', {
                required: `${REQUIRED_WIDTH}x${REQUIRED_HEIGHT}`,
                actual: `${preview.width}x${preview.height}`,
              })
            : err.message
          : t('upload_failed');
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }

  async function handleToggleStatus(banner: Banner) {
    setBusyId(banner._id);
    try {
      const res = await toggleBannerStatus(banner._id);
      const updated = res.data;
      setBanners((prev) =>
        prev.map((b) => (b._id === banner._id ? (updated ?? b) : b)),
      );
      toast.success(
        (updated ?? banner).status === 'PUBLISHED'
          ? t('status_published_toast')
          : t('status_draft_toast'),
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t('status_failed'));
    } finally {
      setBusyId(null);
    }
  }

  async function handlePositionSave(banner: Banner) {
    const raw = positionDrafts[banner._id];
    const parsed = raw === undefined ? banner.position : Number(raw);
    if (!Number.isInteger(parsed) || parsed < 1) {
      toast.error(t('invalid_position'));
      return;
    }
    if (parsed === banner.position) return;

    setBusyId(banner._id);
    try {
      const res = await updateBannerPosition(banner._id, parsed);
      const updated = res.data;
      setBanners((prev) =>
        prev
          .map((b) => (b._id === banner._id ? (updated ?? b) : b))
          .sort((a, b) => a.position - b.position),
      );
      setPositionDrafts((d) => {
        const next = { ...d };
        delete next[banner._id];
        return next;
      });
      toast.success(t('position_saved'));
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : t('position_failed'),
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteConfirm() {
    if (!pendingDelete) return;
    const banner = pendingDelete;
    setBusyId(banner._id);
    try {
      await deleteBanner(banner._id);
      setBanners((prev) => prev.filter((b) => b._id !== banner._id));
      toast.success(t('delete_success'));
      setPendingDelete(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t('delete_failed'));
    } finally {
      setBusyId(null);
    }
  }

  const summary = useMemo(
    () => ({
      total: banners.length,
      published: banners.filter((b) => b.status === 'PUBLISHED').length,
      drafts: banners.filter((b) => b.status === 'DRAFT').length,
    }),
    [banners],
  );

  if (!mounted) {
    return <Skeleton className="h-80 rounded-2xl" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-3xl border border-border bg-white p-8 text-center shadow-sm">
        <ShieldAlert className="mx-auto h-10 w-10 text-primary" />
        <p className="mt-4 text-sm text-text-secondary">
          {t('admin_login_required')}
        </p>
        <div className="mt-5">
          <Link href="/auth/login">
            <Button>{tCommon('login')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="rounded-3xl border border-border bg-white p-8 text-center shadow-sm">
        <ShieldAlert className="mx-auto h-10 w-10 text-primary" />
        <p className="mt-4 text-sm text-text-secondary">{t('admin_only')}</p>
        <div className="mt-5">
          <Link href="/">
            <Button variant="outline">{t('back_home')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const dimensionsOk =
    preview &&
    preview.width === REQUIRED_WIDTH &&
    preview.height === REQUIRED_HEIGHT;

  return (
    <div className="space-y-6">
      {/* Summary chips */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ['summary_total', summary.total],
          ['summary_published', summary.published],
          ['summary_drafts', summary.drafts],
        ].map(([labelKey, value]) => (
          <div
            key={labelKey as string}
            className="rounded-2xl border border-border bg-bg-card p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
              {t(labelKey as any)}
            </p>
            <p className="mt-2 text-2xl font-bold text-text-primary">
              {value as number}
            </p>
          </div>
        ))}
      </div>

      {/* Upload card */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-text-primary">
            {t('upload_title')}
          </h2>
          <p className="text-sm text-text-secondary">
            {t('upload_subtitle', {
              required: `${REQUIRED_WIDTH}×${REQUIRED_HEIGHT}`,
            })}
          </p>
        </div>

        {!preview ? (
          <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-bg-card px-6 py-10 text-center cursor-pointer transition hover:border-primary/40 hover:bg-primary-light/30">
            <CloudUpload className="h-10 w-10 text-text-muted" />
            <span className="text-sm font-medium text-text-primary">
              {t('choose_file')}
            </span>
            <span className="text-xs text-text-muted">{t('accepted_types')}</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={(e) =>
                void handleFileSelected(e.target.files?.[0] ?? null)
              }
            />
          </label>
        ) : (
          <div className="space-y-3">
            <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl border border-border bg-bg-card">
              {/* preview is a blob URL — use raw img to skip the next/image
                  remotePatterns check */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.url}
                alt={t('preview_alt')}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p
                className={`text-xs font-medium ${
                  dimensionsOk ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {dimensionsOk
                  ? t('dimensions_ok', {
                      width: preview.width,
                      height: preview.height,
                    })
                  : t('dimensions_warn', {
                      required: `${REQUIRED_WIDTH}×${REQUIRED_HEIGHT}`,
                      actual: `${preview.width}×${preview.height}`,
                    })}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClearPreview}
                  disabled={uploading}
                >
                  {tCommon('cancel')}
                </Button>
                <Button
                  onClick={handleUpload}
                  loading={uploading}
                  disabled={!dimensionsOk || uploading}
                >
                  {uploading ? t('uploading') : t('upload_cta')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-text-primary">
          {t('list_title')}
        </h2>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-60 rounded-2xl" />
            ))}
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {loadError}
          </div>
        ) : banners.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-bg-card px-6 py-12 text-center">
            <ImageIcon className="mx-auto h-10 w-10 text-text-muted" />
            <h3 className="mt-3 text-base font-semibold text-text-primary">
              {t('empty_title')}
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              {t('empty_description')}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {banners.map((banner) => {
              const isPublished = banner.status === 'PUBLISHED';
              const isBusy = busyId === banner._id;
              const draft = positionDrafts[banner._id];
              const positionValue =
                draft !== undefined ? draft : String(banner.position);

              return (
                <article
                  key={banner._id}
                  className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm flex flex-col"
                >
                  <div className="relative w-full aspect-[16/9] bg-bg-card">
                    <Image
                      src={banner.imageUrl}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                    <span
                      className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isPublished
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-zinc-200 text-zinc-700'
                      }`}
                    >
                      {isPublished
                        ? t('status_published')
                        : t('status_draft')}
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                        {t('position_label')}
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={positionValue}
                        onChange={(e) =>
                          setPositionDrafts((d) => ({
                            ...d,
                            [banner._id]: e.target.value,
                          }))
                        }
                        className="w-20 rounded-md border border-border px-2 py-1 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                      />
                      {draft !== undefined &&
                        draft !== String(banner.position) && (
                          <Button
                            size="sm"
                            onClick={() => void handlePositionSave(banner)}
                            disabled={isBusy}
                          >
                            {t('save')}
                          </Button>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void handleToggleStatus(banner)}
                        disabled={isBusy}
                      >
                        {isPublished ? (
                          <span className="inline-flex items-center gap-1">
                            <EyeOff className="h-3.5 w-3.5" />
                            {t('action_unpublish')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {t('action_publish')}
                          </span>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPendingDelete(banner)}
                        disabled={isBusy}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <span className="inline-flex items-center gap-1">
                          <Trash2 className="h-3.5 w-3.5" />
                          {t('action_delete')}
                        </span>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">
              {t('delete_modal_title')}
            </h3>
            <p className="text-sm text-text-secondary">
              {t('delete_modal_description')}
            </p>
            <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg border border-border bg-bg-card">
              <Image
                src={pendingDelete.imageUrl}
                alt=""
                fill
                sizes="400px"
                className="object-cover"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setPendingDelete(null)}
                disabled={busyId === pendingDelete._id}
              >
                {tCommon('cancel')}
              </Button>
              <Button
                onClick={() => void handleDeleteConfirm()}
                loading={busyId === pendingDelete._id}
                className="bg-red-600 hover:bg-red-700"
              >
                {t('confirm_delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
