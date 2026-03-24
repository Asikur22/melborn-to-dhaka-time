# TimeSync - Melbourne ↔ Dhaka Time Converter

A beautiful, modern time zone converter built with vanilla HTML, CSS, and JavaScript. Convert times between Melbourne, Australia and Dhaka, Bangladesh with an intuitive, user-friendly interface.

![TimeSync Preview](https://img.shields.io/badge/Status-Live-brightgreen) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## Features

- **Real-time Clocks** - Live clocks showing current time in both cities with seconds
- **Time Conversion** - Convert any time between Melbourne and Dhaka instantly
- **Date Selection** - Support for past and future dates with cross-midnight handling
- **Day/Night Indicators** - Visual ☀️/🌙 indicators based on local time
- **Paste Support** - Paste times in various formats (2:30 PM, 14:30, etc.)
- **Quick Reference** - Pre-calculated common conversion times
- **Responsive Design** - Works beautifully on desktop and mobile
- **Keyboard Shortcuts** - Press `S` to swap conversion direction
- **Automatic DST Handling** - Uses IANA time zones for accurate daylight saving adjustments

## Demo

Simply open `index.html` in your browser to see it in action.

```bash
open index.html
```

Or serve it locally:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve
```

Then visit `http://localhost:8000`

## Screenshots

The converter features:
- 🎨 Dark theme with gradient accents
- 🇦🇺 Blue/purple theme for Melbourne
- 🇧🇩 Green/teal theme for Dhaka
- ✨ Smooth animations and transitions
- 📱 Mobile-responsive layout

## Installation

No installation required! This is a static web application.

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/melborn-to-dhaka-time.git
   ```

2. Open `index.html` in your browser

## Usage

### Basic Time Conversion
1. Enter a time in either the Melbourne or Dhaka input field
2. The converted time automatically appears in the other field
3. Click "Now" to set the current time for that city

### Date Selection
1. Use the date picker below each time input to select a date
2. Useful for scheduling meetings across time zones
3. Cross-midnight conversions show date changes (e.g., 1 AM in Melbourne = 8 PM previous day in Dhaka)

### Paste Support
Copy and paste times in various formats:
- `2:30 PM`
- `14:30`
- `2:30pm`
- `2.30 PM`

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `S` | Swap conversion direction |

## Technical Details

### Time Zone Information

| City | IANA Timezone | UTC Offset | DST |
|------|---------------|------------|-----|
| Melbourne | `Australia/Melbourne` | UTC+10 / UTC+11 | Yes (AEDT/AEST) |
| Dhaka | `Asia/Dhaka` | UTC+6 | No |

The time difference is approximately **5 hours** (Melbourne is ahead), but this varies during daylight saving transitions.

### Browser APIs Used

- **`Intl.DateTimeFormat`** - For timezone-aware date/time formatting
- **`Intl.supportedValuesOf('timeZone')`** - Time zone validation
- **Clipboard API** - Paste support for time inputs

### File Structure

```
melborn-to-dhaka-time/
├── index.html      # Main HTML structure
├── styles.css      # All styling with CSS custom properties
├── app.js          # Time conversion logic and interactivity
└── README.md       # This file
```

### Key JavaScript Functions

| Function | Description |
|----------|-------------|
| `convertTime()` | Core conversion logic between timezones |
| `getTimezoneOffset()` | Calculates timezone offset in minutes |
| `parsePastedTime()` | Parses various time formats from clipboard |
| `updateClocks()` | Updates live clock displays |
| `handleMelbourneInput()` | Handles Melbourne time input changes |
| `handleDhakaInput()` | Handles Dhaka time input changes |

## Browser Support

Works in all modern browsers:
- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

Requires `Intl.DateTimeFormat` with full timezone support.

## Development

### Making Changes

1. Edit `styles.css` for visual changes
2. Edit `app.js` for functionality changes
3. Edit `index.html` for structural changes

No build process required - just refresh the browser!

### CSS Custom Properties

The design uses CSS variables for easy theming:

```css
--melbourne-primary: #3B82F6;    /* Blue */
--melbourne-secondary: #8B5CF6;  /* Purple */
--dhaka-primary: #10B981;        /* Green */
--dhaka-secondary: #06B6D4;      /* Teal */
--accent: #F59E0B;               /* Amber */
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Time zone data provided by the browser's built-in `Intl` API
- Fonts: [Inter](https://fonts.google.com/specimen/Inter) and [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)
- Inspired by the need for simple, beautiful timezone tools

---

Made with ❤️ by **Asiqur Rahman** for anyone who needs to coordinate between Melbourne and Dhaka!
