let artist = null;
let lastCustomCode = "";
let seeds = null;
let index = [0, 0];
let ongoing = 0;
let artistTimeout = null;
let renderCache = {};
let schemaName = null;
let customChangeTimeout = null;
let editor = null;
let artistInitialized = false;
let big = false;
const EXPORT_SIZE = 8000;
const CUSTOM = '[Custom]';

var schemas = { '[Custom]': { draw: null } };
function addSchema(name, draw) {
	name.replace(/\W/g, '');
	console.log("Adding schema", name);
	schemas[name] = { draw };
}

import('./svgcanvas.js');

function load() {
	require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.26.1/min/vs' }});
	require(["vs/editor/editor.main"], () => {
		editor = monaco.editor.create(document.getElementById('code'), {
		value: [
			`function draw(ctx, seed) {`,
			`  ctx.font = '0.4px serif';`,
			`  split(seed, 2).forEach((n, i) => ctx.fillText(n, 0.5, i / 2 + 0.25, 1));`,
			`}`,
			`addSchema('${CUSTOM}', draw);`
		].join('\n'),
		language: 'javascript',
		theme: 'vs-dark',
		automaticLayout: true,
	  });
	  editor.onDidChangeModelContent((e) => { customChanged() });
	  ensureInitialized();
	});
	resetArtist();
}

function ensureInitialized() {
	if (!editor || !artistInitialized || seeds) return;

	let cc = window.localStorage.getItem("customCode");
	if (cc) {
		editor.setValue(cc);
	}
	updateCustom();
	try {
		selectSchema(window.localStorage.getItem("schemaName") || CUSTOM);
	}
	catch (e) {
		selectSchema(CUSTOM);
	}
	try {
		index = JSON.parse(window.localStorage.getItem('index'));
	}
	finally {
		if (!index) index = [0, 0];
	}
	try {
		seeds = JSON.parse(window.localStorage.getItem('seeds'));
	}
	finally {
		if (seeds) {
			rerender();
		} else {
			resetSeeds();
		}
	}
}

function clicked(e) {
	if (e.offsetY >= 400 * 1.12) {
		let x = Math.floor(e.offsetX / (50 * 1.02));
		let y = Math.floor((e.offsetY - 400 * 1.12) / (50 * 1.12));
		index = [Math.min(7, y), Math.min(15, x)];
	} else if (e.offsetX >= 400 * 1.02) {
		let x = Math.floor((e.offsetX - 400 * 1.02) / (100 * 1.02));
		let y = Math.floor(e.offsetY / (100 * 1.12));
		index = [index[0], Math.min(3, y) * 4 + Math.min(3, x)];
	} else {
		return
	}
	window.localStorage.setItem("index", JSON.stringify(index));
	ensureUpdated();
}

function bigMode() {
	big = true;
	rerender();
}

function smallMode() {
	big = false;
	rerender();
}

function selectSchema(name) {
	if (schemaName == name) return;
	if (schemaName) {
		let e = document.getElementById(schemaName == CUSTOM ? 'customthumb' : `thumb-${schemaName}`);
		if (e) e.style.backgroundColor = 'transparent';
	}
	schemaName = name;
	let e = document.getElementById(schemaName == CUSTOM ? 'customthumb' : `thumb-${schemaName}`);
	// Can be null if our browser local storage holds stale names.
	if (!e) return;
	e.style.backgroundColor = '#bbf';
	if (e.scrollIntoViewIfNeeded) e.scrollIntoViewIfNeeded();
	window.localStorage.setItem('schemaName', name);
	document.title = `Entropretty - ${name}`;
	rerender();
}

function exportPng() {
//    artist.postMessage({ op: 'render', note: 'export', schemaName, seed: seeds[index[0]][index[1]], width: 12000, height: 18600});
	artist.postMessage({ op: 'render', note: 'export', schemaName, seed: seeds[index[0]][index[1]], width: 2000, height: 2000});
}

