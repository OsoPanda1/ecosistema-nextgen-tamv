# TAMV Visual Experience Specification

## Experiencias Visuales 2D, 3D, XR, VR y 4D - Nivel Profesional

**Fecha:** 2026-02-03  
**Estado:** Especificación Técnica  
**Regla de Oro:** NO MEDIOCRIDAD - Solo calidad AAA

---

## 🎯 Objetivo

Crear experiencias visuales de nivel profesional que rivalicen con:

- **2D/UI**: Figma, Linear, Notion (diseño moderno y fluido)
- **3D**: Unreal Engine 5, Unity HDRP (gráficos fotorrealistas)
- **XR/VR**: Meta Quest 3, Apple Vision Pro (inmersión total)
- **4D**: Experiencias temporales dinámicas con física realista

---

## 📐 Arquitectura Visual

### Stack Tecnológico

#### Frontend 2D (UI/UX)

```typescript
// Core
- React 18+ (Concurrent features)
- TypeScript 5.3+ (Strict mode)
- Vite 5+ (Build tool)

// Styling & Animation
- Tailwind CSS 3.4+ (Utility-first)
- Framer Motion 11+ (Animaciones fluidas)
- Radix UI (Componentes accesibles)
- Lucide React (Iconos modernos)

// 3D Integration
- Three.js r160+ (WebGL)
- React Three Fiber 8+ (React + Three.js)
- Drei (Helpers para R3F)
- Leva (GUI controls)

// State Management
- Zustand (Estado global ligero)
- TanStack Query (Server state)

// Performance
- React Virtuoso (Virtualización)
- use-gesture (Gestos táctiles)
```

#### 3D Engine

```typescript
// Core 3D
- Three.js r160+
- React Three Fiber 8+
- @react-three/drei
- @react-three/postprocessing

// Physics
- @react-three/rapier (Física realista)
- cannon-es (Alternativa)

// Shaders & Effects
- glsl-noise (Ruido procedural)
- postprocessing (Efectos post-procesamiento)
- Custom GLSL shaders

// Loading & Optimization
- @react-three/gltfjsx (GLTF loader)
- draco3d (Compresión)
- basis-universal (Texturas comprimidas)
```

#### XR/VR

```typescript
// WebXR
- @react-three/xr
- @react-three/hands
- @react-three/controllers

// Spatial Audio
- Resonance Audio
- Web Audio API

// Hand Tracking
- MediaPipe Hands
- TensorFlow.js
```

#### 4D (Temporal)

```typescript
// Time-based Effects
- GSAP 3+ (Timeline animations)
- Framer Motion (React animations)
- Custom time shaders

// Particle Systems
- three-mesh-bvh (Optimización)
- Custom particle shaders
```

---

## 🎨 Diseño Visual 2D

### Principios de Diseño

1. **Minimalismo Funcional**
   - Espacios en blanco generosos
   - Jerarquía visual clara
   - Tipografía legible (Inter, Geist)

2. **Microinteracciones**
   - Feedback inmediato (<100ms)
   - Animaciones suaves (ease-out)
   - Estados hover/active/focus

3. **Modo Oscuro Nativo**
   - Contraste WCAG AAA
   - Colores vibrantes pero no saturados
   - Transiciones suaves entre modos

### Paleta de Colores

```typescript
const colors = {
  // Dark Mode (Primary)
  background: {
    primary: '#0A0A0A', // Negro profundo
    secondary: '#141414', // Gris oscuro
    tertiary: '#1E1E1E', // Gris medio
  },

  // Accent Colors
  accent: {
    primary: '#3B82F6', // Azul vibrante
    secondary: '#8B5CF6', // Púrpura
    success: '#10B981', // Verde
    warning: '#F59E0B', // Ámbar
    error: '#EF4444', // Rojo
  },

  // Text
  text: {
    primary: '#FAFAFA', // Blanco casi puro
    secondary: '#A1A1AA', // Gris claro
    tertiary: '#71717A', // Gris medio
  },

  // Glassmorphism
  glass: {
    background: 'rgba(20, 20, 20, 0.7)',
    border: 'rgba(255, 255, 255, 0.1)',
    blur: '20px',
  },
};
```

