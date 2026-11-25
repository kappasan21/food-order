"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/format";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string;
};

type FormState = {
  name: string;
  description: string;
  priceDisplay: string;
  imageUrl: string;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  priceDisplay: "",
  imageUrl: "",
};

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // add form
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<FormState>(emptyForm);
  const [addError, setAddError] = useState<string | null>(null);
  const [addBusy, setAddBusy] = useState(false);

  // edit form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [editError, setEditError] = useState<string | null>(null);
  const [editBusy, setEditBusy] = useState(false);

  // delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // upload
  const [uploadBusy, setUploadBusy] = useState(false);
  const addFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      const res = await fetch("/api/menu");
      const data = (await res.json()) as MenuItem[] | { error: string };
      if (!res.ok) throw new Error("error" in data ? data.error : "Failed to load");
      setItems(data as MenuItem[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load menu");
    } finally {
      setIsLoading(false);
    }
  }

  async function uploadImage(file: File): Promise<string | null> {
    setUploadBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      return data.url ?? null;
    } catch (e) {
      return null;
    } finally {
      setUploadBusy(false);
    }
  }

  async function handleAddFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) setAddForm((f) => ({ ...f, imageUrl: url }));
    else setAddError("Image upload failed. Try again.");
  }

  async function handleEditFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) setEditForm((f) => ({ ...f, imageUrl: url }));
    else setEditError("Image upload failed. Try again.");
  }

  function parsePriceCents(display: string): number | null {
    const val = parseFloat(display.replace(/[^0-9.]/g, ""));
    if (isNaN(val) || val <= 0) return null;
    return Math.round(val * 100);
  }

  async function submitAdd() {
    setAddError(null);
    const priceCents = parsePriceCents(addForm.priceDisplay);
    if (!addForm.name.trim()) return setAddError("Name is required");
    if (!addForm.description.trim()) return setAddError("Description is required");
    if (!priceCents) return setAddError("Enter a valid price (e.g. 12.50)");
    if (!addForm.imageUrl) return setAddError("Upload an image first");

    setAddBusy(true);
    try {
      const res = await fetch("/api/admin/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name.trim(),
          description: addForm.description.trim(),
          priceCents,
          imageUrl: addForm.imageUrl,
        }),
      });
      const data = (await res.json()) as MenuItem | { error: string };
      if (!res.ok) throw new Error("error" in data ? data.error : "Failed to create");
      setItems((prev) => [...prev, data as MenuItem]);
      setAddForm(emptyForm);
      setShowAdd(false);
    } catch (e) {
      setAddError(e instanceof Error ? e.message : "Failed to create item");
    } finally {
      setAddBusy(false);
    }
  }

  function startEdit(item: MenuItem) {
    setEditingId(item.id);
    setEditForm({
      name: item.name,
      description: item.description,
      priceDisplay: (item.priceCents / 100).toFixed(2),
      imageUrl: item.imageUrl,
    });
    setEditError(null);
  }

  async function submitEdit() {
    if (!editingId) return;
    setEditError(null);
    const priceCents = parsePriceCents(editForm.priceDisplay);
    if (!editForm.name.trim()) return setEditError("Name is required");
    if (!editForm.description.trim()) return setEditError("Description is required");
    if (!priceCents) return setEditError("Enter a valid price (e.g. 12.50)");
    if (!editForm.imageUrl) return setEditError("An image URL is required");

    setEditBusy(true);
    try {
      const res = await fetch(`/api/admin/menu/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          description: editForm.description.trim(),
          priceCents,
          imageUrl: editForm.imageUrl,
        }),
      });
      const data = (await res.json()) as MenuItem | { error: string };
      if (!res.ok) throw new Error("error" in data ? data.error : "Failed to update");
      setItems((prev) =>
        prev.map((it) => (it.id === editingId ? (data as MenuItem) : it)),
      );
      setEditingId(null);
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Failed to update item");
    } finally {
      setEditBusy(false);
    }
  }

  async function deleteItem(item: MenuItem) {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setDeletingId(item.id);
    try {
      const res = await fetch(`/api/admin/menu/${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setItems((prev) => prev.filter((it) => it.id !== item.id));
    } catch {
      alert("Failed to delete item");
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) return <p className="text-stone-600">Loading menu...</p>;
  if (error) return <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-red-700">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-900">Menu</h1>
          <p className="mt-1 text-stone-500">{items.length} items</p>
        </div>
        <button
          type="button"
          onClick={() => { setShowAdd(true); setAddForm(emptyForm); setAddError(null); }}
          className="rounded-full bg-red-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-800"
        >
          + Add item
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-stone-900">New menu item</h2>
          <MenuItemForm
            form={addForm}
            onChange={setAddForm}
            onFileChange={handleAddFileChange}
            fileRef={addFileRef}
            uploadBusy={uploadBusy}
            error={addError}
            busy={addBusy}
            onSubmit={submitAdd}
            onCancel={() => setShowAdd(false)}
            submitLabel="Add item"
          />
        </div>
      )}

      {/* Item list */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"
          >
            {editingId === item.id ? (
              <div>
                <h2 className="mb-4 text-sm font-semibold text-stone-700">Editing: {item.name}</h2>
                <MenuItemForm
                  form={editForm}
                  onChange={setEditForm}
                  onFileChange={handleEditFileChange}
                  fileRef={editFileRef}
                  uploadBusy={uploadBusy}
                  error={editError}
                  busy={editBusy}
                  onSubmit={submitEdit}
                  onCancel={() => setEditingId(null)}
                  submitLabel="Save changes"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-2xl sm:h-16 sm:w-24">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-stone-900">{item.name}</p>
                  <p className="text-sm text-stone-500">{item.description}</p>
                  <p className="mt-1 text-sm font-medium text-red-700">
                    {formatPrice(item.priceCents)}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="rounded-full border border-stone-300 px-4 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteItem(item)}
                    disabled={deletingId === item.id}
                    className="rounded-full border border-red-200 px-4 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === item.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {items.length === 0 && !showAdd && (
        <p className="text-stone-500">No menu items yet. Add one above.</p>
      )}
    </div>
  );
}

type MenuItemFormProps = {
  form: FormState;
  onChange: (f: FormState) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
  uploadBusy: boolean;
  error: string | null;
  busy: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
};

function MenuItemForm({
  form, onChange, onFileChange, fileRef, uploadBusy, error, busy, onSubmit, onCancel, submitLabel,
}: MenuItemFormProps) {
  const field = "block text-sm font-medium text-stone-700";
  const input = "mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300";

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={field}>Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            placeholder="Pizza Margherita"
            className={input}
          />
        </div>
        <div>
          <label className={field}>Price (USD)</label>
          <input
            type="text"
            value={form.priceDisplay}
            onChange={(e) => onChange({ ...form, priceDisplay: e.target.value })}
            placeholder="12.50"
            className={input}
          />
        </div>
      </div>

      <div>
        <label className={field}>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          rows={3}
          placeholder="Describe the dish..."
          className={input}
        />
      </div>

      <div>
        <label className={field}>Image</label>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploadBusy}
            className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
          >
            {uploadBusy ? "Uploading..." : "Choose image"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={onFileChange}
            className="hidden"
          />
          {form.imageUrl && (
            <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-stone-200">
              <Image src={form.imageUrl} alt="Preview" fill className="object-cover" sizes="56px" />
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={busy || uploadBusy}
          className="rounded-full bg-red-700 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-800 disabled:opacity-60"
        >
          {busy ? "Saving..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-stone-300 px-5 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
