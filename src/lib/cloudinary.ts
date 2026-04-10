export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Uploads a file directly to Cloudinary from the browser.
 * Relies on Unsigned Uploads being enabled on the Upload Preset.
 */
export const uploadToCloudinary = async (file: File): Promise<{ url: string; public_id: string }> => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        throw new Error('Cloudinary environment variables are missing.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Failed to upload to Cloudinary');
    }

    const data = await res.json();
    return {
        url: data.secure_url,
        public_id: data.public_id,
    };
};

/**
 * Helper to generate an optimized Cloudinary URL for an image.
 * e.g., auto format, auto quality.
 */
export const getOptimizedImageUrl = (url: string, width?: number): string => {
    // Basic Cloudinary URL structure: https://res.cloudinary.com/<cloud_name>/image/upload/<transformations>/v<version>/<public_id>
    // We can inject transformations after 'upload/' if it's a valid cloudinary URL
    if (url.includes('/upload/')) {
        const transformations = ['f_auto', 'q_auto'];
        if (width) {
            transformations.push(`w_${width}`);
            transformations.push('c_limit');
        }
        return url.replace('/upload/', `/upload/${transformations.join(',')}/`);
    }
    return url;
};
