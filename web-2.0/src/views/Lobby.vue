<template>
  <div>
    <h1>Planning Poker</h1>
    <p>{{ greeting }}</p>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default class Lobby extends Vue {
  greeting = "Hello world!";
}
</script>
