// 비디오 재생 제어
const introVideo = document.getElementById('intro-video');
let videoPlayedOnce = false;

// 비디오가 끝나면 정지하고 처음으로 되돌림
introVideo.addEventListener('ended', () => {
    if (!videoPlayedOnce) {
        videoPlayedOnce = true;
        introVideo.pause();
        introVideo.currentTime = 0;
    }
});

// 비디오가 재생되려고 할 때, 이미 한 번 재생되었다면 막음
introVideo.addEventListener('play', () => {
    if (videoPlayedOnce) {
        introVideo.pause();
    }
});

// 비디오가 로드된 후 자동 재생
introVideo.addEventListener('loadeddata', () => {
    if (!videoPlayedOnce) {
        introVideo.play().catch(err => {
            console.log('비디오 자동 재생 실패:', err);
        });
    }
});

// 카루셀 설정
const carousel = document.getElementById('carousel');
const pumpkinImages = ['pumpkin1.svg', 'pumpkin2.svg', 'pumpkin3.svg'];
const cardWidth = 200; // 카드 너비 (CSS와 동일)
const gap = 20; // 카드 간격 (CSS와 동일)
const cardTotalWidth = cardWidth + gap;
let scrollPosition = 0;
let isPaused = false;
let animationId = null;
const scrollSpeed = 0.5; // 스크롤 속도 (픽셀/프레임)

// 카드 생성 함수
function createCards() {
    // 충분한 카드를 생성하여 무한 스크롤 효과 구현
    // 최소 3세트의 카드를 생성 (원래 + 복사본 2개)
    const numSets = 3;
    const cardsPerSet = 12;
    
    for (let set = 0; set < numSets; set++) {
        for (let i = 0; i < cardsPerSet; i++) {
            const card = document.createElement('div');
            card.className = 'card';
            
            // 랜덤하게 pumpkin 이미지 선택
            const randomPumpkin = pumpkinImages[Math.floor(Math.random() * pumpkinImages.length)];
            const img = document.createElement('img');
            img.src = randomPumpkin;
            img.alt = 'Pumpkin';
            
            card.appendChild(img);
            
            // Hover 이벤트
            card.addEventListener('mouseenter', () => {
                isPaused = true;
                carousel.classList.add('paused');
            });
            
            card.addEventListener('mouseleave', () => {
                isPaused = false;
                carousel.classList.remove('paused');
            });
            
            carousel.appendChild(card);
        }
    }
}

// 무한 스크롤 애니메이션
function animateCarousel() {
    if (!isPaused) {
        scrollPosition -= scrollSpeed;
        
        // 한 세트의 카드 너비만큼 스크롤했으면 처음으로 리셋
        const oneSetWidth = 12 * cardTotalWidth; // 12개 카드
        if (Math.abs(scrollPosition) >= oneSetWidth) {
            scrollPosition = 0;
        }
        
        carousel.style.transform = `translateX(${scrollPosition}px)`;
    }
    
    animationId = requestAnimationFrame(animateCarousel);
}

// Start 버튼 이벤트
const startButton = document.getElementById('start-btn');
startButton.addEventListener('click', () => {
    console.log('Start button clicked!');
    // 여기에 시작 로직을 추가할 수 있습니다
});

// 초기화
createCards();
animateCarousel();

