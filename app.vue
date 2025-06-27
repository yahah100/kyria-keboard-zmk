<template>
  <div id="app-container">
    <header>
      <h1>ZMK Keymap Visual Editor</h1>
      <div class="controls">
        <input type="file" ref="fileInput" @change="handleFileSelected" style="display: none" accept=".keymap" />
        <button @click="handleImportClick" class="control-btn">Import Keymap</button>
        <button @click="downloadKeymap" class="control-btn">Download Keymap</button>
      </div>
    </header>
    <main>
      <aside class="sidebar">
        <LayerManager
          :selected-layer-index="selectedLayerIndex"
          @update:selected-layer-index="selectedLayerIndex = $event"
        />
      </aside>
      <div class="keyboard-view">
        <transition name="fade" mode="out-in">
          <Keyboard
            :key="selectedLayerIndex"
            v-if="selectedLayer"
            :bindings="selectedLayer.bindings"
            @key-click="openEditor"
          />
        </transition>
      </div>
    </main>
    <KeyEditor
      v-if="selectedLayer"
      :is-open="isEditorOpen"
      :layer-name="selectedLayer.label"
      :key-index="selectedKeyIndex"
      :current-binding="selectedKeyBinding"
      :available-layers="keymap.layers.map(l => l.label)"
      @close="isEditorOpen = false"
      @update-binding="updateBinding"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Keyboard from '~/components/Keyboard.vue';
import KeyEditor from '~/components/KeyEditor.vue';
import LayerManager from '~/components/LayerManager.vue';
import { useKeymap } from '~/composables/useKeymap';

const { keymap, loadKeymap, generateKeymapContent, updateKeyBinding } = useKeymap();

const selectedLayerIndex = ref(0);
const isEditorOpen = ref(false);
const selectedKeyIndex = ref(0);
const fileInput = ref<HTMLInputElement | null>(null);

const selectedLayer = computed(() => {
  return keymap.value.layers[selectedLayerIndex.value];
});

const selectedKeyBinding = computed(() => {
  return selectedLayer.value?.bindings[selectedKeyIndex.value] || '';
});

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
    loadKeymap(content);
    selectedLayerIndex.value = 0; // Reset to default layer
  };
  reader.readAsText(file);
};

const openEditor = (keyIndex: number) => {
  selectedKeyIndex.value = keyIndex;
  isEditorOpen.value = true;
};

const updateBinding = (payload: { keyIndex: number; newBinding: string }) => {
  updateKeyBinding(selectedLayerIndex.value, payload.keyIndex, payload.newBinding);
};

const downloadKeymap = () => {
  const newContent = generateKeymapContent();
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

<style>
:root {
  --header-height: 60px;
  --sidebar-width: 250px;
}

body {
  background-color: #f0f2f5;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: #333;
}

#app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  height: var(--header-height);
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

header h1 {
  font-size: 1.5rem;
  margin: 0;
}

.controls .control-btn {
  margin-left: 10px;
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.controls .control-btn:hover {
  background-color: #0056b3;
}

main {
  display: flex;
  flex-grow: 1;
  overflow: hidden;
}

.keyboard-view {
  flex-grow: 1;
  overflow-y: auto;
  padding: 2rem;
}

.sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  background-color: #fafafa;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
