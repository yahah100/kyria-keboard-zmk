import { ref } from 'vue';

export const useKeymap = () => {
  const keymap = ref(null);

  const parseKeymap = (content: string) => {
    const layerRegex = /(\w+)_layer\s*{[^}]*bindings\s*=\s*<([^>]+)>/gs;
    let match;
    const layers: { name: string, bindings: string[] }[] = [];
    while ((match = layerRegex.exec(content)) !== null) {
      const layerName = match[1];
      const bindings = match[2]
        .replace(/&/g, '\n&')
        .split('\n')
        .map(b => b.trim().replace(/\\/g, ''))
        .filter(b => b && !b.startsWith('//'));
      
      const cleanedBindings = bindings.map(b => b.replace(/&/g, '').trim().split(/\s+/).join(' '));

      layers.push({ name: `${layerName}_layer`, bindings: cleanedBindings });
    }
    return layers;
  };

  const generateKeymapContent = (layers: { name: string, bindings: string[] }[], originalContent: string): string => {
    let newContent = originalContent;
    for (const layer of layers) {
      const layerNameForRegex = layer.name.replace(/_layer$/, '');
      const regex = new RegExp(`(${layerNameForRegex}_layer\\s*{[^}]*bindings\\s*=\\s*<)[^>]+(>)`, 's');
      
      const bindingsWithAmpersand = layer.bindings.map(b => `&${b}`);
      let newBindingsBlock = '';
      // Group bindings for readability in the exported file
      for (let i = 0; i < bindingsWithAmpersand.length; i += 10) {
          newBindingsBlock += '\n            ' + bindingsWithAmpersand.slice(i, i + 10).join(' ');
      }
      newBindingsBlock += '\n        ';

      if (regex.test(newContent)) {
        newContent = newContent.replace(regex, `$1${newBindingsBlock}$2`);
      }
    }
    return newContent;
  };

  return {
    keymap,
    parseKeymap,
    generateKeymapContent,
  };
}; 