type ConsoleStyle = {
	text: string;
	style: string;
};

function textToHexColor(text: string): string {
	if (!text || typeof text !== "string") {
		throw new Error("Input must be a non-empty string");
	}

	// Generate hash
	let hash = 0;
	for (let i = 0; i < text.length; i++) {
		hash = text.charCodeAt(i) + ((hash << 5) - hash);
		hash = hash & hash; // Convert to 32-bit integer
	}

	// Hex color
	let color = "#";
	for (let i = 0; i < 3; i++) {
		const value = (hash >> (i * 8)) & 255;
		color += `00${value.toString(16)}`.slice(-2);
	}

	return color;
}

function createConsoleStyles(...items: string[]): ConsoleStyle[] {
	return items.map((item) => ({
		text: item.startsWith("#") ? "" : `%c %c ${item} `,
		style: item.startsWith("#")
			? `background: ${item}; color: ${isColorTooDark(item) ? "white" : "black"}; font-weight: bold; border-radius: 5px;`
			: " ",
	}));
}

function formatForConsole(styles: ConsoleStyle[]): [string, ...string[]] {
	const format = styles.map((s) => s.text).join("");
	const cssStyles = styles.map((s) => s.style);
	return [format, ...cssStyles];
}

/**
 * Logs items to the console, with each item styled according to the following rules:
 *  - If the item is a hex color code (starts with '#'), it is used as the background color.
 *  - Otherwise, the item is treated as a string.
 *  - The first item is always treated as a string, and will be separated from the rest of the items by a space.
 *  - The rest of the items will be separated by a space.
 *
 * @returns {string} The formatted log message
 */
function formatLog(...items: string[]) {
	const styles = createConsoleStyles(...items);
	const format = formatForConsole(styles);
	return format;
}

export { textToHexColor, formatLog };

function isColorTooDark(color: string): boolean {
	const hex = color.replace(/^#/, '');
	const r = Number.parseInt(hex.slice(0, 2), 16);
	const g = Number.parseInt(hex.slice(2, 4), 16);
	const b = Number.parseInt(hex.slice(4, 6), 16);
	const brightness = (r * 299 + g * 587 + b * 114) / 1000;
	return brightness < 90;
}
