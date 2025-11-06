import { createRouter, createWebHistory } from 'vue-router';
import SheetList from '../views/SheetList.vue';
import SheetEditor from '../views/SheetEditor.vue';

const routes = [
  {
    path: '/',
    name: 'SheetList',
    component: SheetList
  },
  {
    path: '/sheet/:id',
    name: 'SheetEditor',
    component: SheetEditor
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
