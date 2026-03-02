
"use strict";

const deltaTime = 0.01;
const G = 0.000001;

const simParams = new Float32Array([deltaTime, G]);

let timeFrames = 0;
let timeSum = 0;
let iterations = 0;

// --- Canvas & WebGPU Setup ---
const ms = document.createElement('ms');
ms.id = 'ms';
document.body.appendChild(ms);
const content = document.createElement('div');
document.body.appendChild(content);
content.innerHTML = '<canvas id="simulationCanvas"></canvas>';

const canvas = document.getElementById('simulationCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();
const context = canvas.getContext('webgpu');
const format = navigator.gpu.getPreferredCanvasFormat();

context.configure({
  device,
  format,
  alphaMode: "opaque",
});

// --- Constants ---
const PARTICLE_COUNT = 20_000;

// 12 x f32: 2 pos + 2 vel + 1 mass + 1 density + 1 radius + 1 padding + 3 color + 1 padding
// Equals 12 x 4 bytes = 48 bytes = 3 x 16 bytes
const PARTICLE_SIZE = 12; 
const MIN_MASS = 5.0;
const MAX_MASS = 20.0;

// --- Camera ---
const camera = { centerX: 0, centerY: 0, zoom: 1.0 };

const cameraBuffer = device.createBuffer({
  size: 16,
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

function updateCameraBuffer() {
  device.queue.writeBuffer(cameraBuffer, 0, new Float32Array([
    camera.centerX,
    camera.centerY,
    camera.zoom,
    canvas.width / canvas.height
  ]));
}

updateCameraBuffer();

// --- Mouse Controls ---
let isPanning = false, lastMouseX = 0, lastMouseY = 0;

// --- Particle Data Initialization ---
function createInitialParticleData() {
  const data = new Float32Array(PARTICLE_COUNT * PARTICLE_SIZE);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
  
    const mass = MIN_MASS + Math.random() * (MAX_MASS - MIN_MASS);
    const density = 100000;

    const base = i * PARTICLE_SIZE;
    // first 16 bytes
    data[base +  0] = (Math.random() * 2 - 1) * (canvas.width / canvas.height);
    data[base +  1] = Math.random() * 2 - 1;
    data[base +  2] = (Math.random() - 0.5) * 0.00;
    data[base +  3] = (Math.random() - 0.5) * 0.00;
    // next 16 bytes (padding added for 16 byte alignment)
    data[base +  4] = mass;
    data[base +  5] = density;
    data[base +  6] = Math.sqrt(data[base + 4] / (data[base +  5] * Math.PI)); // radius
    data[base +  7] = 0; // padding
    // Last 16 bytes (padding added for 16 byte alignment)
    data[base +  8] = 0.3 + Math.random() * 0.7;
    data[base +  9] = 0.3 + Math.random() * 0.7;
    data[base + 10] = 0.3 + Math.random() * 0.7;
    data[base + 11] = 0; // padding
  }

  return data;
}

const initialParticleData = createInitialParticleData();

// --- Circle Geometry ---

function createCircleVertices(segments = 64) {
  const vertices = [];
  for (let i = 0; i < segments; i++) {
    const angle1 = (i / segments) * 2 * Math.PI;
    const angle2 = ((i + 1) / segments) * 2 * Math.PI;
    vertices.push(
      0, 0,
      Math.cos(angle1), Math.sin(angle1),
      Math.cos(angle2), Math.sin(angle2)
    );
  }
  return new Float32Array(vertices);
}

const circleVertices = createCircleVertices();

const CIRCLE_VERTEX_COUNT = circleVertices.length / 2;

// Buffers

const aspectRatioBuffer = device.createBuffer({
  size: 4,
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

// Simulation parameter buffer

const simParamsBuffer = device.createBuffer({
  size: simParams.byteLength,
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

device.queue.writeBuffer(simParamsBuffer, 0, simParams.buffer, simParams.byteOffset, simParams.byteLength);

const circleVertexBuffer = device.createBuffer({
  size: circleVertices.byteLength,
  usage: GPUBufferUsage.VERTEX,
  mappedAtCreation: true,
});

new Float32Array(circleVertexBuffer.getMappedRange()).set(circleVertices);

circleVertexBuffer.unmap();

// --- Particle Buffers (Ping-Pong) ---
const bufferSize = initialParticleData.byteLength;
const buffers = [0, 1].map(() =>
  device.createBuffer({
    size: bufferSize,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  })
);

new Float32Array(buffers[0].getMappedRange()).set(initialParticleData);
buffers[0].unmap();
buffers[1].unmap();

// --- Shaders ---
const computeShaderModule = device.createShaderModule({
  code: `
  
struct SimParams {
  deltaTime: f32,
  G: f32
};
  
struct Particle {
  pos: vec2<f32>,
  vel: vec2<f32>,
  mass: f32,
  density: f32,
  radius: f32,
  padding1: f32,
  color: vec3<f32>,
  padding2: f32,
};

@group(0) @binding(0) var<uniform> params: SimParams;
@group(0) @binding(1) var<storage, read> particlesIn : array<Particle>;
@group(0) @binding(2) var<storage, read_write> particlesOut : array<Particle>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id : vec3<u32>) {
  
  let i = id.x;

  if (i >= arrayLength(&particlesIn)) { return; }

  var p = particlesIn[i];

  var force = vec2<f32>(0.0, 0.0);

  let dt = params.deltaTime;
  let G = params.G;

  for (var j = 0u; j < arrayLength(&particlesIn); j++) {

    if (i == j) { continue; }
    let other = particlesIn[j];
    let diff = other.pos - p.pos;
    let distSqr = dot(diff, diff);
    let sumRadii = p.radius + other.radius;

    let direction = normalize(diff);

    // Newtonian gravitational attraction
    if (distSqr < 0.0001) { continue; }
      
    let f = (G * p.mass * other.mass) / distSqr;
    force += direction * f;
  }

  let acceleration = force / p.mass;
  p.vel += acceleration * dt;
  p.pos += p.vel * dt;
  particlesOut[i] = p;
}
`,
});

const vertexModule = device.createShaderModule({
  code: `
struct Particle {
  pos: vec2<f32>,
  vel: vec2<f32>,
  mass: f32,
  density: f32,
  radius: f32,
  padding1: f32,
  color: vec3<f32>,
  padding2: f32,
};

@group(0) @binding(0) var<storage, read> particles: array<Particle>;
@group(0) @binding(1) var<uniform> camera: vec4<f32>;

struct VSOut {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec3<f32>,
};

@vertex
fn main(
  @location(0) unitPos: vec2<f32>,
  @builtin(instance_index) instanceIndex: u32
) -> VSOut {
  let p = particles[instanceIndex];
  let radiusWorld = p.radius;
  let scaled = unitPos * radiusWorld;
  let worldPos = p.pos + scaled;
  // let center = camera.xy;
  // let zoom = camera.z;
  let aspect = camera.w;
  var relative = worldPos;
  relative.x /= aspect;
  var out: VSOut;
  out.position = vec4<f32>(relative, 0.0, 1.0);
  out.color = p.color;
  return out;
}
`,
});
const fragmentModule = device.createShaderModule({
  code: `
@fragment
fn main(@location(0) color: vec3<f32>) -> @location(0) vec4<f32> {
  return vec4<f32>(color, 1.0);
}
`,
});


// --- Pipelines ---

const computePipeline = device.createComputePipeline({
  layout: 'auto',
  compute: { module: computeShaderModule, entryPoint: 'main' },
});

const renderPipeline = device.createRenderPipeline({
  layout: 'auto',
  vertex: {
    module: vertexModule,
    entryPoint: 'main',
    buffers: [{
      arrayStride: 8,
      attributes: [{ shaderLocation: 0, format: 'float32x2', offset: 0 }],
    }],
  },
  fragment: {
    module: fragmentModule,
    entryPoint: 'main',
    targets: [{ format }],
  },
  primitive: { topology: 'triangle-list' },
});


// --- Bind Groups ---
const computeBindGroups = [0, 1].map(i =>
  device.createBindGroup({
    layout: computePipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: simParamsBuffer } },
      { binding: 1, resource: { buffer: buffers[i] } },
      { binding: 2, resource: { buffer: buffers[1 - i] } },
    ],
  })
);

const renderBindGroups = [0, 1].map(i =>
  device.createBindGroup({
    layout: renderPipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: buffers[i] } },
      { binding: 1, resource: { buffer: cameraBuffer } },
    ],
  })
);