function exportSvg() {
	artist.postMessage({ op: 'renderSvg', note: 'export', schemaName, seed: seeds[index[0]][index[1]], width: 2000, height: 2000});
}

function exportSvgAnimation() {
	artist.postMessage({ op: 'renderSvgAnimation', note: 'export', schemaName, seeds: seeds, index: index, width: 2000, height: 2000});
}

function updateCustom() {
	let customCode = editor.getValue().trim();
	let prefix = "function draw(ctx, seed) {\n";
	let suffix = `\n}\naddSchema('${CUSTOM}', draw);`;
	if (!customCode.startsWith(prefix) || !customCode.endsWith(suffix)) {
		if (lastCustomCode.startsWith(prefix) && lastCustomCode.endsWith(suffix)) {
			editor.setValue(lastCustomCode);
			return;
		} else {
			customCode = prefix + customCode + suffix;
		}
	}
	if (lastCustomCode == customCode) return;
	lastCustomCode = customCode;
	window.localStorage.setItem("customCode", customCode);
	let code = customCode
		.replace('°', ' * Math.PI * 2')
		.slice(0, -suffix.length) + "} draw";
	console.log("Main: Updating custom...");
	schemas[CUSTOM].draw = eval(code);
	artist.postMessage({ op: 'updateCustom', code, thumb: !big });
}

function customChanged() {
	updateCustom();
	if (seeds) selectSchema(CUSTOM);
	if (customChangeTimeout) window.clearTimeout(customChangeTimeout);
	customChangeTimeout = window.setTimeout(() => { customChangeTimeout = null; rerender(); }, 1000);
}

function resetArtist() {
	if (artist) {
		console.log("Timing out");
		artist.terminate();
	}
	artist = new Worker('artist.js', {'type': 'module'});
	artist.onmessage = onArtistMessage;
	artistTimeout = null;
	ongoing = 0;
}

function finishRender() {
	window.clearTimeout(artistTimeout);
	artistTimeout = null;
	paint();
}

function ensureUpdated() {
	if (ongoing == 0) {
		// Everything rendered
		paint();
	}
	// No need to do anything if still rendering as we will paint once it's complete.
}

function resetSeeds() {
	let mutate = mutateBits(3);
	seeds = [];
	for(var i = 0; i < 8; ++i) {
		let run = [randSeed(4)];
		for(var j = 0; j < 16; ++j) {
			run.push(run.slice(-1)[0].slice());
			mutate(run.slice(-1)[0]);
		}
		seeds.push(run);
	}
	window.localStorage.setItem('seeds', JSON.stringify(seeds));
	rerender();
}

function rerender() {
	// We must bail if there's no seeds yet - we will call rerender at the end of the initialization
	// process anyway.
	if (!seeds) return;
	renderCache = {};
	if (artistTimeout) {
		window.clearTimeout(artistTimeout);
		resetArtist();
	}
	artistTimeout = window.setTimeout(resetArtist, 500000);
	console.log(`Main: Rerendering ${schemaName}`);
	if (big) {
		ongoing++;
		artist.postMessage({ op: 'render', note: 'screen', schemaName, seed: seeds[index[0]][index[1]], width: 800, height: 800 });
	} else {
		for(var y = 0; y < 8; y++) {
			for(var x = 0; x < 16; x++) {
				ongoing++;
				artist.postMessage({ op: 'render', note: 'screen', schemaName, seed: seeds[y][x], width: 400, height: 400 });
			}
		}
	}
}

