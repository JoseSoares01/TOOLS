(function () {
  var lastTime = 0;
  var vendors = ["ms", "moz", "webkit", "o"];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
    window.cancelAnimationFrame =
      window[vendors[x] + "CancelAnimationFrame"] ||
      window[vendors[x] + "CancelRequestAnimationFrame"];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function () {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
  }
})();

var Math2 = {};
Math2.random = function (t, n) { return Math.random() * (n - t) + t; };
Math2.map = function (t, n, r, a, o) { return (o - a) * ((t - n) / (r - n)) + a; };
Math2.randomPlusMinus = function (t) { t = t ? t : 0.5; return Math.random() > t ? -1 : 1; };
Math2.randomInt = function (t, n) { n += 1; return Math.floor(Math.random() * (n - t) + t); };
Math2.randomBool = function (t) { t = t ? t : 0.5; return Math.random() < t; };
Math2.degToRad = function (t) { return t * Math.PI / 180; };
Math2.radToDeg = function (t) { return 180 / (Math.PI * t); };
Math2.distance = function (t, n, r, a) {
  return Math.sqrt((r - t) * (r - t) + (a - n) * (a - n));
};

var mousePos = { x: 0, y: 0 };

window.onmousemove = function (e) {
  e = e || window.event;

  var pageX = e.pageX;
  var pageY = e.pageY;

  if (pageX === undefined) {
    pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    pageY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }

  mousePos = {
    x: pageX,
    y: pageY
  };
};

var options = {
  width: window.innerWidth,
  height: window.innerHeight,
  keyword: "404",
  density: 10,
  densityText: 3,
  minDist: 20
};

var renderer = new PIXI.autoDetectRenderer(options.width, options.height, {
  transparent: true
});
var stage = new PIXI.Stage(0x000000, true);

document.body.appendChild(renderer.view);
renderer.view.id = "notFound";
renderer.view.id = "pagina-em-manutencao";

var particles = [];

function init() {
  positionParticles();
  positionText();
}

function positionParticles() {
  var canvas = document.createElement("canvas");
  canvas.width = 500;
  canvas.height = 350;
  var context = canvas.getContext("2d");

  context.fillStyle = "#000000";
  context.font = "300px Arial, sans-serif";
  context.fillText(options.keyword, 0, 250);

  var imageData = context.getImageData(0, 0, 350, 500);
  var data = imageData.data;

  for (var i = 0; i < imageData.height; i += options.density) {
    for (var j = 0; j < imageData.width; j += options.density) {
      var color = data[((j * (imageData.width * 4)) + (i * 4)) - 1];

      if (color === 255) {
        var newPar = particle();
        newPar.setPosition(i, j);
        particles.push(newPar);
        stage.addChild(newPar);
      }
    }
  }
}

function positionText() {
  var canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 120;
  var context = canvas.getContext("2d");

  context.fillStyle = "#000000";
  context.font = "80px Arial, sans-serif";
  context.fillText("Not Found", 0, 80);
  

  var imageData = context.getImageData(0, 0, 400, 400);
  var data = imageData.data;

  for (var i = 0; i < imageData.height; i += options.densityText) {
    for (var j = 0; j < imageData.width; j += options.densityText) {
      var color = data[((j * (imageData.width * 4)) + (i * 4)) - 1];

      if (color === 255) {
        var newPar = particle(true);
        newPar.setPosition(i, j);
        particles.push(newPar);
        stage.addChild(newPar);
      }
    }
  }
}

function particle(text) {
  var $this = new PIXI.Graphics();

  if (text === true) {
    $this.text = true;
  }

  $this.beginFill(0xFFFFFF);

  var radius = $this.text ? Math.random() * 3.5 : Math.random() * 10.5;
  $this.radius = radius;

  $this.drawCircle(0, 0, radius);

  $this.size = $this.radius;
  $this.x = -$this.width;
  $this.y = -$this.height;
  $this.free = false;

  $this.timer = Math2.randomInt(0, 100);
  $this.v = Math2.randomPlusMinus() * Math2.random(0.5, 1);
  $this.hovered = false;
  $this.alpha = Math2.randomInt(10, 100) / 100;

  $this.vy = -5 + parseInt(Math.random() * 10) / 2;
  $this.vx = -4 + parseInt(Math.random() * 8);

  $this.setPosition = function (x, y) {
    if ($this.text) {
      $this.x = x + (options.width / 2 - 180);
      $this.y = y + (options.height / 2 + 100);
    } else {
      $this.x = x + (options.width / 2 - 250);
      $this.y = y + (options.height / 2 - 175);
    }
  };

  return $this;
}

function update() {
  renderer.render(stage);

  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];

    if (
      mousePos.x > p.x &&
      mousePos.x < p.x + p.size &&
      mousePos.y > p.y &&
      mousePos.y < p.y + p.size
    ) {
      p.hovered = true;
    }

    var scale = Math.max(
      Math.min(2.5 - (Math2.distance(p.x, p.y, mousePos.x, mousePos.y) / 160), 160),
      1
    );

    p.scale.x = scale;
    p.scale.y = scale;

    p.x = p.x + 0.2 * Math.sin(p.timer * 0.15);
    p.y = p.y + 0.2 * Math.cos(p.timer * 0.15);
    p.timer = p.timer + p.v;
  }

  window.requestAnimationFrame(update);
}

init();
update();