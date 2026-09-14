#!/usr/bin/env python3
"""Generate the icon set (stdlib only): a white pawn on a red rounded square.
Run from repo root: python3 scripts/make-icons.py"""
import struct, zlib, pathlib

BG = (0xC0, 0x39, 0x2B)
FG = (0xFF, 0xFF, 0xFF)
SS = 4  # supersampling factor

# MARK: pawn geometry (unit square, y down)
def inside_pawn(x, y):
    # head
    if (x - .5) ** 2 + (y - .30) ** 2 <= .12 ** 2: return True
    # collar
    if .40 <= x <= .60 and .40 <= y <= .45: return True
    # neck (narrowing trapezoid)
    if .44 <= y <= .62:
        t = (y - .44) / .18
        hw = .075 + .105 * t
        if abs(x - .5) <= hw: return True
    # body bulge
    if (x - .5) ** 2 / .20 ** 2 + (y - .64) ** 2 / .10 ** 2 <= 1: return True
    # base
    if .26 <= x <= .74 and .70 <= y <= .80: return True
    return False

def inside_bg(x, y, r=.18):
    # rounded square
    cx = min(max(x, r), 1 - r); cy = min(max(y, r), 1 - r)
    return (x - cx) ** 2 + (y - cy) ** 2 <= r ** 2

# MARK: raster
def render(size):
    n = size * SS
    rows = []
    for py in range(size):
        row = bytearray()
        for px in range(size):
            acc = [0, 0, 0, 0]
            for sy in range(SS):
                for sx in range(SS):
                    x = (px * SS + sx + .5) / n; y = (py * SS + sy + .5) / n
                    if not inside_bg(x, y): continue
                    c = FG if inside_pawn(x, y) else BG
                    acc[0] += c[0]; acc[1] += c[1]; acc[2] += c[2]; acc[3] += 255
            k = SS * SS
            a = acc[3] // k
            if a:  # un-premultiply against covered samples only
                cov = acc[3] / 255
                row += bytes((int(acc[0] / cov), int(acc[1] / cov), int(acc[2] / cov), a))
            else:
                row += b'\0\0\0\0'
        rows.append(b'\x00' + bytes(row))
    return b''.join(rows)

def png(size):
    def chunk(t, d):
        return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    return (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(render(size), 9)) + chunk(b'IEND', b''))

out = pathlib.Path(__file__).resolve().parent.parent / 'icons'
out.mkdir(exist_ok=True)
for s in (16, 48, 128):
    (out / f'{s}.png').write_bytes(png(s))
print('icons written to', out)
