type DefaultKey = {
    function: string;
    keycode: string;
}

type TabKey = {
    function: string;
    keycode1: string;
    keycode2: string;
}

export type Key = DefaultKey | TabKey;


type SixKeys = [Key, Key, Key, Key, Key, Key];
type EightKeys = [Key, Key, Key, Key, Key, Key, Key, Key];
type FiveKeys = [Key, Key, Key, Key, Key];

type splitKeyboard = {
    firstRow: SixKeys;
    secondRow: SixKeys;
    thirdRow: EightKeys;
    fourthRow: FiveKeys;
}

export type Keyboard = {
    left: splitKeyboard;
    right: splitKeyboard;
}

export class KeyboardBuilder {
    private keyboard: Keyboard;

    constructor() {
        this.keyboard = this.createEmptyKeyboard();
    }

    /**
     * Creates a keyboard with all keys set to "trans" (transparent/empty)
     */
    createEmptyKeyboard(): Keyboard {
        const transKey: Key = { function: "trans", keycode: "" };
        
        return {
            left: {
                firstRow: [transKey, transKey, transKey, transKey, transKey, transKey],
                secondRow: [transKey, transKey, transKey, transKey, transKey, transKey],
                thirdRow: [transKey, transKey, transKey, transKey, transKey, transKey, transKey, transKey],
                fourthRow: [transKey, transKey, transKey, transKey, transKey]
            },
            right: {
                firstRow: [transKey, transKey, transKey, transKey, transKey, transKey],
                secondRow: [transKey, transKey, transKey, transKey, transKey, transKey],
                thirdRow: [transKey, transKey, transKey, transKey, transKey, transKey, transKey, transKey],
                fourthRow: [transKey, transKey, transKey, transKey, transKey]
            }
        };
    }

    /**
     * Fills the keyboard with keys from a flat array
     * Distribution: left.firstRow (0-5), right.firstRow (6-11), left.secondRow (12-17), 
     * right.secondRow (18-23), left.thirdRow (24-31), right.thirdRow (32-39), 
     * left.fourthRow (40-44), right.fourthRow (45-49)
     */
    fillFromArray(keys: Key[]): KeyboardBuilder {
        if (keys.length !== 50) {
            throw new Error(`Expected 50 keys, got ${keys.length}`);
        }

        // Left first row (6 keys: 0-5)
        for (let i = 0; i < 6; i++) {
            this.keyboard.left.firstRow[i] = keys[i];
        }

        // Right first row (6 keys: 6-11)
        for (let i = 0; i < 6; i++) {
            this.keyboard.right.firstRow[i] = keys[6 + i];
        }

        // Left second row (6 keys: 12-17)
        for (let i = 0; i < 6; i++) {
            this.keyboard.left.secondRow[i] = keys[12 + i];
        }

        // Right second row (6 keys: 18-23)
        for (let i = 0; i < 6; i++) {
            this.keyboard.right.secondRow[i] = keys[18 + i];
        }

        // Left third row (8 keys: 24-31)
        for (let i = 0; i < 8; i++) {
            this.keyboard.left.thirdRow[i] = keys[24 + i];
        }

        // Right third row (8 keys: 32-39)
        for (let i = 0; i < 8; i++) {
            this.keyboard.right.thirdRow[i] = keys[32 + i];
        }

        // Left fourth row (5 keys: 40-44)
        for (let i = 0; i < 5; i++) {
            this.keyboard.left.fourthRow[i] = keys[40 + i];
        }

        // Right fourth row (5 keys: 45-49)
        for (let i = 0; i < 5; i++) {
            this.keyboard.right.fourthRow[i] = keys[45 + i];
        }

        return this;
    }

    /**
     * Converts a keyboard structure back to a flat array of keys
     */
    toFlatArray(keyboard: Keyboard): Key[] {
        const keys: Key[] = [];
        
        // Left first row (0-5)
        keys.push(...keyboard.left.firstRow);
        // Right first row (6-11)
        keys.push(...keyboard.right.firstRow);
        // Left second row (12-17)
        keys.push(...keyboard.left.secondRow);
        // Right second row (18-23)
        keys.push(...keyboard.right.secondRow);
        // Left third row (24-31)
        keys.push(...keyboard.left.thirdRow);
        // Right third row (32-39)
        keys.push(...keyboard.right.thirdRow);
        // Left fourth row (40-44)
        keys.push(...keyboard.left.fourthRow);
        // Right fourth row (45-49)
        keys.push(...keyboard.right.fourthRow);
        
        return keys;
    }

    /**
     * Gets a key at a specific flat index (0-49)
     */
    getKeyAtIndex(keyboard: Keyboard, index: number): Key | null {
        if (index < 0 || index >= 50) return null;
        const flatArray = this.toFlatArray(keyboard);
        return flatArray[index];
    }

    /**
     * Sets a key at a specific flat index (0-49)
     */
    setKeyAtIndex(index: number, key: Key): KeyboardBuilder {
        if (index < 0 || index >= 50) {
            throw new Error(`Index ${index} is out of range (0-49)`);
        }

        // Convert index to position
        if (index < 6) {
            // Left first row (0-5)
            this.keyboard.left.firstRow[index] = key;
        } else if (index < 12) {
            // Right first row (6-11)
            this.keyboard.right.firstRow[index - 6] = key;
        } else if (index < 18) {
            // Left second row (12-17)
            this.keyboard.left.secondRow[index - 12] = key;
        } else if (index < 24) {
            // Right second row (18-23)
            this.keyboard.right.secondRow[index - 18] = key;
        } else if (index < 32) {
            // Left third row (24-31)
            this.keyboard.left.thirdRow[index - 24] = key;
        } else if (index < 40) {
            // Right third row (32-39)
            this.keyboard.right.thirdRow[index - 32] = key;
        } else if (index < 45) {
            // Left fourth row (40-44)
            this.keyboard.left.fourthRow[index - 40] = key;
        } else {
            // Right fourth row (45-49)
            this.keyboard.right.fourthRow[index - 45] = key;
        }

        return this;
    }

    /**
     * Sets the keyboard from an existing keyboard structure
     */
    fromKeyboard(keyboard: Keyboard): KeyboardBuilder {
        this.keyboard = { ...keyboard };
        return this;
    }

    /**
     * Resets the keyboard to all "trans" keys
     */
    reset(): KeyboardBuilder {
        this.keyboard = this.createEmptyKeyboard();
        return this;
    }

    /**
     * Returns the built keyboard
     */
    build(): Keyboard {
        return { ...this.keyboard };
    }
}

// Utility function to create an empty keyboard quickly
export function createEmptyKeyboard(): Keyboard {
    return new KeyboardBuilder().build();
}

// Utility function to create a keyboard from an array of keys
export function createKeyboardFromArray(keys: Key[]): Keyboard {
    return new KeyboardBuilder().fillFromArray(keys).build();
}

// Utility function to convert keyboard to flat array
export function keyboardToFlatArray(keyboard: Keyboard): Key[] {
    return new KeyboardBuilder().toFlatArray(keyboard);
}
 