# LiveSheet 待辦事項

> **最後更新**：2025-11-06
> **當前階段**：Phase 1A 完成，準備 Phase 1B

---

## 🔥 立即待辦（現在可做）

### GitHub 相關
- [ ] **Merge 到 main 分支**
  - 建立 Pull Request：`claude/github-spec-kit-guide-011CUrJQUfQwZcADe2eEqJ9T` → `main`
  - 審查並 merge

- [ ] **啟用 GitHub Pages**
  1. 前往 GitHub Repository → Settings → Pages
  2. Source 選擇「GitHub Actions」
  3. 等待第一次部署完成
  4. 取得部署網址：`https://<username>.github.io/LiveSheet/`

- [ ] **測試線上部署**
  - 開啟 GitHub Pages 網址
  - 測試 Sheet 列表功能
  - 測試建立新 Sheet
  - 測試表格編輯功能

### 本地測試
- [ ] **本地執行前端專案**
  ```bash
  cd frontend
  npm run dev
  ```
  - 開啟 http://localhost:5173
  - 測試所有功能
  - 檢查 Console 有無錯誤

- [ ] **更新 README（可選）**
  - 加入 GitHub Pages 網址
  - 加入本地測試指引的截圖

---

## 📦 Phase 1B: 後端開發（公司環境）

### 環境準備
- [ ] **安裝必要工具**
  - [ ] .NET 8 SDK
  - [ ] SQL Server 2019+ / SQL Server Express
  - [ ] Visual Studio 2022 / VS Code + C# Extension
  - [ ] SQL Server Management Studio (SSMS)

- [ ] **複製專案到公司**
  ```bash
  git clone <repository-url>
  cd LiveSheet
  git checkout main  # 或開發分支
  ```

### 資料庫建立
- [ ] **執行初始化腳本**
  - [ ] 開啟 SSMS
  - [ ] 執行 `.specify/memory/specification.md` 附錄 A 的 SQL 腳本
  - [ ] 驗證表格建立成功（Sheets, Cells）
  - [ ] 檢查測試資料

- [ ] **記錄連線字串**
  ```
  Server=localhost;Database=SharedSheetDB;Trusted_Connection=True;
  ```

### 建立後端專案
- [ ] **建立 .NET 專案**
  ```bash
  cd backend  # 或建立此資料夾
  dotnet new webapi -n LiveSheet.Api
  cd LiveSheet.Api
  ```

- [ ] **安裝必要套件**
  ```bash
  dotnet add package Microsoft.EntityFrameworkCore.SqlServer
  dotnet add package Microsoft.EntityFrameworkCore.Design
  dotnet add package Microsoft.EntityFrameworkCore.Tools
  dotnet add package Microsoft.AspNetCore.SignalR
  ```

- [ ] **設定 appsettings.json**
  - [ ] 加入連線字串
  - [ ] 設定 CORS

### EF Core DB First
- [ ] **Scaffold 資料庫模型**
  ```bash
  dotnet ef dbcontext scaffold "Server=localhost;Database=SharedSheetDB;Trusted_Connection=True;" \
    Microsoft.EntityFrameworkCore.SqlServer \
    -o Models \
    -f
  ```

- [ ] **檢查生成的模型**
  - [ ] Sheet.cs
  - [ ] Cell.cs
  - [ ] AppDbContext.cs

- [ ] **註冊 DbContext**
  - [ ] 在 Program.cs 加入 DbContext
  - [ ] 測試資料庫連線

### RESTful API
- [ ] **建立 SheetsController**
  - [ ] GET /api/sheets - 取得所有 Sheets
  - [ ] POST /api/sheets - 建立新 Sheet
  - [ ] GET /api/sheets/{id}/cells - 取得 Cells

- [ ] **設定 CORS**
  - [ ] 允許前端來源（localhost:5173）
  - [ ] 允許 SignalR 必要的 headers

- [ ] **錯誤處理**
  - [ ] 加入全域錯誤處理 Middleware
  - [ ] 統一錯誤回應格式

- [ ] **測試 API**
  - [ ] 使用 Postman 測試每個端點
  - [ ] 檢查回應格式正確

### SignalR Hub
- [ ] **建立 SheetHub.cs**
  - [ ] JoinSheet 方法
  - [ ] LeaveSheet 方法
  - [ ] UpdateCell 方法（含資料庫儲存）

- [ ] **註冊 SignalR**
  - [ ] 在 Program.cs 加入 SignalR 服務
  - [ ] 設定 Hub 路由（/sheethub）
  - [ ] 設定 CORS

- [ ] **測試 SignalR**
  - [ ] 使用 SignalR 測試工具連線
  - [ ] 測試 JoinSheet/LeaveSheet
  - [ ] 測試 UpdateCell 廣播

