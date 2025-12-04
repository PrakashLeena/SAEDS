/**
 * Cloudinary Image Optimization Helper
 * Generates optimized Cloudinary URLs with WebP format, auto compression, and proper sizing
 */

/**
 * Optimize a Cloudinary image URL
 * @param {string} url - Original Cloudinary URL
 * @param {object} options - Optimization options
 * @param {number} options.width - Target width
 * @param {number} options.height - Target height
 * @param {string} options.format - Image format (default: 'webp')
 * @param {string} options.quality - Quality setting (default: 'auto')
 * @param {string} options.crop - Crop mode (default: 'fill')
 * @returns {string} Optimized Cloudinary URL
 */
export const optimizeCloudinaryUrl = (url, options = {}) => {
    if (!url || !url.includes('cloudinary.com')) {
        return url; // Return original if not a Cloudinary URL
    }

    const {
        width,
        height,
        format = 'webp',
        quality = 'auto',
        crop = 'fill',
    } = options;

    // Build transformation string
    const transformations = [];

    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (crop) transformations.push(`c_${crop}`);
    if (format) transformations.push(`f_${format}`);
    if (quality) transformations.push(`q_${quality}`);

    const transformString = transformations.join(',');

    // Insert transformations into URL
    // Pattern: https://res.cloudinary.com/<cloud>/image/upload/<transformations>/<path>
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return url;

    const beforeUpload = url.substring(0, uploadIndex + 8); // includes '/upload/'
    const afterUpload = url.substring(uploadIndex + 8);

    return `${beforeUpload}${transformString}/${afterUpload}`;
};

/**
 * Preset configurations for common image types
 */
export const imagePresets = {
    avatar: { width: 80, height: 80, crop: 'fill' },
    profileCard: { width: 150, height: 150, crop: 'fill' },
    thumbnail: { width: 200, height: 200, crop: 'fill' },
    hero: { width: 1340, height: 754, crop: 'fill' },
    card: { width: 400, height: 300, crop: 'fill' },
    gallery: { width: 600, height: 400, crop: 'fill' },
};

/**
 * Apply a preset to a Cloudinary URL
 * @param {string} url - Original Cloudinary URL
 * @param {string} presetName - Name of the preset (avatar, hero, etc.)
 * @returns {string} Optimized Cloudinary URL
 */
export const applyPreset = (url, presetName) => {
    const preset = imagePresets[presetName];
    if (!preset) {
        console.warn(`Preset "${presetName}" not found. Using original URL.`);
        return url;
    }
    return optimizeCloudinaryUrl(url, preset);
};
