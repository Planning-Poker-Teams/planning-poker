<template>
  <a class="cursor-pointer" :title="linkTooltip" @click="$emit('onClick', column)">
    <font-awesome-icon v-if="activeCol === column" :icon="`arrow-${activeDir}`" class="mr-2" />
    <slot></slot>
  </a>
</template>

<script setup lang="ts">
import {computed} from 'vue';

const props = defineProps({
  column: {
    type: String,
    required: true,
  },
  activeDir: {
    type: String,
    required: true,
    validator(value) {
      return ['up', 'down'].includes(`${value}`);
    },
  },
  activeCol: {
    type: String,
    required: true,
  },
});

const linkTooltip = computed(
  () => `Sort column in ${props.activeDir === 'up' ? 'descending' : 'ascending'} order`
);

defineEmits(['onClick']);
</script>
