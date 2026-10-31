/**
 * Adsgram SDK Controller Utility for Telegram Mini Apps
 * Official Documentation: https://adsgram.ai
 */

// User's Interstitial Block ID
export const ADSGRAM_INTERSTITIAL_BLOCK_ID = 'int-57158';

/**
 * Show Adsgram Interstitial Ad
 * @param {string} blockId - Adsgram Interstitial Block ID (default: 'int-57158')
 * @returns {Promise<{ done: boolean, error?: boolean, description?: string }>}
 */
export const showAdsgramInterstitialAd = async (blockId = ADSGRAM_INTERSTITIAL_BLOCK_ID) => {
  if (typeof window === 'undefined') {
    return { done: false, error: true, description: 'Window not defined' };
  }

  // Check if Adsgram is available on window
  if (window.Adsgram) {
    try {
      const controller = window.Adsgram.init({ blockId });
      const result = await controller.show();
      return { done: true, result };
    } catch (err) {
      console.warn('Adsgram interstitial closed or failed:', err);
      return {
        done: false,
        error: true,
        description: err?.description || 'Ad closed or failed to load'
      };
    }
  }

  console.warn('Adsgram SDK not loaded or blocked.');
  return { done: false, error: true, description: 'Adsgram SDK not loaded' };
};
