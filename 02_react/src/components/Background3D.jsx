import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Background3D = () => {
    const mountRef = useRef(null);
    const animationIdRef = useRef(null); // Ref para el ID de animación (Evita congelamientos en React)

    useEffect(() => {
        // =========================================================
        // CÓDIGO BASADO EN antigravity_threejs/main.js
        // Mantiene la lógica matemática y física idéntica.
        // =========================================================

        // 1. Configuración de Escena
        const BACKGROUND_COLOR = 0x0a0a0a; // Color negro (se mezcla con el CSS si es opaco)
        const PARTICLE_COLOR = 0xfaf17b;   // Dorado LOREMAR

        const scene = new THREE.Scene();
        // scene.background = new THREE.Color(BACKGROUND_COLOR); // Comentado para permitir transparencia

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 50;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // ADAPTACION REACT: Usar ref en lugar de document.body
        if (mountRef.current) {
            // Limpieza previa defensiva
            while (mountRef.current.firstChild) {
                mountRef.current.removeChild(mountRef.current.firstChild);
            }
            mountRef.current.appendChild(renderer.domElement);
        }

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

        // 3. ShaderMaterial (La lógica visual en GPU)
        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uMouse: { value: new THREE.Vector2(0, 0) },
                uMouseVel: { value: new THREE.Vector2(0, 0) },
                uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                uPixelRatio: { value: renderer.getPixelRatio() },
                uColor1: { value: new THREE.Color(PARTICLE_COLOR) }, // Dorado
                uColor2: { value: new THREE.Color(0xf9ac58) }        // Naranja Cobrizo (Segundo color)
            },
            vertexShader: `
                uniform float uTime;
                uniform vec2 uMouse;
                uniform float uPixelRatio;
                uniform vec2 uMouseVel;
                uniform vec3 uColor1;
                uniform vec3 uColor2;
        
                varying float vAlpha;
                varying vec3 vColor; // Color calculado para este punto
        
                // --- Simplex Noise 2D ---
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
                    float liquidStrength = 3.0; // Distancia de movimiento
                    float noiseSpeed = 0.2;     // Velocidad del flujo
                    float noiseScale = 0.015;   // Textura de la marea
                    
                    // Calculamos desplazamiento único para X e Y
                    float flowX = snoise(vec2(pos.x * noiseScale + uTime * noiseSpeed, pos.y * noiseScale + uTime * noiseSpeed));
                    float flowY = snoise(vec2(pos.x * noiseScale - uTime * noiseSpeed + 100.0, pos.y * noiseScale + uTime * noiseSpeed + 100.0));
                    
                    pos.x += flowX * liquidStrength;
                    pos.y += flowY * liquidStrength;
        
                    // --- 1. RUIDO ORGÁNICO (Escala base) ---
                    float n = snoise(vec2(pos.x * 0.015 + uTime * 0.1, pos.y * 0.015 + uTime * 0.1));
                    float ambientScale = (n + 1.0) * 0.5; 
                    
                    // --- 2. INTERACCIÓN MOUSE (ANILLO TIPO LÁMPARA DE LAVA) ---
                    float lavaScale = 0.012;   // Tamaño de las "burbujas"
                    float lavaSpeed = 0.1;     // Velocidad de deformación
                    float lavaStrength = 10.0; // Intensidad de deformación
        
                    float noiseX = snoise(vec2(pos.x * lavaScale + uTime * lavaSpeed, pos.y * lavaScale + uTime * lavaSpeed));
                    float noiseY = snoise(vec2(pos.x * lavaScale - uTime * lavaSpeed, pos.y * lavaScale - uTime * lavaSpeed));
                    
                    // Posición distorsionada para calcular distancia al mouse
                    vec2 distortedPosForDist = pos.xy + vec2(noiseX, noiseY) * lavaStrength;
        
                    float dist = distance(distortedPosForDist, uMouse);
                    
                    // Definición del Anillo
                    float innerRadius = 25.0;
                    float innerDelta = innerRadius * 0.8; 
                    float outerRadius = 35.0; 
                    
                    // Máscaras suavizadas
                    float outerInfluence = smoothstep(outerRadius, outerRadius - innerDelta, dist);
                    float innerMask = smoothstep(innerRadius, innerRadius - innerDelta, dist);
                    
                    // Influencia final del anillo (Donde ocurre la magia)
                    float ringInfluence = max(0.0, outerInfluence - innerMask);
        
                    // --- DEZPLAZAMIENTO (Push) ---
                    vec2 displacement = uMouseVel * ringInfluence * 3.0; 
                    pos.xy += displacement;
                    
                    // --- 3. COLOR DINÁMICO (NUBES) ---
                    float colorNoiseScale = 0.005; // Escala grande para "nubes"
                    float colorSpeed = 0.1;
                    
                    // Generar un valor de ruido entre 0 y 1
                    float colorN = snoise(vec2(position.x * colorNoiseScale + uTime * colorSpeed, position.y * colorNoiseScale - uTime * colorSpeed * 0.5));
                    
                    // Normalizar ruido de [-1, 1] a [0, 1]
                    float mixFactor = (colorN + 1.0) * 0.5;
                    
                    // Mezclar los dos colores
                    vColor = mix(uColor1, uColor2, mixFactor);

                    // --- 4. CÁLCULO FINAL DE TAMAÑO ---
                    float baseSize = 0.15; // Tamaño mínimo
                    float finalSize = baseSize + (ringInfluence * 7.0) + (ambientScale * 0.5);
        
                    if (finalSize < 0.1) finalSize = 0.1;
        
                    // Salida a pantalla
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
        
                    // Ajuste de tamaño por perspectiva
                    gl_PointSize = finalSize * uPixelRatio * (60.0 / -mvPosition.z);
        
                    // Opacidad
                    vAlpha = 0.8 + (ambientScale * 0.2) + ringInfluence; 
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vAlpha;
        
                void main() {
                    // Círculo perfecto en el fragmento
                    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
                    float r = dot(cxy, cxy);
                    if (r > 1.0) discard;
        
                    // Suavizado de bordes (Antialiasing)
                    float delta = fwidth(r);
                    float alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);
        
                    gl_FragColor = vec4(vColor, vAlpha * alpha);
                }
            `,
            transparent: true,
            depthTest: false,
            blending: THREE.NormalBlending
        });

        const particles = new THREE.Points(geometry, shaderMaterial);
        scene.add(particles);

        // 4. Interacción Mouse (Raycasting)
        const raycaster = new THREE.Raycaster();
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const planeIntersect = new THREE.Vector3();
        const mouseNormalized = new THREE.Vector2();

        let isUserInteracting = false;

        const handleMouseMove = (e) => {
            isUserInteracting = true;
            mouseNormalized.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseNormalized.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };

        window.addEventListener('mousemove', handleMouseMove);

        // 5. Animación & Física
        const clock = new THREE.Clock();

        const currentMouse = new THREE.Vector2(0, 0);
        const targetMouse = new THREE.Vector2(0, 0);
        const mouseVelocity = new THREE.Vector2(0, 0);

        const TENSION = 0.05;
        const FRICTION = 0.3;

        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);

            // Multiplicamos por 0.3 para reducir la velocidad de fluctuación
            const time = clock.getElapsedTime() * 0.5;
            shaderMaterial.uniforms.uTime.value = time;

            // 1. Calcular Target
            if (!isUserInteracting) {
                // MODO ESTÁTICO: Fijo en el centro hasta interactuar
                targetMouse.set(0, 0);
            } else {
                // Mouse Interactivo
                raycaster.setFromCamera(mouseNormalized, camera);
                if (raycaster.ray.intersectPlane(plane, planeIntersect)) {
                    targetMouse.set(planeIntersect.x, planeIntersect.y);
                }
            }

            // 2. Física (Spring/Inercia)
            const dx = targetMouse.x - currentMouse.x;
            const dy = targetMouse.y - currentMouse.y;

            const ax = dx * TENSION;
            const ay = dy * TENSION;

            mouseVelocity.x += ax;
            mouseVelocity.y += ay;

            mouseVelocity.x *= FRICTION;
            mouseVelocity.y *= FRICTION;

            currentMouse.x += mouseVelocity.x;
            currentMouse.y += mouseVelocity.y;

            // 3. Update Uniforms
            shaderMaterial.uniforms.uMouse.value.set(currentMouse.x, currentMouse.y);
            shaderMaterial.uniforms.uMouseVel.value.set(mouseVelocity.x * 2.0, mouseVelocity.y * 2.0);

            renderer.render(scene, camera);
        }

        animate();

        // Resize Handler
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            shaderMaterial.uniforms.uPixelRatio.value = renderer.getPixelRatio();
        };

        window.addEventListener('resize', handleResize);

        // =========================================================
        // CLEANUP (React Specific)
        // =========================================================
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationIdRef.current);

            if (mountRef.current && renderer.domElement) {
                if (mountRef.current.contains(renderer.domElement)) {
                    mountRef.current.removeChild(renderer.domElement);
                }
            }

            geometry.dispose();
            shaderMaterial.dispose();
            renderer.dispose();
        };

    }, []);

    return (
        <div
            ref={mountRef}
            style={{
                position: 'fixed', // Fixed: cubre toda la ventana
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0, // Detrás del contenido
                pointerEvents: 'none' // Deja pasar los clicks
            }}
        />
    );
};

export default Background3D;
