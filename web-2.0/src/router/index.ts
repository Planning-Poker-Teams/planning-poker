import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Lobby from "../views/Lobby.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Lobby",
    component: Lobby,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
