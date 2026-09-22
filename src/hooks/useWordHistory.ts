import { useCallback, useState } from 'react'
import type { Word } from '../lib/wordProvider'

export interface WordHistory {
  word: Word
  /** 되돌릴 이전 단어가 남아 있는지 (스택에 1개만 있으면 더 되돌릴 게 없다) */
  canUndo: boolean
  /** 새로 뽑은 단어를 히스토리 맨 위에 쌓는다 */
  push: (word: Word) => void
  /** 바로 이전 단어로 되돌아간다. 여러 번 누르면 계속 더 과거로 돌아간다 */
  undo: () => void
  /** 히스토리를 완전히 새 단어 하나로 초기화한다 (전체 다시 뽑기용) */
  reset: (word: Word) => void
}

/**
 * 왼쪽/오른쪽 슬롯이 각자 독립적으로 "되돌리기"를 지원하기 위한 단어 스택.
 * 되돌리기는 항상 이전에 실제로 뽑혔던 단어로 돌아가므로, 그 단어의
 * id/카테고리를 그대로 쓰는 캡슐 색상·위치 로직(getCapsuleForSide 등)도
 * 자연스럽게 그때와 같은 캡슐을 다시 보여준다.
 */
export function useWordHistory(initial: Word): WordHistory {
  const [stack, setStack] = useState<Word[]>([initial])

  const push = useCallback((word: Word) => {
    setStack((prev) => [...prev, word])
  }, [])

  const undo = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev))
  }, [])

  const reset = useCallback((word: Word) => {
    setStack([word])
  }, [])

  return {
    word: stack[stack.length - 1],
    canUndo: stack.length > 1,
    push,
    undo,
    reset,
  }
}
