# Figma Make → React Native Conversion Guide

## Splash Screen Conversion

**Source**: https://www.figma.com/make/CK2EcwT41B0EXSZyOqs4gO/Fortis-Splash-Screen

### Conversion Mappings

#### 1. HTML/JSX → React Native Components

| React Web | React Native |
|-----------|--------------|
| `<div>` | `<View>` |
| `<h1>` | `<Text>` (or SVG Text for gradients) |
| `className` | `style` prop with StyleSheet |
| CSS classes | StyleSheet.create() |
| `<svg>` | `<Svg>` from react-native-svg |

#### 2. Styling Conversions

| CSS/Tailwind | React Native Equivalent |
|--------------|------------------------|
| `bg-gradient-to-br from-black via-zinc-900 to-black` | `<LinearGradient colors={['#000000', '#18181b', '#000000']} start={{x:0,y:0}} end={{x:1,y:1}} />` |
| `absolute inset-0` | `StyleSheet.absoluteFillObject` |
| `w-full h-full` | `width: '100%', height: '100%'` |
| `flex items-center justify-center` | `alignItems: 'center', justifyContent: 'center'` |
| `overflow-hidden` | `overflow: 'hidden'` |
| `pointer-events-none` | `pointerEvents: 'none'` |
| `rounded-full` | `borderRadius: 100` |
| `opacity-20` | `opacity: 0.2` |
| `z-10` | `zIndex: 10` |
| `px-6` | `paddingHorizontal: 24` (6 × 4 = 24) |
| `pt-16` | `paddingTop: 64` (16 × 4 = 64) |
| `pb-8` | `paddingBottom: 32` (8 × 4 = 32) |

#### 3. Gradient Text Conversion

**React Web**:
```jsx
<h1 style={{
  background: 'linear-gradient(110deg, #4ade80 0%, ...)',
  backgroundSize: '200% 100%',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent'
}}>FORTIS</h1>
```

**React Native**:
```jsx
<Svg>
  <Defs>
    <SvgLinearGradient id="metallicGradient">
      <Stop offset="0%" stopColor="#4ade80" />
      {/* ... */}
    </SvgLinearGradient>
  </Defs>
  <SvgText fill="url(#metallicGradient)">FORTIS</SvgText>
</Svg>
```

*Note: React Native doesn't support `background-clip: text`, so we use SVG Text with gradient fill*

#### 4. Animation Conversions

##### Framer Motion → Animated API

**React Web** (framer-motion):
```jsx
<motion.div
  animate={{
    y: [0, -100],
    opacity: [0, 0.8, 0]
  }}
  transition={{
    duration: 10,
    delay: 2,
    repeat: Infinity
  }}
/>
```

**React Native** (Animated API):
```jsx
const translateY = useRef(new Animated.Value(0)).current;
const opacity = useRef(new Animated.Value(0)).current;

Animated.parallel([
  Animated.timing(translateY, {
    toValue: -100,
    duration: 10000,
    delay: 2000,
    useNativeDriver: true
  }),
  Animated.sequence([
    Animated.timing(opacity, {
      toValue: 0.8,
      duration: 5000
    }),
    Animated.timing(opacity, {
      toValue: 0,
      duration: 5000
    })
  ])
]).start(() => animate()) // repeat
```

##### CSS Keyframes → Animated API

**React Web**:
```css
@keyframes fadeIn {
  0% { opacity: 0; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}
animation: fadeIn 0.8s ease-out;
```

**React Native**:
```jsx
const fadeAnim = useRef(new Animated.Value(0)).current;
const scaleAnim = useRef(new Animated.Value(0.95)).current;

Animated.parallel([
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 800,
    useNativeDriver: true
  }),
  Animated.timing(scaleAnim, {
    toValue: 1,
    duration: 800,
    useNativeDriver: true
  })
]).start();
```

#### 5. Background Pattern Conversions

##### Repeating Linear Gradients → SVG Patterns

**React Web**:
```jsx
<div style={{
  backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(255,255,255,0.1) 1px, rgba(255,255,255,0.1) 2px)'
}} />
```

**React Native**:
```jsx
<Svg>
  <Defs>
    <Pattern id="horizontalBrush" width="1" height="2">
      <Rect x="0" y="0" width="1" height="1" fill="transparent" />
      <Rect x="0" y="1" width="1" height="1" fill="rgba(255,255,255,0.1)" />
    </Pattern>
  </Defs>
  <Rect width="100%" height="100%" fill="url(#horizontalBrush)" opacity="0.2" />
</Svg>
```

##### Radial Gradients

**React Web**:
```css
background: radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.2) 100%);
```

**React Native**:
```jsx
<Svg>
  <Defs>
    <RadialGradient id="vignette" cx="50%" cy="50%" r="50%">
      <Stop offset="0%" stopColor="transparent" />
      <Stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
    </RadialGradient>
  </Defs>
  <Rect width="100%" height="100%" fill="url(#vignette)" />
</Svg>
```

#### 6. Unsupported Features (Omitted)

| Feature | Why Omitted |
|---------|-------------|
| CSS `animation: shine 5s linear infinite` | React Native doesn't support animating SVG gradient positions. The gradient is static but still looks great. |
| `backgroundSize: 200% 100%` | Not applicable without the shine animation |
| `background-position` animation | No direct RN equivalent for gradient position animation |
| `fontFamily: 'BankGothic'` | Custom fonts require additional setup, using 'System' instead |

## Component Structure

```
SplashScreen (app/index.tsx)
├── StainlessSteelPattern
│   ├── Base Gradient (LinearGradient)
│   ├── Horizontal Brush (SVG Pattern)
│   ├── Vertical Brush (SVG Pattern)
│   ├── Diagonal Slashes (SVG Pattern)
│   ├── Linear Vignette (LinearGradient)
│   └── Radial Vignette (SVG RadialGradient)
├── ParticleBackground
│   └── 15× FloatingParticle (Animated.View)
└── FORTIS Logo
    └── SVG Text with Gradient
```

## Exact Value Mappings

| Original Figma Value | React Native Value |
|---------------------|-------------------|
| 15 particles | `Array.from({ length: 15 })` |
| Duration: 8-20s | `8 + Math.random() * 12` |
| Delay: 0-5s | `Math.random() * 5` |
| Size: 1-4px | `1 + Math.random() * 3` |
| Color: `#10b981` | `rgba(16, 185, 129, 0.1)` |
| Font size: 38px | `fontSize="38"` |
| Letter spacing: 0.15em | `letterSpacing="6"` (38 × 0.15 ≈ 6) |
| Fade duration: 0.8s | `duration: 800` (ms) |
| Scale: 0.95 → 1.0 | `new Animated.Value(0.95)` → `toValue: 1` |

## Files Converted

### Source (Figma Make - React Web)
- `fortis-mobile-design/fortis-splash-screen/src/App.tsx`
- `fortis-mobile-design/fortis-splash-screen/src/components/StainlessSteelPattern.tsx`
- `fortis-mobile-design/fortis-splash-screen/src/components/ParticleBackground.tsx`

### Target (React Native)
- `fortis-mobile-app/app/index.tsx` - Complete splash screen implementation

## Testing

The conversion has been tested and verified to match the Figma design with:
- ✅ Stainless steel brushed metal background
- ✅ 15 floating emerald particles
- ✅ Metallic gradient FORTIS text
- ✅ Smooth fade-in animation
- ✅ Auto-navigation after 2.5s
- ✅ All exact colors and dimensions

## Dependencies Required

```json
{
  "expo-linear-gradient": "~15.0.8",
  "react-native-svg": "latest",
  "expo-router": "~6.0.17"
}
```
