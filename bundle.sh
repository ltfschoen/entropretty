#!/bin/bash

for file in ./designs/*.js;
do
  rollup -i $file -o out/$(basename $file) -f es -p 'terser={mangle: {reserved: [\"draw\"]}}';
done

for dir in ./designs/*/;
do
  for file in $(dir);
    do
      rollup -i ./designs/$(dir)/$(file).js -o out/$(dir)/$(basename $(file)) -f es -p 'terser={mangle: {reserved: [\"draw\"]}}';
    done
done

# for dir in ./designs; do for file in dir; do rollup -i ./designs/$(dir)/$(file).js -o out/$(dir)/$(basename $(file)) -f es -p 'terser={mangle: {reserved: [\"draw\"]}}'; done done

# rollup -i x.js -o out/$(basename x.js) -f es -p 'terser={mangle: {reserved: [\"draw\"]}}';
