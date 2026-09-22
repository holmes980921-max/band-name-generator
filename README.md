# BAND NAME MACHINE

서로 관련 없는 두 단어를 캡슐 뽑기 자판기 컨셉으로 뽑아서 밴드 이름을 만드는 웹 서비스입니다.

## 핵심 컨셉

- 화면 전체가 하나의 캡슐 뽑기 자판기입니다. 상단 돔 안에는 다양한 색상(흰색 + 포인트 컬러 반반)의 캡슐이 중력에 의해 실제로 쌓인 것처럼 배치되어 있습니다.
- 왼쪽/오른쪽 뽑기 버튼을 누르면 그 쪽 캡슐 더미에서 하나가 실제로 선택되어, 배출구를 지나 굴러 나오고, 튕기고, 열리고, 안에서 쪽지가 펼쳐지며 새 단어가 나타납니다.
- 왼쪽과 오른쪽은 완전히 독립적으로 동작합니다 — 한쪽만 다시 뽑아도 반대쪽 단어는 그대로 유지됩니다.
- "이 밴드 이름 사용하기"를 누르면 특별한 큰 캡슐이 열리며 최종 이름이 공개되고, confetti가 터집니다.

## 기술 스택

- React + TypeScript + Vite
- Tailwind CSS v4
- canvas-confetti

## 데이터 구조

- `src/lib/wordProvider.ts` / `src/lib/staticWordProvider.ts`: 단어 공급 계층. 현재는 정적 JSON(`src/data/words.json`) 기반이지만, 인터페이스를 분리해 두어 나중에 외부 사전 API나 서버리스 엔드포인트로 쉽게 교체할 수 있습니다.
- `src/lib/capsuleDome.ts` / `src/lib/capsulePacking.ts`: 자판기 돔 안의 캡슐 배치. 좌표를 손으로 배치하지 않고, 중력 + 충돌 시뮬레이션을 한 번 돌려서 캡슐들이 실제로 서로/바닥에 맞닿아 쌓인 결과를 정적 데이터로 사용합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## 빌드 / 검사

```bash
npm run build   # 타입 체크 + 프로덕션 빌드
npm run lint    # oxlint
```