### Componentes UI

```typescript
// Button Component (Ejemplo)
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'glass';
  size: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

// Features:
- Ripple effect on click
- Loading spinner
- Icon support
- Keyboard navigation
- Haptic feedback (mobile)
```

---

## 🌐 Experiencia 3D

### Escenas 3D

#### 1. Landing Page 3D

```typescript
// Características:
- Modelo 3D del logo TAMV rotando
- Partículas flotantes interactivas
- Iluminación dinámica (día/noche)
- Parallax con scroll
- Performance: 60 FPS constante

// Técnicas:
- Level of Detail (LOD)
- Frustum culling
- Instanced rendering
- Compressed textures (Basis)
```

#### 2. Perfil de Usuario 3D

```typescript
// Avatar 3D personalizable
- Ready Player Me integration
- Facial expressions
- Animaciones idle
- Ropa y accesorios
- NFT wearables

// Interacción:
- Orbit controls
- Zoom suave
- Click para cambiar outfit
```

#### 3. Galería NFT 3D

```typescript
// Museo virtual
- Cuadros en paredes 3D
- Iluminación de galería
- Reflejos en el suelo
- Cámara first-person
- Teleport entre salas

// Optimización:
- Occlusion culling
- Texture streaming
- Progressive loading
```

### Shaders Personalizados

```glsl
// Holographic Shader
uniform float time;
uniform vec3 color;

varying vec2 vUv;
varying vec3 vNormal;

void main() {
  // Fresnel effect
  vec3 viewDirection = normalize(cameraPosition - vPosition);
  float fresnel = pow(1.0 - dot(vNormal, viewDirection), 3.0);

  // Scan lines
  float scanline = sin(vUv.y * 100.0 + time * 2.0) * 0.5 + 0.5;

  // Glitch effect
  float glitch = step(0.98, sin(time * 10.0 + vUv.y * 50.0));

  // Combine
  vec3 finalColor = color * (fresnel + scanline * 0.3 + glitch * 0.5);

  gl_FragColor = vec4(finalColor, fresnel * 0.8);
}
```

---

## 🥽 Experiencia XR/VR

### Modos de Interacción

#### 1. VR Inmersivo (Meta Quest, PSVR2)

```typescript
// Features:
- Room-scale tracking
- Hand tracking nativo
- Spatial audio 3D
- Haptic feedback
- Eye tracking (foveated rendering)

// Controles:
- Grab objects
- Point and teleport
- UI panels flotantes
- Voice commands
```

#### 2. AR Overlay (Móvil, Tablets)

```typescript
// Features:
- Plane detection
- Image tracking
- Face filters
- Object placement
- Occlusion

// Use Cases:
- Ver posts en el espacio real
- Avatar AR en selfies
- NFTs en tu sala
```

#### 3. Mixed Reality (Apple Vision Pro)

```typescript
// Features:
- Passthrough HD
- Hand gestures precisos
- Eye tracking para UI
- Spatial computing
- Multi-window

// Experiencias:
- Ventanas flotantes
- Objetos anclados
- Colaboración espacial
```

### Optimización VR

```typescript
// Performance Targets
- 90 FPS mínimo (Quest 2)
- 120 FPS ideal (Quest 3, Vision Pro)
- <20ms motion-to-photon latency
- Foveated rendering
- Reprojection async

// Técnicas:
- Single-pass stereo rendering
- Fixed foveated rendering
- Dynamic resolution scaling
- Occlusion culling agresivo
```

---

## ⏱️ Experiencia 4D (Temporal)

### Dimensión Temporal

#### 1. Timeline Interactiva

```typescript
// Visualización de posts en el tiempo
- Línea temporal 3D
- Posts como nodos
- Conexiones entre posts relacionados
- Zoom temporal (día/mes/año)
- Animaciones de transición

// Física:
- Gravedad temporal
- Atracción entre posts similares
- Repulsión para evitar overlap
```

