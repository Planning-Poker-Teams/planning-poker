<template>
  <div class="w-full lg:w-2/3 h-full flex-none text-white p-6">
    <a href="/">
      <img
        class="m-5 ml-0 object-contain h-24 shadow-md rounded-lg"
        alt="Planning Poker App logo"
        src="../assets/planning-poker-app-icon.png"
      />
    </a>
    <div class="text-base">
      <h1 class="text-3xl mb-6">Legal notice</h1>
      <h2 class="text-xl font-bold">Headquarters</h2>
      <p class="mb-8">
        codecentric AG<br />
        Hochstrasse 11<br />
        42697 Solingen<br />
        Phone: +49 (0) 212 23 36 28 0<br />
        Fax: +49 (0) 212 23 36 28 79<br />
        Email:
        <a class="underline" href="mailto:info@codecentric.de"
          >info@codecentric.de</a
        ><br />
      </p>
      <h2 class="text-xl font-bold">Board of Directors</h2>
      <p class="mb-8">
        Michael Hochgürtel<br />
        Ulrich Kühn<br />
        Rainer Vehns<br />
      </p>
      <h2 class="text-xl font-bold">Commercial Registry</h2>
      <p class="mb-8">
        District Court Wuppertal, HRB 25917
      </p>
      <h2 class="text-xl font-bold">VAT ID</h2>
      <p class="mb-8">
        DE 119437798
      </p>
      <h2 class="text-xl font-bold">Content Responsibility</h2>
      <p class="mb-8">
        Rainer Vehns, according to §6 MDStV
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component
export default class Imprint extends Vue {}
</script>