async function onArtistMessage(e) {
	if (e.data.op == 'rendered') {
		let { image, seed, note } = e.data;
		if (note == "export") {
			let downloadLink = document.createElement('a');
			downloadLink.setAttribute('download', `${schemaName}-${seed}.png`);
			let canvas = document.createElement('canvas');
			canvas.width = e.data.width;
			canvas.height = e.data.height;
			canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
			canvas.toBlob(function(blob) {
			  downloadLink.setAttribute('href', URL.createObjectURL(blob));
			  downloadLink.click();
			});
		} else {
			renderCache[numeric(seed)] = image;
			ongoing = Math.max(0, ongoing - 1);
			if (ongoing == 0) {
				finishRender();
			}
		}
	} else if (e.data.op == 'renderedSvg') {
		let { blob, seed, note } = e.data;
		if (note == "export") {
			let downloadLink = document.createElement('a');
			downloadLink.setAttribute('download', `${schemaName}-${seed}.svg`);
			let canvas = document.createElement('canvas');
			canvas.width = e.data.width;
			canvas.height = e.data.height;
			downloadLink.setAttribute('href', URL.createObjectURL(blob));
			downloadLink.click();
		} else {
			renderCache[numeric(seed)] = image;
			ongoing = Math.max(0, ongoing - 1);
			if (ongoing == 0) {
				finishRender();
			}
		}
	} else if (e.data.op == 'renderedSvgAnimations') {
		let { blobs, seed, index, schemaPrefix, note } = e.data;
		if (note == "export") {
			const zip = new JSZip();
			const files = blobs;
			const zipName = `${schemaPrefix}-animation`;
			const img = zip.folder(zipName);
			for (let file of files) {
				const filename = file.name;
				const fileblob = file.blob;
				img.file(filename, fileblob);
			}
			// Generate the complete zip file and download it
			const blobdata = await zip.generateAsync({type: 'blob'});
			const zipblob = new Blob([blobdata]);
			const downloadLink = document.createElement("a");
			downloadLink.setAttribute('download', `${zipName}.zip`);
			downloadLink.setAttribute('href', URL.createObjectURL(zipblob));
			downloadLink.click();
		} else {
			console.error(`Unknown postMessage note: ${note}`);
		}
	} else if (e.data.op == 'addSchema') {
		if (artistInitialized) return;
		let canvas = document.createElement('canvas');
		let thumb = e.data.thumb;
		canvas.id = `thumb-${e.data.id}`;
		canvas.width = 100;
		canvas.height = 130;
		let ctx = canvas.getContext('2d');
		ctx.drawImage(thumb, 0, 0, thumb.width, thumb.height, 4, 4, 92, 92);
		console.log("Placing Schema", e.data);
		if (!e.data.caption) {
			ctx.fillStyle = "black";
			ctx.textAlign = "left";
			ctx.textBaseline = "bottom";
			ctx.font = "bold 14px Palatino";
			ctx.fillText(e.data.name, 0, 116, 100);
			if (typeof e.data.artist == 'string') {
				ctx.textAlign = "right";
				ctx.font = "italic 14px Palatino";
				ctx.fillText('by ' + e.data.artist, 100, 130, 100);
			}
		} else {
			console.log("Have caption");
			ctx.drawImage(e.data.caption, 0, 0, 100, 30, 0, 100, 100, 30);
		}
		canvas.onclick = () => { selectSchema(e.data.id) };
		document.getElementById('schemas').appendChild(canvas);
	} else if (e.data.op == 'initialized') {
		artistInitialized = true;
		ensureInitialized();
	} else if (e.data.op == 'customThumb') {
		let thumb = e.data.thumb;
		let ctx = document.getElementById('customthumb').getContext('2d');
		ctx.clearRect(0, 0, 100, 100);
		ctx.drawImage(thumb, 0, 0, thumb.width, thumb.height, 0, 0, 100, 100);
	}
}

function drawItem(ctx, schema, seed, x, y, size) {
	let image = renderCache[numeric(seed)];
	if (!image) {
		ctx.lineWidth = size / 8;
		ctx.lineCap = 'butt';
		ctx.lineJoin = 'miter';
		ctx.strokeStyle = 'red';
		ctx.beginPath();
		ctx.arc(x + size / 2, y + size / 2, size / 3, 0, Math.PI * 2);
		ctx.stroke();
	} else {
		ctx.drawImage(image, 0, 0, image.width, image.height, x, y, size, size);
	}
}

