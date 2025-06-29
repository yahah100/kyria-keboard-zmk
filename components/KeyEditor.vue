<template>
  <div v-if="isOpen" class="editor-overlay" @click="handleOverlayClick">
    <div class="editor-panel" @click.stop>
      <!-- Header with close button -->
      <div class="editor-header">
        <h3>Edit Key</h3>
        <button class="close-button" @click="$emit('close')" aria-label="Close editor">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- Key Information -->
      <div class="key-info">
        <div class="key-details">
          <span class="key-label">Layer:</span>
          <span class="key-value">{{ layerName }}</span>
        </div>
        <div class="key-details">
          <span class="key-label">Position:</span>
          <span class="key-value">{{ keyIndex }}</span>
        </div>
        <div class="key-details">
          <span class="key-label">Current Binding:</span>
          <code class="key-value current-binding">{{ currentBinding || 'No binding' }}</code>
        </div>
      </div>

      <!-- Mode Toggle -->
      <div class="editor-mode-toggle">
        <span :class="{ active: !isFreeTextMode }">Guided</span>
        <label class="switch">
          <input type="checkbox" v-model="isFreeTextMode">
          <span class="slider round"></span>
        </label>
        <span :class="{ active: isFreeTextMode }">Free Text</span>
      </div>

      <!-- Editor Content -->
      <div class="editor-content">
        <div v-if="isFreeTextMode" class="free-text-section">
          <label for="raw-binding">Raw Binding:</label>
          <textarea 
            id="raw-binding"
            v-model="rawBinding" 
            class="raw-textarea"
            placeholder="Enter raw binding (e.g. 'kp A' or 'mo 1')"
          ></textarea>
        </div>

        <div v-else class="guided-section">
          <!-- Behavior Selection -->
          <div class="form-group">
            <label for="behavior-select">Behavior:</label>
            <select id="behavior-select" v-model="selectedBehavior" @change="onBehaviorChange">
              <option value="" disabled>Select a behavior</option>
              <option v-for="behavior in keyReference.behaviors" :key="behavior.name" :value="behavior.name">
                {{ behavior.name }} - {{ behavior.description }}
              </option>
            </select>
          </div>

          <!-- Parameters -->
          <div v-for="(param, index) in behaviorParams" :key="index" class="form-group">
            <label :for="`param-select-${index}`">{{ formatParamName(param) }}:</label>
            <select :id="`param-select-${index}`" v-model="paramValues[index]">
              <option value="" disabled>Select {{ formatParamName(param) }}</option>
              <option v-if="param === 'layer'" v-for="layer in availableLayers" :key="layer" :value="layer.replace('_layer','').toUpperCase()">
                {{ layer }}
              </option>
              <template v-if="param === 'keycode' || param === 'modifier'">
                <optgroup v-for="(codes, category) in keyReference.keycodes" :label="category">
                  <option v-for="code in codes" :key="code.name" :value="code.name">
                    {{ code.name }} - {{ code.description }}
                  </option>
                </optgroup>
              </template>
              <template v-if="isParameterType(param)">
                <option v-for="p in keyReference.parameters[param]" :key="p.name" :value="p.name">
                  {{ p.name }} - {{ p.description }}
                </option>
              </template>
            </select>
          </div>
          
          <!-- Preview -->
          <div v-if="generatedBinding" class="binding-preview">
            <span class="preview-label">New Binding:</span>
            <code class="preview-binding">{{ generatedBinding }}</code>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions">
        <button 
          @click="save" 
          :disabled="isFreeTextMode ? !rawBinding.trim() : !generatedBinding"
          class="save-button"
        >
          Save Changes
        </button>
        <button @click="$emit('close')" class="cancel-button">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs, watch, computed } from 'vue';
import keyReference from '~/data/zmk-key-reference.json';

type ParameterType = keyof typeof keyReference.parameters;

const isParameterType = (param: any): param is ParameterType => {
  return Object.keys(keyReference.parameters).includes(param);
}

const props = defineProps<{
  isOpen: boolean;
  layerName: string;
  keyIndex: number;
  currentBinding: string;
  availableLayers: string[];
}>();

const emit = defineEmits(['close', 'update-binding']);

const { isOpen, currentBinding } = toRefs(props);

const isFreeTextMode = ref(false);
const rawBinding = ref('');

