# LiveSheet - 產品規格文件

## 1. 專案概述

### 1.1 願景
打造一個**輕量級的即時共同編輯表格系統**，讓團隊成員可以像使用 Google Sheets 一樣同時編輯同一份試算表，並即時看到彼此的修改。

### 1.2 問題陳述
現有問題：
- 公司需要內部自架的共同編輯方案，不依賴外部 SaaS 服務
- 需要簡單、可控的技術架構，便於維護和擴展
- 現有工具（如 Excel）無法支援即時多人協作

### 1.3 目標
1. ✅ **即時同步**：使用者 A 的編輯立即反映在使用者 B 的畫面
2. ✅ **簡單易用**：類似傳統試算表的操作體驗
3. ✅ **穩定可靠**：資料正確儲存，避免資料遺失
4. ✅ **自主可控**：自架 Server，資料留在公司內部

### 1.4 非目標（Not in Scope）
- ❌ 不支援複雜的試算表公式（如 VLOOKUP、SUMIF）
- ❌ 不支援圖表、樞紐分析等進階功能
- ❌ 不支援大型表格（暫定 < 10000 cells）
- ❌ 不支援離線編輯
- ❌ 不提供行動 App（僅網頁版）

### 1.5 成功指標
**質化指標**：
- 使用者覺得「即時」（感受不到明顯延遲）
- 多人編輯時不會覺得混亂
- 資料不會莫名消失

**量化指標**：
- 編輯到同步延遲 < 500ms（目標 < 200ms）
- 支援 5-10 人同時編輯同一個 Sheet
- 資料儲存成功率 > 99.9%

---

## 2. 使用者故事

### 2.1 核心使用場景：多人即時編輯

**身為 團隊成員**，我希望能夠：
- 開啟一個共用的試算表
- 看到其他人正在編輯的內容即時更新
- 編輯任何儲存格，並自動儲存
- 知道是誰在什麼時候修改了哪些內容

**驗收標準**：
- ✅ 打開 Sheet 後，可以看到最新的資料
- ✅ 當別人編輯 Cell(3,5) 時，我的畫面上 Cell(3,5) 會即時更新
- ✅ 我編輯 Cell(1,2) 後，其他人的畫面也會即時更新
- ✅ 每個儲存格顯示最後修改者和時間

### 2.2 情境：不同人編輯不同儲存格

**情境描述**：
- Alice 編輯 Cell(0,0)，輸入 "Product"
- Bob 同時編輯 Cell(1,0)，輸入 "Apple"
- Carol 同時編輯 Cell(2,0)，輸入 "Banana"

**預期行為**：
- 三個人都能即時看到彼此的編輯
- 所有修改都正確儲存到資料庫
- 無衝突發生

### 2.3 情境：同時編輯同一個儲存格

**情境描述**：
- Alice 在 10:00:00 編輯 Cell(1,1)，輸入 "100"
- Bob 在 10:00:01 編輯 Cell(1,1)，輸入 "200"

**預期行為**（Last Write Wins）：
- Cell(1,1) 最終值為 "200"（後寫入者勝出）
- UpdatedBy 顯示為 "Bob"
- UpdatedAt 顯示為 10:00:01

**未來改進**：
- 顯示衝突警告
- 提供「誰正在編輯」的視覺提示

### 2.4 情境：斷線重連

**情境描述**：
- Alice 正在編輯，網路暫時斷線
- 網路恢復後

**預期行為**：
- SignalR 自動重新連線
- 重新載入 Sheet 資料，確保同步
- 顯示連線狀態（已連線/斷線）

### 2.5 情境：建立與管理多個 Sheets

**身為 使用者**，我希望能夠：
- 建立新的 Sheet
- 瀏覽所有現有的 Sheets
- 開啟特定的 Sheet 進行編輯
- （未來）刪除或重新命名 Sheet

### 2.6 情境：查詢歷程記錄（Phase 3）

**情境描述**：
- Alice 發現 Cell(1,2) 的價格從 100 變成了 200
- 她想知道是誰在什麼時候修改的，以及修改前的值

**預期行為**：
1. 點擊 Cell(1,2)，選擇「檢視歷程」
2. 看到該儲存格的完整修改歷史：
   ```
   2025-11-06 10:05 - Bob 將值從 '100' 改為 '200'
   2025-11-06 09:30 - Alice 將值從 null 改為 '100'
   ```
3. 也可以查看整個 Sheet 的修改時間軸
4. 可以篩選特定使用者的修改記錄

**驗收標準**：
- ✅ 可查詢特定 Cell 的修改歷史
- ✅ 可查詢整個 Sheet 的修改歷史
- ✅ 可查詢特定使用者的所有編輯
- ✅ 歷程顯示包含：時間、使用者、修改前值、修改後值
- ✅ 支援時間範圍篩選

