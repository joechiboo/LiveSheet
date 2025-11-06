<template>
  <div class="sheet-editor-container">
    <header class="editor-header">
      <div class="header-left">
        <button @click="goBack" class="btn-back">← 返回列表</button>
        <h1 class="sheet-title">{{ sheetName }}</h1>
      </div>
      <div class="header-right">
        <span class="user-info">編輯者: {{ currentUser }}</span>
        <span class="connection-status">
          <span class="status-dot status-mock"></span>
          Mock 模式
        </span>
      </div>
    </header>

    <div class="editor-content">
      <div v-if="loading" class="loading">載入中...</div>
      <GridComponent
        v-else
        :cells="cells"
        :rows="30"
        :cols="26"
        @update-cell="handleCellUpdate"
      />
    </div>

    <footer class="editor-footer">
      <div class="footer-info">
        <span v-if="lastUpdate.cell">
          最後更新: Cell({{ lastUpdate.cell }}) 由 {{ lastUpdate.user }} 於 {{ lastUpdate.time }}
        </span>
        <span v-else>
          提示：點擊儲存格開始編輯，按 Enter 儲存，按 Esc 取消
        </span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import GridComponent from '../components/GridComponent.vue';
import {
  getSheetCells,
  updateCell,
  getCurrentUser,
  mockSheets
} from '../services/mockData';

const router = useRouter();
const route = useRoute();

const sheetId = route.params.id;
const sheetName = ref('載入中...');
const currentUser = ref('Guest');
const cells = ref({});
const loading = ref(true);
const lastUpdate = ref({
  cell: null,
  user: null,
  time: null
});

onMounted(async () => {
  // 載入當前使用者
  currentUser.value = getCurrentUser();

  // 載入 Sheet 名稱
  const sheet = mockSheets.find(s => s.id === sheetId);
  if (sheet) {
    sheetName.value = sheet.name;
  } else {
    sheetName.value = 'Sheet';
  }

  // 載入 Cells
  cells.value = await getSheetCells(sheetId);
  loading.value = false;
});

function goBack() {
  router.push('/');
}

async function handleCellUpdate({ row, col, value, userName }) {
  // 更新本地資料（樂觀更新）
  const key = `${row}-${col}`;
  cells.value[key] = {
    value,
    updatedBy: userName,
    updatedAt: new Date().toISOString()
  };

  // 模擬發送到後端
  await updateCell(sheetId, row, col, value, userName);

  // 更新最後修改資訊
  lastUpdate.value = {
    cell: `${row},${col}`,
    user: userName,
    time: new Date().toLocaleTimeString('zh-TW')
  };

  console.log(`[Mock] Cell (${row},${col}) updated to "${value}" by ${userName}`);
}
</script>

<style scoped>
.sheet-editor-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.editor-header {
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-back {
  background: none;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #f0f0f0;
  color: #333;
}

.sheet-title {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: #666;
}

.user-info {
  font-size: 0.95rem;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-mock {
  background: #FFA500;
}

.editor-content {
  flex: 1;
  padding: 1rem;
  overflow: hidden;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  font-size: 1.2rem;
}

.editor-footer {
  background: white;
  padding: 0.75rem 2rem;
  border-top: 1px solid #ddd;
  font-size: 0.875rem;
  color: #666;
}

.footer-info {
  display: flex;
  justify-content: space-between;
}
</style>
