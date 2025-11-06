// 假資料服務 - 模擬後端 API
// Phase 1A: 純前端展示用

// 生成假的 GUID
function generateGuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 假資料：Sheets 列表
export const mockSheets = [
  {
    id: generateGuid(),
    name: 'Q1 Sales Report',
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2025-11-06T15:30:00Z'
  },
  {
    id: generateGuid(),
    name: 'Product Inventory',
    createdAt: '2025-11-05T09:00:00Z',
    updatedAt: '2025-11-06T14:20:00Z'
  },
  {
    id: generateGuid(),
    name: 'Team Schedule',
    createdAt: '2025-11-03T11:30:00Z',
    updatedAt: '2025-11-06T10:15:00Z'
  }
];

// 假資料：Cells（示範用）
export const mockCells = {
  // 使用 'row-col' 作為 key
  '0-0': { value: 'Product', updatedBy: 'Alice', updatedAt: '2025-11-06T10:00:00Z' },
  '0-1': { value: 'Price', updatedBy: 'Alice', updatedAt: '2025-11-06T10:00:00Z' },
  '0-2': { value: 'Quantity', updatedBy: 'Alice', updatedAt: '2025-11-06T10:00:00Z' },
  '1-0': { value: 'Apple', updatedBy: 'Bob', updatedAt: '2025-11-06T10:05:00Z' },
  '1-1': { value: '100', updatedBy: 'Bob', updatedAt: '2025-11-06T10:05:30Z' },
  '1-2': { value: '50', updatedBy: 'Carol', updatedAt: '2025-11-06T10:06:00Z' },
  '2-0': { value: 'Banana', updatedBy: 'Bob', updatedAt: '2025-11-06T10:07:00Z' },
  '2-1': { value: '80', updatedBy: 'Alice', updatedAt: '2025-11-06T10:08:00Z' },
  '2-2': { value: '30', updatedBy: 'Carol', updatedAt: '2025-11-06T10:09:00Z' },
  '3-0': { value: 'Orange', updatedBy: 'Alice', updatedAt: '2025-11-06T10:10:00Z' },
  '3-1': { value: '90', updatedBy: 'Bob', updatedAt: '2025-11-06T10:11:00Z' },
  '3-2': { value: '40', updatedBy: 'Carol', updatedAt: '2025-11-06T10:12:00Z' }
};

// Mock API: 取得所有 Sheets
export function getSheets() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockSheets);
    }, 300); // 模擬網路延遲
  });
}

// Mock API: 取得特定 Sheet 的 Cells
export function getSheetCells(sheetId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Phase 1A: 所有 sheet 都返回相同的假資料
      resolve({ ...mockCells });
    }, 300);
  });
}

// Mock API: 更新 Cell（本地儲存）
export function updateCell(sheetId, row, col, value, userName) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const key = `${row}-${col}`;
      mockCells[key] = {
        value,
        updatedBy: userName || 'Guest',
        updatedAt: new Date().toISOString()
      };
      resolve(mockCells[key]);
    }, 100);
  });
}

// Mock API: 建立新 Sheet
export function createSheet(name) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newSheet = {
        id: generateGuid(),
        name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockSheets.push(newSheet);
      resolve(newSheet);
    }, 300);
  });
}

// 取得當前使用者名稱（從 localStorage）
export function getCurrentUser() {
  return localStorage.getItem('livesheet_username') || 'Guest';
}

// 設定當前使用者名稱
export function setCurrentUser(username) {
  localStorage.setItem('livesheet_username', username);
}