---

## 3. 功能需求

### 3.1 即時同步功能

#### 3.1.1 SignalR 連線管理
- **FR-101**：前端連線到 SignalR Hub
- **FR-102**：加入 Sheet 的 SignalR Group
- **FR-103**：離開 Sheet 時退出 Group
- **FR-104**：斷線自動重連

#### 3.1.2 儲存格編輯同步
- **FR-201**：使用者編輯儲存格後，透過 SignalR 發送 `UpdateCell` 事件
- **FR-202**：後端儲存到資料庫（Cells 表）
- **FR-203**：廣播 `CellUpdated` 事件給同一個 Group 的其他使用者
- **FR-204**：其他使用者接收事件後更新本地畫面

#### 3.1.3 衝突處理
- **FR-301**：使用 Last Write Wins 策略
- **FR-302**：記錄 UpdatedAt 時間戳記
- **FR-303**：記錄 UpdatedBy 使用者名稱

### 3.2 資料持久化

#### 3.2.1 Sheet 管理
- **FR-401**：建立新的 Sheet（RESTful API）
- **FR-402**：查詢所有 Sheets 列表
- **FR-403**：取得特定 Sheet 的所有 Cells 資料
- **FR-404**：（未來）刪除 Sheet

#### 3.2.2 Cell 資料存取
- **FR-501**：讀取單一 Cell 資料
- **FR-502**：更新 Cell 資料（含新增和修改）
- **FR-503**：批次讀取 Sheet 的所有 Cells
- **FR-504**：（未來）清空 Sheet 所有 Cells

### 3.3 使用者介面

#### 3.3.1 Sheet 列表頁
- **FR-601**：顯示所有 Sheets 清單
- **FR-602**：顯示 Sheet 名稱、建立時間
- **FR-603**：點擊 Sheet 進入編輯頁
- **FR-604**：「建立新 Sheet」按鈕

#### 3.3.2 Sheet 編輯頁
- **FR-701**：顯示表格（Grid）
- **FR-702**：可編輯的儲存格
- **FR-703**：顯示連線狀態（已連線/斷線）
- **FR-704**：顯示當前編輯者（自己的名字）
- **FR-705**：（未來）顯示其他人正在編輯的儲存格

#### 3.3.3 儲存格樣式
- **FR-801**：基本表格樣式（Grid Lines）
- **FR-802**：Focus 狀態（選中的儲存格）
- **FR-803**：（未來）不同使用者的游標顏色

### 3.4 使用者識別（簡易版）

#### 3.4.1 Phase 1（MVP）
- **FR-901**：進入系統時輸入名稱（暫存在 localStorage）
- **FR-902**：名稱用於 UpdatedBy 欄位
- **FR-903**：無密碼驗證

#### 3.4.2 Phase 2（未來）
- **FR-904**：整合 ASP.NET Core Identity
- **FR-905**：JWT Token 驗證
- **FR-906**：權限管理（Owner/Editor/Viewer）

### 3.5 歷程記錄（Audit Log）

#### 3.5.1 資料記錄
- **FR-1001**：每次儲存格更新時自動記錄到 CellHistory 表
- **FR-1002**：記錄修改前值（OldValue）和修改後值（NewValue）
- **FR-1003**：記錄修改者（UpdatedBy）和修改時間（UpdatedAt）
- **FR-1004**：支援查詢歷程記錄的分頁功能

#### 3.5.2 查詢功能
- **FR-1101**：查詢特定 Sheet 的所有修改歷程
- **FR-1102**：查詢特定 Cell 的修改歷程（時間倒序）
- **FR-1103**：查詢特定使用者的所有編輯記錄
- **FR-1104**：支援時間範圍篩選（startDate、endDate）
- **FR-1105**：支援使用者篩選（userId）

#### 3.5.3 UI 呈現（Phase 3）
- **FR-1201**：Sheet 編輯頁顯示「檢視歷程」按鈕
- **FR-1202**：歷程記錄彈窗，顯示修改時間軸
- **FR-1203**：點擊特定儲存格可查看該格的修改歷史
- **FR-1204**：顯示格式：「Bob 在 10:05 將 Cell(1,2) 從 '100' 改為 '200'」
- **FR-1205**：（未來）支援從歷程還原特定版本

#### 3.5.4 資料管理
- **FR-1301**：資料保留策略（如保留 90 天）
- **FR-1302**：定期清理舊歷程記錄（避免資料表過大）
- **FR-1303**：重要 Sheet 可設定永久保留歷程

---

## 4. 技術規格

### 4.1 系統架構圖

