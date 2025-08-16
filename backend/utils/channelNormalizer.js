/**
 * Channel normalization utilities
 * Ensures consistent channel values across all models and services
 */

export const VALID_CHANNELS = ['email'];

/**
 * Normalizes channel value to lowercase format
 * @param {string} channel - The channel value to normalize
 * @returns {string} - Normalized lowercase channel value
 */
export const normalizeChannel = (channel) => {
  if (typeof channel !== 'string') {
    return channel;
  }
  
  const normalized = channel.toLowerCase();
  
  // Validate that it's a supported channel
  if (!VALID_CHANNELS.includes(normalized)) {
    console.warn(`Invalid channel value: ${channel}. Valid channels are: ${VALID_CHANNELS.join(', ')}`);
  }
  
  return normalized;
};

/**
 * Validates if a channel value is valid
 * @param {string} channel - The channel value to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidChannel = (channel) => {
  return VALID_CHANNELS.includes(normalizeChannel(channel));
};

/**
 * Channel enum for mongoose schemas
 */
export const CHANNEL_ENUM = VALID_CHANNELS;