### 驗收標準
- [ ] API 所有端點正常回應
- [ ] SignalR 連線成功
- [ ] 資料可正確儲存到資料庫
- [ ] 無 console 錯誤

---

## 🔗 Phase 1C: 前後端整合（公司環境）

### 前端服務整合
- [ ] **建立 apiService.js**
  ```javascript
  // frontend/src/services/apiService.js
  const API_BASE_URL = 'http://localhost:5000/api';

  export async function getSheets() { ... }
  export async function createSheet(name) { ... }
  export async function getSheetCells(sheetId) { ... }
  ```

- [ ] **建立 signalrService.js**
  ```javascript
  // frontend/src/services/signalrService.js
  import * as signalR from '@microsoft/signalr';

  export function createConnection() { ... }
  export async function joinSheet(connection, sheetId) { ... }
  export async function updateCell(connection, ...) { ... }
  ```

- [ ] **安裝 @microsoft/signalr**
  ```bash
  cd frontend
  npm install @microsoft/signalr
  ```

### 替換 Mock 資料
- [ ] **更新 SheetList.vue**
  - [ ] 引入 apiService
  - [ ] 替換 mockData 呼叫
  - [ ] 測試列表載入

- [ ] **更新 SheetEditor.vue**
  - [ ] 引入 apiService + signalrService
  - [ ] 建立 SignalR 連線
  - [ ] 實作雙向同步
  - [ ] 處理連線狀態

- [ ] **環境變數設定**
  - [ ] 建立 `.env` 檔案
  - [ ] 設定 API_BASE_URL
  - [ ] 開發/生產環境區分

### 整合測試
- [ ] **單瀏覽器測試**
  - [ ] 後端：`dotnet run`
  - [ ] 前端：`npm run dev`
  - [ ] 開啟 http://localhost:5173
  - [ ] 測試 CRUD 功能

- [ ] **雙瀏覽器即時同步測試**
  - [ ] 開啟兩個瀏覽器分頁
  - [ ] 測試編輯不同儲存格
  - [ ] 測試編輯相同儲存格（衝突）
  - [ ] 驗證即時同步（< 500ms）

- [ ] **斷線測試**
  - [ ] 暫停後端
  - [ ] 檢查前端連線狀態
  - [ ] 重啟後端
  - [ ] 驗證自動重連

### 驗收標準
- [ ] 雙向即時同步正常運作
- [ ] 資料正確儲存到資料庫
- [ ] 連線狀態顯示正確
- [ ] 衝突處理符合預期（Last Write Wins）

---

## ✨ Phase 2: 功能增強（公司環境）

### Sheet 管理增強
- [ ] **Sheet 編輯功能**
  - [ ] 前端：Sheet 名稱編輯 UI
  - [ ] 後端：PUT /api/sheets/{id} API
  - [ ] 即時更新 Sheet 名稱

- [ ] **Sheet 刪除功能**
  - [ ] 前端：刪除按鈕 + 確認對話框
  - [ ] 後端：DELETE /api/sheets/{id} API
  - [ ] CASCADE 刪除相關 Cells

### 表格擴展
- [ ] **擴大表格**
  - [ ] 更新 GridComponent rows=50, cols=26
  - [ ] 測試效能

### UX 改善
- [ ] **儲存格 Tooltip**
  - [ ] 顯示最後修改者
  - [ ] 顯示修改時間

- [ ] **連線狀態**
  - [ ] 已連線：綠色圓點
  - [ ] 連線中：黃色圓點
  - [ ] 斷線：紅色圓點
  - [ ] 重連機制

- [ ] **Loading 狀態**
  - [ ] 載入 Sheets 時顯示 Loading
  - [ ] 載入 Cells 時顯示 Loading
  - [ ] Skeleton Screen（可選）

### 使用者識別改進
- [ ] **簡易登入頁**
  - [ ] 輸入名稱後進入系統
  - [ ] 儲存到 sessionStorage
  - [ ] 名稱驗證（不可空白）

---

## 🔍 Phase 3: 歷程記錄（公司環境）

### 資料庫擴展
- [ ] **建立 CellHistory 表**
  - [ ] 執行 SQL 腳本（specification.md 附錄 A）
  - [ ] 建立索引
  - [ ] Scaffold 更新 Models

### 後端歷程記錄
- [ ] **UpdateCell 自動記錄**
  - [ ] 修改 SheetHub.UpdateCell
  - [ ] 記錄 OldValue → NewValue
  - [ ] 記錄 UpdatedBy 和 UpdatedAt

- [ ] **歷程查詢 API**
  - [ ] GET /api/sheets/{id}/history
  - [ ] GET /api/sheets/{sheetId}/cells/{row}/{col}/history
  - [ ] GET /api/history/user/{userId}
  - [ ] 支援分頁、時間篩選

