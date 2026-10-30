import { createClient } from '@/lib/supabase/client'

const BUCKET = 'media'
const MAX_SOURCE_BYTES = 10 * 1024 * 1024

/** Downscale an image to at most `maxEdge` px on its longest side and re-encode as JPEG. */
export function resizeImage(file: File, maxEdge = 1000, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      URL.revokeObjectURL(url)
      if (!ctx) return reject(new Error('Could not process image'))
      ctx.fillStyle = '#ffffff' // flatten transparent PNGs onto white
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not process image'))), 'image/jpeg', quality)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('This file is not a readable image'))
    }
    img.src = url
  })
}

/** Throws a user-friendly error if `file` is not an acceptable image. */
export function validateImageFile(file: File) {
  if (!file.type.startsWith('image/')) throw new Error('Please upload an image file (JPG, PNG or WebP).')
  if (file.size > MAX_SOURCE_BYTES) throw new Error('Image is larger than 10 MB. Please choose a smaller photo.')
}

/**
 * Uploads an (already resized) image to Supabase Storage and returns its public CDN URL.
 * Only admins can upload (enforced by storage policies).
 */
export async function uploadImage(blob: Blob, folder: 'products' | 'logos'): Promise<string> {
  const supabase = createClient()
  const path = `${folder}/${crypto.randomUUID()}.jpg`
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: 'image/jpeg',
    cacheControl: '31536000', // file names are unique, so they can be cached for a year
    upsert: false,
  })
  if (error) throw new Error(`Photo upload failed: ${error.message}`)
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}
