/**
 * Melbourne ↔ Dhaka Time Converter
 * A beautiful, real-time time zone converter
 */

// ========================================
// Configuration
// ========================================
const CONFIG = {
    melbourneTimezone: 'Australia/Melbourne',
    dhakaTimezone: 'Asia/Dhaka',
    updateInterval: 1000, // 1 second
    dayStartHour: 6,
    dayEndHour: 18
};

// ========================================
// DOM Elements
// ========================================
const elements = {
    // Melbourne elements
    melbourneTime: document.getElementById('melbourne-time'),
    melbournePeriod: document.getElementById('melbourne-period'),
    melbourneDate: document.getElementById('melbourne-date'),
    melbourneTz: document.getElementById('melbourne-tz'),
    melbourneDayStatus: document.getElementById('melbourne-day-status'),
    melbourneInput: document.getElementById('melbourne-input'),
    melbourneDateInput: document.getElementById('melbourne-date-input'),

    // Dhaka elements
    dhakaTime: document.getElementById('dhaka-time'),
    dhakaPeriod: document.getElementById('dhaka-period'),
    dhakaDate: document.getElementById('dhaka-date'),
    dhakaTz: document.getElementById('dhaka-tz'),
    dhakaDayStatus: document.getElementById('dhaka-day-status'),
    dhakaInput: document.getElementById('dhaka-input'),
    dhakaDateInput: document.getElementById('dhaka-date-input'),

    // Other elements
    timeDiff: document.getElementById('time-diff'),
    swapBtn: document.getElementById('swap-btn'),
    conversionInfo: document.getElementById('conversion-info'),
    lastUpdated: document.getElementById('last-updated'),

    // Quick reference
    ref9am: document.getElementById('ref-9am'),
    ref12pm: document.getElementById('ref-12pm'),
    ref6pm: document.getElementById('ref-6pm'),

    // Now buttons
    nowBtns: document.querySelectorAll('.now-btn')
};

// ========================================
// Time Formatting Utilities
// ========================================

/**
 * Format time for a specific timezone
 * @param {Date} date - The date to format
 * @param {string} timezone - IANA timezone string
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted time string
 */
function formatTime(date, timezone, options = {}) {
    const defaultOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: timezone
    };

    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(date);
}

/**
 * Format date for a specific timezone
 * @param {Date} date - The date to format
 * @param {string} timezone - IANA timezone string
 * @returns {string} Formatted date string
 */
function formatDate(date, timezone) {
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: timezone
    }).format(date);
}

/**
 * Get the timezone abbreviation (e.g., AEST, BST)
 * @param {Date} date - The date to check
 * @param {string} timezone - IANA timezone string
 * @returns {string} Timezone abbreviation
 */
function getTimezoneAbbr(date, timezone) {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'short'
    });

    const parts = formatter.formatToParts(date);
    const tzPart = parts.find(part => part.type === 'timeZoneName');
    return tzPart ? tzPart.value : '';
}

/**
 * Get just the time in 24-hour format
 * @param {Date} date - The date to format
 * @param {string} timezone - IANA timezone string
 * @returns {string} Time in HH:MM format
 */
function getTime24Hour(date, timezone) {
    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: timezone
    }).format(date);
}

/**
 * Get current hour in timezone
 * @param {Date} date - The date to check
 * @param {string} timezone - IANA timezone string
 * @returns {number} Hour (0-23)
 */
function getCurrentHour(date, timezone) {
    const hourStr = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        hour12: false,
        timeZone: timezone
    }).format(date);
    return parseInt(hourStr, 10);
}

/**
 * Parse time string (HH:MM) to hours and minutes
 * @param {string} timeStr - Time string in HH:MM format
 * @returns {object|null} { hours, minutes } or null if invalid
 */
function parseTimeString(timeStr) {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours, minutes };
}

/**
 * Parse various time formats from pasted text
 * Supports: "2:30 PM", "14:30", "2:30pm", "2.30 PM", "2 30 PM", etc.
 * @param {string} text - Raw pasted text
 * @returns {string|null} Time in HH:MM format, or null if invalid
 */
