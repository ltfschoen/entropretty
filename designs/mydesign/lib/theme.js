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
      x: 5,
      y: -25,
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

  // // images
  //
  // ctx.drawImage("./myimage.png");
  // ctx.createPattern("./myimage.png", 10);
  // ctx.setLineDash([0,1,0,1]);

  // // transform
  // ctx.resetTransform();
  // ctx.setTransform(1,0,1,0,1,0);
  // const [a,b,c,d,e,f] = ctx.getTransform();
  // ctx.setTransform(a+1,b+1,c+1,d+1,e+1,f+1);


  // // path
  //
  // ctx.beginPath();
  // ctx.rect(0, 1, 0, 1);
  // ctx.arcTo(10, 10, 10, 10, 5);
  // ctx.moveTo(0, 0);
  // ctx.clip();
  // ctx.closePath();

  // // command
  //
  // ctx.quadraticCurveTo(10, 10, 0, 1);
  // ctx.bezierCurveTo(10, 10, 10, 10, 0, 1);
  // ctx.lineTo(0, 1);
  // ctx.arc(0, 1, 2, 0.1, 0.5, false);

  // // element
  // ctx.clearRect(0, 1, 0, 1);
  // ctx.strokeRect(0, 1, 0, 1);
  // ctx.strokeText("mytext", 0, 1);
  // ctx.stroke();
  // ctx.fillRect(0, 1, 0, 1);
  // ctx.fill();
  // ctx.fillText("mytext", 0, 1);
  // ctx.measureText("mytext");

  // // gradient
  // ctx.createLinearGradient(0, 1, 0, 1);
  // ctx.createRadialGradient(0, 1, 2, 0, 1, 2);
}

export {
  setTheme,
}
