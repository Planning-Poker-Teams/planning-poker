import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Lobby from '../views/Lobby.vue';
import Room from '../views/Room.vue';
import Imprint from '../views/Imprint.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
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
    path: '/imprint',
    name: 'imprint',
    component: Imprint,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