function parsePastedTime(text) {
    if (!text || typeof text !== 'string') return null;

    // Clean the text
    let cleanText = text.trim();

    // Try to extract time pattern - flexible regex for various formats
    // Matches: 2:30 PM, 14:30, 2.30pm, 2 30 PM, 02:30:00 PM, etc.
    const timeRegex = /(\d{1,2})[.:]\s*(\d{2})(?:[.:]\s*(\d{2}))?\s*(AM|PM|am|pm)?/i;
    const match = cleanText.match(timeRegex);

    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[4] ? match[4].toUpperCase() : null;

    // Validate hours and minutes
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return null;
    }

    // Convert 12-hour format to 24-hour
    if (period === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }

    // Validate final hours (should be 0-23)
    if (hours < 0 || hours > 23) {
        return null;
    }

    // Return in HH:MM format
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Handle paste event on time inputs
 * @param {ClipboardEvent} e - Paste event
 * @param {HTMLInputElement} input - The input element
 * @param {Function} handler - The input change handler to call
 */
function handlePaste(e, input, handler) {
    e.preventDefault();

    // Get pasted text from clipboard
    const pastedText = e.clipboardData?.getData('text');

    if (!pastedText) return;

    // Parse the pasted time
    const parsedTime = parsePastedTime(pastedText);

    if (parsedTime) {
        // Set the parsed time
        input.value = parsedTime;
        // Trigger the conversion
        handler();
    }
}

/**
 * Convert time from one timezone to another
 * @param {string} timeStr - Time string in HH:MM format
 * @param {string} fromTimezone - Source timezone
 * @param {string} toTimezone - Target timezone
 * @param {string|null} dateStr - Optional date string in YYYY-MM-DD format (defaults to today in source timezone)
 * @returns {object|null} { time24, time12, period, targetDate } or null if invalid
 */
function convertTime(timeStr, fromTimezone, toTimezone, dateStr = null) {
    const parsed = parseTimeString(timeStr);
    if (!parsed) return null;

    let year, month, day;

    if (dateStr) {
        // Parse the provided date string (YYYY-MM-DD)
        const dateParts = dateStr.split('-');
        year = parseInt(dateParts[0], 10);
        month = parseInt(dateParts[1], 10);
        day = parseInt(dateParts[2], 10);
    } else {
        // Get current date in the source timezone
        const now = new Date();
        const sourceDateParts = new Intl.DateTimeFormat('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: fromTimezone
        }).formatToParts(now);

        year = parseInt(sourceDateParts.find(p => p.type === 'year').value, 10);
        month = parseInt(sourceDateParts.find(p => p.type === 'month').value, 10);
        day = parseInt(sourceDateParts.find(p => p.type === 'day').value, 10);
    }

    // Create a UTC date at midnight of the source date
    const utcMidnight = Date.UTC(year, month - 1, day, 0, 0, 0);

    // Add the input hours and minutes to get a preliminary timestamp
    const inputTimeMs = utcMidnight + (parsed.hours * 3600 + parsed.minutes * 60) * 1000;

    // Get the source timezone offset at this specific moment
    const sourceOffsetMinutes = getTimezoneOffset(fromTimezone, new Date(inputTimeMs));

    // The input time is "in the source timezone", so we need to adjust
    // If source is UTC+10 and input is 14:00, that's 04:00 UTC
    // So we SUBTRACT the source offset from our timestamp
    const utcTimeMs = inputTimeMs - sourceOffsetMinutes * 60000;
    const utcDate = new Date(utcTimeMs);

    // Format the result in the target timezone
    const time24 = getTime24Hour(utcDate, toTimezone);
    const time12Full = formatTime(utcDate, toTimezone, { second: undefined });
    const parts = time12Full.split(' ');
    const time12 = parts[0] || '';
    const period = parts[1] || '';

    // Get the date in the target timezone
    const targetDateStr = new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: toTimezone
    }).format(utcDate);

    // Format date for display (e.g., "Mar 25, 2026")
    const targetDateDisplay = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: toTimezone
    }).format(utcDate);

    return {
        time24,
        time12,
        period,
        targetDate: targetDateStr,
        targetDateDisplay,
        date: utcDate
    };
}

/**
 * Get timezone offset in minutes (positive = east of UTC)
 * @param {string} timezone - IANA timezone string
 * @param {Date} date - Date to check offset for
 * @returns {number} Offset in minutes (e.g., +660 for UTC+11)
 */
