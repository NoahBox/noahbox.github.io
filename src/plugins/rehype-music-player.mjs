/// <reference types="mdast" />
import { h } from "hastscript";
import { readFileSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { join, basename } from "node:path";
import { parseId3 } from "./id3-parse.mjs";

/**
 * Music player directive.
 *
 * Usage (in markdown):
 *   ::musicplayer{src="/music/Miko_ThemeSong.mp3"}
 *   ::musicplayer{src="./assets/OoZaWaShiMa/Miko_ThemeSong.mp3"}
 *
 * `src` may be either:
 *   - a site-root URL (e.g. "/music/x.mp3") -> read from "public/music/x.mp3",
 *     and served as-is; or
 *   - a path relative to the markdown file (e.g. "./assets/x.mp3"), which
 *     resolves against "src/content/pages" for reading embedded metadata and
 *     is staged into "public/music/<basename>" so the browser can fetch it.
 *
 * Embedded ID3 tags (APIC cover, USLT lyrics, title / artist / album) are
 * extracted at build time and inlined into the mount element as data
 * attributes. The interactive player is mounted on the client by
 * `MusicPlayerClient.astro`.
 *
 * @param {Record<string, unknown>} properties - The directive's attributes (e.g. `src`).
 * @param {import('mdast').RootContent[]} children
 * @returns {import('hast').Element}
 */
export function MusicPlayerComponent(properties, _children) {
	const props = properties || {};
	const rawSrc = props.src;

	if (!rawSrc || typeof rawSrc !== "string") {
		return h(
			"div",
			{ class: "hidden" },
			'musicplayer: missing or invalid "src" attribute',
		);
	}

	const cwd = process.cwd();
	const stripLeadingSlash = (s) => s.replace(/^\/+/, "");
	const stripLeadingRel = (s) => s.replace(/^\.?\//, "");

	// 1) Locate the source file on disk (for reading embedded metadata).
	const candidates = [];
	if (rawSrc.startsWith("/")) {
		candidates.push(join(cwd, "public", stripLeadingSlash(rawSrc)));
	} else {
		// Relative to the content/pages directory where the .md file lives.
		candidates.push(join(cwd, "src/content/pages", stripLeadingRel(rawSrc)));
		candidates.push(join(cwd, stripLeadingRel(rawSrc)));
		candidates.push(join(cwd, "public", stripLeadingRel(rawSrc)));
	}

	const srcPath = candidates.find((p) => existsSync(p));

	let meta = { title: "", artist: "", album: "", cover: null, lyrics: "" };
	if (srcPath) {
		try {
			const parsed = parseId3(readFileSync(srcPath));
			if (parsed) meta = parsed;
		} catch (err) {
			console.warn(`[musicplayer] could not read metadata for ${rawSrc}:`, err.message);
		}
	} else {
		console.warn(`[musicplayer] source file not found for ${rawSrc}; tried:`, candidates);
	}

	// 2) Determine the URL the browser will actually fetch.
	let served;
	if (rawSrc.startsWith("/")) {
		served = rawSrc;
	} else {
		const name = basename(rawSrc);
		const targetPublic = join(cwd, "public", "music", name);
		if (srcPath) {
			try {
				mkdirSync(join(cwd, "public", "music"), { recursive: true });
				copyFileSync(srcPath, targetPublic);
			} catch (err) {
				console.warn(`[musicplayer] could not stage ${name} into public/music:`, err.message);
			}
		}
		served = `/music/${name}`;
	}

	const lyricsB64 = Buffer.from(meta.lyrics || "", "utf-8").toString("base64");

	return h("div", {
		class: "music-player",
		"data-src": served,
		"data-title": meta.title || "",
		"data-artist": meta.artist || "",
		"data-album": meta.album || "",
		"data-cover": meta.cover || "",
		"data-lyrics": lyricsB64,
	});
}
