// 비디오 재생 제어
function initVideo() {
    const introVideo = document.getElementById('intro-video');
    if (!introVideo) {
        console.error('비디오 요소를 찾을 수 없습니다.');
        return;
    }
    
    console.log('비디오 요소 찾음:', introVideo);
    console.log('비디오 src:', introVideo.src);
    console.log('비디오 currentSrc:', introVideo.currentSrc);
    
    let videoPlayedOnce = false;

    // 비디오가 끝나면 정지하고 4초로 되돌림
    introVideo.addEventListener('ended', () => {
        console.log('비디오 재생 완료');
        if (!videoPlayedOnce) {
            videoPlayedOnce = true;
            introVideo.pause();
            introVideo.currentTime = 4;
            console.log('비디오를 4초로 되돌림');
        }
    });

    // 비디오가 재생되려고 할 때, 이미 한 번 재생되었다면 막음
    introVideo.addEventListener('play', () => {
        console.log('비디오 재생 시도, videoPlayedOnce:', videoPlayedOnce);
        if (videoPlayedOnce) {
            introVideo.pause();
        }
    });

    // 비디오가 로드된 후 자동 재생
    introVideo.addEventListener('loadeddata', () => {
        console.log('비디오 로드 완료 (loadeddata)');
        console.log('비디오 duration:', introVideo.duration);
        console.log('비디오 videoWidth:', introVideo.videoWidth);
        console.log('비디오 videoHeight:', introVideo.videoHeight);
        if (!videoPlayedOnce) {
            introVideo.play().catch(err => {
                console.error('비디오 자동 재생 실패:', err);
            });
        }
    });
    
    // loadedmetadata 이벤트
    introVideo.addEventListener('loadedmetadata', () => {
        console.log('비디오 메타데이터 로드 완료');
        console.log('비디오 duration:', introVideo.duration);
    });
    
    // 에러 처리
    introVideo.addEventListener('error', (e) => {
        console.error('비디오 로드 에러:', e);
        console.error('비디오 error code:', introVideo.error?.code);
        console.error('비디오 error message:', introVideo.error?.message);
        console.error('비디오 src:', introVideo.src);
        console.error('비디오 currentSrc:', introVideo.currentSrc);
    });
    
    // canplay 이벤트로도 재생 시도
    introVideo.addEventListener('canplay', () => {
        console.log('비디오 재생 가능 (canplay)');
        if (!videoPlayedOnce && introVideo.paused) {
            introVideo.play().catch(err => {
                console.error('비디오 재생 시도 실패:', err);
            });
        }
    });
    
    // 비디오가 보이도록 스타일 확인
    const videoStyle = window.getComputedStyle(introVideo);
    console.log('비디오 display:', videoStyle.display);
    console.log('비디오 visibility:', videoStyle.visibility);
    console.log('비디오 width:', videoStyle.width);
    console.log('비디오 height:', videoStyle.height);
    
    // 비디오가 로드되지 않았으면 강제로 로드
    if (introVideo.readyState === 0) {
        console.log('비디오 로드 강제 시작');
        introVideo.load();
    }
}

// 카루셀 설정
let carousel, carousel2;
const pumpkinImages = ['pumpkin1.svg', 'pumpkin2.svg', 'pumpkin3.svg'];
const cardWidth = 200; // 카드 너비 (CSS와 동일)
const gap = 20; // 카드 간격 (CSS와 동일)
const cardTotalWidth = cardWidth + gap;
let scrollPosition = 0;
let scrollPosition2 = 0;
let isPaused = false;
let isPaused2 = false;
let animationId = null;
const scrollSpeed = 0.5; // 스크롤 속도 (픽셀/프레임)

// 카드 생성 함수
function createCards(targetCarousel, carouselId) {
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
                if (carouselId === 1) {
                    isPaused = true;
                    targetCarousel.classList.add('paused');
                } else {
                    isPaused2 = true;
                    targetCarousel.classList.add('paused');
                }
            });
            
            card.addEventListener('mouseleave', () => {
                if (carouselId === 1) {
                    isPaused = false;
                    targetCarousel.classList.remove('paused');
                } else {
                    isPaused2 = false;
                    targetCarousel.classList.remove('paused');
                }
            });
            
            targetCarousel.appendChild(card);
        }
    }
}

// 무한 스크롤 애니메이션
function animateCarousel() {
    if (carousel && !isPaused) {
        scrollPosition -= scrollSpeed;
        
        // 한 세트의 카드 너비만큼 스크롤했으면 처음으로 리셋
        const oneSetWidth = 12 * cardTotalWidth; // 12개 카드
        if (Math.abs(scrollPosition) >= oneSetWidth) {
            scrollPosition = 0;
        }
        
        carousel.style.transform = `translateX(${scrollPosition}px)`;
    }
    
    if (carousel2 && !isPaused2) {
        scrollPosition2 += scrollSpeed; // 두 번째 row는 반대 방향으로 스크롤
        
        // 한 세트의 카드 너비만큼 스크롤했으면 처음으로 리셋
        const oneSetWidth = 12 * cardTotalWidth; // 12개 카드
        if (Math.abs(scrollPosition2) >= oneSetWidth) {
            scrollPosition2 = 0;
        }
        
        carousel2.style.transform = `translateX(${scrollPosition2}px)`;
    }
    
    animationId = requestAnimationFrame(animateCarousel);
}

// Start 버튼 이벤트는 initialize 함수로 이동