function getTimezoneOffset(timezone, date) {
    // Use formatToParts to get reliable timezone-aware date components
    const utcParts = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
        timeZone: 'UTC'
    }).formatToParts(date);

    const tzParts = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
        timeZone: timezone
    }).formatToParts(date);

    const getPart = (parts, type) => parseInt(parts.find(p => p.type === type).value, 10);

    // Create comparable timestamps (in minutes since midnight on an arbitrary date)
    const utcMinutes = getPart(utcParts, 'hour') * 60 + getPart(utcParts, 'minute');
    const tzMinutes = getPart(tzParts, 'hour') * 60 + getPart(tzParts, 'minute');

    // Also need to account for day differences
    const utcDay = getPart(utcParts, 'day');
    const tzDay = getPart(tzParts, 'day');

    let dayOffset = 0;
    if (tzDay > utcDay) dayOffset = 24 * 60;  // Target is ahead by a day
    else if (tzDay < utcDay) dayOffset = -24 * 60;  // Target is behind by a day

    return (tzMinutes + dayOffset) - utcMinutes;
}

/**
 * Calculate time difference between two timezones
 * @param {string} tz1 - First timezone
 * @param {string} tz2 - Second timezone
 * @returns {number} Difference in hours
 */
function getTimeDifference(tz1, tz2) {
    const now = new Date();
    const offset1 = getTimezoneOffset(tz1, now);
    const offset2 = getTimezoneOffset(tz2, now);
    return (offset1 - offset2) / 60;
}

// ========================================
// UI Update Functions
// ========================================

/**
 * Update the live clock display
 */
function updateClocks() {
    const now = new Date();

    // Update Melbourne
    updateCityClock(now, 'melbourne', CONFIG.melbourneTimezone);

    // Update Dhaka
    updateCityClock(now, 'dhaka', CONFIG.dhakaTimezone);

    // Update time difference
    const diff = getTimeDifference(CONFIG.melbourneTimezone, CONFIG.dhakaTimezone);
    elements.timeDiff.textContent = Math.abs(diff);

    // Update last updated time
    elements.lastUpdated.textContent = formatTime(now, 'UTC', { second: undefined, timeZoneName: 'short' });
}

/**
 * Update clock for a specific city
 * @param {Date} now - Current date/time
 * @param {string} city - City name ('melbourne' or 'dhaka')
 * @param {string} timezone - IANA timezone
 */
function updateCityClock(now, city, timezone) {
    const timeStr = formatTime(now, timezone);
    const parts = timeStr.split(' ');

    // Time element
    const timeEl = elements[`${city}Time`];
    const newTime = parts[0];
    if (timeEl.textContent !== newTime) {
        timeEl.classList.add('updating');
        setTimeout(() => {
            timeEl.textContent = newTime;
            timeEl.classList.remove('updating');
        }, 100);
    }

    // Period (AM/PM)
    elements[`${city}Period`].textContent = parts[1] || '';

    // Date
    elements[`${city}Date`].textContent = formatDate(now, timezone);

    // Timezone abbreviation
    elements[`${city}Tz`].textContent = getTimezoneAbbr(now, timezone);

    // Day/Night status
    updateDayNightStatus(now, city, timezone);
}

/**
 * Update day/night indicator
 * @param {Date} now - Current date/time
 * @param {string} city - City name
 * @param {string} timezone - IANA timezone
 */
function updateDayNightStatus(now, city, timezone) {
    const hour = getCurrentHour(now, timezone);
    const isDay = hour >= CONFIG.dayStartHour && hour < CONFIG.dayEndHour;

    const statusEl = elements[`${city}DayStatus`];
    const iconEl = statusEl.querySelector('.status-icon');
    const textEl = statusEl.querySelector('.status-text');

    if (isDay) {
        statusEl.classList.remove('night');
        statusEl.classList.add('day');
        iconEl.textContent = '☀️';
        textEl.textContent = 'Day';
    } else {
        statusEl.classList.remove('day');
        statusEl.classList.add('night');
        iconEl.textContent = '🌙';
        textEl.textContent = 'Night';
    }
}

/**
 * Update the quick reference times
 */
function updateQuickReference() {
    // 9:00 AM Melbourne
    const ref9amResult = convertTimeFromMelbourne('09:00');
    elements.ref9am.textContent = ref9amResult ? `${ref9amResult.time12} ${ref9amResult.period}` : '--';

    // 12:00 PM Melbourne
    const ref12pmResult = convertTimeFromMelbourne('12:00');
    elements.ref12pm.textContent = ref12pmResult ? `${ref12pmResult.time12} ${ref12pmResult.period}` : '--';

    // 6:00 PM Melbourne
    const ref6pmResult = convertTimeFromMelbourne('18:00');
    elements.ref6pm.textContent = ref6pmResult ? `${ref6pmResult.time12} ${ref6pmResult.period}` : '--';
}

