/* ---------------------------------------------------------------------------
 * Shell and theme
 * ------------------------------------------------------------------------ */

/** On <html> while a route renders; see styles.css and App. */
export const ROUTE_ENTER_CLASS = 'route-entering';
/** How long after navigation enter animations stay suppressed. */
export const ROUTE_SETTLE_MS = 300;

export const THEME_DARK_CLASS = 'dark';
export const THEME_STORAGE_KEY = 'darkMode';
/** On <html> for one frame while the theme switches; see styles.css. */
export const THEME_SWAP_CLASS = 'theme-switching';

/* ---------------------------------------------------------------------------
 * UI timing and thresholds
 * ------------------------------------------------------------------------ */

/** How long a "Copied" confirmation shows before the button resets. */
export const COPIED_RESET_MS = 2000;

/** Above this share of capacity the meter turns amber as an early warning. */
export const CAPACITY_WARN_AT = 0.85;

/* ---------------------------------------------------------------------------
 * Passwords
 * ------------------------------------------------------------------------ */

export const STRENGTH_LABELS = ['Weak', 'Fair', 'Good', 'Strong'] as const;
/** Upper bounds (exclusive) in bits for weak, fair and good. */
export const STRENGTH_LIMITS = [36, 60, 80];

/** No 0/O, 1/l/I: easy to read aloud or copy by hand. */
export const PASSWORD_CHARSET =
  'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/* ---------------------------------------------------------------------------
 * Images
 * ------------------------------------------------------------------------ */

/** File extension for each image type read from the clipboard. */
export const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

/* ---------------------------------------------------------------------------
 * Steganography container
 *
 * Embedded in the image as "digicloak:<payload length>:<payload>", written one
 * bit at a time into the least significant bit of each R/G/B byte (3 bits per
 * pixel). This layout predates the v2 crypto format and must not change, or
 * previously encoded images become unreadable.
 * ------------------------------------------------------------------------ */

export const MESSAGE_BORDER = ':';
export const MESSAGE_HEADER = 'digicloak';
export const MESSAGE_FORMAT = `${MESSAGE_HEADER}${MESSAGE_BORDER}<L>${MESSAGE_BORDER}<M>`;
export const BITS_PER_CHAR = 8;
export const BITS_PER_PIXEL = 3;

/* ---------------------------------------------------------------------------
 * Encryption (v2: AES-256-GCM, key derived with PBKDF2-SHA-256)
 * ------------------------------------------------------------------------ */

export const V2_PREFIX = 'v2$';
/** PBKDF2 iteration count. */
export const KDF_ROUNDS = 600_000;
export const SALT_BYTES = 16;
export const IV_BYTES = 12;
export const TAG_BYTES = 16;
