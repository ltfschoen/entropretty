// Original source: https://gist.github.com/adamwdraper/4212319
// Modifications: Loops through subdirectories 
import { execSync } from 'child_process';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const designFolderName = 'designs';

const next = (dir, subFolderName, list, i, done) => {
  let file = list[i++];

  if (!file) {
    return done(null);
  }

  const walkPathLength = walkPath.length;
  var subFolderName = dir.slice(walkPathLength + 1);

  file = dir + '/' + file;
  let _subFolderName = subFolderName;
  
  fs.stat(file, function (error, stat) {
      if (stat && stat.isDirectory()) {

          const dirLength = dir.length;
          var subFolderName = file.slice(dirLength + 1);

          walk(file, subFolderName, function (error) {
              next(dir, subFolderName, list, i, done);
          });
      } else {
          var rollupCommand;
          if (_subFolderName) {
            rollupCommand = `rollup -i ${file} -o out/${_subFolderName}/$(basename ${file}) -f es -p 'terser={mangle: {reserved: [\"draw\"]}}';`;
          } else {
            rollupCommand = `rollup -i ${file} -o out/$(basename ${file}) -f es -p 'terser={mangle: {reserved: [\"draw\"]}}';`;
          }
          
          execSync(rollupCommand, { encoding: 'utf-8' });  // the default is 'buffer'

          next(dir, _subFolderName, list, i, done);
      }
  });
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var walkPath = path.join(__dirname, designFolderName);

var walk = function (dir, subFolderName, done) {
    fs.readdir(dir, function (error, list) {
        if (error) {
            return done(error);
        }

        var i = 0;
        next(dir, subFolderName, list, i, done);
    });
};

walk(walkPath, null, function(error) {
    if (error) {
        throw error;
    }
});