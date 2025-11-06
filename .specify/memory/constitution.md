# LiveSheet - 專案開發憲章

## 開發原則

### 1. 簡潔務實
- **優先選擇成熟技術**：使用 .NET 8 + SignalR + SQL Server，避免過度工程
- **漸進式開發**：從基本功能開始，逐步增強
- **最少複雜度原則**：先做出能用的版本，再優化細節
- **避免過早優化**：功能正確性優先於效能優化

### 2. 架構設計原則

#### 2.1 後端架構
- **技術棧**：ASP.NET Core 8 WebAPI + SignalR
- **資料庫**：SQL Server (DB First 方式)
- **ORM**：Entity Framework Core
- **即時通訊**：SignalR Hub 處理即時同步

#### 2.2 前端架構
- **技術棧**：Vue.js 3
- **即時連線**：@microsoft/signalr 客戶端
- **響應式設計**：支援桌面瀏覽器為主

#### 2.3 關注點分離
```
Backend/
├── Models/          # EF Core 自動生成（DB First）
├── Hubs/            # SignalR Hub
├── Controllers/     # RESTful API
├── Services/        # 業務邏輯
└── Data/            # DbContext

Frontend/
├── components/      # Vue 元件
├── services/        # SignalR 連線服務
├── stores/          # 狀態管理
└── views/           # 頁面
```

### 3. 資料庫設計原則

#### 3.1 設計方式
- **DB First**：先設計資料庫 Schema，再用 EF Core Scaffold 生成 Models
- **正規化設計**：適用於小到中型表格（推薦 10000 cells 以內）
- **索引策略**：SheetId 建立索引，提升查詢效能

#### 3.2 核心資料表
```sql
Sheets (工作表)
├── Id: UNIQUEIDENTIFIER (PK)
├── Name: NVARCHAR(200)
├── CreatedAt: DATETIME2
└── UpdatedAt: DATETIME2

Cells (儲存格)
├── SheetId: UNIQUEIDENTIFIER (FK)
├── RowIndex: INT
├── ColIndex: INT
├── Value: NVARCHAR(MAX)
├── UpdatedAt: DATETIME2
└── UpdatedBy: NVARCHAR(100)
└── PRIMARY KEY (SheetId, RowIndex, ColIndex)
```

### 4. 即時同步策略

#### 4.1 SignalR Group 機制
- 每個 Sheet 為一個 Group
- 使用者開啟 Sheet 時 JoinSheet，離開時 LeaveSheet
- 編輯時廣播給 Group 內的其他使用者

#### 4.2 衝突處理
- **簡單方案**：Last Write Wins (後寫入者勝出)
- **樂觀鎖定**：使用 UpdatedAt 時間戳記
- **未來增強**：顯示正在編輯的儲存格（Who's editing）

#### 4.3 訊息流程
```
User A 編輯 Cell(1,2)
  ↓
SignalR → Hub.UpdateCell()
  ↓
儲存到 SQL Server
  ↓
Clients.OthersInGroup() 廣播
  ↓
User B, C, D 收到 CellUpdated 事件
  ↓
更新本地畫面
```

### 5. 程式碼品質標準

#### 5.1 C# 後端
- 使用 async/await 處理非同步操作
- 遵循 .NET 命名慣例（PascalCase for public members）
- 適當的錯誤處理和 logging
- 使用 Dependency Injection

#### 5.2 Vue.js 前端
- Composition API 風格
- TypeScript 類型檢查（可選）
- 元件化設計
- 清晰的狀態管理

#### 5.3 可讀性
- 有意義的變數和函式命名
- 適當的註解（Why, not What）
- 避免過長的函式（建議 < 50 行）

### 6. 測試策略

#### 6.1 開發階段測試
- **手動測試**：多瀏覽器分頁測試即時同步
- **情境測試**：
  - 單人編輯
  - 雙人同時編輯不同 Cell
  - 雙人同時編輯相同 Cell
  - 斷線重連

#### 6.2 單元測試（未來增強）
- Hub 方法測試
- 資料存取邏輯測試

### 7. 效能要求

#### 7.1 回應時間
- 本地編輯：< 50ms
- SignalR 往返：< 200ms（區網環境）
- 資料庫查詢：< 100ms

#### 7.2 可擴展性
- 初期目標：支援 5-10 人同時編輯同一個 Sheet
- 單一 Sheet：< 10000 cells

#### 7.3 資源管理
- SignalR 連線自動重連
- 適當的 Connection Pool 設定