```
┌─────────────────────────────────────────────┐
│              Vue.js Frontend                │
│  ┌─────────────┐      ┌─────────────┐      │
│  │ Sheet List  │      │ Sheet Editor│      │
│  │  Component  │      │  Component  │      │
│  └──────┬──────┘      └──────┬──────┘      │
│         │                    │              │
│         └────────┬───────────┘              │
│                  │                          │
│         ┌────────▼────────┐                │
│         │ SignalR Service │                │
│         └────────┬────────┘                │
└──────────────────┼─────────────────────────┘
                   │ WebSocket/SSE
                   │
┌──────────────────▼─────────────────────────┐
│          ASP.NET Core Backend              │
│  ┌──────────────┐      ┌──────────────┐   │
│  │ Controllers  │      │  SheetHub    │   │
│  │  (REST API)  │      │  (SignalR)   │   │
│  └──────┬───────┘      └──────┬───────┘   │
│         │                     │            │
│         └─────────┬───────────┘            │
│                   │                        │
│         ┌─────────▼──────────┐            │
│         │   AppDbContext     │            │
│         │  (EF Core)         │            │
│         └─────────┬──────────┘            │
└───────────────────┼────────────────────────┘
                    │
         ┌──────────▼───────────┐
         │    SQL Server        │
         │  ┌────────────────┐  │
         │  │  Sheets Table  │  │
         │  └────────────────┘  │
         │  ┌────────────────┐  │
         │  │  Cells Table   │  │
         │  └────────────────┘  │
         │  ┌────────────────┐  │
         │  │ CellHistory    │  │
         │  │ (Phase 3)      │  │
         │  └────────────────┘  │
         └──────────────────────┘
```

### 4.2 資料模型

#### 4.2.1 Sheets 表
```sql
CREATE TABLE Sheets (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(200) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);
```

**欄位說明**：
- `Id`: Sheet 唯一識別碼
- `Name`: Sheet 名稱（例如：「Q1 銷售數據」）
- `CreatedAt`: 建立時間
- `UpdatedAt`: 最後修改時間

#### 4.2.2 Cells 表
```sql
CREATE TABLE Cells (
    SheetId UNIQUEIDENTIFIER NOT NULL,
    RowIndex INT NOT NULL,
    ColIndex INT NOT NULL,
    Value NVARCHAR(MAX),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100),
    PRIMARY KEY (SheetId, RowIndex, ColIndex),
    FOREIGN KEY (SheetId) REFERENCES Sheets(Id) ON DELETE CASCADE
);

CREATE INDEX IX_Cells_SheetId ON Cells(SheetId);
```

**欄位說明**：
- `SheetId`: 所屬 Sheet ID
- `RowIndex`: 列索引（0-based）
- `ColIndex`: 行索引（0-based）
- `Value`: 儲存格內容（純文字）
- `UpdatedAt`: 最後修改時間
- `UpdatedBy`: 最後修改者名稱

**設計考量**：
- 複合主鍵 (SheetId, RowIndex, ColIndex) 確保唯一性
- ON DELETE CASCADE：刪除 Sheet 時自動刪除相關 Cells
- 索引優化：SheetId 上的索引加速查詢

#### 4.2.3 CellHistory 表（歷程記錄）
```sql
CREATE TABLE CellHistory (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    SheetId UNIQUEIDENTIFIER NOT NULL,
    RowIndex INT NOT NULL,
    ColIndex INT NOT NULL,
    OldValue NVARCHAR(MAX),
    NewValue NVARCHAR(MAX),
    UpdatedBy NVARCHAR(100) NOT NULL,
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (SheetId) REFERENCES Sheets(Id) ON DELETE CASCADE
);

CREATE INDEX IX_CellHistory_SheetId ON CellHistory(SheetId);
CREATE INDEX IX_CellHistory_Cell ON CellHistory(SheetId, RowIndex, ColIndex);
CREATE INDEX IX_CellHistory_UpdatedBy ON CellHistory(UpdatedBy);
CREATE INDEX IX_CellHistory_UpdatedAt ON CellHistory(UpdatedAt DESC);
```

**欄位說明**：
- `Id`: 歷程記錄唯一識別碼（自動遞增）
- `SheetId`: 所屬 Sheet ID
- `RowIndex`: 列索引
- `ColIndex`: 行索引
- `OldValue`: 修改前的值
- `NewValue`: 修改後的值
- `UpdatedBy`: 修改者名稱
- `UpdatedAt`: 修改時間

**設計考量**：
- 每次儲存格更新都會新增一筆歷程記錄
- 支援查詢特定 Sheet 的所有修改歷史
- 支援查詢特定 Cell 的修改歷史
- 支援查詢特定使用者的所有編輯記錄
- 索引優化：支援多種查詢模式
- 資料保留策略：可設定定期清理舊資料（如保留 90 天）

