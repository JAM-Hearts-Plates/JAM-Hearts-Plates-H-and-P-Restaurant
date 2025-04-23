import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// if (!process.env.CLOUDINARY_API_SECRET) {
//   throw new Error("Missing Cloudinary API Secret in environment variables");
// }

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

export const menuPicturesUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "HeartsnPlates/Menu",
      allowed_formats: ["jpg", "jpeg", "png"],
      transformation: [{ width: 500, height: 500, crop: "limit" }],
    },
  }),
});


