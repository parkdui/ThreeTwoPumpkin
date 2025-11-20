let video;
let faceapi;
let detections = [];
let faceDetected = false;
let particles = [];
let camActive = true;

// 얼굴 감지 설정
const detectionOptions = {
    withLandmarks: true,
    withDescriptors: false,
};

function setup() {
    const canvas = createCanvas(640, 480);
    canvas.parent('canvas-container');
    
    // 웹캠 초기화
    video = createCapture(VIDEO);
    video.size(640, 480);
    video.hide();
    
    // ml5.js faceapi 초기화
    faceapi = ml5.faceApi(video, detectionOptions, modelReady);
    
    // 파티클 시스템 초기화
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
    }
    
    // 버튼 이벤트 리스너
    document.getElementById('toggle-cam').addEventListener('click', toggleCamera);
    document.getElementById('reset').addEventListener('click', resetSketch);
}

function modelReady() {
    console.log('Face API 모델이 준비되었습니다!');
    document.getElementById('status').textContent = '얼굴을 카메라 앞에 두세요...';
    detectFace();
}

function detectFace() {
    if (camActive && faceapi) {
        faceapi.detect(gotResults);
    }
}

function gotResults(err, result) {
    if (err) {
        console.error(err);
        // 에러가 있어도 계속 감지 시도
        if (camActive) {
            setTimeout(detectFace, 100);
        }
        return;
    }
    
    // 결과가 배열인지 확인
    if (Array.isArray(result)) {
        detections = result;
    } else if (result && result.detections) {
        detections = result.detections;
    } else {
        detections = [];
    }
    
    if (detections.length > 0) {
        faceDetected = true;
        document.getElementById('status').textContent = `얼굴 감지됨! (${detections.length}개)`;
    } else {
        faceDetected = false;
        document.getElementById('status').textContent = '얼굴을 찾는 중...';
    }
    
    // 계속해서 감지
    if (camActive) {
        setTimeout(detectFace, 100);
    }
}

function draw() {
    background(20, 20, 30);
    
    // 웹캠 영상 표시
    if (camActive && video) {
        push();
        translate(width, 0);
        scale(-1, 1); // 미러 효과
        image(video, 0, 0, width, height);
        pop();
    } else {
        // 카메라가 꺼져있을 때 배경
        fill(40, 40, 50);
        rect(0, 0, width, height);
    }
    
    // 얼굴 감지 결과 그리기
    if (detections.length > 0) {
        drawDetections();
        updateParticles();
    }
    
    // 파티클 그리기
    drawParticles();
}

function drawDetections() {
    for (let i = 0; i < detections.length; i++) {
        const detection = detections[i];
        
        // 다양한 API 구조 지원
        let box, landmarks;
        
        if (detection.alignedRect) {
            box = detection.alignedRect._box || detection.alignedRect.box || detection.alignedRect;
            landmarks = detection.landmarks;
        } else if (detection.box) {
            box = detection.box;
            landmarks = detection.landmarks;
        } else if (detection.detection) {
            box = detection.detection.box || detection.detection;
            landmarks = detection.landmarks;
        } else {
            box = detection;
        }
        
        // 박스 좌표 추출
        let x, y, w, h;
        if (box._x !== undefined) {
            x = box._x;
            y = box._box ? box._box._y : box._y;
            w = box._width || box._box?._width || box.width;
            h = box._height || box._box?._height || box.height;
        } else if (box.x !== undefined) {
            x = box.x;
            y = box.y;
            w = box.width;
            h = box.height;
        } else {
            continue; // 유효하지 않은 데이터는 스킵
        }
        
        // 얼굴 박스 그리기 (미러 효과 고려)
        push();
        translate(width - x - w, y);
        scale(-1, 1);
        
        noFill();
        stroke(0, 255, 150);
        strokeWeight(2);
        rect(0, 0, w, h);
        
        // 랜드마크 그리기
        if (landmarks) {
            fill(255, 100, 100);
            noStroke();
            
            // 랜드마크 포인트 그리기
            if (landmarks.positions) {
                for (let j = 0; j < landmarks.positions.length; j++) {
                    const point = landmarks.positions[j];
                    const px = point._x !== undefined ? point._x : point.x;
                    const py = point._y !== undefined ? point._y : point.y;
                    if (px !== undefined && py !== undefined) {
                        ellipse(px, py, 4, 4);
                    }
                }
            } else if (Array.isArray(landmarks)) {
                for (let j = 0; j < landmarks.length; j++) {
                    const point = landmarks[j];
                    const px = point._x !== undefined ? point._x : point.x;
                    const py = point._y !== undefined ? point._y : point.y;
                    if (px !== undefined && py !== undefined) {
                        ellipse(px, py, 4, 4);
                    }
                }
            }
        }
        
        pop();
        
        // 인터랙티브 효과
        createFaceEffect({ _box: { _x: x, _y: y, _width: w, _height: h } });
    }
}

function createFaceEffect(rect) {
    // 얼굴 주변에 파티클 생성
    if (frameCount % 5 === 0) {
        const x = width - rect._box._x - rect._box._width / 2;
        const y = rect._box._y + rect._box._height / 2;
        
        for (let i = 0; i < 3; i++) {
            particles.push(new Particle(x, y));
        }
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].isDead()) {
            particles.splice(i, 1);
        }
    }
    
    // 파티클이 너무 적으면 추가
    while (particles.length < 30) {
        particles.push(new Particle());
    }
}

function drawParticles() {
    for (let particle of particles) {
        particle.display();
    }
}

// 파티클 클래스
class Particle {
    constructor(x, y) {
        if (x && y) {
            this.x = x;
            this.y = y;
        } else {
            this.x = random(width);
            this.y = random(height);
        }
        this.vx = random(-2, 2);
        this.vy = random(-2, 2);
        this.life = 255;
        this.size = random(3, 8);
        this.color = color(
            random(100, 255),
            random(100, 255),
            random(150, 255),
            this.life
        );
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 2;
        this.color.setAlpha(this.life);
        
        // 경계 처리
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    }
    
    display() {
        push();
        fill(this.color);
        noStroke();
        ellipse(this.x, this.y, this.size);
        pop();
    }
    
    isDead() {
        return this.life < 0;
    }
}

function toggleCamera() {
    camActive = !camActive;
    if (camActive) {
        video.play();
        detectFace();
        document.getElementById('toggle-cam').textContent = '카메라 끄기';
    } else {
        video.stop();
        document.getElementById('toggle-cam').textContent = '카메라 켜기';
        document.getElementById('status').textContent = '카메라가 꺼져있습니다.';
    }
}

function resetSketch() {
    particles = [];
    detections = [];
    faceDetected = false;
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
    }
    document.getElementById('status').textContent = '리셋되었습니다.';
}

