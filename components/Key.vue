<template>
  <div 
    class="key" 
    :data-tooltip="label"
    :class="{ 'show-tooltip': isTextTruncated }"
    ref="keyElement"
  >
    <span class="key-text" ref="textElement">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

defineProps<{
  label: string;
}>();

const keyElement = ref<HTMLElement>();
const textElement = ref<HTMLElement>();
const isTextTruncated = ref(false);

const checkTextOverflow = () => {
  if (textElement.value && keyElement.value) {
    const textWidth = textElement.value.scrollWidth;
    const containerWidth = textElement.value.clientWidth;
    isTextTruncated.value = textWidth > containerWidth;
  }
};

onMounted(() => {
  nextTick(() => {
    checkTextOverflow();
  });
});
</script>

<style scoped>
.key {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  border: 1px solid #b0b0b0;
  border-radius: 8px;
  background: linear-gradient(145deg, #ffffff, #e6e6e6);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 2px rgba(255, 255, 255, 0.8);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.1s ease;
  position: relative;
}

.key.show-tooltip::before {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  pointer-events: none;
  z-index: 1000;
  margin-bottom: 5px;
}

.key.show-tooltip::after {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.9);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  pointer-events: none;
  z-index: 1000;
  margin-bottom: 1px;
}

.key.show-tooltip:hover::before,
.key.show-tooltip:hover::after {
  opacity: 1;
  visibility: visible;
}

.key:hover {
  background: linear-gradient(145deg, #f5f5f5, #e0e0e0);
  transform: translateY(-1px);
  box-shadow: 
    0 3px 6px rgba(0, 0, 0, 0.15),
    inset 0 1px 2px rgba(255, 255, 255, 0.8);
}

.key:active {
  transform: translateY(1px);
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.2),
    inset 0 1px 3px rgba(0, 0, 0, 0.1);
  background: linear-gradient(145deg, #e0e0e0, #d0d0d0);
}

.key-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90%;
  text-align: center;
  line-height: 1;
}
</style> 