// 초기화 함수
function initialize() {
    console.log('초기화 함수 실행 시작');
    
    // 비디오 초기화
    try {
        initVideo();
        console.log('비디오 초기화 완료');
    } catch (error) {
        console.error('비디오 초기화 에러:', error);
    }
    
    // 카루셀 초기화 - DOM에서 다시 가져오기
    const carouselContainer = document.getElementById('carousel-container');
    console.log('carousel-container 찾음:', !!carouselContainer);
    
    if (!carouselContainer) {
        console.error('carousel-container를 찾을 수 없습니다!');
        return;
    }
    
    console.log('carousel-container의 자식 요소들:', carouselContainer.children);
    console.log('carousel-container의 자식 수:', carouselContainer.children.length);
    for (let i = 0; i < carouselContainer.children.length; i++) {
        console.log(`자식 ${i}:`, carouselContainer.children[i].id, carouselContainer.children[i].className);
    }
    
    carousel = document.getElementById('carousel');
    carousel2 = document.getElementById('carousel2');
    
    console.log('Carousel 요소 확인:', {
        carousel: !!carousel,
        carousel2: !!carousel2
    });
    
    // carousel2가 없으면 생성
    if (!carousel2) {
        console.log('carousel2가 없어서 생성합니다.');
        carousel2 = document.createElement('div');
        carousel2.id = 'carousel2';
        carousel2.className = 'carousel';
        if (carousel && carousel.nextSibling) {
            carouselContainer.insertBefore(carousel2, carousel.nextSibling);
        } else {
            carouselContainer.appendChild(carousel2);
        }
    }
    
    if (!carousel) {
        console.error('carousel 요소를 찾을 수 없습니다!');
        return;
    }
    
    console.log('최종 Carousel 요소 확인:', {
        carousel: !!carousel,
        carousel2: !!carousel2
    });
    
    if (carousel && carousel2) {
        console.log('Carousel 요소들 찾음, 카드 생성 시작...');
        console.log('carousel 요소:', carousel);
        console.log('carousel2 요소:', carousel2);
        
        // 각 carousel의 스타일 확인
        const carouselStyle = window.getComputedStyle(carousel);
        const containerStyle = window.getComputedStyle(document.getElementById('carousel-container'));
        console.log('carousel-container flex-direction:', containerStyle.flexDirection);
        console.log('carousel display:', carouselStyle.display);
        console.log('carousel height:', carouselStyle.height);
        
        createCards(carousel, 1);
        console.log('carousel 1 카드 생성 완료, 카드 수:', carousel.children.length);
        console.log('carousel 1 실제 높이:', carousel.offsetHeight);
        
        createCards(carousel2, 2);
        console.log('carousel 2 카드 생성 완료, 카드 수:', carousel2.children.length);
        console.log('carousel 2 실제 높이:', carousel2.offsetHeight);
        
        // 강제로 스타일 적용
        carousel.style.display = 'flex';
        carousel.style.flexDirection = 'row';
        carousel.style.minHeight = '220px';
        carousel.style.height = '220px';
        carousel.style.transform = 'translateX(0)';
        carousel.style.position = 'relative';
        carousel.style.top = '0';
        carousel.style.left = '0';
        
        carousel2.style.display = 'flex';
        carousel2.style.flexDirection = 'row';
        carousel2.style.minHeight = '220px';
        carousel2.style.height = '220px';
        carousel2.style.transform = 'translateX(0)';
        carousel2.style.position = 'relative';
        carousel2.style.top = '0';
        carousel2.style.left = '0';
        
        const carouselContainer = document.getElementById('carousel-container');
        carouselContainer.style.display = 'flex';
        carouselContainer.style.flexDirection = 'column';
        carouselContainer.style.gap = '30px';
        carouselContainer.style.padding = '20px 0';
        
        // 각 carousel이 실제로 보이는지 확인
        console.log('carousel 1 offsetTop:', carousel.offsetTop, 'offsetHeight:', carousel.offsetHeight, 'getBoundingClientRect:', carousel.getBoundingClientRect());
        console.log('carousel 2 offsetTop:', carousel2.offsetTop, 'offsetHeight:', carousel2.offsetHeight, 'getBoundingClientRect:', carousel2.getBoundingClientRect());
        
        // container의 자식 요소 확인
        console.log('carousel-container 자식 수:', carouselContainer.children.length);
        console.log('carousel-container 자식들:', Array.from(carouselContainer.children).map(el => ({ id: el.id, offsetTop: el.offsetTop, offsetHeight: el.offsetHeight })));
        
        animateCarousel();
        console.log('카루셀 초기화 완료 - 2개 carousel 모두 생성됨');
    } else {
        console.error('Carousel 요소를 찾을 수 없습니다.');
        console.error('carousel:', carousel);
        console.error('carousel2:', carousel2);
    }
    
    // Start 버튼 이벤트
    const startButton = document.getElementById('start-btn');
    if (startButton) {
        startButton.addEventListener('click', () => {
            console.log('Start button clicked!');
            // 여기에 시작 로직을 추가할 수 있습니다
        });
    }
    
    console.log('초기화 함수 실행 완료');
}

// 즉시 실행하여 확인
console.log('Script.js 로드됨');
console.log('document.readyState:', document.readyState);

// DOM이 로드된 후 실행
if (document.readyState === 'loading') {
    console.log('DOM 로딩 중, DOMContentLoaded 대기');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded 이벤트 발생');
        initialize();
    });
} else {
    // DOM이 이미 로드된 경우
    console.log('DOM 이미 로드됨, 즉시 초기화');
    setTimeout(() => {
        console.log('setTimeout으로 초기화 실행');
        initialize();
    }, 100);
}

