'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import Image from 'next/image'
import FaceMeshSketch from '../components/FaceMeshSketch'

export default function Home() {
  const videoRef = useRef(null)
  const carouselRef = useRef(null)
  const carousel2Ref = useRef(null)
  const [videoPlayedOnce, setVideoPlayedOnce] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [scrollPosition2, setScrollPosition2] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isPaused2, setIsPaused2] = useState(false)
  const animationFrameRef = useRef(null)
  const [showFaceMesh, setShowFaceMesh] = useState(false) // 새 화면 상태
  const [selectedPumpkin, setSelectedPumpkin] = useState(null) // 선택된 호박 이미지

  const pumpkinImages = ['/pumpkin1.svg', '/pumpkin2.svg', '/pumpkin3.svg']
  const cardWidth = 200
  const gap = 20
  const cardTotalWidth = cardWidth + gap
  const scrollSpeed = 0.5
  
  // carousel2의 초기 위치를 음수로 설정하여 왼쪽에 카드가 보이도록
  useEffect(() => {
    if (carousel2Ref.current) {
      const oneSetWidth = 12 * cardTotalWidth
      carousel2Ref.current.style.transform = `translateX(-${oneSetWidth}px)`
      setScrollPosition2(-oneSetWidth)
    }
  }, [cardTotalWidth])

  // 카드 데이터를 useMemo로 고정하여 재렌더링 시 변경되지 않도록 함
  const cards = useMemo(() => {
    return Array.from({ length: 3 }).map((_, setIndex) =>
      Array.from({ length: 12 }).map((_, cardIndex) => {
        const randomPumpkin = pumpkinImages[
          Math.floor(Math.random() * pumpkinImages.length)
        ]
        return {
          id: `${setIndex}-${cardIndex}`,
          image: randomPumpkin,
        }
      })
    )
  }, [])

  // 비디오 제어
  useEffect(() => {
    const video = videoRef.current
    if (!video) {
      console.error('비디오 ref가 없습니다')
      return
    }

    console.log('비디오 요소 찾음:', video)
    console.log('비디오 src:', video.src)
    console.log('비디오 currentSrc:', video.currentSrc)

    const handleEnded = () => {
      console.log('비디오 재생 완료')
      if (!videoPlayedOnce) {
        setVideoPlayedOnce(true)
        video.pause()
        video.currentTime = 4
        console.log('비디오를 4초로 되돌림')
      }
    }

    const handlePlay = () => {
      console.log('비디오 재생 시도, videoPlayedOnce:', videoPlayedOnce)
      if (videoPlayedOnce) {
        video.pause()
      }
    }

    const handleLoadedData = () => {
      console.log('비디오 로드 완료 (loadeddata)')
      console.log('비디오 duration:', video.duration)
      if (!videoPlayedOnce) {
        video.play().catch(err => {
          console.error('비디오 자동 재생 실패:', err)
        })
      }
    }

    const handleError = (e) => {
      console.error('비디오 에러:', e)
      console.error('비디오 error code:', video.error?.code)
      console.error('비디오 error message:', video.error?.message)
    }

    const handleCanPlay = () => {
      console.log('비디오 재생 가능 (canplay)')
      if (!videoPlayedOnce && video.paused) {
        video.play().catch(err => {
          console.error('비디오 재생 시도 실패:', err)
        })
      }
    }

    video.addEventListener('ended', handleEnded)
    video.addEventListener('play', handlePlay)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('error', handleError)
    video.addEventListener('canplay', handleCanPlay)

    // 비디오가 보이도록 확인
    const videoStyle = window.getComputedStyle(video)
    console.log('비디오 display:', videoStyle.display)
    console.log('비디오 visibility:', videoStyle.visibility)
    console.log('비디오 width:', videoStyle.width)
    console.log('비디오 height:', videoStyle.height)

    return () => {
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('error', handleError)
      video.removeEventListener('canplay', handleCanPlay)
    }
  }, [videoPlayedOnce])

  // 카루셀 애니메이션
  useEffect(() => {
    if (showFaceMesh) return // FaceMesh 화면일 때는 캐러셀 애니메이션 중지

    const animate = () => {
      if (!isPaused && carouselRef.current) {
        setScrollPosition(prev => {
          const newPosition = prev - scrollSpeed
          const oneSetWidth = 12 * cardTotalWidth
          
          if (Math.abs(newPosition) >= oneSetWidth) {
            return 0
          }
          
          carouselRef.current.style.transform = `translateX(${newPosition}px)`
          return newPosition
        })
      }
      
      if (!isPaused2 && carousel2Ref.current) {
        setScrollPosition2(prev => {
          const newPosition = prev + scrollSpeed
          const oneSetWidth = 12 * cardTotalWidth
          
          // 양수 방향으로 가다가 0에 도달하면 다시 -oneSetWidth로 리셋
          if (newPosition >= 0) {
            carousel2Ref.current.style.transform = `translateX(-${oneSetWidth}px)`
            return -oneSetWidth
          }
          
          carousel2Ref.current.style.transform = `translateX(${newPosition}px)`
          return newPosition
        })
      }
      
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPaused, isPaused2, cardTotalWidth, showFaceMesh])

  const handleStartClick = () => {
    console.log('Start button clicked!')
    const randomIndex = Math.floor(Math.random() * pumpkinImages.length)
    setSelectedPumpkin(pumpkinImages[randomIndex])
    setShowFaceMesh(true)
  }

  if (showFaceMesh) {
    return <FaceMeshScreen selectedPumpkin={selectedPumpkin} />
  }

  return (
    <div id="container">
      {/* 상단 비디오 */}
      <div id="video-container">
        <video
          id="intro-video"
          ref={videoRef}
          width="80%"
          autoPlay
          muted
          playsInline
          preload="auto"
          style={{
            display: 'block',
            width: '80%',
            height: 'auto',
            backgroundColor: '#000',
            minHeight: '200px',
          }}
        >
          <source src="/intro_title.mp4" type="video/mp4" />
        </video>
      </div>

      {/* 카루셀 컨테이너 */}
      <div id="carousel-container">
        <div
          id="carousel"
          ref={carouselRef}
          className="carousel"
        >
          {cards.flat().map((card) => (
            <div
              key={card.id}
              className="card"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <Image
                src={card.image}
                alt="Pumpkin"
                width={160}
                height={160}
                style={{ objectFit: 'contain' }}
              />
            </div>
          ))}
        </div>
        <div
          id="carousel2"
          ref={carousel2Ref}
          className="carousel"
        >
          {cards.flat().map((card) => (
            <div
              key={`carousel2-${card.id}`}
              className="card"
              onMouseEnter={() => setIsPaused2(true)}
              onMouseLeave={() => setIsPaused2(false)}
            >
              <Image
                src={card.image}
                alt="Pumpkin"
                width={160}
                height={160}
                style={{ objectFit: 'contain' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 하단 Start 버튼 */}
      <div id="button-container">
        <button
          id="start-btn"
          className="start-button"
          onClick={handleStartClick}
        >
          <Image
            src="/start_btn.svg"
            alt="Start"
            width={200}
            height={60}
            style={{ maxWidth: '200px', height: 'auto' }}
          />
        </button>
      </div>
    </div>
  )
}

// FaceMesh 화면 컴포넌트 - p5.js sketch 사용
function FaceMeshScreen({ selectedPumpkin }) {
  const handleKeypointsUpdate = (faces) => {
    // p5.js sketch에서 keypoints 업데이트를 받을 수 있음 (필요시 사용)
    if (faces && faces.length > 0) {
      console.log('✅ 얼굴 감지됨! keypoints 업데이트:', faces.length)
    }
  }

  return (
    <div id="facemesh-container" style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 랜덤 선택된 Pumpkin 이미지 */}
      {selectedPumpkin && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '40%',
          zIndex: 1,
          pointerEvents: 'none'
        }}>
          <Image
            src={selectedPumpkin}
            alt="Pumpkin"
            width={800}
            height={800}
            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
          />
        </div>
      )}

      {/* p5.js sketch로 faceMesh 처리 */}
      <FaceMeshSketch 
        selectedPumpkin={selectedPumpkin}
        onKeypointsUpdate={handleKeypointsUpdate}
      />
    </div>
  )
}
