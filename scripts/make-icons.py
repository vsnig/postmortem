#!/usr/bin/env python3
"""Generate flat placeholder icons (stdlib only). Run from repo root: python3 scripts/make-icons.py"""
import struct, zlib, pathlib

def png(size, rgb):
    raw = b''.join(b'\x00' + bytes(rgb) * size for _ in range(size))
    def chunk(t, d):
        return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    return (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))

out = pathlib.Path(__file__).resolve().parent.parent / 'icons'
out.mkdir(exist_ok=True)
for s in (16, 48, 128):
    (out / f'{s}.png').write_bytes(png(s, (0xc0, 0x39, 0x2b)))
print('icons written to', out)
