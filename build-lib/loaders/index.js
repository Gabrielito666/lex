/**
 * @import {Loader} from "esbuild"
 */

/**
 * @type {{ [ext: string]: Loader }}
 */
const loaders = {
	".css": "css",
	".txt": "text",
    	".json": "json",

    // Imágenes
    ".png": "copy",
    ".jpg": "copy",
    ".jpeg": "copy",
    ".gif": "copy",
    ".webp": "copy",
    ".avif": "copy",
    ".svg": "copy",
    ".ico": "copy",
    ".bmp": "copy",
    ".tiff": "copy",

    // Vídeos
    ".mp4": "copy",
    ".webm": "copy",
    ".ogg": "copy",
    ".mov": "copy",
    ".avi": "copy",
    ".mkv": "copy",

    // Audio
    ".mp3": "copy",
    ".wav": "copy",
    ".flac": "copy",
    ".aac": "copy",
    ".m4a": "copy",
    ".oga": "copy",

    // Fuentes
    ".woff": "copy",
    ".woff2": "copy",
    ".ttf": "copy",
    ".otf": "copy",
    ".eot": "copy",
}

module.exports = loaders;
