#!/usr/bin/bun

import fs from 'node:fs/promises';
import path from 'node:path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const accessKeyId = process.env.ACCESS_KEY_ID;
if (!accessKeyId) {
  throw new Error('ACCESS_KEY_ID environment variable is not set');
}
const filePath = process.argv.at(0) || process.env.FILE_PATH;
if (!filePath) {
  throw new Error('FILE_PATH environment variable is not set');
}
const secretAccessKey = process.env.SECRET_ACCESS_KEY;
if (!secretAccessKey) {
  throw new Error('SECRET_ACCESS_KEY environment variable is not set');
}

const s3 = new S3Client({
  forcePathStyle: true, // Use path-style URLs for compatibility
  endpoint: 'https://sfo3.digitaloceanspaces.com', // Non-CDN endpoint
  region: 'sfo3',
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const uploadImage = () => {
  return fs
    .readFile(filePath)
    .then((fileContent) => {
      const fileName = path.basename(filePath);
      const command = new PutObjectCommand({
        Bucket: 'crispy', // Your Space name
        Key: fileName, // Object key
        Body: fileContent,
        ContentType: 'image/png', // Explicitly set for PNG images
        ACL: 'public-read', // Match the public access of the existing image
      });
      return s3.send(command);
    })
    .then(console.log)
    .catch(console.error);
};

uploadImage();
