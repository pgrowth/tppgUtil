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


