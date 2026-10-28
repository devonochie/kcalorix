/** Shrinks a photo to a JPEG (max 1600px) so it stays under the backend's 5 MB limit. */
export async function prepareImage(file: File, maxSide = 1600): Promise<Blob> {
    if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
    let bitmap: ImageBitmap;
    try {
        bitmap = await createImageBitmap(file);
    } catch {
        throw new Error("Couldn't read that photo. Try another one.");
    }
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Couldn't read that photo. Try another one.");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob) throw new Error("Couldn't read that photo. Try another one.");
    if (blob.size > 5 * 1024 * 1024) throw new Error("That photo is too large. Try a smaller one.");
    return blob;
}