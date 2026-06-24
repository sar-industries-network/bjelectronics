import fs from 'node:fs';
import path from 'node:path';

const outDir = path.join(process.cwd(), 'out');
const target = path.join(process.cwd(), 'bjelectronics-hostinger-out.zip');
if (!fs.existsSync(outDir)) {
  console.error('Cannot create artifact: out directory is missing. Run npm run build first.');
  process.exit(1);
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c >>> 0;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function dosTime(date) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}
function walk(dir) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...walk(full));
    else result.push(full);
  }
  return result;
}

const chunks = [];
const central = [];
let offset = 0;
for (const file of walk(outDir)) {
  const data = fs.readFileSync(file);
  const rel = path.relative(outDir, file).replace(/\\/g, '/');
  const name = Buffer.from(rel);
  const stat = fs.statSync(file);
  const { time, day } = dosTime(stat.mtime);
  const crc = crc32(data);

  const local = Buffer.alloc(30 + name.length);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0, 6);
  local.writeUInt16LE(0, 8);
  local.writeUInt16LE(time, 10);
  local.writeUInt16LE(day, 12);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(data.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(name.length, 26);
  local.writeUInt16LE(0, 28);
  name.copy(local, 30);
  chunks.push(local, data);

  const cent = Buffer.alloc(46 + name.length);
  cent.writeUInt32LE(0x02014b50, 0);
  cent.writeUInt16LE(20, 4);
  cent.writeUInt16LE(20, 6);
  cent.writeUInt16LE(0, 8);
  cent.writeUInt16LE(0, 10);
  cent.writeUInt16LE(time, 12);
  cent.writeUInt16LE(day, 14);
  cent.writeUInt32LE(crc, 16);
  cent.writeUInt32LE(data.length, 20);
  cent.writeUInt32LE(data.length, 24);
  cent.writeUInt16LE(name.length, 28);
  cent.writeUInt16LE(0, 30);
  cent.writeUInt16LE(0, 32);
  cent.writeUInt16LE(0, 34);
  cent.writeUInt16LE(0, 36);
  cent.writeUInt32LE(0, 38);
  cent.writeUInt32LE(offset, 42);
  name.copy(cent, 46);
  central.push(cent);
  offset += local.length + data.length;
}

const centralOffset = offset;
const centralSize = central.reduce((sum, item) => sum + item.length, 0);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(0, 4);
end.writeUInt16LE(0, 6);
end.writeUInt16LE(central.length, 8);
end.writeUInt16LE(central.length, 10);
end.writeUInt32LE(centralSize, 12);
end.writeUInt32LE(centralOffset, 16);
end.writeUInt16LE(0, 20);

fs.writeFileSync(target, Buffer.concat([...chunks, ...central, end]));
console.log(`Hostinger zip created: ${path.basename(target)} (${central.length} files)`);
