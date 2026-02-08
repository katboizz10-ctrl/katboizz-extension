(function (Scratch) {
  "use strict";

  alert(
  "⚠️ WARNING!\n\n" +
  "This extension OVERRIDES Scratch/TurboWarp Looks effects.\n" +
  "Color, fisheye, whirl, pixelate, mosaic, ghost, brightness may BREAK.\n\n" +
  "You can turn custom effects OFF to use Looks normally.\n\n" +
  "Use at your own risk!"
);


  const vm = Scratch.vm;
  const runtime = vm.runtime;
  const renderer = runtime.renderer;
  const gl = renderer._gl;
  const twgl = renderer.exports.twgl;
  const shaderManager = renderer._shaderManager;

  let useCustomShader = true;
  let originalGetShader = null;

  const vertex = `
precision mediump float;
uniform mat4 u_projectionMatrix;
uniform mat4 u_modelMatrix;
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
  gl_Position = u_projectionMatrix * u_modelMatrix * vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
`;

  const fragment = `
precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_skin;
uniform vec2 u_skinSize;

uniform float u_glitch;
uniform float u_glow;
uniform float u_outline;
uniform float u_neon;
uniform float u_rgbsplit;

uniform float u_glitchX;
uniform float u_glitchY;

uniform float u_waveX;
uniform float u_waveY;

uniform float u_time;

float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
  vec2 uv = v_texCoord;

  float glitch = u_glitch / 60.0;
  float glow = u_glow / 40.0;
  float outline = u_outline / 100.0;
  float neon = u_neon / 40.0;
  float rgbs = u_rgbsplit / 50.0;

  float gX = u_glitchX / 60.0;
  float gY = u_glitchY / 60.0;

  float wX = u_waveX / 40.0;
  float wY = u_waveY / 40.0;

  // === SUPER WAVE ===
  uv.x += sin(uv.y * 14.0 + u_time * 0.2) * 0.18 * wX;
  uv.y += sin(uv.x * 14.0 + u_time * 0.2) * 0.18 * wY;

  // === HARD GLITCH XY ===
  float gx = floor(uv.y * 50.0);
  uv.x += (rand(vec2(gx, u_time)) - 0.5) * 0.28 * gX;

  float gy = floor(uv.x * 50.0);
  uv.y += (rand(vec2(gy, u_time + 9.0)) - 0.5) * 0.28 * gY;

  // === MAIN GLITCH ===
  float line = floor(uv.y * 80.0);
  uv.x += (rand(vec2(line, u_time)) - 0.5) * 0.35 * glitch;

  vec4 base = texture2D(u_skin, uv);

  // === RGB SPLIT MAX ===
  float s = (glitch + rgbs) * 0.14;
  float r = texture2D(u_skin, uv + vec2(s,0)).r;
  float b = texture2D(u_skin, uv - vec2(s,0)).b;
  base.rgb = vec3(r, base.g, b);

  float px = 1.0 / u_skinSize.x;
  float py = 1.0 / u_skinSize.y;

  // === GLOW STRONG ===
  float g = 0.0;
  g += texture2D(u_skin, uv + vec2(px*2.0,0)).a;
  g += texture2D(u_skin, uv - vec2(px*2.0,0)).a;
  g += texture2D(u_skin, uv + vec2(0,py*2.0)).a;
  g += texture2D(u_skin, uv - vec2(0,py*2.0)).a;
  g *= 0.25;
  base.rgb += g * glow * 4.0;

  // === NEON MAX ===
  base.rgb += vec3(0.0, 1.5, 2.2) * base.a * neon * 3.0;

  // === OUTLINE MAX (ULTRA THICK) ===
  float a = base.a;
  float e = 0.0;

  for (float i = 1.0; i <= 4.0; i += 1.0) {
    e += texture2D(u_skin, uv + vec2(px*i, 0)).a;
    e += texture2D(u_skin, uv - vec2(px*i, 0)).a;
    e += texture2D(u_skin, uv + vec2(0, py*i)).a;
    e += texture2D(u_skin, uv - vec2(0, py*i)).a;
  }

  for (float i = 2.0; i <= 4.0; i += 1.0) {
    e += texture2D(u_skin, uv + vec2(px*i, py*i)).a;
    e += texture2D(u_skin, uv + vec2(-px*i, py*i)).a;
    e += texture2D(u_skin, uv + vec2(px*i, -py*i)).a;
    e += texture2D(u_skin, uv + vec2(-px*i, -py*i)).a;
  }

  e = step(0.01, e) * (1.0 - a);
  base.rgb = mix(base.rgb, vec3(0.0), e * outline * 4.0);

  gl_FragColor = base;
}
`;

  const DEFAULTS = {
    u_glitch:0, u_glow:0, u_outline:0, u_neon:0, u_rgbsplit:0,
    u_glitchX:0, u_glitchY:0,
    u_waveX:0, u_waveY:0,
    u_time:0
  };

  class Extension {
    constructor() {
      this.shader = twgl.createProgramInfo(gl, [vertex, fragment]);

      originalGetShader = shaderManager.getShader;
      shaderManager.getShader = (mode, bits) => {
        if (mode === "default" && useCustomShader) {
          return this.shader;
        }
        return originalGetShader.call(shaderManager, mode, bits);
      };

      runtime.on("targetWasCreated", target => {
        const d = renderer._allDrawables[target.drawableID];
        if (d) Object.assign(d._uniforms, DEFAULTS);
      });
    }

    getInfo() {
      return {
        id: "filterEffects",
        name: "Filter effects",
        description: "I use this extension to make animations and games",
        color1: "#a200ff",
        blocks: [
          { opcode:"setFx", blockType:Scratch.BlockType.COMMAND,
            text:"set [fx] to [v]",
            arguments:{ fx:{menu:"fx"}, v:{type:Scratch.ArgumentType.NUMBER, defaultValue:0} }
          },
          { opcode:"changeFx", blockType:Scratch.BlockType.COMMAND,
            text:"change [fx] by [v]",
            arguments:{ fx:{menu:"fx"}, v:{type:Scratch.ArgumentType.NUMBER, defaultValue:10} }
          },
          "---",
          { opcode:"clearFx", blockType:Scratch.BlockType.COMMAND,
            text:"clear extra effects" },
          { opcode:"setHybrid", blockType:Scratch.BlockType.COMMAND,
            text:"use custom shader [onoff]",
            arguments:{ onoff:{menu:"onoff"} } }
        ],
        menus:{
          fx:{ items:[
            {text:"glitch", value:"u_glitch"},
            {text:"glitch x", value:"u_glitchX"},
            {text:"glitch y", value:"u_glitchY"},
            {text:"wave x", value:"u_waveX"},
            {text:"wave y", value:"u_waveY"},
            {text:"rgb split", value:"u_rgbsplit"},
            {text:"glow", value:"u_glow"},
            {text:"neon", value:"u_neon"},
            {text:"outline", value:"u_outline"},
            {text:"time", value:"u_time"}
          ]},
          onoff:{ items:[
            {text:"on", value:"on"},
            {text:"off", value:"off"}
          ]}
        }
      };
    }

    clamp(v, fx){
      if (fx === "u_time") return Scratch.Cast.toNumber(v);
      return Math.max(0, Math.min(100, v));
    }

    setFx({fx,v},{target}) {
      const d = renderer._allDrawables[target.drawableID];
      d._uniforms[fx] = this.clamp(Scratch.Cast.toNumber(v), fx);
      vm.renderer.dirty = true;
    }

    changeFx({fx,v},{target}) {
      const d = renderer._allDrawables[target.drawableID];
      d._uniforms[fx] = this.clamp(d._uniforms[fx] + Scratch.Cast.toNumber(v), fx);
      vm.renderer.dirty = true;
    }

    clearFx(_, {target}) {
      const d = renderer._allDrawables[target.drawableID];
      Object.assign(d._uniforms, DEFAULTS);
      vm.renderer.dirty = true;
    }

    setHybrid({onoff}) {
      useCustomShader = (onoff === "on");
      vm.renderer.dirty = true;
    }
  }

  Scratch.extensions.register(new Extension());
})(Scratch);