# LiveSheet

一個基於 .NET 8 + SignalR + Vue.js 的**即時共同編輯表格系統**，讓團隊成員可以像使用 Google Sheets 一樣同時編輯同一份試算表。

## 專案願景

打造一個輕量級、可自主部署的即時協作表格工具，讓公司內部可以擁有類似 Google Sheets 的即時多人編輯體驗，同時保持資料的自主可控。

## 核心特色

- **即時同步**：使用 SignalR 實現毫秒級的即時編輯同步
- **多人協作**：支援 5-10 人同時編輯同一個表格
- **簡單易用**：類似傳統試算表的操作體驗
- **自主可控**：自架 Server，資料留在公司內部
- **穩定可靠**：資料持久化到 SQL Server，避免資料遺失

## 技術架構

### 後端
- **框架**：ASP.NET Core 8 WebAPI
- **即時通訊**：SignalR
- **資料庫**：SQL Server 2019+
- **ORM**：Entity Framework Core (DB First)

### 前端
- **框架**：Vue.js 3
- **即時連線**：@microsoft/signalr
- **狀態管理**：Pinia (規劃中)

### 架構圖
```
┌─────────────────┐
│   Vue.js 3      │
│   Frontend      │
└────────┬────────┘
         │ WebSocket/SSE
         │
┌────────▼────────┐
│  ASP.NET Core 8 │
│  + SignalR Hub  │
└────────┬────────┘
         │
┌────────▼────────┐
│  SQL Server     │
│  (Sheets/Cells) │
└─────────────────┘
```

## 專案狀態

🚧 **目前狀態**：Phase 0 - 規格制定完成，準備進入 Phase 1 開發

### 開發階段
- [x] Phase 0：規格制定（SDD 文件）
- [ ] Phase 1：MVP（最小可行產品）- 預計 3-5 天
- [ ] Phase 2：功能增強 - 預計 2-3 天
- [ ] Phase 3：衝突處理與優化 - 預計 3-4 天
- [ ] Phase 4：進階功能（未來）

## 資料庫設計

### Sheets 表（工作表）
| 欄位 | 類型 | 說明 |
|------|------|------|
| Id | UNIQUEIDENTIFIER | 主鍵 |
| Name | NVARCHAR(200) | Sheet 名稱 |
| CreatedAt | DATETIME2 | 建立時間 |
| UpdatedAt | DATETIME2 | 更新時間 |

### Cells 表（儲存格）
| 欄位 | 類型 | 說明 |
|------|------|------|
| SheetId | UNIQUEIDENTIFIER | 所屬 Sheet (FK) |
| RowIndex | INT | 列索引 |
| ColIndex | INT | 行索引 |
| Value | NVARCHAR(MAX) | 儲存格內容 |
| UpdatedAt | DATETIME2 | 更新時間 |
| UpdatedBy | NVARCHAR(100) | 更新者 |

**主鍵**：(SheetId, RowIndex, ColIndex)

## 快速開始

### 環境需求

**後端**：
- .NET 8 SDK
- SQL Server 2019+ 或 SQL Server Express
- Visual Studio 2022 或 VS Code

**前端**：
- Node.js 18+
- npm 或 yarn

### 安裝步驟

#### 1. 建立資料庫

```sql
-- 執行資料庫初始化腳本
-- 詳見 .specify/memory/specification.md 附錄 A

CREATE DATABASE SharedSheetDB;
GO

USE SharedSheetDB;
GO

-- 建立 Sheets 和 Cells 表
-- （完整腳本請參考規格文件）
```

#### 2. 後端設定（規劃中）

```bash
# 進入後端資料夾
cd backend

# 還原套件
dotnet restore

# 更新連線字串（appsettings.json）
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=SharedSheetDB;Trusted_Connection=True;"
  }
}

# 執行 Scaffold（DB First）
dotnet ef dbcontext scaffold "Server=localhost;Database=SharedSheetDB;Trusted_Connection=True;" \
  Microsoft.EntityFrameworkCore.SqlServer \
  -o Models \
  -f

# 執行專案
dotnet run
```

#### 3. 前端設定（規劃中）

```bash
# 進入前端資料夾
cd frontend

# 安裝依賴
npm install

# 執行開發伺服器
npm run dev
```

#### 4. 開啟瀏覽器

- 前端：http://localhost:5173
- 後端 API：http://localhost:5000

## 專案結構

