import fs from 'node:fs';
import zlib from 'node:zlib';

function crc32(buf) {
    let table = [];
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) {
            c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table[i] = c >>> 0;
    }
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
        crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(width, height, rgbaBuffer) {
    const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8;
    ihdr[9] = 6;
    ihdr[10] = 0;
    ihdr[11] = 0;
    ihdr[12] = 0;
    const ihdrChunk = makeChunk('IHDR', ihdr);

    const rowBytes = width * 4;
    const rawData = Buffer.alloc(height * (rowBytes + 1));
    for (let y = 0; y < height; y++) {
        const destOffset = y * (rowBytes + 1);
        rawData[destOffset] = 0;
        rgbaBuffer.copy(rawData, destOffset + 1, y * rowBytes, (y + 1) * rowBytes);
    }

    const compressed = zlib.deflateSync(rawData);
    const idatChunk = makeChunk('IDAT', compressed);
    const iendChunk = makeChunk('IEND', Buffer.alloc(0));

    return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// Nearest-neighbor / clean scale helper
function scaleRgba(srcRgba, srcW, srcH, scale) {
    const dstW = srcW * scale;
    const dstH = srcH * scale;
    const dst = Buffer.alloc(dstW * dstH * 4);
    for (let y = 0; y < dstH; y++) {
        const srcY = Math.floor(y / scale);
        for (let x = 0; x < dstW; x++) {
            const srcX = Math.floor(x / scale);
            const srcIdx = (srcY * srcW + srcX) * 4;
            const dstIdx = (y * dstW + x) * 4;
            dst[dstIdx] = srcRgba[srcIdx];
            dst[dstIdx + 1] = srcRgba[srcIdx + 1];
            dst[dstIdx + 2] = srcRgba[srcIdx + 2];
            dst[dstIdx + 3] = srcRgba[srcIdx + 3];
        }
    }
    return { dstW, dstH, dst };
}

const aniPath = 'C:/Users/icstc/.gemini/antigravity/brain/6d580978-26a9-4f5c-8c48-2427a20e2ba7/.user_uploaded/media_1794110893227_c961ebef.ani';
const aniBuf = fs.readFileSync(aniPath);

// Copy raw .ani to public
fs.writeFileSync('public/LoadingBlue.ani', aniBuf);
fs.writeFileSync('public/icons/LoadingBlue.ani', aniBuf);

fs.mkdirSync('public/cursors/loading-blue', { recursive: true });

let pos = 56 + 12;
let frameIdx = 0;
let primaryRgba = null;

while (pos < aniBuf.length) {
    const subId = aniBuf.toString('ascii', pos, pos + 4);
    if (subId !== 'icon') break;
    const subSize = aniBuf.readUInt32LE(pos + 4);
    const curBuf = aniBuf.subarray(pos + 8, pos + 8 + subSize);

    // Save individual .cur frame
    fs.writeFileSync(`public/cursors/loading-blue/frame_${frameIdx}.cur`, curBuf);
    if (frameIdx === 0) {
        fs.writeFileSync('public/LoadingBlue.cur', curBuf);
        fs.writeFileSync('public/icons/cursor.cur', curBuf);
    }

    // Parse DIB to PNG
    const dwImageOffset = curBuf.readUInt32LE(18);
    const dib = curBuf.subarray(dwImageOffset);
    const w = dib.readInt32LE(4);
    const h = Math.abs(dib.readInt32LE(8)) / 2;

    const pixelData = dib.subarray(40, 40 + w * h * 4);
    const rgba = Buffer.alloc(w * h * 4);

    for (let y = 0; y < h; y++) {
        const dibRow = (h - 1 - y) * (w * 4);
        const pngRow = y * (w * 4);
        for (let x = 0; x < w; x++) {
            const srcIdx = dibRow + x * 4;
            const dstIdx = pngRow + x * 4;
            rgba[dstIdx] = pixelData[srcIdx + 2];     // R
            rgba[dstIdx + 1] = pixelData[srcIdx + 1]; // G
            rgba[dstIdx + 2] = pixelData[srcIdx];     // B
            rgba[dstIdx + 3] = pixelData[srcIdx + 3]; // A
        }
    }

    if (frameIdx === 0) {
        primaryRgba = rgba;
    }

    const png = encodePng(w, h, rgba);
    fs.writeFileSync(`public/cursors/loading-blue/frame_${frameIdx}.png`, png);

    frameIdx++;
    pos += 8 + subSize + (subSize % 2);
}

// Generate standard 32x32, 48x48, 64x64, 128x128 sizes for primary cursor
if (primaryRgba) {
    const p32 = encodePng(32, 32, primaryRgba);
    fs.writeFileSync('public/cursor.png', p32);
    fs.writeFileSync('public/LoadingBlue.png', p32);
    fs.writeFileSync('public/icons/cursor.png', p32);
    fs.writeFileSync('public/icons/cursor-32.png', p32);

    // 48x48
    const s48 = scaleRgba(primaryRgba, 32, 32, 1.5);
    fs.writeFileSync('public/icons/cursor-48.png', encodePng(s48.dstW, s48.dstH, s48.dst));

    // 64x64
    const s64 = scaleRgba(primaryRgba, 32, 32, 2);
    fs.writeFileSync('public/icons/cursor-64.png', encodePng(s64.dstW, s64.dstH, s64.dst));

    // 128x128
    const s128 = scaleRgba(primaryRgba, 32, 32, 4);
    fs.writeFileSync('public/icons/cursor-128.png', encodePng(s128.dstW, s128.dstH, s128.dst));
}

console.log(`Successfully extracted ${frameIdx} frames and updated public/icons/ and public/`);
