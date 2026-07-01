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
    ".png": "file",
    ".jpg": "file",
    ".jpeg": "file",
    ".gif": "file",
    ".webp": "file",
    ".avif": "file",
    ".svg": "file",
    ".ico": "file",
    ".bmp": "file",
    ".tiff": "file",

    // Vídeos
    ".mp4": "file",
    ".webm": "file",
    ".ogg": "file",
    ".mov": "file",
    ".avi": "file",
    ".mkv": "file",

    // Audio
    ".mp3": "file",
    ".wav": "file",
    ".flac": "file",
    ".aac": "file",
    ".m4a": "file",
    ".oga": "file",

    // Fuentes
    ".woff": "file",
    ".woff2": "file",
    ".ttf": "file",
    ".otf": "file",
    ".eot": "file",
}

module.exports = loaders;
