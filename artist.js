// Import all utils, to make them available to the code editor
import {
  pi,
  shade,
  black,
  white,
  light,
  dark,
  gray,
  turn,
  deg,
  randomGenerator,
  secureRandomGenerator,
  bits,
  bit,
  split,
  numeric,
  symmetrical,
  setDefaultContext,
} from "./utils.js";

let schemas = { "[Custom]": { draw: null } };
let standardSeed = [14, 2, 16, 9, 2, 4, 9, 6];
let context;

function thumb(draw) {
    let canvas = new OffscreenCanvas(100, 100);
    drawItem(canvas.getContext('2d'), {draw}, standardSeed, 100, 100);
    return canvas.transferToImageBitmap();
}
function captionThumb(draw) {
    let canvas = new OffscreenCanvas(100, 30);
    draw(canvas.getContext('2d'), 100, 30);
    return canvas.transferToImageBitmap();
}

onmessage = async function(e) {
    if (e.data.op == 'render') {
        let { schemaName, note, seed, width, height } = e.data;
        let schema = schemas[schemaName];
        let canvas = new OffscreenCanvas(width, height);
        drawItem(canvas.getContext('2d'), schema, seed, width, height);
        let image = canvas.transferToImageBitmap();
        postMessage({ op: 'rendered', note, image, seed, width, height });
    } else if (e.data.op == 'renderSvg') {
        let { schemaName, note, seed, width, height } = e.data;
        let schema = schemas[schemaName];
        let canvas = new OffscreenCanvas(width, height);
        drawItem(canvas.getContext('2d'), schema, seed, width, height);
        const options = {
            quality: 1.0,
            type: "image/svg+xml",
        };
        let blob = await canvas.convertToBlob(options);
        postMessage({ op: 'renderedSvg', note, blob, seed, width, height });
    } else if (e.data.op == 'updateCustom') {
        try {
            let d = eval(e.data.code);
            schemas['[Custom]'].draw = d;
            if (e.data.thumb) {
                postMessage({ op: 'customThumb', thumb: thumb(d) });
            }
        }
        catch (e) {
            console.warn('Invalid draw code', e);
        }
    }
};

function drawItem(ctx, schema, seed, width, height) {
    ctx.save();
    ctx.scale(width / 100, width / 100);
    ctx.lineWidth = 1;
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    try {
        context = ctx;
        setDefaultContext(ctx);
        ctx.aspect = height / width;
        schema.draw(ctx, seed);
        context = null;
        setDefaultContext(null);
    }
    catch (e) {
        console.warn('Render error', e);
        ctx.lineWidth = 0.02;
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'miter';
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(100, 100 * height / width);
        ctx.moveTo(0, 100 * height / width);
        ctx.lineTo(100, 0);
        ctx.stroke();
    }
    ctx.restore();
}

Object.defineProperty(Array.prototype, 'strokeEach', {
    value: function(f) {
        this.forEach((e, i) => {
            context.beginPath();
            f(e, i);
            context.stroke();
        });
    }
});
Object.defineProperty(Array.prototype, 'fillEach', {
    value: function(f) {
        this.forEach((e, i) => {
            context.beginPath();
            f(e, i);
            context.fill();
        });
    }
});

function addSchema(schema, id) {
    console.log('Adding schema', schema, Array.isArray(schema));
    if (Array.isArray(schema)) {
        schema.forEach((s, i) => addSchema(s, id + i))
    } else {
        id.replace(/\W/g, '');
        let caption = schema.caption ? captionThumb(schema.caption) : null;
        let message = { op: 'addSchema', id, thumb: thumb(schema.draw), name: schema.name, artist: schema.artist, caption };
        postMessage(message);
        schemas[id] = { draw: schema.draw };
    }
}

const DESIGNS = [
    'bloom.js',
    'circlebara.js',
    'circlebarb.js',
    'circles.js',
    'datetime.js',
    'dial.js',
    'kins.js',
    'lemonjelly.js',
    'lines.js',
    'maze.js',
    'planets.js',
    'poly.js',
    'roman.js',
    'split.js',
    'sprite.js',
    'squares.js',
    'star.js',
    'example',
];

async function checkExists(importPath) {
    try {
        await import(importPath).schema;
    } catch {
        throw 'The directory does not exist.'
    }
}

let importPath, schema;
for (let d in DESIGNS.sort()) {
    importPath = `./designs/${DESIGNS[d]}`;
    if (importPath.slice(-3) == ".js") {
        schema = (await import(importPath)).schema;
    } else {
        importPath = importPath + '/index.js';
        checkExists(importPath);
        schema = (await import(importPath)).schema;
    }
    addSchema(schema, d);
}
postMessage({ op: 'initialized' });
