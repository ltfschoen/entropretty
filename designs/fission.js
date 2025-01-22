function draw(ctx, seed) {
  ctx.font = '25px serif';
  ctx.translate(5, 5);
  ctx.scale(1, 1);
  ctx.lineWidth = 2;
  ctx.lineCap = 'stroke';
  ctx.lineJoin = 'miter';
  ctx.strokeStyle = '#888';
  ctx.fillStyle = '#111';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';

  // There are several functions provided for operating 
  // on seeds:

  // - `bit(seed, n)`: Get the `n`th bit from the `seed`, 
  // indexed from `0`. Returns either `0` or `1`.
  // - `bits(seed, from, to)`: Get a number built from 
  // the bits of `seed` of the given span `from` and `to`.
  // - `bits(seed)`: Get a number built from all bits of
  //  the seed, somewhere between 0 and 2**32 - 1 inclusive.
  // - `split(seed, parts)`: Return an array of numbers,
  //  `parts` in length, each using approximately the 
  //  same number of bits from the `seed`.
  // - `randomGenerator(seed)`: Return a function which
  //  itself takes no arguments and returns a stream
  //  of random numbers between 0 and 1. 
  //  This uses the Prando algorithm. 
  //  There is also `cheapRandomGenerator` (using SFC32) 
  //  and `secureRandomGenerator` (using SHA-256).

  seed.forEach((n, i) => ctx.fillText(n, 50, i * 25 + 25, 100));
}

export const schema = { draw, name: "Fission", artist: "ltfschoen.gh" };
