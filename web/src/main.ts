import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import '@/assets/tailwind.css';
import Toggle from '@/components/Toggle.vue';

Vue.config.productionTip = false;

Vue.component('toggle', Toggle);

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
