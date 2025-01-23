import { setTheme } from "./lib/index.js";

function draw(ctx, seed) {
  setTheme(ctx, 'default');
  seed.forEach((n, i) => ctx.fillText(n, 50, i * 25 + 25, 100));
}

export const schema = { draw, name: "My Cool Design", artist: "myartistname" };