import wordsData from '../data/words.json'
import type { Word, WordExclusion, WordProvider } from './wordProvider'

const ALL_WORDS = wordsData as Word[]

function pickFrom(pool: Word[]): Word {
  return pool[Math.floor(Math.random() * pool.length)]
}

/**
 * 빌드에 포함된 정적 JSON(src/data/words.json)에서 단어를 뽑는 MVP용 구현체.
 * words.json 자체는 사람이 손으로 하나하나 채운 게 아니라, 국립국어원 계열
 * 사전 데이터를 빌드 타임 스크립트로 정제해 교체할 것을 염두에 두고 만든
 * 시드 데이터다. 데이터 소스를 바꿀 때도 이 클래스만 교체하면 된다.
 */
export class StaticWordProvider implements WordProvider {
  getRandomWord(exclude?: WordExclusion): Word {
    let pool = ALL_WORDS

    if (exclude?.id) {
      const withoutSameWord = pool.filter((word) => word.id !== exclude.id)
      if (withoutSameWord.length > 0) pool = withoutSameWord
    }

    if (exclude?.category) {
      const otherCategory = pool.filter((word) => word.category !== exclude.category)
      if (otherCategory.length > 0) pool = otherCategory
    }

    return pickFrom(pool)
  }
}

export const wordProvider: WordProvider = new StaticWordProvider()
