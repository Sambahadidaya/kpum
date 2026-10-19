'use server';

import sharp from 'sharp';
import { nanoid } from 'nanoid';
import { supabaseAdmin } from '@/lib/supabase';
import { requirePanitiaPermission } from '@/utils/supabaseUtils';

const BUCKET_NAME = 'kandidat';

/**
 * Server Action: Mengompres foto menggunakan Sharp dan mengunggah ke Supabase Storage
 * @param {FormData} formData
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export async function uploadFotoKandidat(formData) {
  try {
    // Pastikan hanya panitia yang memiliki izin kandidat yang bisa upload
    await requirePanitiaPermission('kandidat');

    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return { success: false, error: 'File gambar tidak ditemukan atau tidak valid.' };
    }

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Format file harus berupa JPG, PNG, atau WEBP.' };
    }

    // Ambil array buffer dari file
    const bytes = await file.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);

    // Kompresi gambar menggunakan Sharp (resize max 1080px, convert ke webp kualitas 80%)
    const compressedBuffer = await sharp(inputBuffer)
      .resize({
        width: 1080,
        height: 1080,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

    const fileName = `kandidat-${nanoid(10)}-${Date.now()}.webp`;
    const filePath = `foto/${fileName}`;

    // Upload buffer ke Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, compressedBuffer, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: `Gagal mengunggah foto ke storage: ${uploadError.message}` };
    }

    // Dapatkan URL publik file
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      path: filePath,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat memproses dan mengompres gambar.',
    };
  }
}

/**
 * Server Action: Menghapus file foto dari Supabase Storage jika diperlukan
 * @param {string} fileUrl
 */
export async function deleteFotoKandidat(fileUrl) {
  try {
    await requirePanitiaPermission('kandidat');

    if (!fileUrl) return { success: false };

    // Ekstrak path setelah bucket name
    const marker = `${BUCKET_NAME}/`;
    const index = fileUrl.indexOf(marker);
    if (index === -1) return { success: false };

    const filePath = fileUrl.substring(index + marker.length);

    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

const BUCKET_PANITIA = 'panitia';

/**
 * Server Action: Mengompres foto panitia menggunakan Sharp dan mengunggah ke Supabase Storage (bucket: panitia)
 * Mendukung format PNG transparan secara utuh maupun JPG/WEBP.
 * @param {FormData} formData
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export async function uploadFotoPanitia(formData) {
  try {
    await requirePanitiaPermission('panitia');

    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return { success: false, error: 'File gambar tidak ditemukan atau tidak valid.' };
    }

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Format file harus berupa JPG, PNG, atau WEBP.' };
    }

    // Ambil array buffer dari file
    const bytes = await file.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);

    const isPng = file.type === 'image/png' || file.name?.toLowerCase().endsWith('.png');

    let compressedBuffer;
    let fileName;
    let contentType;

    if (isPng) {
      // Pertahankan transparansi PNG penuh
      compressedBuffer = await sharp(inputBuffer)
        .resize({
          width: 1200,
          height: 1200,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .png({ quality: 90, compressionLevel: 8 })
        .toBuffer();

      fileName = `panitia-${nanoid(10)}-${Date.now()}.png`;
      contentType = 'image/png';
    } else {
      // Kompresi ke format WebP untuk format selain PNG
      compressedBuffer = await sharp(inputBuffer)
        .resize({
          width: 1200,
          height: 1200,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer();

      fileName = `panitia-${nanoid(10)}-${Date.now()}.webp`;
      contentType = 'image/webp';
    }

    const filePath = `foto/${fileName}`;

    // Upload buffer ke Supabase Storage bucket 'panitia'
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_PANITIA)
      .upload(filePath, compressedBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: `Gagal mengunggah foto ke storage: ${uploadError.message}` };
    }

    // Dapatkan URL publik file
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BUCKET_PANITIA)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      path: filePath,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat memproses dan mengompres gambar.',
    };
  }
}

/**
 * Server Action: Mengompres gambar background panitia dan mengunggah ke Supabase Storage (bucket: panitia)
 * @param {FormData} formData
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export async function uploadBgPanitia(formData) {
  try {
    await requirePanitiaPermission('panitia');

    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return { success: false, error: 'File gambar background tidak ditemukan atau tidak valid.' };
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Format file background harus berupa JPG, PNG, atau WEBP.' };
    }

    const bytes = await file.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);

    // Kompresi ke format WebP dengan lebar hingga 1600px
    const compressedBuffer = await sharp(inputBuffer)
      .resize({
        width: 1600,
        height: 1200,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

    const fileName = `bg-${nanoid(10)}-${Date.now()}.webp`;
    const filePath = `bg/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_PANITIA)
      .upload(filePath, compressedBuffer, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: `Gagal mengunggah gambar background ke storage: ${uploadError.message}` };
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BUCKET_PANITIA)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      path: filePath,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat memproses gambar background.',
    };
  }
}

/**
 * Server Action: Menghapus file foto atau gambar background panitia dari Supabase Storage jika diperlukan
 * @param {string} fileUrl
 */
export async function deleteFotoPanitia(fileUrl) {
  try {
    await requirePanitiaPermission('panitia');

    if (!fileUrl) return { success: false };

    // Ekstrak path setelah bucket name
    const marker = `${BUCKET_PANITIA}/`;
    const index = fileUrl.indexOf(marker);
    if (index === -1) return { success: false };

    const filePath = fileUrl.substring(index + marker.length);

    const { error } = await supabaseAdmin.storage
      .from(BUCKET_PANITIA)
      .remove([filePath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


