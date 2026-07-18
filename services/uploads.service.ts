export async function uploadPropertyImages(files: FileList | File[]) {
  const form = new FormData();
  Array.from(files).forEach((file) => form.append("files", file));

  const response = await fetch("/api/uploads/images", {
    method: "POST",
    credentials: "include",
    body: form,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || "Upload failed");
  }

  return (payload.data?.urls ?? payload.urls ?? []) as string[];
}
