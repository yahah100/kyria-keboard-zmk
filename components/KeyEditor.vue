<template>
  <div v-if="isOpen" class="editor-panel">
    <h3>Edit Key</h3>
    <div class="editor-mode-toggle">
      <span>Guided</span>
      <label class="switch">
        <input type="checkbox" v-model="isFreeTextMode">
        <span class="slider round"></span>
      </label>
      <span>Free Text</span>
    </div>

    <hr>

    <div v-if="isFreeTextMode">
      <textarea v-model="rawBinding" class="raw-textarea"></textarea>
    </div>

    <div v-else>
      <p>Layer: {{ layerName }}</p>
      <p>Key Index: {{ keyIndex }}</p>

      <div class="form-group">
        <label for="behavior-select">Behavior:</label>
        <select id="behavior-select" v-model="selectedBehavior" @change="onBehaviorChange">
          <option v-for="behavior in keyReference.behaviors" :key="behavior.name" :value="behavior.name">
            {{ behavior.name }} - {{ behavior.description }}
          </option>
        </select>
      </div>

      <div v-for="(param, index) in behaviorParams" :key="index" class="form-group">
        <label :for="`param-select-${index}`">{{ param.replace('_', ' ') }}:</label>
        <select :id="`param-select-${index}`" v-model="paramValues[index]">
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
      
      <p>New Binding: <code>{{ generatedBinding }}</code></p>
    </div>

    <div class="actions">
      <button @click="save" :disabled="isFreeTextMode ? !rawBinding : !generatedBinding">Save</button>
      <button @click="$emit('close')">Close</button>
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

const selectedBehavior = ref('&kp');
const behaviorParams = ref<string[]>([]);
const paramValues = ref<string[]>([]);

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
    selectedBehavior.value = '&kp';
    onBehaviorChange();
  }
}, { immediate: true });

const save = () => {
  emit('update-binding', {
    keyIndex: props.keyIndex,
    newBinding: isFreeTextMode.value ? rawBinding.value : generatedBinding.value,
  });
  emit('close');
};

watch(isOpen, (newVal) => {
    if(newVal) {
        onBehaviorChange();
        // Reset to guided mode on open
        isFreeTextMode.value = false;
    }
})

</script>

<style scoped>
.editor-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #333;
  color: #eee;
  padding: 20px;
  border: 1px solid #555;
  border-radius: 10px;
  z-index: 100;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  min-width: 500px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  text-transform: capitalize;
}

.form-group select {
  width: 100%;
  padding: 8px;
  background-color: #444;
  color: #eee;
  border: 1px solid #666;
  border-radius: 4px;
}

.actions {
  margin-top: 15px;
}

.actions button {
  margin-right: 10px;
}

.editor-mode-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.raw-textarea {
  width: 100%;
  height: 80px;
  background-color: #222;
  color: #eee;
  border: 1px solid #666;
  border-radius: 4px;
  padding: 10px;
  font-family: monospace;
}

hr {
  border: 1px solid #555;
  margin: 15px 0;
}

/* The switch - https://www.w3schools.com/howto/howto_css_switch.asp */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
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
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

</style> 