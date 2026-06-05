# @moonhr/sheets-client

[English](#english) | [한국어](#한국어)

---

## English

A lightweight Google Sheets client that eliminates the authentication and CRUD boilerplate when using Sheets as a form data store.  
Includes service account auth, row append/query/update, and phone number cell formatting.

### Installation

```bash
npm install @moonhr/sheets-client
```

### Prerequisites

1. Create a service account in [Google Cloud Console](https://console.cloud.google.com/) and download the JSON key.
2. Share the target spreadsheet with the service account email as an **Editor**.
3. Set the following environment variables.

```env
GOOGLE_SERVICE_ACCOUNT_KEY={"client_email":"...","private_key":"..."}
GOOGLE_SHEETS_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
GOOGLE_SHEETS_SHEET_NAME=Sheet1
```

### Basic Usage

```typescript
import { createSheetsClient } from '@moonhr/sheets-client'

const client = createSheetsClient({
  serviceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
  sheetName: process.env.GOOGLE_SHEETS_SHEET_NAME,
})
```

### API

#### `appendRow(values, range?)`

Appends data to the last row of the sheet.

```typescript
await client.appendRow(['2024-01-01', 'John Doe', 'Acme Corp', '01012345678'])
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `values` | `string[]` | — | Array of cell values |
| `range` | `string` | `'A:Z'` | Target range |

---

#### `getRows(range?)`

Returns all rows in the specified range. Each cell is a trimmed string.

```typescript
const rows = await client.getRows('A:E')
// [['Header1', 'Header2', ...], ['Value1', 'Value2', ...], ...]
```

---

#### `findRow(matcher, options?)`

Returns the first row matching the condition, or `null` if not found.

**Match by column index (0-based)**

```typescript
const result = await client.findRow({ 1: 'John Doe', 2: 'Acme Corp' })
```

Performs a trim + lowercase comparison on both sides.

**Match with a custom function**

Use this when you need numeric comparison, e.g. for phone numbers.

```typescript
import { digitsOnly } from '@moonhr/sheets-client'

const result = await client.findRow((row) => {
  return row[1].trim().toLowerCase() === 'john doe' &&
         digitsOnly(row[3]) === digitsOnly('010-1234-5678')
})
```

**Return value**

```typescript
{
  rowIndex: number   // 1-based sheet row number — pass directly to updateRow
  values: string[]   // Array of cell values in that row
}
```

**options**

| Option | Type | Default | Description |
|---|---|---|---|
| `range` | `string` | `'A:Z'` | Search range |
| `skipHeader` | `boolean` | `true` | Whether to skip the first (header) row |

---

#### `updateRow(rowIndex, values, startCol?)`

Updates cells in a specific row.

```typescript
// Use the rowIndex returned by findRow directly
await client.updateRow(result.rowIndex, ['John Doe', 'New Corp', '01099998888'], 'B')
// → Updates range B{rowIndex}:D{rowIndex}
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `rowIndex` | `number` | — | Sheet row number (2 or greater) |
| `values` | `string[]` | — | Array of replacement cell values |
| `startCol` | `string` | `'A'` | Starting column letter |

---

### Utilities

```typescript
import { toTextCell, digitsOnly, stripQuotes } from '@moonhr/sheets-client'
```

| Function | Description | Example |
|---|---|---|
| `toTextCell(value)` | Forces a phone number to be saved as text in Sheets (prevents auto-conversion to number) | `'01012345678'` → `"'01012345678"` |
| `digitsOnly(value)` | Extracts digits only (for phone number comparison) | `'010-1234-5678'` → `'01012345678'` |
| `stripQuotes(value)` | Removes wrapping quotes from environment variable values | `'"Sheet1"'` → `'Sheet1'` |

### Real-world Example — RSVP Form

```typescript
import { createSheetsClient, toTextCell, digitsOnly } from '@moonhr/sheets-client'

const client = createSheetsClient({
  serviceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
  sheetName: process.env.GOOGLE_SHEETS_SHEET_NAME,
})

// Submit registration
await client.appendRow([
  new Date().toISOString(),
  'John Doe',
  'Acme Corp',
  toTextCell('01012345678'),
  'john@example.com',
  'Agreed',
])

// Look up registration
const found = await client.findRow((row) =>
  row[1].trim() === 'John Doe' &&
  digitsOnly(row[3]) === '01012345678'
)

// Update registration
if (found) {
  await client.updateRow(
    found.rowIndex,
    ['John Doe', 'New Corp', toTextCell('01099998888'), 'new@example.com'],
    'B'
  )
}
```

### Build

```bash
npm run build   # generate dist/
npm run dev     # watch mode
```

### License

MIT

---

## 한국어

Google Sheets를 폼 데이터 저장소로 사용할 때 필요한 인증·CRUD 보일러플레이트를 제거해주는 경량 클라이언트입니다.  
서비스 계정 인증, 행 추가/조회/수정, 전화번호 셀 포맷 처리를 포함합니다.

### 설치

```bash
npm install @moonhr/sheets-client
```

### 사전 준비

1. [Google Cloud Console](https://console.cloud.google.com/)에서 서비스 계정을 생성하고 JSON 키를 발급합니다.
2. 해당 서비스 계정 이메일을 대상 스프레드시트에 **편집자** 권한으로 공유합니다.
3. 환경변수를 설정합니다.

```env
GOOGLE_SERVICE_ACCOUNT_KEY={"client_email":"...","private_key":"..."}
GOOGLE_SHEETS_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
GOOGLE_SHEETS_SHEET_NAME=Sheet1
```

### 기본 사용법

```typescript
import { createSheetsClient } from '@moonhr/sheets-client'

const client = createSheetsClient({
  serviceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
  sheetName: process.env.GOOGLE_SHEETS_SHEET_NAME,
})
```

### API

#### `appendRow(values, range?)`

시트 마지막 행에 데이터를 추가합니다.

```typescript
await client.appendRow(['2024-01-01', '홍길동', '회사명', '01012345678'])
```

| 파라미터 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `values` | `string[]` | — | 셀 값 배열 |
| `range` | `string` | `'A:Z'` | 추가 범위 |

---

#### `getRows(range?)`

지정 범위의 모든 행을 반환합니다. 각 셀은 trim된 문자열입니다.

```typescript
const rows = await client.getRows('A:E')
// [['헤더1', '헤더2', ...], ['값1', '값2', ...], ...]
```

---

#### `findRow(matcher, options?)`

조건에 맞는 첫 번째 행을 반환합니다. 없으면 `null`.

**컬럼 인덱스로 매칭 (0-based)**

```typescript
const result = await client.findRow({ 1: '홍길동', 2: '회사명' })
```

양쪽 trim + 소문자 비교를 수행합니다.

**커스텀 함수로 매칭**

전화번호처럼 숫자 비교가 필요한 경우에 사용합니다.

```typescript
import { digitsOnly } from '@moonhr/sheets-client'

const result = await client.findRow((row) => {
  return row[1].trim().toLowerCase() === '홍길동' &&
         digitsOnly(row[3]) === digitsOnly('010-1234-5678')
})
```

**반환값**

```typescript
{
  rowIndex: number   // 시트 행 번호 (1-based) — updateRow에 그대로 사용
  values: string[]   // 해당 행의 셀 값 배열
}
```

**options**

| 옵션 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `range` | `string` | `'A:Z'` | 검색 범위 |
| `skipHeader` | `boolean` | `true` | 첫 번째 행(헤더) 건너뜀 여부 |

---

#### `updateRow(rowIndex, values, startCol?)`

특정 행의 셀을 업데이트합니다.

```typescript
// findRow가 반환한 rowIndex를 그대로 사용
await client.updateRow(result.rowIndex, ['홍길동', '새회사', '01099998888'], 'B')
// → B{rowIndex}:D{rowIndex} 범위를 업데이트
```

| 파라미터 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `rowIndex` | `number` | — | 시트 행 번호 (2 이상) |
| `values` | `string[]` | — | 교체할 셀 값 배열 |
| `startCol` | `string` | `'A'` | 시작 열 문자 |

---

### 유틸리티

```typescript
import { toTextCell, digitsOnly, stripQuotes } from '@moonhr/sheets-client'
```

| 함수 | 설명 | 예시 |
|---|---|---|
| `toTextCell(value)` | 전화번호를 시트에 텍스트로 강제 저장 (숫자 자동변환 방지) | `'01012345678'` → `"'01012345678"` |
| `digitsOnly(value)` | 숫자만 추출 (전화번호 비교용) | `'010-1234-5678'` → `'01012345678'` |
| `stripQuotes(value)` | 환경변수 래핑 따옴표 제거 | `'"Sheet1"'` → `'Sheet1'` |

### 실사용 예시 — RSVP 폼

```typescript
import { createSheetsClient, toTextCell, digitsOnly } from '@moonhr/sheets-client'

const client = createSheetsClient({
  serviceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
  sheetName: process.env.GOOGLE_SHEETS_SHEET_NAME,
})

// 신청 접수
await client.appendRow([
  new Date().toISOString(),
  '홍길동',
  '(주)회사',
  toTextCell('01012345678'),
  'hong@example.com',
  '동의',
])

// 신청 조회
const found = await client.findRow((row) =>
  row[1].trim() === '홍길동' &&
  digitsOnly(row[3]) === '01012345678'
)

// 신청 수정
if (found) {
  await client.updateRow(
    found.rowIndex,
    ['홍길동', '새회사', toTextCell('01099998888'), 'new@example.com'],
    'B'
  )
}
```

### 빌드

```bash
npm run build   # dist/ 생성
npm run dev     # watch 모드
```

### 라이선스

MIT