**使用場景**：
- 追蹤誰在什麼時間修改了什麼
- 審計用途（Audit Trail）
- 資料還原參考
- 衝突分析

### 4.3 API 規格

#### 4.3.1 RESTful API

**GET /api/sheets**
- 用途：取得所有 Sheets 列表
- 回應：
```json
[
  {
    "id": "guid",
    "name": "Q1 Sales",
    "createdAt": "2025-11-06T10:00:00Z",
    "updatedAt": "2025-11-06T15:30:00Z"
  }
]
```

**POST /api/sheets**
- 用途：建立新 Sheet
- 請求：
```json
{
  "name": "New Sheet"
}
```
- 回應：
```json
{
  "id": "new-guid",
  "name": "New Sheet",
  "createdAt": "2025-11-06T16:00:00Z"
}
```

**GET /api/sheets/{id}/cells**
- 用途：取得特定 Sheet 的所有 Cells
- 回應：
```json
[
  {
    "rowIndex": 0,
    "colIndex": 0,
    "value": "Product",
    "updatedAt": "2025-11-06T10:00:00Z",
    "updatedBy": "Alice"
  },
  {
    "rowIndex": 0,
    "colIndex": 1,
    "value": "Price",
    "updatedAt": "2025-11-06T10:01:00Z",
    "updatedBy": "Bob"
  }
]
```

**GET /api/sheets/{id}/history**
- 用途：取得特定 Sheet 的所有修改歷程
- 查詢參數：
  - `limit`: 限制回傳筆數（預設 100）
  - `offset`: 分頁偏移量
  - `userId`: 篩選特定使用者的修改（可選）
  - `startDate`: 起始時間（可選）
  - `endDate`: 結束時間（可選）
- 回應：
```json
{
  "total": 250,
  "items": [
    {
      "id": 1,
      "rowIndex": 1,
      "colIndex": 2,
      "oldValue": "100",
      "newValue": "200",
      "updatedBy": "Bob",
      "updatedAt": "2025-11-06T10:05:30Z"
    },
    {
      "id": 2,
      "rowIndex": 0,
      "colIndex": 0,
      "oldValue": null,
      "newValue": "Product",
      "updatedBy": "Alice",
      "updatedAt": "2025-11-06T10:00:00Z"
    }
  ]
}
```

**GET /api/sheets/{sheetId}/cells/{row}/{col}/history**
- 用途：取得特定儲存格的修改歷程
- 查詢參數：
  - `limit`: 限制回傳筆數（預設 50）
- 回應：
```json
[
  {
    "id": 5,
    "oldValue": "150",
    "newValue": "200",
    "updatedBy": "Bob",
    "updatedAt": "2025-11-06T10:05:30Z"
  },
  {
    "id": 3,
    "oldValue": "100",
    "newValue": "150",
    "updatedBy": "Alice",
    "updatedAt": "2025-11-06T10:02:15Z"
  },
  {
    "id": 1,
    "oldValue": null,
    "newValue": "100",
    "updatedBy": "Alice",
    "updatedAt": "2025-11-06T10:00:00Z"
  }
]
```

**GET /api/history/user/{userId}**
- 用途：取得特定使用者的所有編輯歷程（跨 Sheets）
- 查詢參數：
  - `limit`: 限制回傳筆數（預設 100）
  - `sheetId`: 篩選特定 Sheet（可選）
- 回應：
```json
[
  {
    "id": 10,
    "sheetId": "guid-1",
    "sheetName": "Q1 Sales",
    "rowIndex": 2,
    "colIndex": 3,
    "oldValue": "50",
    "newValue": "60",
    "updatedAt": "2025-11-06T11:00:00Z"
  }
]
```

#### 4.3.2 SignalR Hub 方法

**Hub: `/sheethub`**

**Client → Server 方法**：

1. **JoinSheet**
   - 參數：`string sheetId`
   - 用途：加入 Sheet 的 SignalR Group
   - 回傳：無

2. **LeaveSheet**
   - 參數：`string sheetId`
   - 用途：離開 Sheet 的 SignalR Group
   - 回傳：無

3. **UpdateCell**
   - 參數：
     - `string sheetId`
     - `int row`
     - `int col`
     - `string value`
     - `string userName`
   - 用途：更新儲存格內容
   - 行為：
     1. 儲存到資料庫
     2. 廣播 `CellUpdated` 給其他人

**Server → Client 事件**：

1. **CellUpdated**
   - 參數：
     - `int row`
     - `int col`
     - `string value`
     - `string userName`
   - 用途：通知其他使用者有儲存格更新

