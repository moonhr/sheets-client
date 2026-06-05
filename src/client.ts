import { google } from 'googleapis'
import { stripQuotes } from './utils'
import type { FindResult, RowMatcher, ServiceAccountKey, SheetsClientConfig } from './types'

const SCOPE = 'https://www.googleapis.com/auth/spreadsheets'

function parseKey(key: string | ServiceAccountKey): ServiceAccountKey {
  if (typeof key !== 'string') return key
  try {
    const parsed = JSON.parse(key) as Partial<ServiceAccountKey>
    if (!parsed.client_email || !parsed.private_key) throw new Error()
    return parsed as ServiceAccountKey
  } catch {
    throw new Error('serviceAccountKey JSON 형식이 유효하지 않습니다.')
  }
}

function colLetter(index: number): string {
  let col = ''
  let n = index + 1
  while (n > 0) {
    col = String.fromCharCode(((n - 1) % 26) + 65) + col
    n = Math.floor((n - 1) / 26)
  }
  return col
}

export class SheetsClient {
  private readonly spreadsheetId: string
  private readonly sheetName: string
  private readonly serviceAccountKey: string | ServiceAccountKey

  constructor(config: SheetsClientConfig) {
    this.spreadsheetId = config.spreadsheetId
    this.sheetName = stripQuotes(config.sheetName)
    this.serviceAccountKey = config.serviceAccountKey
  }

  private async sheets() {
    const sa = parseKey(this.serviceAccountKey)
    const auth = new google.auth.JWT({
      email: sa.client_email,
      key: sa.private_key,
      scopes: [SCOPE],
    })
    return google.sheets({ version: 'v4', auth })
  }

  private range(r: string) {
    return `${this.sheetName}!${r}`
  }

  /** 시트 끝에 행 추가 */
  async appendRow(values: string[], range = 'A:Z'): Promise<void> {
    const api = await this.sheets()
    await api.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: this.range(range),
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [values] },
    })
  }

  /** 지정 범위의 모든 행 반환 (각 셀은 trim된 문자열) */
  async getRows(range = 'A:Z'): Promise<string[][]> {
    const api = await this.sheets()
    const res = await api.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: this.range(range),
    })
    return (res.data.values ?? []).map(row =>
      row.map(cell => String(cell ?? '').trim())
    )
  }

  /**
   * 조건에 맞는 첫 번째 행을 반환.
   *
   * matcher가 Record이면 { [컬럼인덱스]: 기대값 } — 양쪽 trim+소문자 비교
   * matcher가 함수이면 (row, rowIndex) => boolean — 커스텀 비교 가능
   *
   * @param skipHeader true이면 첫 번째 행(헤더)을 건너뜀 (기본값: true)
   */
  async findRow(
    matcher: RowMatcher,
    options: { range?: string; skipHeader?: boolean } = {}
  ): Promise<FindResult | null> {
    const { range = 'A:Z', skipHeader = true } = options
    const rows = await this.getRows(range)
    const start = skipHeader ? 1 : 0

    const matchFn: (row: string[], i: number) => boolean =
      typeof matcher === 'function'
        ? matcher
        : (row) =>
            Object.entries(matcher).every(([col, expected]) => {
              const cell = String(row[Number(col)] ?? '').trim().toLowerCase()
              return cell === expected.trim().toLowerCase()
            })

    for (let i = start; i < rows.length; i++) {
      const row = rows[i]
      if (!row) continue
      // rowIndex: 헤더가 row 0(= 시트 1행)이므로 i+1이 시트 행 번호
      if (matchFn(row, i + 1)) {
        return { rowIndex: i + 1, values: row }
      }
    }
    return null
  }

  /**
   * 특정 행 업데이트.
   *
   * @param rowIndex 시트 행 번호 (1-based, findRow가 반환한 값 그대로 사용)
   * @param values   교체할 셀 값 배열
   * @param startCol 시작 열 문자 (기본값: 'A')
   */
  async updateRow(
    rowIndex: number,
    values: string[],
    startCol = 'A'
  ): Promise<void> {
    if (!Number.isInteger(rowIndex) || rowIndex < 2) {
      throw new Error('rowIndex는 2 이상의 정수여야 합니다.')
    }
    const api = await this.sheets()
    const startColIndex = startCol.toUpperCase().charCodeAt(0) - 65
    const endCol = colLetter(startColIndex + values.length - 1)
    await api.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: this.range(`${startCol}${rowIndex}:${endCol}${rowIndex}`),
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [values] },
    })
  }
}

export function createSheetsClient(config: SheetsClientConfig): SheetsClient {
  return new SheetsClient(config)
}
