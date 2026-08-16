import { useRef, useState } from "react";
import type { CloudinarySignResponse } from "./types";
import { apiClient } from "@/shared/api/client";
import styles from "./brand.module.css";

interface ImageUploadSlotProps {
  label: string;
  currentUrl: string | null;
  onUploaded: (url: string) => void;
  /** Shown behind the preview so light/dark logo variants stay legible while editing. */
  previewBackground?: "light" | "dark";
}

/**
 * A single logo upload slot: shows the current image, lets the admin pick a
 * replacement, signs the upload via the B6 media endpoint (POST /api/media/sign),
 * then uploads directly to Cloudinary from the browser so the file never
 * round-trips through our own API.
 */
export function ImageUploadSlot({
  label,
  currentUrl,
  onUploaded,
  previewBackground = "light",
}: ImageUploadSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);
    try {
      const signature = await apiClient.post<CloudinarySignResponse>(
        "/api/media/sign",
        { folder: "brand" }
      );

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", signature.api_key);
      form.append("timestamp", String(signature.timestamp));
      form.append("signature", signature.signature);
      if (signature.folder) form.append("folder", signature.folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signature.cloud_name}/image/upload`,
        { method: "POST", body: form }
      );

      if (!uploadRes.ok) {
        throw new Error("Upload to Cloudinary failed.");
      }

      const data = (await uploadRes.json()) as { secure_url: string };
      onUploaded(data.secure_url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't upload that image."
      );
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={styles.uploadSlot}>
      <span className={styles.uploadLabel}>{label}</span>
      <div
        className={styles.uploadPreview}
        data-background={previewBackground}
      >
        {currentUrl ? (
          <img src={currentUrl} alt={label} />
        ) : (
          <span className={styles.uploadPlaceholder}>No image set</span>
        )}
      </div>
      <button
        type="button"
        className={styles.uploadButton}
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? "Uploading…" : currentUrl ? "Replace" : "Upload"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        hidden
      />
      {error && <p className={styles.uploadError}>{error}</p>}
    </div>
  );
}
