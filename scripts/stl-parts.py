#!/usr/bin/env python3
"""Count the separate pieces in a binary STL (triangles that share vertices).

A printable object from one model should be one piece; more means part of
it floats loose.
Usage: scripts/stl-parts.py file.stl
"""
import struct
import sys


def parts(path):
    with open(path, 'rb') as f:
        data = f.read()
    count = struct.unpack_from('<I', data, 80)[0]
    parent = {}

    def find(v):
        while parent[v] != v:
            parent[v] = parent[parent[v]]
            v = parent[v]
        return v

    for i in range(count):
        base = 84 + i * 50 + 12
        corners = [tuple(round(c, 4) for c in struct.unpack_from('<3f', data, base + 12 * j)) for j in range(3)]
        for c in corners:
            parent.setdefault(c, c)
        a = find(corners[0])
        for c in corners[1:]:
            parent[find(c)] = a
    return len({find(v) for v in parent})


if __name__ == '__main__':
    print(parts(sys.argv[1]))