// --- Animation Loop ---
let step = 0;

function frame() {
  let startTime = performance.now();

  const commandEncoder = device.createCommandEncoder();

  // Compute pass
  const computePass = commandEncoder.beginComputePass();
  computePass.setPipeline(computePipeline);
  computePass.setBindGroup(0, computeBindGroups[step % 2]);
  computePass.dispatchWorkgroups(Math.ceil(PARTICLE_COUNT / 64));
  computePass.end();

  let endTime = performance.now();

  // Render pass
  const textureView = context.getCurrentTexture().createView();
  const renderPass = commandEncoder.beginRenderPass({
    colorAttachments: [{
      view: textureView,
      clearValue: { r: 0, g: 0, b: 0, a: 1 },
      loadOp: 'clear',
      storeOp: 'store',
    }],
  });
  renderPass.setPipeline(renderPipeline);
  renderPass.setBindGroup(0, renderBindGroups[(step + 1) % 2]);
  renderPass.setVertexBuffer(0, circleVertexBuffer);
  renderPass.draw(CIRCLE_VERTEX_COUNT, PARTICLE_COUNT);
  renderPass.end();
  device.queue.submit([commandEncoder.finish()]);

  step++;

  timeSum += endTime - startTime;
  timeFrames++;

  if (timeSum > 1) {
      timeSum /= timeFrames;
      document.getElementById("ms").innerHTML = timeSum.toFixed(3) + " ms";
      timeFrames = 0;
      timeSum = 0;
  }

  requestAnimationFrame(frame);
}

// Run simulation
requestAnimationFrame(frame);