import { useState } from 'react'
import type { CapsuleColor } from '../lib/capsuleDome'
import { useCapsuleSequence } from '../hooks/useCapsuleSequence'
import { Capsule } from './Capsule'
import { Note } from './Note'

interface ResultOverlayProps {
  bandName: string
  color: CapsuleColor
  onClose: () => void
  onRedraw: () => void
  /** 최종 쪽지가 완전히 펼쳐져 이름이 드러나는 순간 호출된다 (컨페티 트리거용). */
  onRevealed: () => void
}

export function ResultOverlay({ bandName, color, onClose, onRedraw, onRevealed }: ResultOverlayProps) {
  const [revealed, setRevealed] = useState(false)
  const phase = useCapsuleSequence('final-reveal', {
    onDone: () => {
      setRevealed(true)
      onRevealed()
    },
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="밴드 이름 발급 완료"
    >
      <div className="rise-in relative w-full max-w-sm rounded-2xl border-2 border-amber-400/60 bg-zinc-900 px-6 py-10 text-center shadow-[0_0_70px_-10px_rgba(255,176,32,0.45)] sm:max-w-md sm:px-10 sm:py-12">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-500 transition-colors hover:text-zinc-200"
          aria-label="닫기"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <span className="font-ui text-xs font-bold tracking-[0.25em] text-amber-400">
          BAND NAME MACHINE · {revealed ? '발급 완료' : '발급 중'}
        </span>

        <div className="relative mt-6 flex h-36 items-center justify-center sm:h-40">
          <Capsule phase={phase} color={color} origin={{ x: 50, y: -12 }} target={{ x: 50, y: 50 }} size="lg" />
          <Note phase={phase} text={bandName} size="lg" />
        </div>

        {revealed && (
          <>
            <p className="font-ui mt-2 text-sm text-zinc-400">
              이 조합이 마음에 드시나요? 다시 뽑아서 새 이름을 받을 수도 있어요.
            </p>
            <button type="button" onClick={onRedraw} className="select-button font-display mt-8 w-full rounded-xl py-3 text-base">
              새 이름 뽑으러 가기
            </button>
          </>
        )}
      </div>
    </div>
  )
}
