#!/bin/bash
INPUT="icon.png"
ICONSET_DIR="app.iconset"

sizes=(16 32 128 256 512 18 36 64)
mkdir -p "$ICONSET_DIR"

for size in "${sizes[@]}"; do
  sips -z $size $size "$INPUT" --out "${ICONSET_DIR}/icon_${size}x${size}.png"

  retina=$((size*2))
  if [[ $retina -le 1024 ]]; then
    sips -z $retina $retina "$INPUT" --out "${ICONSET_DIR}/icon_${size}x${size}@2x.png"
  fi
done

iconutil -c icns "$ICONSET_DIR" -o app.icns