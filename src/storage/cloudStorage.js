// // import IPYQStorage from "../interface/IPYQStorage.js";
// // import { r2 } from "../config/r2Config.js";
// // import { PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
// // import { R2_BUCKET } from "../config/serverConfig.js";
// // import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// // class cloudStorage extends IPYQStorage {
// //   async uploadFile(file) {
// //     try {
// //       const mimetype = file.mimetype;
// //       const key = `campus-hub/uploads/${Date.now()}-${file.originalname}`; // Generate a unique key for the file in the cloud storage
// //       // create put objcet commmand
// //       const command = new PutObjectCommand({
// //         Bucket: R2_BUCKET,
// //         Key: key,
// //         Body: file.buffer,
// //         ContentType: mimetype,
// //       });
// //       // this is presigned url
// //       const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 600 });
// //       console.log("uploadUrl", uploadUrl);

// //       // Upload the file to the cloud storage using presigned url
// //       const contentLength = file.buffer.length;
// //       const uploadResponse = await fetch(uploadUrl, {
// //         method: "PUT",
// //         headers: {
// //           "Content-Type": mimetype,
// //           "Content-Length": contentLength.toString(), // ✅ MUST match
// //         },
// //         body: file.buffer,
// //       });
// //       console.log("uploadResponse", uploadResponse);

// //       if (!uploadResponse.ok) {
// //         throw new Error(`Upload failed with status: ${uploadResponse.status}`);
// //       }

// //       // verify the file uploaded successfuly
// //       const headCommand = new HeadObjectCommand({
// //         Bucket: R2_BUCKET,
// //         Key: key,
// //       });

// //       const metadata = await r2.send(headCommand);
// //       if (!metadata) throw new Error("File not found");

// //       return `${R2_PUBLIC_URL}/${encodeURIComponent(key)}`;
// //     } catch (error) {
// //       console.error("Cloudflare R2 upload error:", error);
// //       throw new Error(`File upload failed: ${error.message}`);
// //     }
// //   }
// //   async getFileUrl(fileId) {
// //     // Implement logic to get the file URL from the cloud storage using the fileId
// //     return `https://cloudstorage.com/${fileId}`; // Placeholder
// //   }
// // }
// // export default cloudStorage;


// // src/storage/cloudStorage.js
// working with presigned url but fetching url not tested via frontend ......
// import IPYQStorage from "../interface/IPYQStorage.js";
// import { r2 } from "../config/r2Config.js";
// import { PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
// import { R2_BUCKET, R2_PUBLIC_URL } from "../config/serverConfig.js";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// class cloudStorage extends IPYQStorage {
//   /**
//    * Step 1: Generate a presigned URL for client to upload directly to R2
//    */
//   async uploadFile(file) {
//     try {
//       const mimetype = file.mimetype;
//       const key = `campus-hub/uploads/${Date.now()}-${file.originalname}`;

//       // Prepare S3 PutObject command
//       const command = new PutObjectCommand({
//         Bucket: R2_BUCKET,
//         Key: key,
//         ContentType: mimetype,
//       });

//       // ✅ Generate presigned URL (valid for 10 min)
//       const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 600 });
//        console.log(uploadUrl)
//       // ⚡ Return both the presigned URL & final file URL
//       return {
//         uploadUrl,
      
//         fileUrl: `${R2_PUBLIC_URL}/${encodeURIComponent(key)}`,
//         key,
//       };
//     } catch (error) {
//       console.error("Cloudflare R2 presigned URL error:", error);
//       throw new Error(`Presigned URL generation failed: ${error.message}`);
//     }
//   }

//   /**
//    * Step 2: Verify file exists in R2 (after client uploads)
//    */
//   async verifyFile(key) {
//     try {
//       const headCommand = new HeadObjectCommand({
//         Bucket: R2_BUCKET,
//         Key: key,
//       });

//       const metadata = await r2.send(headCommand);
//       return {
//         exists: true,
//         size: metadata.ContentLength,
//         contentType: metadata.ContentType,
//       };
//     } catch (err) {
//       if (err.name === "NotFound") {
//         return { exists: false };
//       }
//       throw err;
//     }
//   }

//   async getFileUrl(fileId) {
//     return `${R2_PUBLIC_URL}/${encodeURIComponent(fileId)}`;
//   }
// }

// export default cloudStorage;

// src/storage/cloudStorage.js
//completeluy working without presigned url
import IPYQStorage from "../interface/IPYQStorage.js";
import { r2 } from "../config/r2Config.js";
import { PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { R2_BUCKET, R2_PUBLIC_URL } from "../config/serverConfig.js";

class cloudStorage extends IPYQStorage {
  async uploadFile(file) {
    try {
      const mimetype = file.mimetype;
      const key = `campus-hub/uploads/${Date.now()}-${file.originalname}`;

      // ✅ Direct upload (no presigned URL)
      const command = new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: file.buffer, // file bytes
        ContentType: mimetype,
      });

      // upload directly to R2
      await r2.send(command);

      // Optional: verify file exists
      const headCommand = new HeadObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      });
      await r2.send(headCommand);

      // Return public URL
      return `${R2_PUBLIC_URL}/${encodeURIComponent(key)}`;
    } catch (error) {
      console.error("Cloudflare R2 upload error:", error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  async getFileUrl(fileId) {
    return `${R2_PUBLIC_URL}/${fileId}`;
  }
}

export default cloudStorage;
