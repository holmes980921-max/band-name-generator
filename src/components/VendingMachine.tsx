import confetti from 'canvas-confetti'
import { useCallback, useState } from 'react'
import { useCapsuleSequence } from '../hooks/useCapsuleSequence'
import { getCapsuleForSide, getLaunchCapsule } from '../lib/capsuleDome'
import { wordProvider } from '../lib/staticWordProvider'
import type { Word } from '../lib/wordProvider'
import { Capsule } from './Capsule'
import { CapsuleDome } from './CapsuleDome'
import { ResultOverlay } from './ResultOverlay'
import { WordOutput } from './WordOutput'

function drawInitialPair(): [Word, Word] {
  const left = wordProvider.getRandomWord()
  const right = wordProvider.getRandomWord({ id: left.id, category: left.category })
  return [left, right]
}

/** 돔 존이 machine-glass 전체 높이의 몇 %를 차지하는지 (아래 JSX의 h-[54%]와 반드시 맞춰야 한다). */
const DOME_HEIGHT_RATIO = 0.54
/** 배출 트레이(쪽지가 펼쳐지는 자리)의 세로 중심 — machine-glass 전체 기준 % */
const TRAY_CENTER_Y = 79
const LEFT_TRAY_X = 25
const RIGHT_TRAY_X = 75

function fireConfetti() {
  const colors = ['#FFB020', '#2DD4BF', '#FFFFFF']
  const common = { colors, ticks: 220, gravity: 0.9, scalar: 0.9 }

  confetti({ ...common, particleCount: 90, spread: 70, origin: { x: 0.5, y: 0.35 } })
  window.setTimeout(() => {
    confetti({ ...common, particleCount: 50, spread: 100, origin: { x: 0.2, y: 0.4 } })
    confetti({ ...common, particleCount: 50, spread: 100, origin: { x: 0.8, y: 0.4 } })
  }, 180)
}

