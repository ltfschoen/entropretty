import { black, dark, light, shade } from "../../../utils.js";

const themes = {
  default: {
    fillStyle: shade,
    font: '25px serif',
    globalAlpha: 0.5,
    lineWidth: 1,
    lineDash: [],
    rotate: 45 * Math.PI / 180, // radians
    scale: {
      x: 4,
      y: 4,
    },
    shadowBlur: 10,
    shadowColor: dark,
    shadowOffset: {
      x: 10,
      y: 10,
    },
    strokeStyle: light,
    textAlign: 'center', // 'start', 'center', 'end'
    textBaseline: 'alphabetic',
    translate: {
      x: 20,
      y: -50,
    }
  }
};

const setTheme = (ctx, theme) => {
  ctx.restore();
  ctx.save();
  ctx.fillStyle = themes[theme].fillStyle;
  ctx.font = themes[theme].font;
  ctx.globalAlpha = themes[theme].globalAlpha;
  ctx.lineWidth = themes[theme].lineWidth;
  ctx.lineDash = themes[theme].lineDash;
  ctx.rotate(themes[theme].rotate);
  ctx.scale(themes[theme].scale.x, themes[theme].scale.y);
  ctx.shadowBlur = themes[theme].shadowBlur;
  ctx.shadowColor = themes[theme].shadowColor;
  ctx.shadowOffsetX = themes[theme].shadowOffset.x;
  ctx.shadowOffsetY = themes[theme].shadowOffset.y;
  ctx.strokeStyle = themes[theme].strokeStyle;
  ctx.textAlign = themes[theme].textAlign;
  ctx.textBaseline = themes[theme].textBaseline;
  ctx.translate(themes[theme].translate.x, themes[theme].translate.y);
}

export {
  setTheme,
}