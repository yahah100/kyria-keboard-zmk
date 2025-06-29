<template>
  <div class="keyboard">
    <div v-for="(key, index) in kyriaLayout" :key="index" class="key-wrapper" :style="getKeyStyle(key)" @click="$emit('keyClick', index)">
      <Key :label="getKeyLabel(flatBindings[index])" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Key from './Key.vue';
import { kyriaLayout } from '~/data/kyria-layout';
import { keyboardToFlatArray, type Keyboard, type Key as KeyType } from '~/composables/keyboard';

const props = defineProps<{
  bindings: Keyboard;
}>();

defineEmits(['keyClick']);

const KEY_UNIT_SIZE = 55; // size of a 1u key in pixels

// Convert the keyboard structure to a flat array for easier access
const flatBindings = computed(() => {
  return keyboardToFlatArray(props.bindings);
});

const getKeyLabel = (key: KeyType): string => {
  if (!key) return '';
  
  const behavior = key.function;
  switch (behavior) {
    case 'kp':
    case 'sk':
      return ('keycode' in key) ? key.keycode : '';
    case 'mo':
    case 'to':
    case 'tg':
      return ('keycode' in key) ? `${behavior}(${key.keycode})` : behavior;
    case 'lt':
      return ('keycode1' in key && 'keycode2' in key) ? `${key.keycode1}(${key.keycode2})` : behavior;
    case 'mt':
    case 'hml':
    case 'hmr':
      // Display tap key for hold-tap behaviors
      return ('keycode1' in key && 'keycode2' in key) ? `${key.keycode2}(${key.keycode1})` : behavior;
    case 'trans':
      return '▽'; // Transparent
    default:
      return ('keycode' in key) ? key.keycode : behavior;
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