/**
 * Convert time from Melbourne to Dhaka
 * @param {string} timeStr - Time in HH:MM format
 * @param {string|null} dateStr - Optional date in YYYY-MM-DD format
 * @returns {object|null} Conversion result
 */
function convertTimeFromMelbourne(timeStr, dateStr = null) {
    return convertTime(timeStr, CONFIG.melbourneTimezone, CONFIG.dhakaTimezone, dateStr);
}

/**
 * Convert time from Dhaka to Melbourne
 * @param {string} timeStr - Time in HH:MM format
 * @param {string|null} dateStr - Optional date in YYYY-MM-DD format
 * @returns {object|null} Conversion result
 */
function convertTimeFromDhaka(timeStr, dateStr = null) {
    return convertTime(timeStr, CONFIG.dhakaTimezone, CONFIG.melbourneTimezone, dateStr);
}

/**
 * Update the conversion info display using safe DOM methods
 * @param {string|null} sourceCity - Source city name
 * @param {string|null} sourceTime - Source time (HH:MM)
 * @param {string|null} targetCity - Target city name
 * @param {object|null} result - Conversion result
 */
function updateConversionInfo(sourceCity, sourceTime, sourceDate, targetCity, result) {
    elements.conversionInfo.classList.remove('active');

    if (!sourceTime || !result) {
        const p = document.createElement('p');
        p.textContent = 'Enter a time in either field to see the conversion';
        elements.conversionInfo.textContent = '';
        elements.conversionInfo.appendChild(p);
        return;
    }

    const sourceParsed = parseTimeString(sourceTime);
    const sourceHour12 = sourceParsed.hours % 12 || 12;
    const sourcePeriod = sourceParsed.hours >= 12 ? 'PM' : 'AM';
    const sourceDisplay = `${sourceHour12}:${String(sourceParsed.minutes).padStart(2, '0')} ${sourcePeriod}`;

    // Check if dates differ (for display purposes)
    const datesDiffer = sourceDate && result.targetDate && sourceDate !== result.targetDate;

    const p = document.createElement('p');

    // Source time
    const strong1 = document.createElement('strong');
    strong1.textContent = sourceDisplay;
    p.appendChild(strong1);

    // Source city (with date if dates differ)
    if (datesDiffer && sourceDate) {
        p.appendChild(document.createTextNode(` on ${formatDateShort(sourceDate)} in ${capitalizeFirst(sourceCity)} is `));
    } else {
        p.appendChild(document.createTextNode(` in ${capitalizeFirst(sourceCity)} is `));
    }

    // Target time
    const strong2 = document.createElement('strong');
    strong2.textContent = `${result.time12} ${result.period}`;
    p.appendChild(strong2);

    // Target city (with date if dates differ)
    if (datesDiffer && result.targetDateDisplay) {
        p.appendChild(document.createTextNode(` on ${result.targetDateDisplay} in ${capitalizeFirst(targetCity)}`));
    } else {
        p.appendChild(document.createTextNode(` in ${capitalizeFirst(targetCity)}`));
    }

    elements.conversionInfo.textContent = '';
    elements.conversionInfo.appendChild(p);
    elements.conversionInfo.classList.add('active');
}

/**
 * Format a date string (YYYY-MM-DD) to short format (e.g., "Mar 25")
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date string
 */
function formatDateShort(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
    }).format(date);
}

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ========================================
// Event Handlers
// ========================================

/**
 * Handle Melbourne input change
 */
function handleMelbourneInput() {
    const timeValue = elements.melbourneInput.value;
    const dateValue = elements.melbourneDateInput.value || null;

    if (!timeValue) {
        elements.dhakaInput.value = '';
        updateConversionInfo(null, null, null, null, null);
        return;
    }

    const result = convertTimeFromMelbourne(timeValue, dateValue);
    if (result) {
        elements.dhakaInput.value = result.time24;
        elements.dhakaDateInput.value = result.targetDate;
        updateConversionInfo('melbourne', timeValue, dateValue, 'dhaka', result);
    }
}