### 前端歷程查詢
- [ ] **歷程記錄 Modal 元件**
  - [ ] 建立 HistoryModal.vue
  - [ ] 時間軸顯示
  - [ ] 篩選功能

- [ ] **Sheet 編輯頁整合**
  - [ ] 加入「檢視歷程」按鈕
  - [ ] 右鍵選單「查看儲存格歷程」
  - [ ] 顯示格式：「Bob 在 10:05 將值從 '100' 改為 '200'」

### Presence（誰正在編輯）
- [ ] **後端 Presence 追蹤**
  - [ ] Hub 追蹤正在編輯的 Cell
  - [ ] 廣播 CellEditStart/CellEditEnd 事件

- [ ] **前端 Presence 顯示**
  - [ ] 顯示其他人正在編輯的儲存格
  - [ ] 不同使用者的顏色標示

### 測試與優化
- [ ] **單元測試**
  - [ ] SheetHub 方法測試
  - [ ] 歷程記錄 API 測試

- [ ] **E2E 測試**
  - [ ] Playwright 設定
  - [ ] 關鍵流程測試

- [ ] **壓力測試**
  - [ ] 5 人同時編輯測試
  - [ ] 大量 Cells 效能測試

---

## 🚀 Phase 4: 進階功能（未來）

- [ ] ASP.NET Core Identity 整合
- [ ] JWT Token 驗證
- [ ] 權限管理（Owner/Editor/Viewer）
- [ ] Undo/Redo 功能
- [ ] 儲存格格式化（數字、日期、貨幣）
- [ ] 儲存格樣式（粗體、顏色、對齊）
- [ ] 虛擬捲動（支援大表格）
- [ ] 匯出 CSV/Excel
- [ ] 匯入 CSV/Excel
- [ ] 從歷程還原版本
- [ ] 歷程資料保留策略

---

## 📝 技術債務與改進

### 已知問題
- 無

### 待優化項目
- [ ] 前端錯誤處理機制優化
- [ ] API 回應格式統一
- [ ] Loading 狀態更流暢
- [ ] 大表格效能優化（虛擬捲動）

### 文檔待補充
- [ ] API 文檔完整版（Swagger）
- [ ] 部署指南
- [ ] 故障排除指南
- [ ] 貢獻指南

---

## 🎯 當週目標（更新每週）

### 本週（2025-11-06 ~ 2025-11-12）
- [x] 完成 Phase 0（規格制定）
- [x] 完成 Phase 1A（前端基礎）
- [ ] Merge 到 main 並啟用 GitHub Pages
- [ ] 搬回公司並開始 Phase 1B

### 下週（2025-11-13 ~ 2025-11-19）
- [ ] 完成 Phase 1B（後端開發）
- [ ] 完成 Phase 1C（前後端整合）
- [ ] 雙瀏覽器即時同步測試通過

---

## 💡 待決定事項

### 技術選擇
- [ ] 前端狀態管理：Pinia or Vuex？（建議 Pinia）
- [ ] UI 框架：Pure CSS or Vuetify/Element Plus？
- [ ] 測試框架：Vitest or Jest？

### 功能範圍
- [ ] 表格大小上限：50x26 or 動態擴展？
- [ ] 歷程記錄保留時間：90 天 or 永久？
- [ ] 是否需要離線模式？（當前規格為「不支援」）

### 部署方案
- [ ] 後端部署位置：Azure / 公司內部 IIS / Docker？
- [ ] 資料庫：雲端 or 本地？
- [ ] SSL/TLS 憑證取得方式？

---

## 📞 需協助事項

### 需要外部資源
- [ ] SQL Server 連線權限
- [ ] 公司內部網路設定
- [ ] 生產環境伺服器資訊

### 需要決策
- [ ] 使用者驗證方式最終方案
- [ ] 資料備份策略
- [ ] 監控和日誌方案

---

**最後更新**：2025-11-06
**維護者**：開發團隊
**檔案版本**：1.0

---

## 📌 快速指令

### 前端
```bash
# 開發模式
cd frontend && npm run dev

# Build
cd frontend && npm run build

# 預覽 build
cd frontend && npm run preview
```

### 後端（未來）
```bash
# 執行
cd backend/LiveSheet.Api && dotnet run

# Watch 模式
cd backend/LiveSheet.Api && dotnet watch run

# Scaffold 資料庫
dotnet ef dbcontext scaffold "..." Microsoft.EntityFrameworkCore.SqlServer -o Models -f
```

### Git
```bash
# 建立 Pull Request
git push origin <branch-name>
# 然後到 GitHub 建立 PR

# 更新本地分支
git pull origin main

# 查看狀態
git status
```
