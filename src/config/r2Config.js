import { S3Client } from "@aws-sdk/client-s3";
import { R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } from "./serverConfig.js";


export const r2 = new S3Client({
  region: "auto", // R2 doesn’t use fixed regions
  endpoint: R2_ENDPOINT, // your R2 endpoint
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});
