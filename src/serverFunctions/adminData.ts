/**
 * Server-side admin data — categories and images stored in-memory.
 * These act as the "server source of truth" visible to all users.
 * Note: in-memory stores reset on cold-start but persist within warm instances.
 */
import { createServerFn } from '@tanstack/react-start';
import { validateAdminToken } from './adminAuth';

// ── In-memory stores ─────────────────────────────────────────────────────────

const _serverCategories: Array<{
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: number;
}> = [];

const _serverImages: Array<{
  catId: string;
  dataUrl: string;
  uploadedAt: number;
}> = [];

// ── Category CRUD ─────────────────────────────────────────────────────────────

export const getAdminCategories = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as { token: string; clientId: string })
  .handler(async ({ data }) => {
    const valid = await validateAdminToken(data.token, data.clientId);
    if (!valid) return { ok: false as const, categories: [] };
    return { ok: true as const, categories: [..._serverCategories] };
  });

export const saveAdminCategory = createServerFn({ method: 'POST' })
  .inputValidator(
    (d: unknown) =>
      d as {
        token: string;
        clientId: string;
        category: { id: string; name: string; icon: string; color: string };
      },
  )
  .handler(async ({ data }) => {
    const valid = await validateAdminToken(data.token, data.clientId);
    if (!valid) return { ok: false as const };
    const existing = _serverCategories.findIndex((c) => c.id === data.category.id);
    const entry = { ...data.category, createdAt: Date.now() };
    if (existing >= 0) _serverCategories[existing] = entry;
    else _serverCategories.push(entry);
    return { ok: true as const };
  });

export const deleteAdminCategory = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as { token: string; clientId: string; id: string })
  .handler(async ({ data }) => {
    const valid = await validateAdminToken(data.token, data.clientId);
    if (!valid) return { ok: false as const };
    const idx = _serverCategories.findIndex((c) => c.id === data.id);
    if (idx >= 0) _serverCategories.splice(idx, 1);
    return { ok: true as const };
  });

/** Public endpoint — no auth required. Returns server-persisted custom categories. */
export const getPublicCategories = createServerFn({ method: 'GET' }).handler(async () => {
  return { categories: [..._serverCategories] };
});

// ── Image store ───────────────────────────────────────────────────────────────

export const saveAdminImage = createServerFn({ method: 'POST' })
  .inputValidator(
    (d: unknown) => d as { token: string; clientId: string; catId: string; dataUrl: string },
  )
  .handler(async ({ data }) => {
    const valid = await validateAdminToken(data.token, data.clientId);
    if (!valid) return { ok: false as const };
    const idx = _serverImages.findIndex((i) => i.catId === data.catId);
    const entry = { catId: data.catId, dataUrl: data.dataUrl, uploadedAt: Date.now() };
    if (idx >= 0) _serverImages[idx] = entry;
    else _serverImages.push(entry);
    return { ok: true as const };
  });

export const deleteAdminImage = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as { token: string; clientId: string; catId: string })
  .handler(async ({ data }) => {
    const valid = await validateAdminToken(data.token, data.clientId);
    if (!valid) return { ok: false as const };
    const idx = _serverImages.findIndex((i) => i.catId === data.catId);
    if (idx >= 0) _serverImages.splice(idx, 1);
    return { ok: true as const };
  });

export const getAdminImages = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as { token: string; clientId: string })
  .handler(async ({ data }) => {
    const valid = await validateAdminToken(data.token, data.clientId);
    if (!valid) return { ok: false as const, images: [] };
    return { ok: true as const, images: [..._serverImages] };
  });
