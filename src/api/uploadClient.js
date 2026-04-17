import axios from "axios";

export const uploadFileToSignedUrl = async (url, file, onProgress) => {
  await axios.put(url, file, {
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    onUploadProgress: (e) => {
      if (!onProgress || !e.total) return;
      onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
};
