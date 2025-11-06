<template>
  <div class="sheet-list-container">
    <header class="header">
      <h1>📊 LiveSheet</h1>
      <div class="user-info">
        <span>使用者: {{ currentUser }}</span>
        <button @click="showUserModal = true" class="btn-link">更改</button>
      </div>
    </header>

    <div class="content">
      <div class="toolbar">
        <button @click="showCreateModal = true" class="btn-primary">
          ➕ 新增 Sheet
        </button>
      </div>

      <div v-if="loading" class="loading">載入中...</div>

      <div v-else class="sheets-grid">
        <div
          v-for="sheet in sheets"
          :key="sheet.id"
          class="sheet-card"
          @click="openSheet(sheet.id)"
        >
          <div class="sheet-icon">📄</div>
          <h3 class="sheet-name">{{ sheet.name }}</h3>
          <div class="sheet-meta">
            <div>建立: {{ formatDate(sheet.createdAt) }}</div>
            <div>更新: {{ formatDate(sheet.updatedAt) }}</div>
          </div>
        </div>

        <div v-if="sheets.length === 0" class="empty-state">
          <p>尚無 Sheet，點擊「新增 Sheet」開始使用</p>
        </div>
      </div>
    </div>

    <!-- 建立 Sheet 的 Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal" @click.stop>
        <h2>建立新 Sheet</h2>
        <input
          v-model="newSheetName"
          type="text"
          placeholder="輸入 Sheet 名稱"
          class="input"
          @keyup.enter="createNewSheet"
        />
        <div class="modal-actions">
          <button @click="showCreateModal = false" class="btn-secondary">取消</button>
          <button @click="createNewSheet" class="btn-primary">建立</button>
        </div>
      </div>
    </div>

    <!-- 設定使用者名稱的 Modal -->
    <div v-if="showUserModal" class="modal-overlay" @click="showUserModal = false">
      <div class="modal" @click.stop>
        <h2>設定使用者名稱</h2>
        <input
          v-model="newUsername"
          type="text"
          placeholder="輸入你的名稱"
          class="input"
          @keyup.enter="updateUsername"
        />
        <div class="modal-actions">
          <button @click="showUserModal = false" class="btn-secondary">取消</button>
          <button @click="updateUsername" class="btn-primary">確定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getSheets, createSheet, getCurrentUser, setCurrentUser } from '../services/mockData';

const router = useRouter();
const sheets = ref([]);
const loading = ref(true);
const currentUser = ref('Guest');
const showCreateModal = ref(false);
const showUserModal = ref(false);
const newSheetName = ref('');
const newUsername = ref('');

onMounted(async () => {
  // 載入當前使用者
  currentUser.value = getCurrentUser();
  newUsername.value = currentUser.value;

  // 載入 Sheets
  sheets.value = await getSheets();
  loading.value = false;
});

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function openSheet(sheetId) {
  router.push(`/sheet/${sheetId}`);
}

async function createNewSheet() {
  if (!newSheetName.value.trim()) {
    alert('請輸入 Sheet 名稱');
    return;
  }

  const newSheet = await createSheet(newSheetName.value);
  sheets.value.push(newSheet);
  newSheetName.value = '';
  showCreateModal.value = false;
}

function updateUsername() {
  if (!newUsername.value.trim()) {
    alert('請輸入名稱');
    return;
  }

  setCurrentUser(newUsername.value);
  currentUser.value = newUsername.value;
  showUserModal.value = false;
}
</script>

<style scoped>
.sheet-list-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  margin: 0;
  color: #333;
  font-size: 1.8rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.toolbar {
  margin-bottom: 2rem;
}

.btn-primary {
  background: #4A90E2;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #357ABD;
}

.btn-secondary {
  background: #ddd;
  color: #333;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-link {
  background: none;
  border: none;
  color: #4A90E2;
  cursor: pointer;
  text-decoration: underline;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.sheets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.sheet-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.sheet-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.sheet-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.sheet-name {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.2rem;
}

.sheet-meta {
  font-size: 0.875rem;
  color: #666;
}

.sheet-meta div {
  margin-bottom: 0.25rem;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  color: #999;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  min-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal h2 {
  margin-top: 0;
  color: #333;
}

.input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
</style>