### 4.4 前端資料結構

#### 4.4.1 Sheet Store (Pinia/Vuex)
```javascript
{
  currentSheet: {
    id: 'guid',
    name: 'Q1 Sales',
    cells: {
      '0-0': { value: 'Product', updatedBy: 'Alice', updatedAt: '...' },
      '0-1': { value: 'Price', updatedBy: 'Bob', updatedAt: '...' },
      '1-0': { value: 'Apple', updatedBy: 'Carol', updatedAt: '...' }
    }
  },
  connection: SignalRConnection,
  connectionState: 'Connected' | 'Disconnected' | 'Connecting',
  currentUser: 'Alice'
}
```

#### 4.4.2 Grid Component Props
```javascript
{
  sheetId: String,
  rows: Number,    // 預設 50
  cols: Number,    // 預設 26 (A-Z)
  cells: Object,   // { '0-0': { value, updatedBy, updatedAt } }
  editable: Boolean
}
```

### 4.5 即時同步流程

#### 4.5.1 使用者 A 編輯流程
```
[User A Browser]
  1. 使用者在 Cell(1,2) 輸入 "Hello"
  2. onCellEdit(1, 2, "Hello")
     ↓
  3. connection.invoke("UpdateCell", sheetId, 1, 2, "Hello", "Alice")
     ↓
[SignalR Hub]
  4. UpdateCell() 接收
  5. 儲存到 SQL Server (INSERT or UPDATE Cells)
  6. Clients.OthersInGroup(sheetId).SendAsync("CellUpdated", 1, 2, "Hello", "Alice")
     ↓
[User B, C Browser]
  7. connection.on("CellUpdated", (row, col, value, userName) => {
       updateCell(row, col, value, userName)
     })
  8. 畫面更新 Cell(1,2) = "Hello"
```

#### 4.5.2 衝突處理流程
```
Scenario: Alice 和 Bob 同時編輯 Cell(1,1)

T=0ms:  Alice 輸入 "100"
T=50ms: Bob 輸入 "200"

T=100ms: Alice's UpdateCell 到達 Hub
         → 寫入 DB: Cell(1,1) = "100", UpdatedAt = T100
         → 廣播給 Bob

T=150ms: Bob's UpdateCell 到達 Hub
         → 寫入 DB: Cell(1,1) = "200", UpdatedAt = T150 (覆蓋)
         → 廣播給 Alice

T=200ms: Alice 收到 Bob 的更新，Cell(1,1) 變成 "200"
         Bob 收到 Alice 的更新，但因為自己後來的 "200" 已覆蓋，無影響

最終結果: Cell(1,1) = "200" (Last Write Wins)
```

**改進方向**（未來）：
- 顯示「Bob 在 XXX 時間覆蓋了你的編輯」警告
- 實作 Operational Transformation 避免覆蓋

---

## 5. UI/UX 設計

### 5.1 頁面結構

#### 5.1.1 Sheet 列表頁 (`/sheets`)
```
┌───────────────────────────────────────┐
│  LiveSheet                            │
│  ┌─────────────────────────────────┐  │
│  │  + New Sheet                    │  │
│  └─────────────────────────────────┘  │
│                                       │
│  My Sheets                            │
│  ┌─────────────────────────────────┐  │
│  │ Q1 Sales Report                 │  │
│  │ Created: 2025-11-01  Updated: ... │
│  └─────────────────────────────────┘  │
│  ┌─────────────────────────────────┐  │
│  │ Product Inventory               │  │
│  │ Created: 2025-11-05  Updated: ... │
│  └─────────────────────────────────┘  │
└───────────────────────────────────────┘
```

#### 5.1.2 Sheet 編輯頁 (`/sheets/:id`)
```
┌────────────────────────────────────────────┐
│ ← Back to Sheets   |  Q1 Sales Report      │
│ Editing as: Alice  |  ● Connected          │
├────────────────────────────────────────────┤
│     A      B      C      D      E      F   │
│  ┌──────┬──────┬──────┬──────┬──────┬────┐│
│1 │Product│Price│ Qty  │      │      │    ││
│  ├──────┼──────┼──────┼──────┼──────┼────┤│
│2 │Apple │ 100  │  50  │      │      │    ││
│  ├──────┼──────┼──────┼──────┼──────┼────┤│
│3 │Banana│  80  │  30  │      │      │    ││
│  ├──────┼──────┼──────┼──────┼──────┼────┤│
│4 │      │      │      │      │      │    ││
│  └──────┴──────┴──────┴──────┴──────┴────┘│
│                                            │
│  Last updated: Cell(1,2) by Bob at 10:05  │
└────────────────────────────────────────────┘
```

