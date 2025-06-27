<template>
  <div class="keyboard-container">
    <div class="controls">
      <div class="layer-selector">
        <button v-for="(layer, index) in layers" :key="layer.name" @click="selectedLayerIndex = index" :class="{ active: selectedLayerIndex === index }">
          {{ layer.name }}
        </button>
      </div>
      <div>
        <input type="file" ref="fileInput" @change="handleFileSelected" style="display: none" accept=".keymap">
        <button @click="handleImportClick" class="import-btn">Import Keymap</button>
        <button @click="downloadKeymap" class="download-btn">Download Keymap</button>
      </div>
    </div>
    <div class="keyboard">
      <div v-for="(key, index) in kyriaLayout" :key="index" class="key-wrapper" :style="getKeyStyle(key)" @click="openEditor(index)">
        <Key :label="getKeyLabel(index)" />
      </div>
    </div>
    <KeyEditor
      :is-open="isEditorOpen"
      :layer-name="selectedLayer.name"
      :key-index="selectedKeyIndex"
      :current-binding="selectedKeyBinding"
      :available-layers="layers.map(l => l.name)"
      @close="isEditorOpen = false"
      @update-binding="updateBinding"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import Key from './Key.vue';
import KeyEditor from './KeyEditor.vue';
import { useKeymap } from '~/composables/useKeymap';
import { kyriaLayout } from '~/data/kyria-layout';
import { defaultKeymap } from '~/data/default-kyria-keymap';

const { parseKeymap, generateKeymapContent } = useKeymap();
const keymapContent = ref(defaultKeymap);
const layers = ref<{ name: string; bindings: string[] }[]>([]);
const selectedLayerIndex = ref(0);
const KEY_UNIT_SIZE = 55; // size of a 1u key in pixels
const isEditorOpen = ref(false);
const selectedKeyIndex = ref(0);
const fileInput = ref<HTMLInputElement | null>(null);

const handleImportClick = () => {
  fileInput.value?.click();
};

const handleFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    keymapContent.value = content;
    layers.value = parseKeymap(content);
    selectedLayerIndex.value = 0; // Reset to default layer
  };
  reader.readAsText(file);
};

onMounted(() => {
  layers.value = parseKeymap(keymapContent.value);
  console.log(layers.value);
});

const selectedLayer = computed(() => {
  if (!layers.value[selectedLayerIndex.value]) {
    return { name: '', bindings: [] };
  }
  return layers.value[selectedLayerIndex.value];
});

const selectedKeyBinding = computed(() => {
  if (selectedLayer.value && selectedLayer.value.bindings[selectedKeyIndex.value]) {
    return selectedLayer.value.bindings[selectedKeyIndex.value];
  }
  return '';
});

const getKeyLabel = (keyIndex: number): string => {
  if (selectedLayer.value && selectedLayer.value.bindings[keyIndex]) {
    const binding = selectedLayer.value.bindings[keyIndex];
    const parts = binding.split(' ');
    const behavior = parts[0];

    switch (behavior) {
      case 'kp':
      case 'sk':
        return parts[1];
      case 'mo':
      case 'to':
      case 'tg':
        return `${behavior}(${parts[1]})`;
      case 'lt':
        return `${parts[1]}(${parts[2]})`;
      case 'mt':
      case 'hml':
      case 'hmr':
        return parts.length > 2 ? parts[2] : parts[1]; // Display tap key
      case 'trans':
        return '▽'; // Transparent
      default:
        return binding;
    }
  }
  return '';
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

const openEditor = (keyIndex: number) => {
  selectedKeyIndex.value = keyIndex;
  isEditorOpen.value = true;
};

const updateBinding = (payload: { keyIndex: number; newBinding: string }) => {
  const layer = layers.value[selectedLayerIndex.value];
  if (layer && layer.bindings[payload.keyIndex]) {
    layer.bindings[payload.keyIndex] = payload.newBinding;
  }
};

const downloadKeymap = () => {
  const newContent = generateKeymapContent(layers.value, keymapContent.value);
  const blob = new Blob([newContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'kyria_rev3_configured.keymap';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

</script>

<style scoped>
.keyboard-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.layer-selector {
  margin-bottom: 20px;
}
.layer-selector button {
  padding: 10px 20px;
  margin: 0 5px;
  border: 1px solid #ccc;
  background-color: #fff;
  cursor: pointer;
}
.layer-selector button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}
.download-btn, .import-btn {
  margin-left: 10px;
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.download-btn:hover {
  background-color: #218838;
}
.keyboard {
  position: relative;
  width: calc(16 * 55px); /* Approximate width */
  height: calc(5.5 * 55px); /* Approximate height */
  margin-top: 20px;
}
.key-wrapper {
  position: absolute;
  cursor: pointer;
}
</style> 