export function VendingMachine() {
  const [[leftWord, rightWord], setPair] = useState<[Word, Word]>(() => drawInitialPair())
  const [confirmed, setConfirmed] = useState(false)

  const leftPhase = useCapsuleSequence(leftWord.id, { skipInitial: true })
  const rightPhase = useCapsuleSequence(rightWord.id, { skipInitial: true })

  const leftSpinning = leftPhase !== 'idle'
  const rightSpinning = rightPhase !== 'idle'

  const leftCapsule = getCapsuleForSide(leftWord.id, leftWord.text, 'left')
  const rightCapsule = getCapsuleForSide(rightWord.id, rightWord.text, 'right')

  // 뽑힌 캡슐이 "돔 안에 있던 바로 그 캡슐"처럼 보이도록, 이동 애니메이션의
  // 출발점을 돔 좌표(자리)에서 그대로 가져온다. 색상 선택 로직(getCapsuleForSide)은
  // 그대로 두고, 위치만 추가로 조회한다.
  const leftLaunchCapsule = getLaunchCapsule(leftWord.id, 'left')
  const rightLaunchCapsule = getLaunchCapsule(rightWord.id, 'right')
  const leftOrigin = { x: leftLaunchCapsule.xPct, y: leftLaunchCapsule.yPct * DOME_HEIGHT_RATIO }
  const rightOrigin = { x: rightLaunchCapsule.xPct, y: rightLaunchCapsule.yPct * DOME_HEIGHT_RATIO }
  const leftTarget = { x: LEFT_TRAY_X, y: TRAY_CENTER_Y }
  const rightTarget = { x: RIGHT_TRAY_X, y: TRAY_CENTER_Y }

  const rerollLeft = useCallback(() => {
    setPair(([left, right]) => [wordProvider.getRandomWord({ id: left.id, category: right.category }), right])
  }, [])

  const rerollRight = useCallback(() => {
    setPair(([left, right]) => [left, wordProvider.getRandomWord({ id: right.id, category: left.category })])
  }, [])

  const handleConfirm = useCallback(() => {
    setConfirmed(true)
  }, [])

  const handleRedraw = useCallback(() => {
    setPair(drawInitialPair())
    setConfirmed(false)
  }, [])

  const bandName = `${leftWord.text} × ${rightWord.text}`

  return (
    <div className="flex min-h-svh items-center justify-center bg-[#0b0c10] px-4 py-10">
      <div className="machine-shell w-full max-w-sm rounded-[2rem] p-4 sm:max-w-md sm:p-6">
        {/* marquee header */}
        <div className="flex items-center justify-center gap-2 rounded-xl bg-black/30 py-3">
          <span className="indicator-dot h-2 w-2 rounded-full bg-amber-400" />
          <h1 className="font-display text-center text-lg tracking-wide text-amber-300 sm:text-xl">
            BAND NAME MACHINE
          </h1>
          <span className="indicator-dot h-2 w-2 rounded-full bg-amber-400" style={{ animationDelay: '1.1s' }} />
        </div>

        {/* 자판기 본체: 위쪽은 좌우가 공유하는 캡슐 돔, 아래쪽은 두 개의 배출 트레이 */}
        <div className="machine-glass relative mt-5 h-64 w-full overflow-hidden rounded-2xl sm:h-72">
          <div className="absolute inset-x-0 top-0 h-[54%]">
            <CapsuleDome leftPhase={leftPhase} leftSeed={leftWord.id} rightPhase={rightPhase} rightSeed={rightWord.id} />
            <div className="dome-chamber" />
            <div className="dome-sheen absolute inset-0" />
            <div className="dome-chute dome-chute--left" />
            <div className="dome-chute dome-chute--right" />
          </div>

          {/* 돔과 트레이를 물리적으로 이어주는 이음매(리벳 장식 포함) */}
          <div className="dome-seam absolute inset-x-0" style={{ top: 'calc(54% - 3px)' }} />

          <div className="dome-fade absolute inset-x-0 top-[38%] h-[18%]" />

          {/* 이동하는 캡슐 2개 — machine-glass 전체 좌표계를 써서, 돔 안 그 캡슐의
              자리(origin)에서 트레이 자리(target)까지 실제로 옮겨가는 것처럼 보인다. */}
          <Capsule phase={leftPhase} color={leftCapsule.color} origin={leftOrigin} target={leftTarget} size="sm" />
          <Capsule phase={rightPhase} color={rightCapsule.color} origin={rightOrigin} target={rightTarget} size="sm" />

          <div className="absolute inset-x-0 bottom-0 flex h-[42%] items-stretch px-3 pb-3 sm:px-4">
            <WordOutput capsule={leftCapsule} phase={leftPhase} />
            <div className="flex w-8 flex-shrink-0 items-center justify-center text-sm font-bold text-zinc-600 sm:w-9">×</div>
            <WordOutput capsule={rightCapsule} phase={rightPhase} />
          </div>
        </div>

        {/* 뽑기 버튼: 디스플레이와 분리된, 실제 자판기 버튼 위치 */}
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={rerollLeft}
            disabled={leftSpinning}
            className="vending-button flex flex-1 items-center justify-center gap-1.5 text-xs sm:text-sm"
            aria-label="왼쪽 단어 다시 뽑기"
          >
            <RerollIcon />
            왼쪽 뽑기
          </button>
          <button
            type="button"
            onClick={rerollRight}
            disabled={rightSpinning}
            className="vending-button flex flex-1 items-center justify-center gap-1.5 text-xs sm:text-sm"
            aria-label="오른쪽 단어 다시 뽑기"
          >
            <RerollIcon />
            오른쪽 뽑기
          </button>
        </div>

        {/* vent decoration */}
        <div className="machine-vents mx-2 mt-4 h-2 rounded-full opacity-60" />

        {/* select / purchase button */}
        <div className="mt-5 flex flex-col items-center gap-3">
          <p className="font-ui text-center text-xs text-zinc-400 sm:text-sm">
            마음에 드는 단어는 그대로 두고, 다른 쪽만 다시 뽑아보세요
          </p>
          <button type="button" onClick={handleConfirm} className="select-button w-full rounded-2xl py-4 text-base sm:text-lg">
            이 밴드 이름 사용하기
          </button>
          <p className="font-ui text-[11px] text-zinc-500">버튼을 누르면 이름이 즉시 발급됩니다</p>
        </div>
      </div>

      {confirmed && (
        <ResultOverlay
          bandName={bandName}
          color={leftCapsule.color}
          onClose={() => setConfirmed(false)}
          onRedraw={handleRedraw}
          onRevealed={fireConfetti}
        />
      )}
    </div>
  )
}

function RerollIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  )
}
