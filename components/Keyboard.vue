<template>
  <div class="keyboard">
    <div v-for="(key, index) in kyriaLayout" :key="index" class="key-wrapper" :style="getKeyStyle(key)" @click="$emit('keyClick', index)">
      <Key :label="getKeyLabel(bindings[index])" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Key from './Key.vue';
import { kyriaLayout } from '~/data/kyria-layout';

defineProps<{
  bindings: readonly string[];
}>();

defineEmits(['keyClick']);

const KEY_UNIT_SIZE = 55; // size of a 1u key in pixels

const getKeyLabel = (binding: string): string => {
  if (!binding) return '';
  const parts = binding.split(' ');
  const behavior = parts[0];

  switch (behavior) {
    case 'kp':
    case 'sk':
      return parts[1] || '';
    case 'mo':
    case 'to':
    case 'tg':
      return parts.length > 1 ? `${behavior}(${parts[1]})` : behavior;
    case 'lt':
      return parts.length > 2 ? `${parts[1]}(${parts[2]})` : behavior;
    case 'mt':
    case 'hml':
    case 'hmr':
      return parts.length > 2 ? parts[2] : (parts.length > 1 ? parts[1] : behavior); // Display tap key
    case 'trans':
      return '▽'; // Transparent
    default:
      return binding;
  }
};

const getKeyStyle = (key: { x: number; y: number, w?: number, h?: number }) => {
  const width = (key.w || 1) * KEY_UNIT_SIZE - 5;
  const height = (key.h || 1) * KEY_UNIT_SIZE - 5;
  return {
    left: `${key.x * KEY_UNIT_SIZE}px`,
    top: `${key.y * KEY_UNIT_SIZE}px`,
    width: `${width}px`,
    height: `${height}px`,
  };
};
</script>

<style scoped>
.keyboard {
  position: relative;
  width: calc(16 * 55px); /* Approximate width */
  height: calc(5.5 * 55px); /* Approximate height */
  margin: 40px auto;
}
.key-wrapper {
  position: absolute;
  cursor: pointer;
  background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: monospace;
    font-size: 12px;
    user-select: none;
    transition: background-color 0.2s;
}

.key-wrapper:hover {
    background-color: #f0f0f0;
}
</style> 