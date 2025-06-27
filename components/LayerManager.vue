<template>
  <div class="layer-manager">
    <h2>Layers</h2>
    <ul>
      <li
        v-for="(layer, index) in keymap.layers"
        :key="index"
        :class="{ active: index === selectedLayerIndex }"
        @click="$emit('update:selectedLayerIndex', index)"
      >
        {{ layer.label || `Layer ${index}` }}
      </li>
    </ul>
    <button @click="addLayer">Add Layer</button>
  </div>
</template>

<script setup lang="ts">
import { useKeymap } from '~/composables/useKeymap';

defineProps<{
  selectedLayerIndex: number;
}>();

defineEmits(['update:selectedLayerIndex']);

const { keymap, addLayer } = useKeymap();
</script>

<style scoped>
.layer-manager {
  padding: 1rem;
  background-color: #ffffff;
  height: 100%;
}

h2 {
  margin-top: 0;
  font-size: 1.25rem;
  color: #333;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  transition: background-color 0.2s;
}

li:hover {
  background-color: #f0f0f0;
}

li.active {
  background-color: #007bff;
  color: white;
  font-weight: bold;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
}

button:hover {
  background-color: #218838;
}
</style> 