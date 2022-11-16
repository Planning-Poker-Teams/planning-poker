import { createApp, VueElement } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/tailwind.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faDoorOpen, faCheck, faPlay, faRedo, faSlidersH } from '@fortawesome/free-solid-svg-icons';

library.add(faDoorOpen);
library.add(faCheck);
library.add(faPlay);
library.add(faRedo);
library.add(faSlidersH);

createApp(App).use(store).use(router).component('font-awesome-icon', FontAwesomeIcon).mount('#app');
