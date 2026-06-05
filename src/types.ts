export interface ServiceAccountKey {
  client_email: string
  private_key: string
}

export interface SheetsClientConfig {
  /** 서비스 계정 JSON (문자열 또는 객체) */
  serviceAccountKey: string | ServiceAccountKey
  spreadsheetId: string
  sheetName: string
}

export interface FindResult {
  /** 시트의 실제 행 번호 (1-based, 헤더 포함) — updateRow에 그대로 사용 가능 */
  rowIndex: number
  values: string[]
}

export type RowMatcher =
  | Record<number, string>
  | ((row: string[], rowIndex: number) => boolean)
