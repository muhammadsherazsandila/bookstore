import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";

const cloudinaryConfig: {
  cloud_name?: string;
  api_key?: string;
  api_secret?: string;
} = {};

if (env.CLOUDINARY_CLOUD_NAME) {
  cloudinaryConfig.cloud_name = env.CLOUDINARY_CLOUD_NAME;
}
if (env.CLOUDINARY_API_KEY) {
  cloudinaryConfig.api_key = env.CLOUDINARY_API_KEY;
}
if (env.CLOUDINARY_API_SECRET) {
  cloudinaryConfig.api_secret = env.CLOUDINARY_API_SECRET;
}

cloudinary.config(cloudinaryConfig);

export default cloudinary;
