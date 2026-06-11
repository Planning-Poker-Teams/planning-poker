import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowDown,
  faArrowUp,
  faChartPie,
  faCheck,
  faCoins,
  faDoorOpen,
  faLink,
  faMagnifyingGlass,
  faPenToSquare,
  faPlay,
  faPlus,
  faSlidersH,
  faUndo,
  faUsers,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/tailwind.css';

library.add(faArrowDown);
library.add(faArrowUp);
library.add(faChartPie);
library.add(faCheck);
library.add(faCoins);
library.add(faDoorOpen);
library.add(faLink);
library.add(faMagnifyingGlass);
library.add(faPenToSquare);
library.add(faPlay);
library.add(faPlus);
library.add(faSlidersH);
library.add(faUndo);
library.add(faUsers);
library.add(faXmark);

createApp(App).use(store).use(router).component('font-awesome-icon', FontAwesomeIcon).mount('#app');
