// Minimal ID3v2 parser focused on what the music player needs:
//   - APIC  -> embedded album cover (returns a data: URI)
//   - USLT  -> embedded lyrics (plain text, may be LRC-timed)
//   - TIT2/TPE1/TALB -> title / artist / album
// Supports ID3v2.3 (frame size big-endian) and ID3v2.4 (synchsafe sizes).
// Returns null if no ID3v2 tag is present.

function synchsafe(buf, off) {
  return (
    ((buf[off] & 0x7f) << 21) |
    ((buf[off + 1] & 0x7f) << 14) |
    ((buf[off + 2] & 0x7f) << 7) |
    (buf[off + 3] & 0x7f)
  );
}

function decodeText(buf, encoding) {
  if (buf.length === 0) return "";
  if (encoding === 1) {
    // UTF-16: strip BOM if present, then decode as little-endian (covers BE too if BOM set)
    let start = 0;
    let le = true;
    if (buf[0] === 0xfe && buf[1] === 0xff) {
      start = 2;
      le = false;
    } else if (buf[0] === 0xff && buf[1] === 0xfe) {
      start = 2;
      le = true;
    }
    const sub = buf.subarray(start);
    if (le) {
      // Node TextDecoder 'utf-16le' ignores a BOM if we already stripped; if not stripped, handle
      if (sub[0] === 0xff && sub[1] === 0xfe) return sub.subarray(2).toString("utf16le");
      return sub.toString("utf16le");
    }
    return Buffer.from(sub).toString("utf16be");
  }
  // encoding 0 / 2 / 3 -> try UTF-8, fall back to latin1 if it looks mojibaked
  const utf8 = buf.toString("utf-8");
  if (utf8.includes("�")) return buf.toString("latin1");
  return utf8;
}

// Find the null terminator for a description field given its encoding.
// Returns index AFTER the terminator (i.e. start of the following binary/text).
function descEnd(data, encoding) {
  if (encoding === 1) {
    for (let i = 0; i + 1 < data.length; i++) {
      if (data[i] === 0 && data[i + 1] === 0) return i + 2;
    }
    return data.length;
  }
  for (let i = 0; i < data.length; i++) {
    if (data[i] === 0) return i + 1;
  }
  return data.length;
}

export function parseId3(buffer) {
  const head = buffer.toString("latin1", 0, 3);
  if (head !== "ID3") return null;

  const major = buffer[3];
  const flags = buffer[4]; // minor
  const unsync = (buffer[5] & 0x80) !== 0;
  const tagSize = synchsafe(buffer, 6);
  let body = buffer.subarray(10, 10 + tagSize);

  if (unsync) {
    // Remove unsynchronisation: 0xFF 0x00 -> 0xFF
    const out = [];
    for (let i = 0; i < body.length; i++) {
      if (body[i] === 0xff && body[i + 1] === 0x00) {
        out.push(0xff);
        i++;
      } else {
        out.push(body[i]);
      }
    }
    body = Buffer.from(out);
  }

  const result = { title: "", artist: "", album: "", cover: null, lyrics: "" };
  let offset = 0;

  while (offset + 10 <= body.length) {
    const id = body.toString("latin1", offset, offset + 4);
    if (id === "\u0000\u0000\u0000\u0000" || id === "3DI") break;
    let size;
    if (major >= 4) size = synchsafe(body, offset + 4);
    else size = body.readUInt32BE(offset + 4); // v2.3 big-endian
    const dataStart = offset + 10;
    if (size <= 0 || dataStart + size > body.length) break;
    const data = body.subarray(dataStart, dataStart + size);

    if (id === "APIC") {
      const enc = data[0];
      // mime: from byte 1 until 0x00
      let m = 1;
      while (m < data.length && data[m] !== 0) m++;
      const mime = data.toString("latin1", 1, m);
      const picType = data[m + 1];
      const descStart = m + 2;
      const dEnd = descEnd(data.subarray(descStart), enc);
      const pic = data.subarray(descStart + dEnd);
      if (pic.length > 0) {
        const b64 = pic.toString("base64");
        result.cover = `data:${mime || "image/png"};base64,${b64}`;
      }
    } else if (id === "USLT") {
      const enc = data[0];
      // language: 3 bytes, then content descriptor (null terminated), then lyrics
      const descStart = 1 + 3;
      const dEnd = descEnd(data.subarray(descStart), enc);
      const lyrics = data.subarray(descStart + dEnd);
      result.lyrics = decodeText(lyrics, enc).replace(/\r/g, "");
    } else if (id === "TIT2" || id === "TPE1" || id === "TALB") {
      const enc = data[0];
      const text = decodeText(data.subarray(1), enc);
      if (id === "TIT2") result.title = text;
      else if (id === "TPE1") result.artist = text;
      else if (id === "TALB") result.album = text;
    }

    offset = dataStart + size;
  }

  return result;
}
