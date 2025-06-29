import { ref, readonly } from 'vue';
import { defaultKeymap } from '~/data/default-kyria-keymap';
import { kyriaLayout } from '~/data/kyria-layout';
import { KeyboardBuilder, type Keyboard, type Key, keyboardToFlatArray } from './keyboard';

interface KeymapLayer {
  name: string;
  label: string;
  bindings: Keyboard;
}

interface Keymap {
  layers: KeymapLayer[];
  originalContent: string;
}

const keymap = ref<Keymap>({
  layers: [],
  originalContent: defaultKeymap,
});

function parseBindingsString(bindingsString: string): string[] {
  return bindingsString
    .replace(/&/g, '\n&')
    .split('\n')
    .map((b: string) => b.trim().replace(/\\/g, ''))
    .filter((b: string) => b && !b.startsWith('//'))
    .map((b: string) => b.replace(/^&/, '').trim());
}

function mapBindingsToKeyboard(bindings: string[]): Keyboard {
  const keys: Key[] = [];
  for (const binding of bindings) {
    const parts: string[] = binding.split(' ');
    const functionKey: string = parts[0];
    const keycode1: string = parts[1];
    const keycode2: string = parts[2] || '';

    const key: Key = parts.length > 2 ? {
      function: functionKey,
      keycode1: keycode1,
      keycode2: keycode2
    } : {
      function: functionKey,
      keycode: keycode1 || ''
    };
    keys.push(key);
  }
  const keyboard = new KeyboardBuilder().fillFromArray(keys).build();
  console.log(keyboard);
  return keyboard;
}

function parseKeymap(content: string): KeymapLayer[] {
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
      const bindingsArray = parseBindingsString(bindingsMatch[1]);
      const keyboard = mapBindingsToKeyboard(bindingsArray);
      layers.push({ 
        name: layerName, 
        label, 
        bindings: keyboard 
      });
    }
  }
  
  return layers;
}

function loadKeymap(content: string) {
  keymap.value.originalContent = content;
  keymap.value.layers = parseKeymap(content);
}

function addLayer() {
  const newLayer: KeymapLayer = {
    name: `layer_${keymap.value.layers.length}`,
    label: `Layer ${keymap.value.layers.length}`,
    bindings: new KeyboardBuilder().createEmptyKeyboard(),
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
    
    // Convert keyboard structure to flat array, then to bindings strings
    const flatKeys = keyboardToFlatArray(layer.bindings);
    const bindingsWithAmpersand = flatKeys.map((key: Key) => {
      if ('keycode1' in key && 'keycode2' in key) {
        // TabKey type
        return `&${key.function} ${key.keycode1} ${key.keycode2}`;
      } else {
        // DefaultKey type
        return `&${key.function} ${key.keycode || ''}`.trim();
      }
    });
    
    let newBindingsBlock = '';
    
    newBindingsBlock = '\n            ' + bindingsWithAmpersand.join(' ');

    newBindingsBlock += '\n        ';

    if (regex.test(newContent)) {
      newContent = newContent.replace(regex, `$1${newBindingsBlock}$2`);
    } else {
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
    updateKeyBinding: (layerIndex: number, keyIndex: number, key: Key) => {
        if (keymap.value.layers[layerIndex]) {
            const builder = new KeyboardBuilder()
                .fromKeyboard(keymap.value.layers[layerIndex].bindings)
                .setKeyAtIndex(keyIndex, key);
            keymap.value.layers[layerIndex].bindings = builder.build();
        }
    },
    // Helper function to get a key at a specific index from a layer
    getKeyAtIndex: (layerIndex: number, keyIndex: number): Key | null => {
        const layer = keymap.value.layers[layerIndex];
        if (!layer) return null;
        const builder = new KeyboardBuilder();
        return builder.getKeyAtIndex(layer.bindings, keyIndex);
    },
    // Helper function to convert layer bindings to flat array
    getLayerAsArray: (layerIndex: number): Key[] | null => {
        const layer = keymap.value.layers[layerIndex];
        if (!layer) return null;
        return keyboardToFlatArray(layer.bindings);
    },
    // Helper to convert any bindings array to Keyboard structure
    bindingsToKeyboard: mapBindingsToKeyboard
  };
}; 