/**
 * 전화번호처럼 숫자만 남겨야 하는 값을 시트에 텍스트로 강제 저장.
 * (앞에 ' 붙이면 구글 시트가 숫자 변환을 건너뜀)
 */
export function toTextCell(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  return `'${digits}`
}

/** 숫자만 추출 (전화번호 비교용) */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

/** 환경변수 래핑 따옴표 제거 */
export function stripQuotes(value: string): string {
  const t = value.trim()
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")))
    return t.slice(1, -1)
  return t
}
