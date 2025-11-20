'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

// p5.js를 동적으로 로드
const FaceMeshSketch = ({ selectedPumpkin, onKeypointsUpdate }) => {
  const sketchRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let p5Instance = null
    let faceMesh = null
    let video = null
    let faces = []
    const options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false }

    const loadP5AndMl5 = async () => {
      // p5.js와 ml5.js 로드
      if (!window.p5) {
        await new Promise((resolve) => {
          const script = document.createElement('script')
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.10/p5.min.js'
          script.onload = resolve
          document.head.appendChild(script)
        })
      }

      if (!window.ml5) {
        await new Promise((resolve) => {
          const script = document.createElement('script')
          script.src = 'https://unpkg.com/ml5@latest/dist/ml5.min.js'
          script.onload = resolve
          document.head.appendChild(script)
        })
      }

      // p5.js sketch 생성
      const sketch = (p) => {
        let faceMeshReady = false

        p.preload = () => {
          // Load the faceMesh model with callback (Reference code 방식)
          // 콜백 내에서 faceMesh를 설정해야 함
          window.ml5.faceMesh(options, (loadedFaceMesh) => {
            console.log('✅ FaceMesh 모델 로드 완료 (p5.js)')
            faceMesh = loadedFaceMesh
            faceMeshReady = true
            console.log('faceMesh 객체:', faceMesh)
            console.log('faceMesh.detectStart:', faceMesh.detectStart)
            
            // 비디오가 이미 준비되어 있다면 바로 시작
            if (video && video.elt && video.elt.readyState >= video.elt.HAVE_ENOUGH_DATA) {
              startDetection()
            }
          })
        }

        const startDetection = () => {
          if (faceMeshReady && faceMesh && typeof faceMesh.detectStart === 'function' && video) {
            console.log('✅ p5.js에서 detectStart 호출')
            faceMesh.detectStart(video, gotFaces)
          } else {
            console.log('⏳ faceMesh 또는 video 준비 대기 중...', {
              faceMeshReady,
              hasFaceMesh: !!faceMesh,
              hasDetectStart: faceMesh && typeof faceMesh.detectStart === 'function',
              hasVideo: !!video
            })
          }
        }

        p.setup = () => {
          // Canvas를 화면 중앙에 40% width로 설정 (pumpkin svg와 동일한 크기)
          const canvasWidth = p.windowWidth * 0.4
          const canvasHeight = canvasWidth // 정사각형 비율 유지
          p.createCanvas(canvasWidth, canvasHeight)
          
          // Canvas를 중앙에 배치
          const canvasElement = p.canvas
          canvasElement.style.position = 'absolute'
          canvasElement.style.top = '50%'
          canvasElement.style.left = '50%'
          canvasElement.style.transform = 'translate(-50%, -50%)'
          
          // Create the webcam video and hide it
          video = p.createCapture(p.VIDEO)
          video.size(canvasWidth, canvasHeight) // canvas와 동일한 크기
          video.hide()
          
          // video 요소를 강제로 숨기기 (두 개의 video가 나오는 문제 해결)
          const videoElement = video.elt
          videoElement.style.display = 'none'
          videoElement.style.visibility = 'hidden'
          videoElement.style.position = 'absolute'
          videoElement.style.top = '-9999px'

          // 비디오가 준비되면 detectStart 호출 (HTML5 video 이벤트 사용)
          videoElement.addEventListener('loadedmetadata', () => {
            console.log('p5.js video loadedmetadata')
            // 약간의 지연을 주어 모델이 완전히 로드될 때까지 대기
            setTimeout(() => {
              startDetection()
            }, 500)
          })
          
          // 비디오가 이미 준비되어 있을 수도 있음
          if (videoElement.readyState >= videoElement.HAVE_ENOUGH_DATA) {
            setTimeout(() => {
              startDetection()
            }, 1000)
          }
        }

        p.draw = () => {
          // 배경을 투명하게 (keypoints만 보이도록)
          p.clear()
          
          // Draw all the tracked face points (eyes and mouth only)
          for (let i = 0; i < faces.length; i++) {
            let face = faces[i]
            if (face && face.keypoints) {
              // 눈: 눈 영역 keypoints의 평균 위치를 계산하여 눈동자 중심점 구하기
              // Left eye keypoints
              const leftEyeIndices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
              // Right eye keypoints
              const rightEyeIndices = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
              
              // 왼쪽 눈 중심점 계산
              let leftEyeX = 0
              let leftEyeY = 0
              let leftEyeCount = 0
              for (let idx of leftEyeIndices) {
                if (face.keypoints[idx]) {
                  leftEyeX += face.keypoints[idx].x
                  leftEyeY += face.keypoints[idx].y
                  leftEyeCount++
                }
              }
              if (leftEyeCount > 0) {
                leftEyeX /= leftEyeCount
                leftEyeY /= leftEyeCount
                p.fill(255) // white
                p.noStroke()
                p.circle(leftEyeX, leftEyeY, 30) // 큰 circle
              }
              
              // 오른쪽 눈 중심점 계산
              let rightEyeX = 0
              let rightEyeY = 0
              let rightEyeCount = 0
              for (let idx of rightEyeIndices) {
                if (face.keypoints[idx]) {
                  rightEyeX += face.keypoints[idx].x
                  rightEyeY += face.keypoints[idx].y
                  rightEyeCount++
                }
              }
              if (rightEyeCount > 0) {
                rightEyeX /= rightEyeCount
                rightEyeY /= rightEyeCount
                p.fill(255) // white
                p.noStroke()
                p.circle(rightEyeX, rightEyeY, 30) // 큰 circle
              }
              
              // 입: 입술 윗부분 line만 (상단 keypoints만)
              const upperLipIndices = new Set([
                61, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318
              ])
              
              for (let j = 0; j < face.keypoints.length; j++) {
                if (upperLipIndices.has(j)) {
                  let keypoint = face.keypoints[j]
                  p.fill(255) // white
                  p.noStroke()
                  p.circle(keypoint.x, keypoint.y, 10)
                }
              }
            }
          }
        }

        // Callback function for when faceMesh outputs data
        const gotFaces = (results) => {
          faces = results
          // React 컴포넌트에 keypoints 전달
          if (onKeypointsUpdate && results && results.length > 0) {
            onKeypointsUpdate(results)
          }
        }

        p.windowResized = () => {
          // 화면 크기가 변경되어도 40% width 유지
          const canvasWidth = p.windowWidth * 0.4
          const canvasHeight = canvasWidth
          p.resizeCanvas(canvasWidth, canvasHeight)
        }
      }

      // p5 인스턴스 생성
      p5Instance = new window.p5(sketch, containerRef.current)
      sketchRef.current = p5Instance
    }

    loadP5AndMl5()

    return () => {
      if (p5Instance) {
        p5Instance.remove()
      }
      if (faceMesh && faceMesh.detectStop) {
        faceMesh.detectStop()
      }
      if (video && video.stop) {
        video.stop()
      }
    }
  }, [selectedPumpkin, onKeypointsUpdate])

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '40%',
        zIndex: 100,
        pointerEvents: 'none'
      }}
    />
  )
}

export default FaceMeshSketch

