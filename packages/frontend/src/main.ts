import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faDoorOpen,
  faCheck,
  faPlus,
  faPlay,
  faRedo,
  faUndo,
  faSlidersH,
  faXmark,
  faArrowDown,
  faArrowUp,
  faLink,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/tailwind.css';

library.add(faDoorOpen);
library.add(faCheck);
library.add(faPlay);
library.add(faPlus);
library.add(faRedo);
library.add(faUndo);
library.add(faSlidersH);
library.add(faXmark);
library.add(faArrowDown);
library.add(faArrowUp);
library.add(faLink);


createApp(App).use(store).use(router).component('font-awesome-icon', FontAwesomeIcon).mount('#app');