#### 2. Efectos Temporales

```typescript
// Rewind/Fast-forward
- Smooth time scrubbing
- Particle trails
- Motion blur temporal
- Time-based shaders

// Weather System
- Día/noche dinámico
- Clima procedural
- Estaciones del año
- Eventos especiales
```

#### 3. Predicción Visual

```typescript
// AI-powered predictions
- Tendencias futuras visualizadas
- Probabilidades como niebla
- Líneas de tiempo alternativas
- Simulaciones what-if
```

---

## 🎬 Animaciones y Transiciones

### Principios de Animación

```typescript
// Timing Functions
const easing = {
  // Entrada suave
  easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',

  // Salida suave
  easeIn: 'cubic-bezier(0.7, 0, 0.84, 0)',

  // Rebote
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',

  // Elástico
  elastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
};

// Duraciones
const duration = {
  instant: 100, // Feedback inmediato
  fast: 200, // Transiciones rápidas
  normal: 300, // Transiciones estándar
  slow: 500, // Transiciones complejas
  verySlow: 1000, // Animaciones especiales
};
```

### Microinteracciones

```typescript
// Hover Effects
- Scale up (1.05x)
- Glow effect
- Shadow elevation
- Color shift

// Click Effects
- Ripple animation
- Scale down (0.95x)
- Haptic feedback
- Sound effect

// Loading States
- Skeleton screens
- Progressive loading
- Shimmer effect
- Smooth transitions
```

---

## 🚀 Performance Optimization

### Métricas Objetivo

```typescript
// Web Vitals
- LCP: <2.5s (Largest Contentful Paint)
- FID: <100ms (First Input Delay)
- CLS: <0.1 (Cumulative Layout Shift)
- FCP: <1.8s (First Contentful Paint)
- TTI: <3.8s (Time to Interactive)

// 3D Performance
- FPS: 60 constante (desktop)
- FPS: 30-60 (mobile)
- Draw calls: <100
- Triangles: <100k visible
- Texture memory: <512MB
```

### Técnicas de Optimización

```typescript
// Code Splitting
- Route-based splitting
- Component lazy loading
- Dynamic imports
- Prefetching

// Asset Optimization
- Image: WebP, AVIF
- 3D Models: Draco compression
- Textures: Basis Universal
- Fonts: Variable fonts

// Rendering
- Virtual scrolling
- Intersection Observer
- RequestAnimationFrame
- Web Workers para cálculos
```

---

## 🎮 Controles e Interacción

### Dispositivos Soportados

#### Desktop

```typescript
- Mouse + Keyboard
- Gamepad (Xbox, PlayStation)
- MIDI controllers
- Pen tablets
```

#### Mobile

```typescript
- Touch gestures
- Gyroscope
- Accelerometer
- Camera (AR)
```

#### VR/XR

```typescript
- Hand tracking
- Controllers
- Eye tracking
- Voice commands
- Haptic feedback
```

### Gestos y Atajos

```typescript
// Touch Gestures
- Swipe: Navegar
- Pinch: Zoom
- Long press: Menú contextual
- Double tap: Like
- Three-finger swipe: Cambiar vista

// Keyboard Shortcuts
- Space: Play/Pause
- Arrow keys: Navegar
- Cmd/Ctrl + K: Búsqueda
- Cmd/Ctrl + /: Atajos
- Esc: Cerrar modal
```

---

## 🎨 Casos de Uso Visuales

### 1. Feed de Posts (2D → 3D)

```typescript
// Vista 2D (Default)
- Cards con glassmorphism
- Infinite scroll
- Lazy loading de imágenes
- Skeleton loading

// Vista 3D (Toggle)
- Posts como tarjetas flotantes
- Disposición en espiral
- Parallax con scroll
- Zoom en hover
```

### 2. Perfil de Usuario (3D Avatar)

```typescript
// Avatar 3D
- Modelo personalizable
- Animaciones idle
- Expresiones faciales
- Ropa NFT

// Entorno
- Sala personalizable
- Iluminación dinámica
- Objetos coleccionables
- Música ambiente
```

