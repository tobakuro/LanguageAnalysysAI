/**
 * sound分類器のラベル（{段}_{行} 形式、例: "a_ka"）をひらがなに変換するテーブル。
 * ラベル体系は training/data/sound/ のファイル名規則と対応している。
 * 濁点・半濁点はサイコロ分類器の結果と組み合わせて別途変換する（applyDiacritic参照）。
 */
const KANA_TABLE: Record<string, string> = {
  a_a: 'あ',
  i_a: 'い',
  u_a: 'う',
  e_a: 'え',
  o_a: 'お',
  a_ka: 'か',
  i_ka: 'き',
  u_ka: 'く',
  e_ka: 'け',
  o_ka: 'こ',
  a_sa: 'さ',
  i_sa: 'し',
  u_sa: 'す',
  e_sa: 'せ',
  o_sa: 'そ',
  a_ta: 'た',
  i_ta: 'ち',
  u_ta: 'つ',
  e_ta: 'て',
  o_ta: 'と',
  a_na: 'な',
  i_na: 'に',
  u_na: 'ぬ',
  e_na: 'ね',
  o_na: 'の',
  a_ha: 'は',
  i_ha: 'ひ',
  u_ha: 'ふ',
  e_ha: 'へ',
  o_ha: 'ほ',
  a_ma: 'ま',
  i_ma: 'み',
  u_ma: 'む',
  e_ma: 'め',
  o_ma: 'も',
  a_ya: 'や',
  u_ya: 'ゆ',
  o_ya: 'よ',
  a_ra: 'ら',
  i_ra: 'り',
  u_ra: 'る',
  e_ra: 'れ',
  o_ra: 'ろ',
  a_wa: 'わ',
  o_wa: 'を',
  n: 'ん',
}

/** 濁点化できる清音 → 濁音の対応表（か・さ・た・は行のみ）。 */
const DAKUTEN_TABLE: Record<string, string> = {
  か: 'が',
  き: 'ぎ',
  く: 'ぐ',
  け: 'げ',
  こ: 'ご',
  さ: 'ざ',
  し: 'じ',
  す: 'ず',
  せ: 'ぜ',
  そ: 'ぞ',
  た: 'だ',
  ち: 'ぢ',
  つ: 'づ',
  て: 'で',
  と: 'ど',
  は: 'ば',
  ひ: 'び',
  ふ: 'ぶ',
  へ: 'べ',
  ほ: 'ぼ',
}

/** 半濁点化できる清音 → 半濁音の対応表（は行のみ）。 */
const HANDAKUTEN_TABLE: Record<string, string> = {
  は: 'ぱ',
  ひ: 'ぴ',
  ふ: 'ぷ',
  へ: 'ぺ',
  ほ: 'ぽ',
}

export function labelToKana(label: string): string {
  const kana = KANA_TABLE[label]
  if (kana === undefined) {
    throw new Error(`未知の音ラベルです: ${label}`)
  }
  return kana
}

export type DiceKind = 'none' | 'dakuten' | 'handakuten'

/** 清音に濁点/半濁点を適用する。対応表にない組み合わせ（例: "あ"+濁点）はそのまま返す。 */
export function applyDiacritic(kana: string, dice: DiceKind): string {
  if (dice === 'dakuten') {
    return DAKUTEN_TABLE[kana] ?? kana
  }
  if (dice === 'handakuten') {
    return HANDAKUTEN_TABLE[kana] ?? kana
  }
  return kana
}
