/**
 * Gigapub SDK Controller Utility for Telegram Mini Apps
 * Script ID: 8909
 * Documentation: https://giga.pub
 */

/**
 * Show Gigapub Rewarded / Interstitial Ad
 * @returns {Promise<{ done: boolean, error?: boolean, description?: string }>}
 */
export const showGigaPubAd = async () => {
  if (typeof window === 'undefined') {
    return { done: false, error: true, description: 'Window not defined' };
  }

  if (typeof window.showGiga === 'function') {
    try {
      await window.showGiga();
      return { done: true };
    } catch (err) {
      console.warn('Gigapub ad closed or failed to display:', err);
      return {
        done: false,
        error: true,
        description: err?.message || 'Ad closed or failed to display'
      };
    }
  }

  console.warn('Gigapub SDK not ready or showGiga is undefined.');
  return { done: false, error: true, description: 'Gigapub SDK not loaded' };
};

