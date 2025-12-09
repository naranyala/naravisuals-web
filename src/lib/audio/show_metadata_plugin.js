
export class ShowMetadataPlugin {
  constructor(daw) {
    this.daw = daw;
    this.cache = new Map();          // file → metadata object
  }

  /* public API ----------------------------------------------------------- */
  async extract(file) {
    if (this.cache.has(file)) return this.cache.get(file);

    const buf = await file.slice(0, 256 * 1024).arrayBuffer(); // first 256 kB
    const meta = {};

    /* 1. quick-and-dirty textual scan ------------------------------------ */
    const txt = new TextDecoder('utf-8', { fatal: false }).decode(buf);
    const lines = txt.split(/\0|\n/);

    /* ID3v2 */
    const id3 = ID3v2(buf);
    if (id3) Object.assign(meta, id3);

    /* ID3v1 (last 128 bytes) */
    const id1 = ID3v1(buf);
    if (id1) Object.assign(meta, id1);

    /* Vorbis / FLAC comments */
    const vorb = VorbisComment(buf);
    if (vorb) Object.assign(meta, vorb);

    /* RIFF LIST-INFO */
    const riff = RiffInfo(buf);
    if (riff) Object.assign(meta, riff);

    /* iXML chunk (Broadcast Wave) */
    const ixml = iXML(buf);
    if (ixml) Object.assign(meta, ixml);

    /* 2. generic file facts ---------------------------------------------- */
    meta.filename = file.name;
    meta.filesize = file.size;
    meta.mime = file.type || 'application/octet-stream';
    meta.lastModified = file.lastModified
      ? new Date(file.lastModified).toISOString()
      : null;

    this.cache.set(file, meta);
    return meta;
  }

  /* optional: clear cache */
  clear() { this.cache.clear(); }
}

/* ------------------------------------------------------------------ */
/* tiny parsers (no deps, no alloc bombs)                              */
/* ------------------------------------------------------------------ */

function readStr(view, off, max = 64) {
  let s = '';
  for (let i = 0; i < max; i++) {
    const c = view.getUint8(off + i);
    if (!c) break;
    s += String.fromCharCode(c);
  }
  return s;
}

/* ID3v2.3 / 2.4  (first 10 bytes header) */
function ID3v2(buf) {
  const v = new DataView(buf);
  if (readStr(v, 0, 3) !== 'ID3') return null;
  const maj = v.getUint8(3);
  const rev = v.getUint8(4);
  const flags = v.getUint8(5);
  const size = syncsafe32(v, 6);
  if (size > buf.byteLength - 10) return null;

  const tags = {};
  let off = 10;
  while (off < 10 + size - 10) {
    const fid = readStr(v, off, 4);
    const sz = maj === 4 ? syncsafe32(v, off + 4) : v.getUint32(off + 4);
    const fl = v.getUint16(off + 8);
    off += 10;
    if (fid === '\0\0\0\0') break;

    const enc = v.getUint8(off);
    let text = '';
    if (enc === 0 || enc === 3) {
      text = new TextDecoder(enc === 3 ? 'utf-8' : 'latin1')
        .decode(buf.slice(off + 1, off + 1 + sz - 1));
    } else if (enc === 1) {
      text = new TextDecoder('utf-16').decode(buf.slice(off + 1, off + 1 + sz - 1));
    }
    tags[fid] = text.trim().replace(/\0+$/, '');
    off += sz;
  }
  return { id3v2: { version: `2.${maj}`, tags } };
}

/* ID3v1  (last 128 bytes) */
function ID3v1(buf) {
  const v = new DataView(buf);
  const tail = buf.byteLength - 128;
  if (readStr(v, tail, 3) !== 'TAG') return null;
  return {
    title: readStr(v, tail + 3, 30).trim(),
    artist: readStr(v, tail + 33, 30).trim(),
    album: readStr(v, tail + 63, 30).trim(),
    year: readStr(v, tail + 93, 4).trim(),
    comment: readStr(v, tail + 97, 30).trim(),
    genre: v.getUint8(tail + 127)
  };
}

/* Vorbis-comment header (FLAC or Ogg) */
function VorbisComment(buf) {
  const dv = new DataView(buf);
  const needle = [0x4f, 0x67, 0x67, 0x53]; // OggS
  for (let i = 0; i < 64 * 1024; i++) {
    if (dv.getUint32(i) === 0x05606767) { // little-endian "OggS"
      const txt = new TextDecoder().decode(buf.slice(i, i + 64 * 1024));
      const m = txt.match(/vendor=([^\n]+)\n([\s\S]+)/);
      if (m) {
        const lines = m[2].split('\n');
        const tags = {};
        lines.forEach(l => {
          const [k, ...v] = l.split('=');
          if (k) tags[k.toUpperCase()] = v.join('=');
        });
        return { vorbis: tags };
      }
    }
  }
  return null;
}

/* RIFF LIST-INFO */
function RiffInfo(buf) {
  const dv = new DataView(buf);
  if (readStr(dv, 0, 4) !== 'RIFF') return null;
  const tags = {};
  let off = 12;
  while (off < dv.byteLength - 8) {
    const ckID = readStr(dv, off, 4);
    const sz = dv.getUint32(off + 4, true);
    if (ckID === 'LIST') {
      const type = readStr(dv, off + 8, 4);
      if (type === 'INFO') {
        let sub = off + 12;
        while (sub < off + 8 + sz) {
          const id = readStr(dv, sub, 4);
          const len = dv.getUint32(sub + 4, true);
          const val = new TextDecoder('latin1')
            .decode(buf.slice(sub + 8, sub + 8 + len))
            .replace(/\0/g, '');
          tags[id] = val.trim();
          sub += 8 + (len + 1 & ~1); // word aligned
        }
        return { riff: tags };
      }
    }
    off += 8 + (sz + 1 & ~1);
  }
  return null;
}

/* iXML chunk inside broadcast-wave */
function iXML(buf) {
  const txt = new TextDecoder().decode(buf);
  const open = txt.indexOf('<iXML>');
  const close = txt.indexOf('</iXML>');
  if (open === -1 || close === -1) return null;
  const xml = txt.slice(open, close + 7);
  return { ixml: xml }; // you can DOM-parse if you like
}

/* helper: sync-safe int32 (ID3v2) */
function syncsafe32(v, off) {
  return (v.getUint8(off) << 21) |
    (v.getUint8(off + 1) << 14) |
    (v.getUint8(off + 2) << 7) |
    (v.getUint8(off + 3));
}