### 5.2 互動設計

#### 5.2.1 儲存格編輯
- **點擊儲存格**：顯示邊框，進入編輯模式
- **輸入文字**：直接修改內容
- **Enter / 點擊其他格**：結束編輯，觸發 UpdateCell
- **Esc**：取消編輯，恢復原值

#### 5.2.2 即時回饋
- **本地編輯**：立即更新畫面（樂觀更新）
- **收到同步**：平滑更新（避免閃爍）
- **衝突覆蓋**：（未來）顯示提示訊息

#### 5.2.3 連線狀態
- **已連線**：綠色圓點 ● Connected
- **連線中**：黃色圓點 ● Connecting...
- **斷線**：紅色圓點 ● Disconnected

### 5.3 視覺設計

#### 5.3.1 配色方案
- 主色：藍色（#4A90E2）
- 背景：淺灰（#F5F5F5）
- 表格線：灰色（#DDDDDD）
- 選中儲存格：藍色邊框

#### 5.3.2 字型
- 標題：16px, bold
- 儲存格內容：14px, normal
- 提示文字：12px, gray

---

## 6. 實作階段

### Phase 1: MVP（最小可行產品）
**目標**：2 人可同時編輯，基本同步功能

**後端任務**：
- [x] 建立資料庫 Schema (Sheets, Cells)
- [ ] EF Core DB First Scaffold
- [ ] 建立 SignalR Hub (JoinSheet, UpdateCell)
- [ ] 實作 RESTful API (GET /sheets, POST /sheets, GET /sheets/:id/cells)
- [ ] 基本錯誤處理

**前端任務**：
- [ ] 建立 Vue 3 專案
- [ ] 安裝 @microsoft/signalr
- [ ] Sheet 列表頁元件
- [ ] Grid 編輯元件（基本版，10x10）
- [ ] SignalR 連線服務
- [ ] 實作雙向同步（UpdateCell + CellUpdated）

**驗收標準**：
- ✅ 開啟兩個瀏覽器分頁
- ✅ 同時編輯不同儲存格，互相看到更新
- ✅ 資料正確儲存到資料庫
- ✅ 基本的錯誤處理（斷線重連）

**預估時間**：3-5 天

---

### Phase 2: 功能增強
**目標**：完善 CRUD 功能，提升使用體驗

**任務**：
- [ ] Sheet 名稱編輯
- [ ] Sheet 刪除功能
- [ ] 擴大表格大小（50x26）
- [ ] 顯示最後修改者和時間
- [ ] 連線狀態顯示
- [ ] 簡易使用者名稱設定（localStorage）
- [ ] 斷線自動重連優化
- [ ] Loading 狀態處理

**驗收標準**：
- ✅ 完整的 Sheet CRUD 操作
- ✅ UI/UX 符合基本可用性
- ✅ 錯誤訊息清楚

**預估時間**：2-3 天

---

### Phase 3: 衝突處理、歷程記錄與優化
**目標**：處理極端情況，加入歷程記錄功能，提升穩定性

**後端任務**：
- [ ] 建立 CellHistory 表
- [ ] UpdateCell 時自動記錄歷程（OldValue → NewValue）
- [ ] 實作歷程查詢 API（Sheet 層級、Cell 層級、User 層級）
- [ ] 同時編輯同一格的衝突提示
- [ ] 效能優化（批次更新、Debounce）
- [ ] 錯誤日誌記錄
- [ ] 單元測試（Hub 方法、歷程記錄）

**前端任務**：
- [ ] Sheet 編輯頁加入「檢視歷程」按鈕
- [ ] 歷程記錄彈窗元件（顯示修改時間軸）
- [ ] 點擊儲存格查看該格的修改歷史
- [ ] 顯示「誰正在編輯」（Presence）
- [ ] E2E 測試（Playwright）

**驗收標準**：
- ✅ 5 人同時編輯流暢
- ✅ 衝突有清楚提示
- ✅ 可查詢 Sheet 和 Cell 的修改歷程
- ✅ 歷程記錄顯示清楚（時間、使用者、變更內容）
- ✅ 核心功能有測試覆蓋

**預估時間**：4-5 天

---

### Phase 4: 進階功能（未來）
**任務**：
- [ ] ASP.NET Core Identity 整合
- [ ] 權限管理（Owner/Editor/Viewer）
- [ ] Undo/Redo 功能
- [ ] 儲存格格式化（數字、日期）
- [ ] 虛擬捲動（支援大表格）
- [ ] 匯出 CSV/Excel
- [ ] 從歷程記錄還原特定版本（基於 Phase 3 的歷程記錄）
- [ ] 歷程記錄的資料保留策略與自動清理

