#!/bin/bash
INPUT="icon.png"
ICONSET_DIR="icons"

sizes=(16 32 64 128 256 512 1024)
mkdir -p "$ICONSET_DIR"

for size in "${sizes[@]}"; do
  sips -z $size $size "$INPUT" --out "${ICONSET_DIR}/icon_${size}x${size}.png"
done