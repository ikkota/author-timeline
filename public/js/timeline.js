// Timeline Logic

async function loadData() {
    console.log("Fetching ./data/authors.json...");
    const response = await fetch('./data/authors.json');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Data loaded:", data.length, "items");
    return data;
}

function createDate(year) {
    if (year === null || year === undefined) return null;

    // Use user-recommended robust method for ancient dates/BC
    const d = new Date(Date.UTC(0, 0, 1));
    d.setUTCFullYear(year, 0, 1);
    return d;
}

// Custom date formatter for axis
function formatAxis(date, scale, step) {
    let d = date;
    // Vis.js might pass a Moment object
    if (d && typeof d.toDate === 'function') {
        d = d.toDate();
    } else if (typeof d === 'number') {
        d = new Date(d);
    }

    if (!d || typeof d.getUTCFullYear !== 'function') {
        return String(date);
    }

    const year = d.getUTCFullYear();
    if (year < 0) {
        return Math.abs(year) + " BC";
    }
    return year + " AD";
}

async function initTimeline() {
    try {
        const jsonData = await loadData();

        // Transform JSON integer years to JS Date objects
        const items = new vis.DataSet(jsonData.map(item => {
            const start = createDate(item.start);
            const end = createDate(item.end);

            // Vis.js expects start/end. 
            // If type is point, only start is needed.
            // If type is range, both needed.

            // Occupation Styling Logic
            let style = "";
            const occs = item.occupations || [];

            if (occs.length > 0) {
                // Color mapping
                const colors = {
                    "philosopher": "#B3CDE3", // Pastel Blue
                    "historian": "#FBB4AE",   // Pastel Red
                    "poet": "#CCEBC5",        // Pastel Green
                    "politician": "#DECBE4",  // Pastel Purple
                    "writer": "#FED9A6",      // Pastel Orange
                    "tragedian": "#FFFFCC",   // Pastel Yellow
                    "mathematician": "#E5D8BD" // Pastel Brown
                };

                // Helper to get color
                const getColor = (o) => {
                    const k = o.toLowerCase();
                    for (const key in colors) {
                        if (k.includes(key)) return colors[key];
                    }
                    return "#E0E0E0"; // Default Grey
                };

                if (occs.length === 1) {
                    style = `background-color: ${getColor(occs[0])}; border-color: #999;`;
                } else {
                    // Stripes
                    const usedColors = occs.map(getColor);
                    // Build gradient: color1 0%, color1 10px, color2 10px, color2 20px...
                    // Or simple equal split? "striped" usually means repeating diagonal or simple repeating.
                    // User Request: "Horizontal stripes of multiple colors". 
                    // Let's do repeating-linear-gradient with distinct bands.

                    let grad = "repeating-linear-gradient(45deg, ";
                    const width = 10; // px width of stripe

                    // Logic: c1 0, c1 10, c2 10, c2 20...
                    let steps = [];
                    usedColors.forEach((c, i) => {
                        let start = i * width;
                        let end = (i + 1) * width;
                        steps.push(`${c} ${start}px ${end}px`);
                    });

                    // To repeat, we need the total pattern size.
                    // Actually repeating-linear-gradient repeats automatically if we don't specify stop at end?
                    // No, usually it repeats the definition.
                    // But if we have 3 colors, we define 0-10, 10-20, 20-30. Then it repeats.

                    grad += steps.join(", ");
                    grad += ")";

                    style = `background: ${grad}; border-color: #666;`;
                }
            }

            return {
                id: item.id,
                content: item.content,
                start: start,
                end: end,
                type: item.type,
                title: item.title,
                className: item.className,
                style: style // Apply inline style
            };
        }));

        const container = document.getElementById('timeline-container');

        // Configuration
        const options = {
            height: '100%',
            zoomMin: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years min zoom
            zoomMax: 1000 * 60 * 60 * 24 * 365 * 3000, // 3000 years max zoom
            start: createDate(-500), // Default view: Classical antiquity
            end: createDate(0),
            format: {
                minorLabels: formatAxis,
                majorLabels: formatAxis
            },
            verticalScroll: true,
            horizontalScroll: true,
            stack: true, // Auto-stack items
            margin: {
                item: 10, // Margin between items
            }
        };

        // Create Timeline
        const timeline = new vis.Timeline(container, items, options);

        // Remove loading text
        const loading = document.querySelector('.loading');
        if (loading) loading.style.display = 'none';

    } catch (e) {
        console.error("Failed to init timeline:", e);
        document.getElementById('timeline-container').innerHTML = `
            <div style="padding:20px; color:red;">
                Error loading data: ${e.message}<br>
                Check console for details.
            </div>`;
    }
}

document.addEventListener('DOMContentLoaded', initTimeline);
