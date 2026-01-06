/**
 * color.js - Shared coloring utility for Author GeoTimeline
 * 
 * Provides consistent occupation-based HSL colors across timeline and map.
 */

/**
 * Generates a consistent HSL color based on a string (primary occupation).
 * @param {string} occupation - The occupation string to hash.
 * @returns {string} HSL color string.
 */
function getOccColor(occupation) {
    if (!occupation) {
        return '#888'; // Neutral fallback
    }

    let hash = 0;
    for (let i = 0; i < occupation.length; i++) {
        hash = occupation.charCodeAt(i) + ((hash << 5) - hash);
    }

    const h = Math.abs(hash % 360);
    const s = 65 + (Math.abs(hash % 25)); // 65-90% saturation
    const l = 75 + (Math.abs(hash % 10)); // 75-85% lightness

    return `hsl(${h}, ${s}%, ${l}%)`;
}
