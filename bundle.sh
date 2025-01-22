#!/bin/bash

for file in ./designs/*.js;
do
  rollup -i $file -o out/$(basename $file) -f es -p 'terser={mangle: {reserved: [\"draw\"]}}';
  rollup -i ./designs/x.js -o out/x/$(basename x.js) -f es -p 'terser={mangle: {reserved: [\"draw\"]}}';
done

# rollup -i x.js -o out/$(basename x.js) -f es -p 'terser={mangle: {reserved: [\"draw\"]}}';