function paintItem(ctx, schema, seed, x, y, size) {
	ctx.fillStyle = 'white';
	ctx.fillRect(x, y, size, size + size * 0.12);
	drawItem(ctx, schema, seed, x, y + size * 0.12, size)

	ctx.save();
	ctx.translate(x, y);
	let d = size / 16;
	let z = d / 2;
	for (let i = 0; i < 32; i++) {
		let r = i > 15;
		let c = i & 15;
		let v = bit(seed, i);
		ctx.fillStyle = v ? 'black' : 'white';
		ctx.fillRect(c * d + d / 6, r * d + d / 6, d - d / 3, d - d / 3);
	}
	ctx.restore();
}

// Assumes rendering is complete.
function paint() {
	const schema = null;
	if (ongoing > 0) {
		console.warn("paint() called while rendering. This won't work.");
		return;
	}
	var ctx = document.getElementById('canvas').getContext('2d');

	ctx.fillStyle = '#444';
	ctx.fillRect(0, 0, 800 * 1.02, 800 * 1.12);

	if (big) {
		paintItem(ctx, schema, seeds[index[0]][index[1]], 0, 0, 800);
	} else {
		paintItem(ctx, schema, seeds[index[0]][index[1]], 0, 0, 400);
		for(var i = 0; i < 16; ++i) {
			let x = i % 4;
			let y = Math.floor(i / 4);
			paintItem(ctx, schema, seeds[index[0]][i], x * 100 * 1.02 + 400 * 1.02, y * 100 * 1.12, 100);
		}
		for(var y = 0; y < 8; y++) {
			for(var x = 0; x < 16; x++) {
				paintItem(ctx, schema, seeds[y][x], x * 50 * 1.02, y * 50 * 1.12 + 400 * 1.12, 50);
			}
		}

		let highlight = (x, y, s) => {
			ctx.fillStyle = '#f002';
			ctx.fillRect(x * s * 1.02, y * s * 1.12, s * 1.02, s * 1.12);
			ctx.strokeStyle = '#f00f';
			ctx.lineWidth = 1;
			ctx.strokeRect(x * s * 1.02, y * s * 1.12, s * 1.02, s * 1.12);
		};
		ctx.save();
		ctx.translate(400 * 1.02, 0);
		highlight(index[1] % 4, Math.floor(index[1] / 4), 100);
		ctx.restore();
		ctx.save();
		ctx.translate(0, 400 * 1.12);
		highlight(index[1], index[0], 50);
		ctx.restore();
	}
}

// copied from utils as unable to import js module in common js
const white = "#fff";
const light = "#ccc";
const dark = "#666";
const black = "#000";

function shade(x) {
  if (x < 1) {
	return white;
  }
  if (x < 2) {
	return light;
  }
  if (x < 3) {
	return dark;
  }
  return black;
}

function bit(seed, i) {
	return (seed[Math.floor(i / 8) % 4] >> i % 8) & 1;
}

function bits(seed, from = 0, to = 32) {
	let r = 0;
	for (let i = from; i < to; ++i) {
		r = ((r << 1) | bit(seed, i)) >>> 0;
	}
	return r;
}

function numeric(seed) {
	return (seed[0] | seed[1] << 8 | seed[2] << 16 | seed[3] << 24) >>> 0
}

function mutateBits(count) {
	return (seed) => {
		for(var b = 0; b < count; ++b) {
			let bit = 2 ** Math.floor(Math.random() * 8);
			let item = Math.floor(Math.random() * 4);
			seed[item] ^= bit;
		}
	}
}

function randSeed(bytes = 4) {
	let s = [];
	for (var i = 0; i < bytes; ++i) {
		let n = Math.floor(Math.random() * 255);
		s.push(n);
	}
	return s
}
