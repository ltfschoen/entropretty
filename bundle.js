import { execSync } from 'child_process';  // replace ^ if using ES modules

// const output = execSync('rollup --help', { encoding: 'utf-8' });  // the default is 'buffer'
// console.log('Output was:\n', output);


// Reference: https://gist.github.com/adamwdraper/4212319
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

var next = function (dir, subFolderName, list, i, done) {
  var file = list[i++];

  if (!file) {
      return done(null);
  }
  
  console.log('dir1: ', dir)
  console.log('file1: ', file)
  console.log('subFolderName: ', subFolderName)

  file = dir + '/' + file;
  console.log('file x: ', file)
  let _subFolderName = subFolderName;
  
  fs.stat(file, function (error, stat) {
      console.log('file: ', file)
      console.log('stat && stat.isDirectory(): ', stat && stat.isDirectory())

      if (stat && stat.isDirectory()) {

          var subFolderName = file.slice(file.lastIndexOf('/')+1)
          console.log('subFolderName: ', subFolderName)

          walk(file, subFolderName, function (error) {
              // rollup -i ./designs/$(dir)/$(file).js -o out/$(dir)/$(basename $(file)) -f es -p 'terser={mangle: {reserved: [\"draw\"]}}';


              // var rollupCommand = `rollup -i ${walkPath}/${subFolderName}/$(basename ${file}) -o out/${subFolderName}/$(basename ${file}) -f es -p 'terser={mangle: {reserved: [\"draw\"]}}';`;
              // console.log('rollupCommand: ', rollupCommand);
              // var output = execSync(rollupCommand, { encoding: 'utf-8' });  // the default is 'buffer'
              console.log('subFolderName y: ', subFolderName)
              next(dir, subFolderName, list, i, done);
          });
      } else {
          // do stuff to file here
          // console.log(file);

          console.log('subFolderName x: ', _subFolderName)

          var rollupCommand;
          if (_subFolderName) {
            rollupCommand = `rollup -i ${file} -o out/${_subFolderName}/$(basename ${file}) -f es -p 'terser={mangle: {reserved: [\"draw\"]}}';`;
          } else {
            rollupCommand = `rollup -i ${file} -o out/$(basename ${file}) -f es -p 'terser={mangle: {reserved: [\"draw\"]}}';`;
          }
          
          var output = execSync(rollupCommand, { encoding: 'utf-8' });  // the default is 'buffer'

          console.log('Output was:\n', output);

          next(dir, _subFolderName, list, i, done);
      }
  });
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var walkPath = path.join(__dirname, 'designs');

var walk = function (dir, subFolderName, done) {
    fs.readdir(dir, function (error, list) {
        if (error) {
            return done(error);
        }

        var i = 0;
        next(dir, subFolderName, list, i, done);
    });
};

// optional command line params
//      source for walk path
process.argv.forEach(function (val, index, array) {
    if (val.indexOf('source') !== -1) {
        walkPath = val.split('=')[1];
    }
});

console.log('-------------------------------------------------------------');
console.log('processing...');
console.log('-------------------------------------------------------------');

walk(walkPath, null, function(error) {
    if (error) {
        throw error;
    } else {
        console.log('-------------------------------------------------------------');
        console.log('finished.');
        console.log('-------------------------------------------------------------');
    }
});