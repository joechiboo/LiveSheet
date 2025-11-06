<template>
  <div class="grid-container">
    <table class="grid-table">
      <thead>
        <tr>
          <th class="row-header"></th>
          <th v-for="col in cols" :key="col" class="col-header">
            {{ getColLabel(col) }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row">
          <td class="row-header">{{ row }}</td>
          <td
            v-for="col in cols"
            :key="`${row}-${col}`"
            :class="['cell', { 'cell-focused': isFocused(row, col) }]"
            @click="focusCell(row, col)"
          >
            <input
              v-if="isFocused(row, col)"
              ref="cellInput"
              v-model="editingValue"
              type="text"
              class="cell-input"
              @blur="finishEdit"
              @keyup.enter="finishEdit"
              @keyup.esc="cancelEdit"
            />
            <span v-else class="cell-value">
              {{ getCellValue(row, col) }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue';
import { getCurrentUser } from '../services/mockData';

const props = defineProps({
  cells: {
    type: Object,
    required: true
  },
  rows: {
    type: Number,
    default: 20
  },
  cols: {
    type: Number,
    default: 10
  }
});

const emit = defineEmits(['updateCell']);

const focusedRow = ref(null);
const focusedCol = ref(null);
const editingValue = ref('');
const cellInput = ref(null);

// 將列數字轉換為字母 (0 -> A, 1 -> B, ...)
function getColLabel(colIndex) {
  let label = '';
  let num = colIndex;
  while (num >= 0) {
    label = String.fromCharCode(65 + (num % 26)) + label;
    num = Math.floor(num / 26) - 1;
  }
  return label;
}

function getCellValue(row, col) {
  const key = `${row}-${col}`;
  return props.cells[key]?.value || '';
}

function isFocused(row, col) {
  return focusedRow.value === row && focusedCol.value === col;
}

async function focusCell(row, col) {
  focusedRow.value = row;
  focusedCol.value = col;
  editingValue.value = getCellValue(row, col);

  await nextTick();
  if (cellInput.value && cellInput.value[0]) {
    cellInput.value[0].focus();
    cellInput.value[0].select();
  }
}

function finishEdit() {
  if (focusedRow.value !== null && focusedCol.value !== null) {
    const oldValue = getCellValue(focusedRow.value, focusedCol.value);

    // 只有在值改變時才發送更新
    if (editingValue.value !== oldValue) {
      emit('updateCell', {
        row: focusedRow.value,
        col: focusedCol.value,
        value: editingValue.value,
        userName: getCurrentUser()
      });
    }

    focusedRow.value = null;
    focusedCol.value = null;
  }
}

function cancelEdit() {
  focusedRow.value = null;
  focusedCol.value = null;
  editingValue.value = '';
}
</script>

<style scoped>
.grid-container {
  overflow: auto;
  border: 1px solid #ddd;
  background: white;
}

.grid-table {
  border-collapse: collapse;
  width: 100%;
  table-layout: fixed;
}

.row-header,
.col-header {
  background: #f0f0f0;
  border: 1px solid #ddd;
  padding: 0.5rem;
  text-align: center;
  font-weight: bold;
  color: #666;
  min-width: 50px;
  font-size: 0.875rem;
}

.row-header {
  width: 50px;
  position: sticky;
  left: 0;
  z-index: 10;
}

.col-header {
  position: sticky;
  top: 0;
  z-index: 5;
  min-width: 100px;
}

.cell {
  border: 1px solid #ddd;
  padding: 0;
  height: 32px;
  position: relative;
  cursor: cell;
  background: white;
}

.cell:hover {
  background: #f9f9f9;
}

.cell-focused {
  outline: 2px solid #4A90E2;
  background: white;
  z-index: 1;
}

.cell-value {
  display: block;
  padding: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-input {
  width: 100%;
  height: 100%;
  border: none;
  padding: 0.5rem;
  font-size: 1rem;
  outline: none;
  box-sizing: border-box;
}
</style>
