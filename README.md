# txtPassUtil

A lightweight JavaScript utility library for theme management and color manipulation in Zoho Widgets. Uses HSL color space for accurate color lightening.

## Installation

Include the minified version in your HTML:

```html
<script src="txtPassUtil.min.js"></script>
```

Or the unminified version for development:

```html
<script src="txtPassUtil.js"></script>
```

## Functions

### `changetheme(themecolor)`

Changes the application theme by setting CSS custom properties for primary and accent colors.

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `themecolor` | `string` | `"#0f699d"` | The primary theme color in hexadecimal format |

**CSS Variables Set:**
- `--primary-color`: The provided theme color
- `--accent-color`: A lightened version of the primary color (46.3% lighter)

**Example:**
```javascript
// Set a custom theme color
changetheme("#3498db");

// Use default theme color
changetheme();
```

---

### `lightenHexColor(hexColor, percent)`

Lightens a hex color by increasing its lightness in HSL color space.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `hexColor` | `string` | The hex color to lighten (e.g., `"#RRGGBB"` or `"#RGB"`) |
| `percent` | `number` | The percentage to increase lightness (e.g., 10 for 10%) |

**Returns:** `string` - The lightened hex color in `#RRGGBB` format

**Example:**
```javascript
// Lighten a color by 20%
const lightBlue = lightenHexColor("#0f699d", 20);
```

---

### `hexToHsl(hex)`

Converts a HEX color code to HSL (Hue, Saturation, Lightness).

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `hex` | `string` | The hex color code (`#RRGGBB` or `#RGB`, `#` optional) |

**Returns:** `number[]` - Array of `[h, s, l]` where:
- `h` (hue): degrees [0, 360)
- `s` (saturation): percentage [0, 100]
- `l` (lightness): percentage [0, 100]

**Example:**
```javascript
const [h, s, l] = hexToHsl("#3498db");
console.log(h, s, l); // 204, 70, 53
```

---

### `hslToHex(h, s, l)`

Converts HSL (Hue, Saturation, Lightness) color values to a HEX color code.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `h` | `number` | Hue in degrees (0-360) |
| `s` | `number` | Saturation as percentage (0-100) |
| `l` | `number` | Lightness as percentage (0-100) |

**Returns:** `string` - The hex color code in `#RRGGBB` format

**Example:**
```javascript
const hexColor = hslToHex(200, 50, 50);
console.log(hexColor); // "#40BFBF"
```

---

### `fillMerge(inputString, values)`

Replaces merge fields in a string with corresponding values from a JSON object. Merge fields use angle bracket syntax like `<Field Name>`.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `inputString` | `string` | The string containing merge fields in the format `<Field Name>` |
| `values` | `Object` | A JSON object where keys correspond to merge fields (spaces replaced with underscores) |

**Returns:** `Object` - An object containing:
- `result`: The processed string with merge fields replaced (original string if error)
- `code`: `"success"` if all fields were replaced, `"error"` otherwise
- `message`: An error message if a merge field value is missing (only present on error)

**Example:**
```javascript
// Successful merge
const template = "Hello <First Name>, your order <Order ID> is ready!";
const data = { First_Name: "John", Order_ID: "12345" };
const result = fillMerge(template, data);
console.log(result);
// { result: "Hello John, your order 12345 is ready!", code: "success" }

// Missing field
const partial = fillMerge("<First Name> <Last Name>", { First_Name: "John" });
console.log(partial);
// { result: "<First Name> <Last Name>", code: "error", message: "Key(s) not found: Last Name" }
```

## CSS Usage

After calling `changetheme()`, use the CSS variables in your stylesheets:

```css
.header {
  background-color: var(--primary-color);
}

.button:hover {
  background-color: var(--accent-color);
}
```

## Building

To create the minified version:

```bash
npx terser txtPassUtil.js -o txtPassUtil.min.js --compress "drop_console=true" --mangle
```

## License

MIT
