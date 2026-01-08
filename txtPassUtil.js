/**
 * Lightens a given hex color by a specified percentage.
 * @param {string} hexColor The hex color string (e.g., "#RRGGBB" or "#RGB").
 * @param {number} percent The percentage to lighten the color (e.g., 10 for 10%).
 * @returns {string} The lighter hex color string.
 */
function lightenHexColor(hexColor, percent) {
  const [h, s, l] = hexToHsl(hexColor);


  // Increase lightness, clamping at 100%
  let newL = Math.min(100, l + percent);


  const newS = 90;

  return hslToHex(h, s, newS);
}

// Helper function to convert hex to HSL
/**
 * Converts a HEX color code to HSL (Hue, Saturation, Lightness).
 *
 * @param {string} hex - The HEX color code to convert. It can be in the format
 *                       `#RRGGBB` or `#RGB`. The `#` prefix is optional.
 * @returns {number[]} An array containing the HSL values:
 *                     - `h` (hue) in degrees [0, 360),
 *                     - `s` (saturation) as a percentage [0, 100],
 *                     - `l` (lightness) as a percentage [0, 100].
 * @throws {Error} Throws an error if the input is not a valid HEX color code.
 */
function hexToHsl(hex) {
  // Remove '#' if present
  hex = hex.replace(/^#/, '');

  // Parse r, g, b values
  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    throw new Error('Invalid HEX color.');
  }

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return [h, s * 100, l * 100];
}

// Helper function to convert HSL to hex
/**
 * Converts HSL (Hue, Saturation, Lightness) color values to a HEX color code.
 *
 * @param {number} h - The hue value, in degrees (0-360).
 * @param {number} s - The saturation value, as a percentage (0-100).
 * @param {number} l - The lightness value, as a percentage (0-100).
 * @returns {string} The HEX color code in the format "#RRGGBB".
 *
 * @example
 * // Convert HSL to HEX
 * const hexColor = hslToHex(200, 50, 50);
 * console.log(hexColor); // Outputs: "#40BFBF"
 */
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs((h / 60) % 2 - 1));
  let m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase();
}



/**
 * Changes the theme of the application by setting primary, secondary, and accent colors.
 *
 * @param {string} themecolor - The primary theme color in hexadecimal format. Defaults to "#0f699d" if not provided.
 * @param {string} [secondary="#f8f8f8"] - The secondary theme color in hexadecimal format. Optional, defaults to "#f8f8f8".
 */
function changetheme(themecolor) {

  const color = themecolor || "#0f699d";
  document.documentElement.style.setProperty('--primary-color', color);
  const accentcolor = lightenHexColor(color, 46.3);
  document.documentElement.style.setProperty('--accent-color', accentcolor);

}