### 3. Galería NFT (VR Museum)

```typescript
// Museo Virtual
- Salas temáticas
- Iluminación de galería
- Audio guía
- Teleport entre salas
- Multiplayer (ver otros visitantes)
```

### 4. Timeline 4D

```typescript
// Visualización Temporal
- Línea de tiempo 3D
- Posts como eventos
- Conexiones causales
- Predicciones futuras
- Rewind/Fast-forward
```

---

## 📦 Estructura de Componentes

```
frontend/
├── src/
│   ├── components/
│   │   ├── 2d/
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── Input.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   └── feed/
│   │   │       ├── PostCard.tsx
│   │   │       ├── PostList.tsx
│   │   │       └── CreatePost.tsx
│   │   ├── 3d/
│   │   │   ├── scenes/
│   │   │   │   ├── LandingScene.tsx
│   │   │   │   ├── ProfileScene.tsx
│   │   │   │   └── GalleryScene.tsx
│   │   │   ├── models/
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── Logo.tsx
│   │   │   │   └── NFTFrame.tsx
│   │   │   ├── effects/
│   │   │   │   ├── Particles.tsx
│   │   │   │   ├── Bloom.tsx
│   │   │   │   └── PostProcessing.tsx
│   │   │   └── shaders/
│   │   │       ├── holographic.glsl
│   │   │       ├── dissolve.glsl
│   │   │       └── portal.glsl
│   │   ├── xr/
│   │   │   ├── VRScene.tsx
│   │   │   ├── AROverlay.tsx
│   │   │   ├── HandTracking.tsx
│   │   │   └── SpatialUI.tsx
│   │   └── 4d/
│   │       ├── Timeline.tsx
│   │       ├── TemporalEffects.tsx
│   │       └── Predictions.tsx
│   ├── hooks/
│   │   ├── use3D.ts
│   │   ├── useXR.ts
│   │   ├── useGestures.ts
│   │   └── usePerformance.ts
│   ├── utils/
│   │   ├── 3d/
│   │   │   ├── loaders.ts
│   │   │   ├── optimization.ts
│   │   │   └── physics.ts
│   │   └── performance/
│   │       ├── metrics.ts
│   │       └── monitoring.ts
│   └── styles/
│       ├── globals.css
│       ├── animations.css
│       └── themes.ts
```

---

## ✅ Checklist de Calidad

### Visual

- [ ] Diseño consistente en todos los componentes
- [ ] Animaciones suaves (60 FPS)
- [ ] Responsive en todos los dispositivos
- [ ] Modo oscuro/claro perfecto
- [ ] Accesibilidad WCAG AAA

### 3D

- [ ] Modelos optimizados (<5MB)
- [ ] Texturas comprimidas
- [ ] LOD implementado
- [ ] Iluminación realista
- [ ] Sombras suaves

### XR/VR

- [ ] 90+ FPS en VR
- [ ] Hand tracking preciso
- [ ] Spatial audio
- [ ] Comfort mode (anti-mareo)
- [ ] Multiplataforma

### Performance

- [ ] LCP <2.5s
- [ ] FID <100ms
- [ ] CLS <0.1
- [ ] Bundle size <500KB
- [ ] Lazy loading implementado

---

## 🎯 Roadmap de Implementación

### Fase 1: Foundation (Semana 1-2)

- Setup React + TypeScript + Vite
- Componentes UI base
- Sistema de diseño
- Animaciones básicas

### Fase 2: 3D Integration (Semana 3-4)

- Three.js + R3F setup
- Escena landing 3D
- Avatar system
- Shaders básicos

### Fase 3: XR/VR (Semana 5-6)

- WebXR integration
- VR scene
- Hand tracking
- Spatial UI

### Fase 4: 4D & Polish (Semana 7-8)

- Timeline 4D
- Efectos temporales
- Optimización final
- Testing exhaustivo

---

**Regla de Oro: NO MEDIOCRIDAD**

Cada pixel, cada frame, cada interacción debe ser perfecta.
Calidad AAA o nada.
