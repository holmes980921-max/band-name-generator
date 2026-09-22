export type WordCategory =
  | 'object'
  | 'nature'
  | 'food'
  | 'animal'
  | 'body'
  | 'emotion'
  | 'action'
  | 'place'
  | 'abstract'
  | 'people'

export interface Word {
  id: string
  text: string
  category: WordCategory
}

export interface WordExclusion {
  /** 직전에 뽑혔던 단어 id. 같은 단어가 연속으로 나오지 않도록 제외한다. */
  id?: string
  /** 반대편 슬롯의 카테고리. 가능하면 같은 카테고리를 피해 서로 관련 없는 조합을 유도한다. */
  category?: WordCategory
}

/**
 * 단어 공급원을 추상화한 인터페이스.
 * 지금은 정적 JSON(StaticWordProvider) 구현체를 쓰지만,
 * 나중에 외부 사전 API나 서버리스 엔드포인트로 교체하더라도
 * 이 인터페이스만 만족하면 UI 코드는 변경할 필요가 없다.
 */
export interface WordProvider {
  getRandomWord(exclude?: WordExclusion): Word
}
