# 🚀 E룸페이 (ERoom Pay)

> QR 기반 결제 및 카드 혜택 추천 서비스

---

## 🛠️ 기술 스택 (Tech Stacks)

### Frontend
- React Native
- Expo
- TypeScript

### State Management
- Zustand
- TanStack Query (React Query)

### Styling
- NativeWind
- Tailwind CSS

### Communication
- REST API
- WebSocket / SSE (실시간 더치페이 기능)

### Build Tool
- Expo CLI

---

## 📂 폴더 구조 (Folder Structure)

```bash
src/
├─ app/                         # 앱 초기 설정 및 Navigation
│  ├─ navigation/
│  └─ providers/
│
├─ features/                    # 기능 단위 구조
│  ├─ auth/                     # 로그인 / 회원가입
│  ├─ payment/                  # 결제 기능
│  ├─ qr/                       # QR 생성 및 스캔
│  ├─ recommendation/           # 카드 추천
│  ├─ dutchpay/                 # 더치페이
│  ├─ card/                     # 카드 관리
│  ├─ history/                  # 결제 내역
│  ├─ notification/             # 알림
│  └─ mypage/                   # 마이페이지
│
├─ shared/                      # 공통 컴포넌트 및 유틸
│  ├─ components/
│  ├─ hooks/
│  ├─ utils/
│  ├─ constants/
│  └─ types/
│
├─ api/                         # API 통신 설정
├─ store/                       # Zustand Store
├─ assets/                      # 이미지 및 아이콘
└─ styles/                      # 공통 스타일 및 테마
```

---

## 📦 설치 패키지 (Installed Packages)

```bash
npm install zustand @tanstack/react-query
npm install nativewind
npm install --save-dev tailwindcss
```

---

## 📄 Environment

```bash
Node.js >= 18
npm >= 9
Expo SDK Latest
```