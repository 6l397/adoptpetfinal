import crypto from "crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const createSignature = (params, apiSecret) => {
  const payload = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto.createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
};

export const POST = async (request) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      {
        error:
          "Не налаштовано Cloudinary. Додайте CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY і CLOUDINARY_API_SECRET у .env.",
      },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Файл не передано." }, { status: 400 });
  }

  if (!file.type?.startsWith("image/")) {
    return NextResponse.json(
      { error: "Можна завантажувати тільки зображення." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Фото завелике. Максимальний розмір - 5 МБ." },
      { status: 400 }
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    folder: "adoptpet",
    timestamp,
  };
  const signature = createSignature(params, apiSecret);
  const uploadData = new FormData();

  uploadData.append("file", file, file.name);
  uploadData.append("api_key", apiKey);
  uploadData.append("folder", params.folder);
  uploadData.append("timestamp", String(timestamp));
  uploadData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: uploadData,
    }
  );
  const result = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: result?.error?.message || "Cloudinary не прийняв фото." },
      { status: response.status }
    );
  }

  return NextResponse.json({
    url: result.secure_url,
    publicId: result.public_id,
  });
};
