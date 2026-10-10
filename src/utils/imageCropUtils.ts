/**
 * Utility functions for client-side image cropping and background WebP compression
 */

export interface PixelCrop {
    x: number
    y: number
    width: number
    height: number
}

/**
 * Loads an HTML Image element from a data URL or object URL safely with CORS support
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', (error) => reject(error))
        image.setAttribute('crossOrigin', 'anonymous')
        image.src = url
    })

/**
 * Crops an image according to pixel coordinates from react-easy-crop,
 * scales it to target max dimensions, and compresses it in the background to WebP.
 */
export async function getCroppedImg(
    imageSrc: string,
    pixelCrop: PixelCrop,
    targetMaxW = 1200,
    targetMaxH = 1200,
    quality = 0.85
): Promise<File> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
        throw new Error('Failed to create canvas 2D rendering context')
    }

    // Determine destination dimensions preserving aspect ratio
    let destWidth = Math.max(1, Math.round(pixelCrop.width))
    let destHeight = Math.max(1, Math.round(pixelCrop.height))

    if (destWidth > targetMaxW) {
        destHeight = Math.round((destHeight * targetMaxW) / destWidth)
        destWidth = targetMaxW
    }
    if (destHeight > targetMaxH) {
        destWidth = Math.round((destWidth * targetMaxH) / destHeight)
        destHeight = targetMaxH
    }

    canvas.width = destWidth
    canvas.height = destHeight

    // Smooth scaling
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Draw cropped region from source image onto scaled canvas
    ctx.drawImage(
        image,
        Math.max(0, pixelCrop.x),
        Math.max(0, pixelCrop.y),
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        destWidth,
        destHeight
    )

    // Convert to modern WebP blob with graceful fallback to JPEG
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    const file = new File([blob], `cropped-${Date.now()}.webp`, { type: 'image/webp' })
                    resolve(file)
                } else {
                    canvas.toBlob(
                        (fallbackBlob) => {
                            if (!fallbackBlob) {
                                return reject(new Error('Canvas image rendering failed'))
                            }
                            const fallbackFile = new File([fallbackBlob], `cropped-${Date.now()}.jpg`, {
                                type: 'image/jpeg'
                            })
                            resolve(fallbackFile)
                        },
                        'image/jpeg',
                        quality
                    )
                }
            },
            'image/webp',
            quality
        )
    })
}
