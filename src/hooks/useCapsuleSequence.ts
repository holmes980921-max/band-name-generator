import { useEffect, useRef, useState } from 'react'
import { runCapsuleSequence, type CapsulePhase } from '../lib/capsulePhases'

interface UseCapsuleSequenceOptions {
  /** 시퀀스가 끝나고 phase가 idle로 돌아온 시점에 호출된다. */
  onDone?: () => void
  /** true면 최초 마운트에서는 애니메이션을 재생하지 않는다. */
  skipInitial?: boolean
}

/**
 * triggerKey가 바뀔 때마다 캡슐 뽑기 애니메이션 시퀀스를 한 번 재생한다.
 * - 슬롯 하나의 재추첨: triggerKey = word.id, skipInitial = true
 * - 최종 확정 연출: triggerKey = 고정 문자열(예: 'final'), skipInitial = false (마운트 즉시 재생)
 */
export function useCapsuleSequence(triggerKey: string, options: UseCapsuleSequenceOptions = {}): CapsulePhase {
  const { onDone, skipInitial = false } = options
  const [phase, setPhase] = useState<CapsulePhase>('idle')
  // 최초 렌더에서 한 번만 캡처된다. React StrictMode의 effect 이중 실행(mount ->
  // cleanup -> mount)에도 값이 유지되므로, "다음에 재실행될 때 스킵할지" 판단을
  // effect 안에서 매번 갱신되는 ref가 아니라 이 고정값과의 비교로 처리한다.
  const [initialKey] = useState(triggerKey)
  // 최초 렌더에서 한 번만 읽는다. OS 설정이 세션 도중 바뀌는 경우까지는 다루지 않는다.
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const onDoneRef = useRef(onDone)

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    if (skipInitial && triggerKey === initialKey) return
    return runCapsuleSequence(setPhase, () => onDoneRef.current?.(), reduced)
  }, [triggerKey, skipInitial, initialKey, reduced])

  return phase
}
