'use client'

import { useEffect, useRef } from 'react'

export default function CanvasSketch() {
  const canvasRef = useRef(null)
  const videoRef = useRef(null)
  const animationFrameRef = useRef(null)
  const faceapiRef = useRef(null)
  const detectionsRef = useRef([])
  const particlesRef = useRef([])
  const camActiveRef = useRef(true)
  const frameCountRef = useRef(0)

  const CANVAS_WIDTH = 640
  const CANVAS_HEIGHT = 480

  const detectionOptions = {
    withLandmarks: true,
    withDescriptors: false,
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let video = null

    // 웹캠 초기화
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(stream => {
        video = document.createElement('video')
        video.srcObject = stream
        video.width = CANVAS_WIDTH
        video.height = CANVAS_HEIGHT
        video.play()
        video.style.display = 'none'
        document.body.appendChild(video)
        videoRef.current = video

        // ml5.js faceapi 초기화
        if (typeof window !== 'undefined' && window.ml5) {
          faceapiRef.current = window.ml5.faceApi(
            video,
            detectionOptions,
            () => modelReady(ctx)
          )
        }
      })
      .catch(err => {
        console.error('웹캠 접근 실패:', err)
      })

    // 파티클 시스템 초기화
    for (let i = 0; i < 50; i++) {
      particlesRef.current.push(new Particle())
    }

    // 애니메이션 루프
    const animate = () => {
      frameCountRef.current++
      draw(ctx, video)
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop())
      }
      if (video && video.parentNode) {
        video.parentNode.removeChild(video)
      }
    }
  }, [])

  const modelReady = ctx => {
    console.log('Face API 모델이 준비되었습니다!')
    const statusEl = document.getElementById('status')
    if (statusEl) {
      statusEl.textContent = '얼굴을 카메라 앞에 두세요...'
    }
    detectFace(ctx)
  }

  const detectFace = ctx => {
    if (camActiveRef.current && faceapiRef.current) {
      faceapiRef.current.detect((err, result) => gotResults(err, result, ctx))
    }
  }

  const gotResults = (err, result, ctx) => {
    if (err) {
      console.error(err)
      if (camActiveRef.current) {
        setTimeout(() => detectFace(ctx), 100)
      }
      return
    }

    if (Array.isArray(result)) {
      detectionsRef.current = result
    } else if (result && result.detections) {
      detectionsRef.current = result.detections
    } else {
      detectionsRef.current = []
    }

    const statusEl = document.getElementById('status')
    if (detectionsRef.current.length > 0) {
      if (statusEl) {
        statusEl.textContent = `얼굴 감지됨! (${detectionsRef.current.length}개)`
      }
    } else {
      if (statusEl) {
        statusEl.textContent = '얼굴을 찾는 중...'
      }
    }

    if (camActiveRef.current) {
      setTimeout(() => detectFace(ctx), 100)
    }
  }

  const draw = (ctx, video) => {
    // 배경 그리기
    ctx.fillStyle = 'rgb(20, 20, 30)'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // 웹캠 영상 표시
    if (camActiveRef.current && video && video.readyState === video.HAVE_ENOUGH_DATA) {
      ctx.save()
      ctx.translate(CANVAS_WIDTH, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      ctx.restore()
    } else {
      ctx.fillStyle = 'rgb(40, 40, 50)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    }

    // 얼굴 감지 결과 그리기
    if (detectionsRef.current.length > 0) {
      drawDetections(ctx)
      updateParticles()
    }

    // 파티클 그리기
    drawParticles(ctx)
  }

  const drawDetections = ctx => {
    for (let i = 0; i < detectionsRef.current.length; i++) {
      const detection = detectionsRef.current[i]

      let box, landmarks

      if (detection.alignedRect) {
        box =
          detection.alignedRect._box ||
          detection.alignedRect.box ||
          detection.alignedRect
        landmarks = detection.landmarks
      } else if (detection.box) {
        box = detection.box
        landmarks = detection.landmarks
      } else if (detection.detection) {
        box = detection.detection.box || detection.detection
        landmarks = detection.landmarks
      } else {
        box = detection
      }

      let x, y, w, h
      if (box._x !== undefined) {
        x = box._x
        y = box._box ? box._box._y : box._y
        w = box._width || box._box?._width || box.width
        h = box._height || box._box?._height || box.height
      } else if (box.x !== undefined) {
        x = box.x
        y = box.y
        w = box.width
        h = box.height
      } else {
        continue
      }

      // 얼굴 박스 그리기 (미러 효과 고려)
      ctx.save()
      ctx.translate(CANVAS_WIDTH - x - w, y)
      ctx.scale(-1, 1)

      ctx.strokeStyle = 'rgba(0, 255, 150, 1)'
      ctx.lineWidth = 2
      ctx.strokeRect(0, 0, w, h)

      // 랜드마크 그리기
      if (landmarks) {
        ctx.fillStyle = 'rgba(255, 100, 100, 1)'

        if (landmarks.positions) {
          for (let j = 0; j < landmarks.positions.length; j++) {
            const point = landmarks.positions[j]
            const px = point._x !== undefined ? point._x : point.x
            const py = point._y !== undefined ? point._y : point.y
            if (px !== undefined && py !== undefined) {
              ctx.beginPath()
              ctx.arc(px, py, 2, 0, Math.PI * 2)
              ctx.fill()
            }
          }
        } else if (Array.isArray(landmarks)) {
          for (let j = 0; j < landmarks.length; j++) {
            const point = landmarks[j]
            const px = point._x !== undefined ? point._x : point.x
            const py = point._y !== undefined ? point._y : point.y
            if (px !== undefined && py !== undefined) {
              ctx.beginPath()
              ctx.arc(px, py, 2, 0, Math.PI * 2)
              ctx.fill()
            }
          }
        }
      }

      ctx.restore()

      // 인터랙티브 효과
      createFaceEffect({ _box: { _x: x, _y: y, _width: w, _height: h } })
    }
  }

  const createFaceEffect = rect => {
    if (frameCountRef.current % 5 === 0) {
      const x = CANVAS_WIDTH - rect._box._x - rect._box._width / 2
      const y = rect._box._y + rect._box._height / 2

      for (let i = 0; i < 3; i++) {
        particlesRef.current.push(new Particle(x, y))
      }
    }
  }

  const updateParticles = () => {
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      particlesRef.current[i].update()
      if (particlesRef.current[i].isDead()) {
        particlesRef.current.splice(i, 1)
      }
    }

    while (particlesRef.current.length < 30) {
      particlesRef.current.push(new Particle())
    }
  }

  const drawParticles = ctx => {
    for (let particle of particlesRef.current) {
      particle.display(ctx)
    }
  }

  // 파티클 클래스
  class Particle {
    constructor(x, y) {
      if (x && y) {
        this.x = x
        this.y = y
      } else {
        this.x = Math.random() * CANVAS_WIDTH
        this.y = Math.random() * CANVAS_HEIGHT
      }
      this.vx = Math.random() * 4 - 2
      this.vy = Math.random() * 4 - 2
      this.life = 255
      this.size = Math.random() * 5 + 3
      this.r = Math.random() * 155 + 100
      this.g = Math.random() * 155 + 100
      this.b = Math.random() * 105 + 150
    }

    update() {
      this.x += this.vx
      this.y += this.vy
      this.life -= 2

      if (this.x < 0 || this.x > CANVAS_WIDTH) this.vx *= -1
      if (this.y < 0 || this.y > CANVAS_HEIGHT) this.vy *= -1
    }

    display(ctx) {
      const alpha = this.life / 255
      ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx.fill()
    }

    isDead() {
      return this.life < 0
    }
  }

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{ display: 'block' }}
    />
  )
}