### 8. 安全性原則

#### 8.1 基本驗證（Phase 1）
- 簡單的使用者名稱識別
- 無密碼驗證（內部使用）

#### 8.2 資料驗證
- 輸入欄位長度限制
- SQL Injection 防護（EF Core 參數化查詢）
- CORS 設定限制前端來源

#### 8.3 未來增強
- ASP.NET Core Identity 整合
- JWT Token 驗證
- 權限管理（Owner, Editor, Viewer）

### 9. 開發環境

#### 9.1 必要工具
- .NET 8 SDK
- SQL Server 2019+ 或 SQL Server Express
- Node.js 18+ (for Vue.js)
- Visual Studio 2022 或 VS Code
- SQL Server Management Studio (SSMS)

#### 9.2 套件依賴
**後端**：
- Microsoft.EntityFrameworkCore.SqlServer
- Microsoft.EntityFrameworkCore.Design
- Microsoft.EntityFrameworkCore.Tools
- Microsoft.AspNetCore.SignalR

**前端**：
- Vue 3
- @microsoft/signalr
- (依需求增加 UI 框架)

### 10. 部署考量

#### 10.1 開發環境
- 本機 SQL Server
- localhost:5000 (API)
- localhost:5173 (Vue dev server)

#### 10.2 生產環境（未來）
- IIS 或 Kestrel
- SQL Server (公司內部)
- WebSocket 支援檢查
- SSL/TLS 設定

### 11. 版本控制規範

#### 11.1 Git Workflow
- main: 穩定版本
- develop: 開發中版本
- feature/*: 功能分支

#### 11.2 Commit 訊息格式
```
<type>: <subject>

[optional body]
```

Type: feat, fix, docs, refactor, test, chore

範例：
- `feat: 新增 SignalR Hub UpdateCell 方法`
- `fix: 修正同時編輯衝突問題`
- `refactor: 重構 Cell 資料存取邏輯`

### 12. 文檔要求

#### 12.1 必要文檔
- README.md：專案說明、環境設定
- API 文檔：SignalR Hub 方法列表
- 資料庫 Schema：ERD 圖或 SQL 腳本

#### 12.2 註解原則
- 複雜邏輯需註解「為什麼」
- Public API 需 XML 註解
- 前端元件需 prop 說明

## 品質檢查點

### 開發階段檢查清單

#### Phase 1: MVP
- [ ] 資料庫 Schema 建立完成
- [ ] EF Core Models Scaffold 成功
- [ ] SignalR Hub 基本方法實作
- [ ] 前端可連線到 SignalR
- [ ] 單一儲存格編輯同步成功
- [ ] 多人同時編輯基本測試通過

#### Phase 2: 功能增強
- [ ] 完整的表格 CRUD 操作
- [ ] 讀取既有 Sheet 資料
- [ ] 錯誤處理機制
- [ ] 斷線重連處理
- [ ] UI/UX 優化

#### 合併前檢查
- [ ] 本地測試通過（多分頁測試）
- [ ] 無明顯 console 錯誤
- [ ] SignalR 連線穩定
- [ ] 資料正確儲存到資料庫
- [ ] 程式碼已審查
- [ ] Commit 訊息清晰

## 技術限制與取捨

### 已知限制
1. **非完全的 CRDT**：使用 Last Write Wins，可能在極端情況下有資料遺失
2. **資料庫正規化**：大型表格 (>10000 cells) 可能需要改用 JSON 欄位
3. **無離線支援**：需要穩定網路連線
4. **基本權限管理**：初期無細緻的權限控制

### 技術債務追蹤
未來可優化項目：
- [ ] 實作 Operational Transformation (OT)
- [ ] 改用 CRDT 演算法
- [ ] 加入 Redis 做快取
- [ ] 實作 Undo/Redo 功能
- [ ] 大表格效能優化（虛擬捲動）

## 成功定義

### MVP 成功標準
1. ✅ 2 個使用者可同時編輯不同儲存格
2. ✅ 編輯即時同步（< 1 秒延遲）
3. ✅ 資料正確儲存到資料庫
4. ✅ 基本的錯誤處理

### 產品成功標準（未來）
1. 5-10 人同時編輯流暢
2. 衝突處理機制完善
3. 良好的使用者體驗
4. 穩定的生產環境運行

---

**版本**：1.0
**最後更新**：2025-11-06
**基於架構**：.NET 8 + SignalR + SQL Server + Vue.js