```
LiveSheet/
├── .specify/                    # SDD 規格文件（Spec-Driven Development）
│   └── memory/
│       ├── constitution.md      # 開發憲章（技術架構與原則）
│       └── specification.md     # 產品規格（功能需求與實作計劃）
├── backend/                     # 後端專案（規劃中）
│   ├── Controllers/             # RESTful API
│   ├── Hubs/                    # SignalR Hub
│   ├── Models/                  # EF Core Models (DB First)
│   ├── Services/                # 業務邏輯
│   └── Program.cs
├── frontend/                    # 前端專案（規劃中）
│   ├── src/
│   │   ├── components/          # Vue 元件
│   │   ├── services/            # SignalR 連線服務
│   │   ├── stores/              # 狀態管理
│   │   └── views/               # 頁面
│   └── package.json
└── README.md
```

## 核心功能

### Phase 1 (MVP)
- [x] 規格文件制定
- [ ] 資料庫建立與 EF Core Scaffold
- [ ] SignalR Hub 實作（JoinSheet、LeaveSheet、UpdateCell）
- [ ] RESTful API（GET/POST Sheets、GET Cells）
- [ ] 前端基本 Grid 元件（10x10）
- [ ] 即時同步功能（雙向）
- [ ] 多瀏覽器分頁測試

### Phase 2（功能增強）
- [ ] 擴大表格大小（50x26）
- [ ] Sheet CRUD 完整功能
- [ ] 顯示最後修改者和時間
- [ ] 連線狀態顯示
- [ ] 簡易使用者名稱設定
- [ ] 斷線自動重連

### Phase 3（衝突處理）
- [ ] 同時編輯衝突提示
- [ ] 顯示誰正在編輯（Presence）
- [ ] 效能優化（批次更新）
- [ ] 單元測試與 E2E 測試

### 未來增強
- [ ] ASP.NET Core Identity 整合
- [ ] 權限管理（Owner/Editor/Viewer）
- [ ] Undo/Redo 功能
- [ ] 儲存格格式化
- [ ] 匯出 CSV/Excel
- [ ] 版本歷史

## API 文件

### RESTful API

#### GET /api/sheets
取得所有 Sheets 列表

**回應**：
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

#### POST /api/sheets
建立新 Sheet

**請求**：
```json
{
  "name": "New Sheet"
}
```

#### GET /api/sheets/{id}/cells
取得 Sheet 的所有 Cells

### SignalR Hub

#### Hub 端點：`/sheethub`

**Client → Server**：
- `JoinSheet(string sheetId)` - 加入 Sheet Group
- `LeaveSheet(string sheetId)` - 離開 Sheet Group
- `UpdateCell(string sheetId, int row, int col, string value, string userName)` - 更新儲存格

**Server → Client**：
- `CellUpdated(int row, int col, string value, string userName)` - 通知儲存格更新

## 開發指南

### 開發原則
1. **簡潔優先**：避免過度工程，優先選擇成熟技術
2. **漸進式開發**：從基本功能開始，逐步增強
3. **關注點分離**：清晰的架構層次
4. **測試驅動**：多瀏覽器分頁測試即時同步

### 衝突處理策略
- **Phase 1**：Last Write Wins（後寫入者勝出）
- **未來**：顯示衝突警告、Operational Transformation

### Commit 訊息格式
```
<type>: <subject>

[optional body]
```

**Type**：feat, fix, docs, refactor, test, chore

**範例**：
- `feat: 新增 SignalR Hub UpdateCell 方法`
- `fix: 修正同時編輯衝突問題`
- `docs: 更新 API 文件`

## 技術文件

### 規格文件（SDD）
- [開發憲章](.specify/memory/constitution.md) - 技術架構與開發原則
- [產品規格](.specify/memory/specification.md) - 功能需求與實作計劃

### 參考資源
- [SignalR 官方文檔](https://learn.microsoft.com/en-us/aspnet/core/signalr/)
- [EF Core DB First](https://learn.microsoft.com/en-us/ef/core/managing-schemas/scaffolding/)
- [Vue.js 3](https://vuejs.org/)
- [GitHub Spec Kit](https://github.com/github/spec-kit)

## 已知限制

1. **衝突處理**：Phase 1 使用 Last Write Wins，極端情況可能有資料遺失
2. **表格大小**：建議 < 10000 cells（正規化設計限制）
3. **離線支援**：需要穩定網路連線
4. **權限管理**：Phase 1 無細緻的權限控制

## 貢獻指南

### 開發流程
1. Fork 本專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

### 程式碼審查標準
- [ ] 符合 Constitution 定義的開發原則
- [ ] 通過基本測試（多分頁同步測試）
- [ ] 無明顯 console 錯誤
- [ ] Commit 訊息清晰

## 授權

[待定]

## 聯絡方式

- **專案維護者**：[Your Name]
- **問題回報**：[GitHub Issues]

---

**版本**：0.1.0 (Phase 0 - 規格制定完成)
**最後更新**：2025-11-06
**開發方法**：Spec-Driven Development (SDD)