---

## 7. 待決定的問題

### 待解決事項
- [ ] **表格大小限制**：50x26 是否足夠？還是需要動態增長？
- [ ] **使用者驗證方式**：Phase 1 用簡單名稱輸入，何時導入正式登入？
- [ ] **衝突處理細節**：是否需要顯示「Bob 覆蓋了你的編輯」警告？
- [ ] **效能瓶頸**：資料庫正規化在多少 cells 會有效能問題？
- [ ] **部署環境**：IIS 還是 Kestrel？WebSocket 支援確認？

### 假設
- 假設 1：使用者在穩定的區網環境，延遲 < 50ms
- 假設 2：同時編輯人數 < 10 人
- 假設 3：單一 Sheet 大小 < 10000 cells
- 假設 4：暫不考慮行動裝置
- 假設 5：使用者信任彼此（無惡意編輯）

---

## 8. 未來增強功能

### 8.1 即時協作增強
- 🔮 顯示其他使用者的游標位置
- 🔮 顏色標示不同使用者正在編輯的儲存格
- 🔮 使用者上線/離線通知
- 🔮 聊天功能（討論編輯內容）

### 8.2 試算表功能
- 🔮 基本公式支援（SUM, AVERAGE）
- 🔮 儲存格格式化（數字、貨幣、日期）
- 🔮 儲存格樣式（粗體、顏色、對齊）
- 🔮 凍結列/欄
- 🔮 篩選與排序

### 8.3 資料管理
- ✅ 歷程記錄（Phase 3 已規劃）
- 🔮 從歷程還原特定版本（Phase 4）
- 🔮 匯入 CSV/Excel
- 🔮 匯出 PDF
- 🔮 資料驗證（下拉選單、數值範圍）
- 🔮 歷程記錄的進階篩選（多條件組合查詢）

### 8.4 效能優化
- 🔮 Redis 快取熱門 Sheets
- 🔮 虛擬捲動（支援 100000+ cells）
- 🔮 Lazy Loading（只載入可見區域）
- 🔮 WebWorker 處理大量計算

### 8.5 企業功能
- 🔮 完整的權限管理
- 🔮 審計日誌（Audit Log）
- 🔮 資料加密
- 🔮 SSO 整合

---

## 9. 技術風險與緩解

### 風險 1：SignalR 連線不穩定
**影響**：使用者編輯無法同步
**緩解**：
- 實作自動重連機制
- 顯示明確的連線狀態
- 本地暫存編輯，重連後補發

### 風險 2：資料庫效能瓶頸
**影響**：大量 cells 時查詢變慢
**緩解**：
- 限制 Phase 1 表格大小
- 建立適當索引
- 必要時改用 JSON 欄位存整張表

### 風險 3：衝突處理不完善
**影響**：使用者資料被覆蓋，感到困惑
**緩解**：
- Phase 1 接受 Last Write Wins
- Phase 3 加入衝突提示
- 文檔說明衝突行為

### 風險 4：前端狀態管理複雜
**影響**：同步邏輯錯誤，畫面與資料庫不一致
**緩解**：
- 使用 Pinia/Vuex 集中管理狀態
- 單元測試覆蓋同步邏輯
- 定期全量同步（Reconciliation）

---

## 10. 參考資料

### 類似產品
- **Google Sheets**：目標參考對象
- **Notion Databases**：即時協作體驗
- **Airtable**：表格 UI 設計

