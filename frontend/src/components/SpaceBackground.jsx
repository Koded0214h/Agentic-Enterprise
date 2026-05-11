import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function SpaceBackground({ mode = 'absolute' }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const W = mode === 'fixed' ? window.innerWidth : (mount.clientWidth || window.innerWidth)
    const H = mode === 'fixed' ? window.innerHeight : (mount.clientHeight || window.innerHeight)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 2000)
    camera.position.z = 400

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ─── Stars (three depth layers) ───
    function makeStarLayer(count, spread, size, opacity) {
      const geo = new THREE.BufferGeometry()
      const pos = new Float32Array(count * 3)
      for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * spread
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      return new THREE.Points(geo, new THREE.PointsMaterial({
        size, color: 0xffffff, transparent: true, opacity, sizeAttenuation: true,
      }))
    }

    const starsFar   = makeStarLayer(1800, 1400, 1.2, 0.55)
    const starsMid   = makeStarLayer(900,  900,  1.8, 0.7)
    const starsClose = makeStarLayer(300,  500,  2.8, 0.85)
    scene.add(starsFar, starsMid, starsClose)

    // ─── Nebulae ───
    function makeNebula(color, x, y, z, scale, opacity) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(1, 8, 8),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity })
      )
      mesh.position.set(x, y, z)
      mesh.scale.set(scale * 2.5, scale, scale * 1.5)
      return mesh
    }
    const neb1 = makeNebula(0x6600cc, -80,  40,  -200, 120, 0.04)
    const neb2 = makeNebula(0x001166,  100, -60, -250, 150, 0.05)
    const neb3 = makeNebula(0x440055, -150, -80, -300, 180, 0.03)
    scene.add(neb1, neb2, neb3)

    // ─── Planets ───
    function makePlanet(radius, bodyColor, atmColor, atmOpacity) {
      const group = new THREE.Group()

      // Body
      group.add(new THREE.Mesh(
        new THREE.SphereGeometry(radius, 48, 48),
        new THREE.MeshBasicMaterial({ color: bodyColor })
      ))

      // Terminator shadow (offset dark sphere faking a lit side)
      const shadow = new THREE.Mesh(
        new THREE.SphereGeometry(radius * 1.002, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0x010510, transparent: true, opacity: 0.55 })
      )
      shadow.scale.set(1, 1, 0.55)
      shadow.position.z = -radius * 0.22
      group.add(shadow)

      // Inner atmosphere rim
      group.add(new THREE.Mesh(
        new THREE.SphereGeometry(radius * 1.07, 32, 32),
        new THREE.MeshBasicMaterial({ color: atmColor, transparent: true, opacity: atmOpacity })
      ))
      // Soft outer glow
      group.add(new THREE.Mesh(
        new THREE.SphereGeometry(radius * 1.22, 24, 24),
        new THREE.MeshBasicMaterial({ color: atmColor, transparent: true, opacity: atmOpacity * 0.38 })
      ))
      // Farthest haze
      group.add(new THREE.Mesh(
        new THREE.SphereGeometry(radius * 1.45, 20, 20),
        new THREE.MeshBasicMaterial({ color: atmColor, transparent: true, opacity: atmOpacity * 0.12 })
      ))

      return group
    }

    // ── Left planet: ringed warm gas giant (Saturn-ish) ──
    const planetL = makePlanet(88, 0x7a4520, 0xd4813a, 0.14)

    // Rings — two overlapping tori for depth
    const ringOuter = new THREE.Mesh(
      new THREE.TorusGeometry(138, 10, 4, 100),
      new THREE.MeshBasicMaterial({ color: 0xb87a3a, transparent: true, opacity: 0.32, side: THREE.DoubleSide })
    )
    ringOuter.rotation.x = Math.PI * 0.3
    planetL.add(ringOuter)

    const ringInner = new THREE.Mesh(
      new THREE.TorusGeometry(110, 6, 4, 100),
      new THREE.MeshBasicMaterial({ color: 0xd4a060, transparent: true, opacity: 0.22, side: THREE.DoubleSide })
    )
    ringInner.rotation.x = Math.PI * 0.3
    planetL.add(ringInner)

    // Start left planet mostly off-screen left edge
    planetL.position.set(-420, -40, 90)
    scene.add(planetL)

    // ── Right planet: ice world (Neptune-ish blue) ──
    const planetR = makePlanet(68, 0x0d2b50, 0x2a7fff, 0.16)

    // Faint cloud band overlay
    const band = new THREE.Mesh(
      new THREE.SphereGeometry(69, 32, 16),
      new THREE.MeshBasicMaterial({ color: 0x1a4a80, transparent: true, opacity: 0.18 })
    )
    band.scale.y = 0.28  // flatten into equatorial band
    planetR.add(band)

    // Start right planet mostly off-screen right edge
    planetR.position.set(430, 70, 75)
    scene.add(planetR)

    // ─── Moving asteroids (independent drift) ───
    const ASTEROID_COUNT = 38
    const aPos = new Float32Array(ASTEROID_COUNT * 3)
    const aVel = []
    for (let i = 0; i < ASTEROID_COUNT; i++) {
      aPos[i * 3]     = (Math.random() - 0.5) * 900
      aPos[i * 3 + 1] = (Math.random() - 0.5) * 600
      aPos[i * 3 + 2] = (Math.random() - 0.5) * 300 - 50
      const speed = 0.04 + Math.random() * 0.12
      const angle = Math.random() * Math.PI * 2
      aVel.push({ x: Math.cos(angle) * speed, y: Math.sin(angle) * speed * 0.4 })
    }
    const asteroidGeo = new THREE.BufferGeometry()
    asteroidGeo.setAttribute('position', new THREE.BufferAttribute(aPos, 3))
    const asteroidMat = new THREE.PointsMaterial({
      size: 2.2, color: 0xb0a890, transparent: true, opacity: 0.55, sizeAttenuation: true,
    })
    const asteroids = new THREE.Points(asteroidGeo, asteroidMat)
    scene.add(asteroids)

    // ─── Shooting stars ───
    const streaks = []
    function spawnStreak() {
      const x   = (Math.random() - 0.5) * 600
      const y   = Math.random() * 300 + 50
      const len = 30 + Math.random() * 80
      const pts = [new THREE.Vector3(x, y, -100), new THREE.Vector3(x - len, y - len * 0.3, -100)]
      const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat)
      scene.add(line)
      streaks.push({ line, mat, life: 1.0, speed: 0.04 + Math.random() * 0.06 })
      setTimeout(spawnStreak, 2000 + Math.random() * 4000)
    }
    spawnStreak()

    // ─── Mouse parallax ───
    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0
    const onMouse = (e) => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouse)

    // ─── Scroll ───
    let scrollY = 0
    const onScroll = () => { scrollY = window.scrollY }
    window.addEventListener('scroll', onScroll, { passive: true })

    // ─── Resize ───
    const onResize = () => {
      const nW = mode === 'fixed' ? window.innerWidth  : (mount?.clientWidth  || window.innerWidth)
      const nH = mode === 'fixed' ? window.innerHeight : (mount?.clientHeight || window.innerHeight)
      camera.aspect = nW / nH
      camera.updateProjectionMatrix()
      renderer.setSize(nW, nH)
    }
    window.addEventListener('resize', onResize)

    // ─── Animate ───
    let frame, t = 0
    const animate = () => {
      frame = requestAnimationFrame(animate)
      t += 0.001

      // Smooth mouse lag
      targetX += (mouseX - targetX) * 0.03
      targetY += (mouseY - targetY) * 0.03

      // Star layers parallax
      starsFar.rotation.y   = targetX * 0.015 + t * 0.03
      starsFar.rotation.x   = targetY * 0.01
      starsMid.rotation.y   = targetX * 0.04  + t * 0.025
      starsMid.rotation.x   = targetY * 0.025
      starsClose.rotation.y = targetX * 0.09  + t * 0.015
      starsClose.rotation.x = targetY * 0.06

      // Nebula drift
      neb1.position.x = -80  + Math.sin(t * 0.3)       * 8  + targetX * -12
      neb1.position.y =  40  + Math.cos(t * 0.25)      * 5  + targetY * -8
      neb2.position.x =  100 + Math.sin(t * 0.2  + 1)  * 10 + targetX * -18
      neb3.position.x = -150 + Math.cos(t * 0.15)      * 12

      // ── Asteroid drift ──
      const ap = asteroidGeo.attributes.position.array
      for (let i = 0; i < ASTEROID_COUNT; i++) {
        ap[i * 3]     += aVel[i].x
        ap[i * 3 + 1] += aVel[i].y
        if (ap[i * 3]     >  450) ap[i * 3]     = -450
        if (ap[i * 3]     < -450) ap[i * 3]     =  450
        if (ap[i * 3 + 1] >  300) ap[i * 3 + 1] = -300
        if (ap[i * 3 + 1] < -300) ap[i * 3 + 1] =  300
      }
      asteroidGeo.attributes.position.needsUpdate = true

      // ── Planet scroll parallax ──
      // Left (ringed): rises as you scroll down, mild mouse push
      planetL.position.x = -420 + targetX * -30
      planetL.position.y = -40  + scrollY * 0.16 + targetY * -10
      planetL.rotation.y = t * 0.007

      // Right (ice): sinks as you scroll down, mild mouse push opposite
      planetR.position.x =  430 + targetX * -22
      planetR.position.y =  70  - scrollY * 0.11 + targetY * -8
      planetR.rotation.y = t * -0.005

      // Shooting star fade
      for (let i = streaks.length - 1; i >= 0; i--) {
        const s = streaks[i]
        s.life -= s.speed
        s.mat.opacity = Math.max(0, s.life)
        if (s.life <= 0) {
          scene.remove(s.line)
          s.line.geometry.dispose()
          s.mat.dispose()
          streaks.splice(i, 1)
        }
      }

      // Camera z-shift on scroll (zoom in effect)
      camera.position.z = 400 - scrollY * 0.08

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [mode])

  return (
    <div
      ref={mountRef}
      style={{
        position: mode === 'fixed' ? 'fixed' : 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    />
  )
}
