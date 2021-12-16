import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import LegalNotice from '../views/LegalNotice.vue';
import Lobby from '../views/Lobby.vue';
import PrivacyPolicy from '../views/PrivacyPolicy.vue';
import Room from '../views/Room.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'lobby',
    component: Lobby,
  },
  {
    path: '/room/:roomName',
    name: 'room',
    component: Room,
  },
  {
    path: '/legal-notice',
    name: 'legalNotice',
    component: LegalNotice,
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: PrivacyPolicy,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