### 技術文件
- [SignalR 官方文檔](https://learn.microsoft.com/en-us/aspnet/core/signalr/)
- [EF Core DB First](https://learn.microsoft.com/en-us/ef/core/managing-schemas/scaffolding/)
- [Vue.js 3](https://vuejs.org/)

### 即時協作演算法
- **Operational Transformation (OT)**：Google Docs 使用
- **CRDT (Conflict-free Replicated Data Types)**：更現代的方案
- **Last Write Wins**：簡單但可能遺失資料

---

## 附錄 A：資料庫初始化腳本

```sql
-- 建立資料庫
CREATE DATABASE SharedSheetDB;
GO

USE SharedSheetDB;
GO

-- 建立 Sheets 表
CREATE TABLE Sheets (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(200) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- 建立 Cells 表
CREATE TABLE Cells (
    SheetId UNIQUEIDENTIFIER NOT NULL,
    RowIndex INT NOT NULL,
    ColIndex INT NOT NULL,
    Value NVARCHAR(MAX),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100),
    PRIMARY KEY (SheetId, RowIndex, ColIndex),
    FOREIGN KEY (SheetId) REFERENCES Sheets(Id) ON DELETE CASCADE
);

-- 建立索引
CREATE INDEX IX_Cells_SheetId ON Cells(SheetId);

-- 建立 CellHistory 表（歷程記錄）
CREATE TABLE CellHistory (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    SheetId UNIQUEIDENTIFIER NOT NULL,
    RowIndex INT NOT NULL,
    ColIndex INT NOT NULL,
    OldValue NVARCHAR(MAX),
    NewValue NVARCHAR(MAX),
    UpdatedBy NVARCHAR(100) NOT NULL,
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (SheetId) REFERENCES Sheets(Id) ON DELETE CASCADE
);

-- 建立 CellHistory 索引
CREATE INDEX IX_CellHistory_SheetId ON CellHistory(SheetId);
CREATE INDEX IX_CellHistory_Cell ON CellHistory(SheetId, RowIndex, ColIndex);
CREATE INDEX IX_CellHistory_UpdatedBy ON CellHistory(UpdatedBy);
CREATE INDEX IX_CellHistory_UpdatedAt ON CellHistory(UpdatedAt DESC);

-- 插入測試資料
DECLARE @SheetId UNIQUEIDENTIFIER = NEWID();

INSERT INTO Sheets (Id, Name) VALUES (@SheetId, 'Demo Sheet');

INSERT INTO Cells (SheetId, RowIndex, ColIndex, Value, UpdatedBy) VALUES
(@SheetId, 0, 0, 'Product', 'System'),
(@SheetId, 0, 1, 'Price', 'System'),
(@SheetId, 0, 2, 'Quantity', 'System'),
(@SheetId, 1, 0, 'Apple', 'Alice'),
(@SheetId, 1, 1, '100', 'Alice'),
(@SheetId, 1, 2, '50', 'Bob');

-- 插入測試歷程記錄
INSERT INTO CellHistory (SheetId, RowIndex, ColIndex, OldValue, NewValue, UpdatedBy, UpdatedAt) VALUES
(@SheetId, 1, 1, NULL, '100', 'Alice', DATEADD(MINUTE, -10, GETDATE())),
(@SheetId, 1, 1, '100', '120', 'Bob', DATEADD(MINUTE, -5, GETDATE())),
(@SheetId, 1, 2, NULL, '30', 'Bob', DATEADD(MINUTE, -8, GETDATE())),
(@SheetId, 1, 2, '30', '50', 'Bob', DATEADD(MINUTE, -2, GETDATE()));
```

---

## 附錄 B：SignalR Hub 完整程式碼範例

```csharp
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

public class SheetHub : Hub
{
    private readonly AppDbContext _db;
    private readonly ILogger<SheetHub> _logger;

    public SheetHub(AppDbContext db, ILogger<SheetHub> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task JoinSheet(string sheetId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, sheetId);
        _logger.LogInformation($"User {Context.ConnectionId} joined sheet {sheetId}");
    }

    public async Task LeaveSheet(string sheetId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, sheetId);
        _logger.LogInformation($"User {Context.ConnectionId} left sheet {sheetId}");
    }

    public async Task UpdateCell(string sheetId, int row, int col, string value, string userName)
    {
        try
        {
            var guid = Guid.Parse(sheetId);

            var cell = await _db.Cells.FindAsync(guid, row, col);
            string oldValue = cell?.Value; // 記錄舊值用於歷程

            if (cell == null)
            {
                cell = new Cell
                {
                    SheetId = guid,
                    RowIndex = row,
                    ColIndex = col,
                    Value = value,
                    UpdatedBy = userName,
                    UpdatedAt = DateTime.UtcNow
                };
                _db.Cells.Add(cell);
            }
            else
            {
                cell.Value = value;
                cell.UpdatedBy = userName;
                cell.UpdatedAt = DateTime.UtcNow;
            }

            // 新增歷程記錄（Phase 3）
            var history = new CellHistory
            {
                SheetId = guid,
                RowIndex = row,
                ColIndex = col,
                OldValue = oldValue,
                NewValue = value,
                UpdatedBy = userName,
                UpdatedAt = DateTime.UtcNow
            };
            _db.CellHistory.Add(history);

            await _db.SaveChangesAsync();

            // 廣播給其他人
            await Clients.OthersInGroup(sheetId).SendAsync("CellUpdated", row, col, value, userName);

            _logger.LogInformation($"Cell ({row},{col}) updated by {userName} in sheet {sheetId}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating cell ({row},{col}) in sheet {sheetId}");
            throw;
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation($"User {Context.ConnectionId} disconnected");
        await base.OnDisconnectedAsync(exception);
    }
}
```

---

**版本**：1.0
**最後更新**：2025-11-06
**作者**：LiveSheet 團隊
**狀態**：規格制定中，準備進入 Phase 1 開發
