// ─── Cloudinary upload via unsigned upload preset ────────────────────────────
// Add to .env.local:
//   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
//   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=postora_unsigned

const CLOUD_NAME   = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

export interface CloudinaryResult {
  publicId:   string;
  url:        string;
  secureUrl:  string;
  format:     string;
  resourceType: "image" | "video" | "raw";
  bytes:      number;
  width?:     number;
  height?:    number;
  duration?:  number;
}

// ─── Upload a single file ─────────────────────────────────────────────────────
export async function uploadToCloudinary(
  file: File,
  folder = "postora/media",
  onProgress?: (pct: number) => void
): Promise<CloudinaryResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file",           file);
    formData.append("upload_preset",  UPLOAD_PRESET);
    formData.append("folder",         folder);

    const resourceType = file.type.startsWith("video") ? "video" : "image";
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    // Track upload progress
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        resolve({
          publicId:     res.public_id,
          url:          res.url,
          secureUrl:    res.secure_url,
          format:       res.format,
          resourceType: res.resource_type,
          bytes:        res.bytes,
          width:        res.width,
          height:       res.height,
          duration:     res.duration,
        });
      } else {
        reject(new Error(`Cloudinary upload failed: ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(formData);
  });
}

// ─── Delete from Cloudinary (requires server-side signed request) ─────────────
// Call your API route /api/cloudinary/delete — never expose your API secret client-side
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  const res = await fetch("/api/cloudinary/delete", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ publicId }),
  });
  if (!res.ok) throw new Error("Failed to delete from Cloudinary");
}

// ─── Get optimised URL ────────────────────────────────────────────────────────
export function getCloudinaryUrl(
  publicId: string,
  options: { width?: number; height?: number; quality?: number; format?: string } = {}
): string {
  const { width, height, quality = 80, format = "auto" } = options;
  const transforms = [
    width    ? `w_${width}`    : null,
    height   ? `h_${height}`   : null,
    `q_${quality}`,
    `f_${format}`,
    "c_fill",
  ].filter(Boolean).join(",");

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`;
}

// ─── Format bytes to human-readable ──────────────────────────────────────────
export function formatBytes(bytes: number): string {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}