/**
 * Handle Dhaka input change
 */
function handleDhakaInput() {
    const timeValue = elements.dhakaInput.value;
    const dateValue = elements.dhakaDateInput.value || null;

    if (!timeValue) {
        elements.melbourneInput.value = '';
        updateConversionInfo(null, null, null, null, null);
        return;
    }

    const result = convertTimeFromDhaka(timeValue, dateValue);
    if (result) {
        elements.melbourneInput.value = result.time24;
        elements.melbourneDateInput.value = result.targetDate;
        updateConversionInfo('dhaka', timeValue, dateValue, 'melbourne', result);
    }
}

/**
 * Handle "Now" button click
 * @param {Event} e - Click event
 */
function handleNowBtn(e) {
    const btn = e.currentTarget;
    const target = btn.dataset.target;
    const now = new Date();

    if (target === 'melbourne') {
        elements.melbourneInput.value = getTime24Hour(now, CONFIG.melbourneTimezone);
        elements.melbourneDateInput.value = getDateInTimezone(now, CONFIG.melbourneTimezone);
        handleMelbourneInput();
    } else if (target === 'dhaka') {
        elements.dhakaInput.value = getTime24Hour(now, CONFIG.dhakaTimezone);
        elements.dhakaDateInput.value = getDateInTimezone(now, CONFIG.dhakaTimezone);
        handleDhakaInput();
    }
}

/**
 * Get date string in YYYY-MM-DD format for a timezone
 * @param {Date} date - The date to format
 * @param {string} timezone - IANA timezone string
 * @returns {string} Date in YYYY-MM-DD format
 */
function getDateInTimezone(date, timezone) {
    return new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: timezone
    }).format(date);
}

/**
 * Handle swap button click
 */
function handleSwap() {
    const melbTime = elements.melbourneInput.value;
    const melbDate = elements.melbourneDateInput.value;
    const dhakaTime = elements.dhakaInput.value;
    const dhakaDate = elements.dhakaDateInput.value;

    // Swap values
    elements.melbourneInput.value = dhakaTime;
    elements.melbourneDateInput.value = dhakaDate;
    elements.dhakaInput.value = melbTime;
    elements.dhakaDateInput.value = melbDate;

    // Update conversion info
    if (dhakaTime) {
        handleDhakaInput();
    } else if (melbTime) {
        handleMelbourneInput();
    }
}

// ========================================
// Initialization
// ========================================

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Time input changes
    elements.melbourneInput.addEventListener('input', handleMelbourneInput);
    elements.dhakaInput.addEventListener('input', handleDhakaInput);

    // Date input changes
    elements.melbourneDateInput.addEventListener('change', handleMelbourneInput);
    elements.dhakaDateInput.addEventListener('change', handleDhakaInput);

    // Paste support for time inputs
    elements.melbourneInput.addEventListener('paste', (e) => handlePaste(e, elements.melbourneInput, handleMelbourneInput));
    elements.dhakaInput.addEventListener('paste', (e) => handlePaste(e, elements.dhakaInput, handleDhakaInput));

    // Now buttons
    elements.nowBtns.forEach(btn => {
        btn.addEventListener('click', handleNowBtn);
    });

    // Swap button
    elements.swapBtn.addEventListener('click', handleSwap);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Press 'S' to swap (when not in an input field)
        if (e.key === 's' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT') {
            handleSwap();
        }
    });
}

/**
 * Initialize date inputs with today's date in respective timezones
 */
function initializeDateInputs() {
    const now = new Date();
    elements.melbourneDateInput.value = getDateInTimezone(now, CONFIG.melbourneTimezone);
    elements.dhakaDateInput.value = getDateInTimezone(now, CONFIG.dhakaTimezone);
}

/**
 * Initialize the application
 */
function init() {
    console.log('🕐 TimeSync: Melbourne ↔ Dhaka Time Converter');
    console.log('Initializing...');

    // Set up event listeners
    setupEventListeners();

    // Initialize date inputs with today's date in respective timezones
    initializeDateInputs();

    // Initial clock update
    updateClocks();

    // Update quick reference
    updateQuickReference();

    // Start clock update interval
    setInterval(updateClocks, CONFIG.updateInterval);

    // Update quick reference every minute (for day changes)
    setInterval(updateQuickReference, 60000);

    console.log('✅ TimeSync initialized successfully!');
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
