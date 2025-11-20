# 3, 2, Pumpkin! - Next.js Portfolio

Interactive portfolio project built with Next.js and React.

## 개발 환경 설정

### 필수 요구사항
- Node.js 18.0 이상
- npm 또는 yarn

### 설치 방법

1. 의존성 설치:
```bash
npm install
```

2. 개발 서버 실행:
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드 및 배포

프로덕션 빌드:
```bash
npm run build
```

프로덕션 서버 실행:
```bash
npm start
```

## 프로젝트 구조

```
├── app/              # Next.js App Router
│   ├── layout.js     # 루트 레이아웃
│   ├── page.js       # 메인 페이지
│   └── globals.css   # 전역 스타일
├── components/       # React 컴포넌트
│   └── P5Sketch.js   # p5.js 스케치 컴포넌트
├── public/           # 정적 파일 (이미지, 비디오 등)
└── package.json      # 프로젝트 설정 및 의존성
```

## 주요 기능

- 비디오 재생 제어
- 무한 스크롤 카루셀
- 인터랙티브 카드 호버 효과
- p5.js 기반 얼굴 인식 (선택적)

## 기술 스택

- **Next.js 14** - React 프레임워크
- **React 18** - UI 라이브러리
- **p5.js** - 크리에이티브 코딩
- **ml5.js** - 머신러닝 (얼굴 인식)

