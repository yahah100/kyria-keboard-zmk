import { ref, readonly } from 'vue';
import { defaultKeymap } from '~/data/default-kyria-keymap';
import { kyriaLayout } from '~/data/kyria-layout';

interface KeymapLayer {
  name: string;
  label: string;
  bindings: string[];
}

interface Keymap {
  layers: KeymapLayer[];
  originalContent: string;
}

const keymap = ref<Keymap>({
  layers: [],
  originalContent: defaultKeymap,
});

function parseKeymap(content: string) {
  const layerRegex = /(\w+)_layer\s*{((?:[^{}]*|\{[^{}]*\})*?)}/gs;
  const labelRegex = /label\s*=\s*"([^"]+)"/;
  const bindingsRegex = /bindings\s*=\s*<([^>]+)>/;

  const layers: KeymapLayer[] = [];
  let match;
  while ((match = layerRegex.exec(content)) !== null) {
    const layerName = `${match[1]}_layer`;
    const layerContent = match[2];

    const labelMatch = layerContent.match(labelRegex);
    const label = labelMatch ? labelMatch[1] : match[1];

    const bindingsMatch = layerContent.match(bindingsRegex);
    if (bindingsMatch) {
      const bindings = bindingsMatch[1]
        .replace(/&/g, '\n&')
        .split('\n')
        .map(b => b.trim().replace(/\\/g, ''))
        .filter(b => b && !b.startsWith('//'))
        .map(b => b.replace(/^&/, '').trim());
      
      layers.push({ name: layerName, label, bindings });
    }
  }
  return layers;
};

function loadKeymap(content: string) {
  keymap.value.originalContent = content;
  keymap.value.layers = parseKeymap(content);
}

function addLayer() {
  const numKeys = kyriaLayout.length;
  const newLayer: KeymapLayer = {
    name: `layer_${keymap.value.layers.length}`,
    label: `Layer ${keymap.value.layers.length}`,
    bindings: Array(numKeys).fill('trans'),
  };
  keymap.value.layers.push(newLayer);
}

const generateKeymapContent = (): string => {
  let newContent = keymap.value.originalContent;
  
  // This part is tricky. Adding a new layer to the .keymap file content
  // requires finding the end of the last layer and inserting the new one.
  // For now, let's focus on updating existing layers.
  
  for (const layer of keymap.value.layers) {
    const layerNameForRegex = layer.name.replace(/_layer$/, '');
    const regex = new RegExp(`(${layerNameForRegex}_layer\\s*{[^}]*bindings\\s*=\\s*<)[^>]+(>)`, 's');
    
    const bindingsWithAmpersand = layer.bindings.map(b => `&${b}`);
    let newBindingsBlock = '';
    
    // This logic seems specific to a certain layout, might need adjustment.
    // For now, just join them. A better way would be to format it nicely.
    newBindingsBlock = '\n            ' + bindingsWithAmpersand.join(' ');

    newBindingsBlock += '\n        ';

    if (regex.test(newContent)) {
      newContent = newContent.replace(regex, `$1${newBindingsBlock}$2`);
    } else {
        // This is a new layer, it needs to be added to the file content.
        // Let's find the `keymap {` block and insert it.
        const keymapRegex = /(keymap\s*{[^}]*)/s;
        const newLayerString = `
        ${layer.name} {
            label = "${layer.label}";
            bindings = <${newBindingsBlock}>;
        };
`;
        if(keymapRegex.test(newContent)) {
            newContent = newContent.replace(keymapRegex, `$1${newLayerString}`);
        }
    }
  }
  return newContent;
};

// Load default keymap on startup
loadKeymap(defaultKeymap);

export const useKeymap = () => {
  return {
    keymap: readonly(keymap),
    loadKeymap,
    addLayer,
    generateKeymapContent,
    updateKeyBinding: (layerIndex: number, keyIndex: number, binding: string) => {
        if (keymap.value.layers[layerIndex] && keymap.value.layers[layerIndex].bindings[keyIndex] !== undefined) {
            keymap.value.layers[layerIndex].bindings[keyIndex] = binding;
        }
    }
  };
}; 