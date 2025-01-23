import { light } from "../../utils.js";
import { a } from "./lib/index.js";

function draw(ctx, seed) {
  // console.log('ctz: ', ctx);
  // ctx.font = '25px serif';
  let nibbles = seed;
  ctx.lineWidth = a;
  ctx.strokeStyle = light;
  ctx.beginPath();
  for (var x = 0; x <= 100; x += 10) {
    ctx.lineTo(
      x,
      ((nibbles[0] + nibbles[1] ** 2 + x / 2) ** 2.1 % 1) * 40
    );
  }
  ctx.stroke();
}

export const schema = { draw, name: "x", artist: "ltfschoen.gh" };