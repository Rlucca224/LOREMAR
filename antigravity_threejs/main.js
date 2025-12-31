import * as THREE from 'three';

// 1. Configuración de Escena
const BACKGROUND_COLOR = 0xffffff; // EDITAR AQUÍ: Color de fondo (Hex)
const PARTICLE_COLOR = 0x000000;   // EDITAR AQUÍ: Color de los puntos (Hex)

const scene = new THREE.Scene();
scene.background = new THREE.Color(BACKGROUND_COLOR);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50; // Cámara más cerca para apreciar el detalle

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// 2. Geometría (Nube de Puntos Aleatoria)
const geometry = new THREE.BufferGeometry();
const positions = [];

const numPointsX = 280;
const numPointsY = 160;
const separation = 1.6;

for (let ix = 0; ix < numPointsX; ix++) {
    for (let iy = 0; iy < numPointsY; iy++) {
        let x = (ix - numPointsX / 2) * separation;
        let y = (iy - numPointsY / 2) * separation;

        // Desplazamiento hexagonal
        if (iy % 2 === 1) {
            x += separation * 0.5;
        }

        positions.push(x, y, 0);
    }
}

geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

// 3. ShaderMaterial (La magia de la escala)
const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) }, // Mouse en mundo iniciado en el centro
        uMouseVel: { value: new THREE.Vector2(0, 0) },
        uMouseVel: { value: new THREE.Vector2(0, 0) },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uColor: { value: new THREE.Color(PARTICLE_COLOR) } // Color dinámico
    },
    vertexShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uPixelRatio;
        uniform vec2 uMouseVel;

        varying float vAlpha;

        // --- Simplex Noise 2D (Versión Robusta y Ligera) ---
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

        float snoise(vec2 v) {
            const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy) );
            vec2 x0 = v - i + dot(i, C.xx);
            vec2 i1;
            i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod(i, 289.0);
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
            + i.x + vec3(0.0, i1.x, 1.0 ));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m ;
            m = m*m ;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }

        void main() {
            vec3 pos = position; 

            // --- 0. MOVIMIENTO LÍQUIDO (Turbulencia) ---
            // Desplazar suavemente todos los puntos usando ruido para simular agua
            float liquidStrength = 3.0; // Distancia de movimiento
            float noiseSpeed = 0.2;     // Velocidad del flujo
            float noiseScale = 0.015;   // Textura de la marea
            
            // Calculamos desplazamiento único para X e Y
            float flowX = snoise(vec2(pos.x * noiseScale + uTime * noiseSpeed, pos.y * noiseScale + uTime * noiseSpeed));
            // Offset grande (100.0) para que Y no sea idéntico a X
            float flowY = snoise(vec2(pos.x * noiseScale - uTime * noiseSpeed + 100.0, pos.y * noiseScale + uTime * noiseSpeed + 100.0));
            
            pos.x += flowX * liquidStrength;
            pos.y += flowY * liquidStrength;

            // --- 1. RUIDO ORGÁNICO ---
            // Usamos snoise 2D con (x, y) y añadimos el tiempo al cálculo
            // para animarlo sin necesidad de ruido 3D costoso.
            float n = snoise(vec2(pos.x * 0.015 + uTime * 0.1, pos.y * 0.015 + uTime * 0.1));
            
            // n va de -1 a 1. Lo pasamos a 0 a 1 para usarlo como escala.
            float ambientScale = (n + 1.0) * 0.5; 
            
            // --- 2. INTERACCIÓN MOUSE (ANILLO TIPO LÁMPARA DE LAVA) ---
            // Deformamos el espacio para que el anillo no sea un círculo perfecto, sino una "mancha" orgánica
            float lavaScale = 0.012;  // Escala baja = Manchas grandes
            float lavaSpeed = 0.1;    // Movimiento lento y viscoso
            float lavaStrength = 10.0; // Cuánto se deforma el anillo (Amplitud)

            float noiseX = snoise(vec2(pos.x * lavaScale + uTime * lavaSpeed, pos.y * lavaScale + uTime * lavaSpeed));
            float noiseY = snoise(vec2(pos.x * lavaScale - uTime * lavaSpeed, pos.y * lavaScale - uTime * lavaSpeed));
            
            // Posición "distorsionada" solo para calcular la distancia (El anillo se deforma)
            vec2 distortedPosForDist = pos.xy + vec2(noiseX, noiseY) * lavaStrength;

            float dist = distance(distortedPosForDist, uMouse);
            
            // Radio Interior (La máscara del centro, donde NO queremos escala)
            float innerRadius = 25.0;
            float innerDelta = innerRadius * 0.8; // 5.0 de distancia de degradado

            // Radio Exterior Grande (Reducido de 70.0 a 45.0)
            float outerRadius = 35.0; 
            // Círculo de influencia general: El degradado dura lo mismo que el interno (15.0) para ser simétrico
            float outerInfluence = smoothstep(outerRadius, outerRadius - innerDelta, dist);
            
            // SUAVIZADO: Usamos 0.4 del radio como límite inferior para que el degradado sean 15 unidades
            float innerMask = smoothstep(innerRadius, innerRadius - innerDelta, dist);
            
            // RESTA LÓGICA: Influencia = Exterior - Interior
            // Si estás en el centro, innerMask es 1.0, así que (1.0 - 1.0) = 0.0 -> Sin efecto.
            // Si estás en el anillo, innerMask es 0.0 y outerInfluence es 1.0 -> Efecto máximo.
            float ringInfluence = max(0.0, outerInfluence - innerMask);

            // --- DEZPLAZAMIENTO (Push) ---
            // Empujar los dots en la dirección del mouse si están en el anillo
            vec2 displacement = uMouseVel * ringInfluence * 3.0; // Multiplicador de fuerza
            pos.xy += displacement;
            
            // --- 3. CÁLCULO FINAL ---
            float baseSize = 0.15; // Tamaño base muy pequeño (~1px dependiendo de resolución)
            
            // Usamos ringInfluence para escalar. 
            // Para mantener el fondo "quieto" en tamaño pixel, reducimos el efecto ambientScale en el tamaño
            float finalSize = baseSize + (ringInfluence * 7.0) + (ambientScale * 0.5);

            if (finalSize < 0.1) finalSize = 0.1;

            // --- SALIDA ---
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;

            gl_PointSize = finalSize * uPixelRatio * (60.0 / -mvPosition.z);

            // Ajustar opacidad: Base muy alta (0.8) para "máximo brillo/visibilidad"
            // El ambientScale ahora varía solo un poco la opacidad (0.8 a 1.0)
            vAlpha = 0.8 + (ambientScale * 0.2) + ringInfluence; 
        }
    `,
    fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;

        void main() {
            // Dibujar círculo perfecto
            vec2 cxy = 2.0 * gl_PointCoord - 1.0;
            float r = dot(cxy, cxy);
            if (r > 1.0) discard;

            // Suavizar bordes (antialiasing en el shader)
            float delta = fwidth(r);
            float alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);

            // Color definido por uniform con la opacidad variable
            gl_FragColor = vec4(uColor, vAlpha * alpha);
        }
    `,
    transparent: true,
    depthTest: false,
    blending: THREE.NormalBlending // Normal para que los puntos negros se vean en fondo blanco
});

