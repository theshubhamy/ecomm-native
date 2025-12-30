import { Share, Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Product } from '@/types';

interface ShareProductOptions {
  product: Product;
  message: string;
}

/**
 * Extracts file extension from URL
 */
function extractImageExtension(imageUrl: string): string {
  let imageExtension = 'jpg';
  try {
    const urlPath = imageUrl.split('?')[0]; // Remove query params
    const pathParts = urlPath.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart.includes('.')) {
      const extension = lastPart.split('.').pop()?.toLowerCase();
      if (
        extension &&
        ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)
      ) {
        imageExtension = extension === 'jpeg' ? 'jpg' : extension;
      }
    }
  } catch {
    // Default to jpg if extraction fails
    imageExtension = 'jpg';
  }
  return imageExtension;
}

/**
 * Downloads image from URL to cache directory
 */
async function downloadImage(
  imageUrl: string,
  fileName: string,
): Promise<{ success: boolean; fileUri?: string; error?: string }> {
  try {
    // Get cache directory URI (ensure it ends with /)
    const cacheDir =
      FileSystem.cacheDirectory || FileSystem.documentDirectory || '';
    if (!cacheDir) {
      return { success: false, error: 'Cache directory not available' };
    }
    const fileUri = `${cacheDir}${fileName}`;

    // Download the image using FileSystem.downloadAsync
    const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);

    if (downloadResult.status === 200 && downloadResult.uri) {
      return { success: true, fileUri: downloadResult.uri };
    } else {
      return {
        success: false,
        error: `Download failed with status: ${downloadResult.status}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Cleans up downloaded file
 */
async function cleanupFile(
  fileUri: string,
  delay: number = 10000,
): Promise<void> {
  return new Promise<void>(resolve => {
    setTimeout(async () => {
      try {
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
      } catch {
        // Cleanup error is not critical
        console.log('File cleanup skipped');
      } finally {
        resolve();
      }
    }, delay);
  });
}

/**
 * Shares product with image and details
 */
export async function shareProduct({
  product,
  message,
}: ShareProductOptions): Promise<void> {
  if (!product.imageUrl) {
    // No image, share text only
    try {
      await Share.share({
        message,
        title: product.name,
      });
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'Failed to share product. Please try again.',
      );
    }
    return;
  }

  try {
    // Extract image extension
    const imageExtension = extractImageExtension(product.imageUrl);
    const fileName = `product_${product.id}_${Date.now()}.${imageExtension}`;

    // Download the image
    const downloadResult = await downloadImage(product.imageUrl, fileName);

    if (!downloadResult.success || !downloadResult.fileUri) {
      // Download failed, share with URL
      await Share.share({
        message: `${message}\n\n${product.imageUrl}`,
        title: product.name,
        url: product.imageUrl,
      });
      return;
    }

    const fileUri = downloadResult.fileUri;

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();

    if (isAvailable) {
      if (Platform.OS === 'ios') {
        // iOS Share API can share both message and image together
        await Share.share({
          message,
          title: product.name,
          url: fileUri,
        });
      } else {
        // For Android, share image and text separately
        // Share image first (most important), then text details
        try {
          // Share image using expo-sharing (most reliable for images on Android)
          await Sharing.shareAsync(fileUri, {
            mimeType: `image/${imageExtension === 'png' ? 'png' : 'jpeg'}`,
            dialogTitle: `Share ${product.name}`,
            UTI: imageExtension === 'png' ? 'public.png' : 'public.jpeg',
          });

          // Share text message with details after image share completes
          // Wait longer to ensure image share dialog is fully processed and user has selected an app
          setTimeout(async () => {
            try {
              await Share.share({
                message,
                title: product.name,
              });
            } catch {
              // Text share failed, but image was shared
              console.log('Text share failed (image was shared successfully)');
            }
          }, 2000); // Increased delay for better reliability
        } catch (imageError) {
          // If image share fails, share message with image URL as fallback
          console.log('Image share failed, using fallback:', imageError);
          try {
            await Share.share({
              message: `${message}\n\nImage: ${product.imageUrl}`,
              title: product.name,
              url: product.imageUrl,
            });
          } catch {
            // Last resort: share text only
            await Share.share({
              message,
              title: product.name,
            });
          }
        }
      }

      // Clean up the downloaded file after a delay
      await cleanupFile(fileUri, 10000);
    } else {
      // Fallback: Share with URL and message
      await Share.share({
        message: `${message}\n\n${product.imageUrl}`,
        title: product.name,
        url: Platform.OS === 'ios' ? fileUri : product.imageUrl,
      });
    }
  } catch (error) {
    console.log('Error sharing product:', error);
    // Fallback to text + URL share
    try {
      await Share.share({
        message: `${message}\n\n${product.imageUrl}`,
        title: product.name,
        url: product.imageUrl,
      });
    } catch (shareError) {
      Alert.alert(
        'Error',
        shareError instanceof Error
          ? shareError.message
          : 'Failed to share product. Please try again.',
      );
    }
  }
}

/**
 * Creates a formatted message for sharing product details
 */
export function createProductShareMessage(product: Product): string {
  const priceText = product.price
    ? `₹${product.price.toFixed(0)}`
    : 'Price not available';

  // Create a well-formatted message with product details
  let message = `🛍️ Check out this amazing product!\n\n`;
  message += `📦 ${product.name}\n`;
  message += `💰 Price: ${priceText}\n`;

  // Add rating if available
  if (product.rating) {
    message += `⭐ Rating: ${product.rating.toFixed(1)}/5.0`;
    if (product.reviewCount !== undefined && product.reviewCount > 0) {
      message += ` (${product.reviewCount} reviews)`;
    }
    message += `\n`;
  }

  // Add stock status
  message += `📊 Status: ${
    product.inStock ? 'In Stock ✅' : 'Out of Stock ❌'
  }\n`;

  // Add description if available (truncate if too long)
  if (product.description) {
    const description =
      product.description.length > 200
        ? product.description.substring(0, 200) + '...'
        : product.description;
    message += `\n📄 ${description}`;
  }

  return message;
}
