const allowed = ["image/png", "image/jpeg", "image/webp"];

export function readImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    if (!allowed.includes(file.type)) {
      reject(new Error("Use a PNG, JPG, or WebP image."));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("Keep the image under 5 MB."));
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const max = 640;
      const scale = Math.min(1, max / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read that image."));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const data =
        file.type === "image/jpeg"
          ? canvas.toDataURL("image/jpeg", 0.86)
          : canvas.toDataURL("image/png");
      URL.revokeObjectURL(url);
      resolve(data);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    image.src = url;
  });
}
