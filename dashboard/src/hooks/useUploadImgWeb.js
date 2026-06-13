import { useState } from "react";

export function useUploadImgWeb() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadImage = async (file) => {
    setUploading(true);
    setError(null);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "image-bus");
      data.append("cloud_name", "dcxvjjx57");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dcxvjjx57/image/upload",
        {
          method: "POST",
          body: data,
        },
      );

      if (!response.ok) {
        throw new Error(
          result.error?.message || "Error al subir la imagen a Cloudinary",
        );
      }

      const result = await response.json();
      return { success: true, url: result.secure_url };
    } catch (err) {
      console.error("Error uploading image: ", err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading, error };
}