const selectedBehavior = ref('');
const behaviorParams = ref<string[]>([]);
const paramValues = ref<string[]>([]);

const formatParamName = (param: string) => {
  return param.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const handleOverlayClick = () => {
  emit('close');
};

const onBehaviorChange = () => {
  const behavior = keyReference.behaviors.find(b => b.name === selectedBehavior.value);
  if (behavior) {
    behaviorParams.value = behavior.params;
    paramValues.value = new Array(behavior.params.length).fill('');
  }
};

const generatedBinding = computed(() => {
  if (!selectedBehavior.value) return '';
  const behavior = keyReference.behaviors.find(b => b.name === selectedBehavior.value);
  if (!behavior) return '';

  const allParamsFilled = paramValues.value.every(p => p !== '');
  if (paramValues.value.length !== behavior.params.length || !allParamsFilled) {
    return '';
  }

  const parts = [selectedBehavior.value.replace('&',''), ...paramValues.value];
  return parts.join(' ');
});

watch(currentBinding, (newVal) => {
  rawBinding.value = newVal;
  const parts = newVal.split(' ');
  const behaviorName = `&${parts[0]}`;
  const behavior = keyReference.behaviors.find(b => b.name === behaviorName);
  
  if (behavior) {
    selectedBehavior.value = behaviorName;
    behaviorParams.value = behavior.params;
    paramValues.value = parts.slice(1);
  } else {
    selectedBehavior.value = '';
    behaviorParams.value = [];
    paramValues.value = [];
  }
}, { immediate: true });

const save = () => {
  emit('update-binding', {
    keyIndex: props.keyIndex,
    newBinding: isFreeTextMode.value ? rawBinding.value.trim() : generatedBinding.value,
  });
  emit('close');
};

watch(isOpen, (newVal) => {
  if(newVal) {
    // Reset to guided mode on open
    isFreeTextMode.value = false;
  }
});
</script>

<style scoped>
.editor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.editor-panel {
  background-color: #2a2a2a;
  color: #eee;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  min-width: 500px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #444;
  margin-bottom: 20px;
}

.editor-header h3 {
  margin: 0;
  color: #fff;
  font-size: 1.2em;
}

.close-button {
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-button:hover {
  color: #fff;
  background-color: #444;
}

.key-info {
  padding: 0 20px;
  margin-bottom: 20px;
  background-color: #1e1e1e;
  border-radius: 8px;
  margin: 0 20px 20px 20px;
  padding: 15px;
}

.key-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.key-details:last-child {
  margin-bottom: 0;
}

.key-label {
  font-weight: 600;
  color: #bbb;
}

.key-value {
  color: #fff;
}

.current-binding {
  background-color: #333;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9em;
}

.editor-mode-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin: 0 20px 20px 20px;
  padding: 15px;
  background-color: #1e1e1e;
  border-radius: 8px;
}

.editor-mode-toggle span {
  font-weight: 500;
  color: #aaa;
  transition: color 0.2s;
}

.editor-mode-toggle span.active {
  color: #fff;
}

.editor-content {
  padding: 0 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #ddd;
}

.form-group select {
  width: 100%;
  padding: 10px;
  background-color: #333;
  color: #eee;
  border: 1px solid #555;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group select:focus {
  outline: none;
  border-color: #2196F3;
}

.raw-textarea {
  width: 100%;
  height: 100px;
  background-color: #1e1e1e;
  color: #eee;
  border: 1px solid #555;
  border-radius: 6px;
  padding: 12px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  resize: vertical;
  transition: border-color 0.2s;
}

.raw-textarea:focus {
  outline: none;
  border-color: #2196F3;
}

.binding-preview {
  background-color: #1e1e1e;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #2196F3;
}

.preview-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #ddd;
}

.preview-binding {
  background-color: #333;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  color: #4CAF50;
}

.actions {
  padding: 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  border-top: 1px solid #444;
  margin-top: 20px;
}

.save-button {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.save-button:hover:not(:disabled) {
  background-color: #1976D2;
}

.save-button:disabled {
  background-color: #666;
  cursor: not-allowed;
}

.cancel-button {
  background-color: transparent;
  color: #ccc;
  border: 1px solid #555;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.cancel-button:hover {
  background-color: #444;
  color: #fff;
}

/* Switch styles */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #666;
  transition: .3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:checked + .slider:before {
  transform: translateX(26px);
}
</style> 