const particles = new THREE.Points(geometry, shaderMaterial);
scene.add(particles);

// 4. Interacción Mouse (Raycasting)
const raycaster = new THREE.Raycaster();
const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const planeIntersect = new THREE.Vector3();
const mouseNormalized = new THREE.Vector2();

// Flag para controlar si el usuario está interactuando
let isUserInteracting = false;

window.addEventListener('mousemove', (e) => {
    isUserInteracting = true; // El usuario tomó el control
    mouseNormalized.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseNormalized.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// 5. Animación
const clock = new THREE.Clock();

// Variables para física del mouse (Inercia: Lento-Rápido-Lento)
const currentMouse = new THREE.Vector2(0, 0);
const targetMouse = new THREE.Vector2(0, 0);
const mouseVelocity = new THREE.Vector2(0, 0);

const TENSION = 0.05; // Aceleración un poco más responsiva
const FRICTION = 0.3; // Fricción alta para evitar el efecto resorte/rebote

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();
    shaderMaterial.uniforms.uTime.value = time;

    // 1. Obtener el TARGET (A donde quiere ir el mouse)
    if (!isUserInteracting) {
        // --- MODO AUTOMÁTICO (Screensaver) ---
        // Calcular límites de la pantalla en coordenadas de mundo (Z=0)
        // Altura visible = 2 * tan(fov/2) * dist
        const vFOV = THREE.MathUtils.degToRad(camera.fov);
        const height = 2 * Math.tan(vFOV / 2) * camera.position.z;
        const width = height * camera.aspect;

        // Movimiento Lissajous suave para recorrer la pantalla sin salirse
        // Factores 0.35 y 0.4 para usar ~80% de la pantalla
        const k = time * 0.5; // Velocidad base
        targetMouse.x = (width * 0.35) * Math.sin(k * 0.7) + (width * 0.05) * Math.cos(k * 1.3);
        targetMouse.y = (height * 0.35) * Math.cos(k * 0.6) + (height * 0.05) * Math.sin(k * 1.5);
    } else {
        // --- MODO INTERACTIVO ---
        raycaster.setFromCamera(mouseNormalized, camera);
        if (raycaster.ray.intersectPlane(plane, planeIntersect)) {
            targetMouse.set(planeIntersect.x, planeIntersect.y);
        }
    }

    // 2. Calcular FISICA (Sistema Masa-Resorte/Inercia)
    // Distancia al objetivo
    const dx = targetMouse.x - currentMouse.x;
    const dy = targetMouse.y - currentMouse.y;

    // Aceleración basada en la distancia (Ley de Hooke suave)
    const ax = dx * TENSION;
    const ay = dy * TENSION;

    // Integrar velocidad
    mouseVelocity.x += ax;
    mouseVelocity.y += ay;

    // Aplicar fricción
    mouseVelocity.x *= FRICTION;
    mouseVelocity.y *= FRICTION;

    // Actualizar posición actual
    currentMouse.x += mouseVelocity.x;
    currentMouse.y += mouseVelocity.y;

    // 3. Enviar al Shader la posición SUAVIZADA
    shaderMaterial.uniforms.uMouse.value.set(currentMouse.x, currentMouse.y);

    // 4. Enviar Velocidad para el empuje
    shaderMaterial.uniforms.uMouseVel.value.set(mouseVelocity.x * 2.0, mouseVelocity.y * 2.0);

    renderer.render(scene, camera);
}

animate();

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    shaderMaterial.uniforms.uPixelRatio.value = renderer.getPixelRatio();
});
