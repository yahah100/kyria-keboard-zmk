export const defaultKeymap = `
/*
 * Copyright (c) 2023 The ZMK Contributors
 *
 * SPDX-License-Identifier: MIT
 */

#include <behaviors.dtsi>
#include <dt-bindings/zmk/bt.h>
#include <dt-bindings/zmk/keys.h>
#include <dt-bindings/zmk/rgb.h>
#include <dt-bindings/zmk/outputs.h>

&led_strip {
    // chain-length = <6>;
    // chain-length = <31>; // Uncomment if using both per-key and underglow LEDs
    chain-length = <25>; // Uncomment if using only per-key LEDs.
};


/ {
    combos {
        compatible = "zmk,combos";
        unlock_combo {
            timeout-ms = <50>;
            key-positions = <0 1>; // Top-left two keys
            bindings = <&to DEFAULT>;
            layers = <LOCK>; // Only active on LOCK layer
        };
    };

    behaviors {
        hml: homerow_mods_left {
            compatible = "zmk,behavior-hold-tap";
            label = "HOMEROW_MODS_LEFT";
            #binding-cells = <2>;
            tapping-term-ms = <280>;
            quick-tap-ms = <175>;
            flavor = "tap-preferred";
            bindings = <&kp>, <&kp>;
        };
        hmr: homerow_mods_right {
            compatible = "zmk,behavior-hold-tap";
            label = "HOMEROW_MODS_RIGHT";
            #binding-cells = <2>;
            tapping-term-ms = <280>;
            quick-tap-ms = <175>;
            flavor = "tap-preferred";
            bindings = <&kp>, <&kp>;
        };
    };

    // Define layer names for better readability
    #define DEFAULT 0
    #define FUNCTION 1
    #define NAV 2
    #define NUMPAD 3
    #define LOCK 4

    keymap {
        compatible = "zmk,keymap";

        default_layer {
            label = "DEFAULT";
            // ---------------------------------------------------------------------------------------------------------------------------------
            // |  ESC  |  Q  |  W  |  E   |  R   |  T   |                                          |  Y   |  U    |  I    |  O   |   P   |   \\  |
            // |  TAB  |  A  |  S  |  D   |  F   |  G   |                                          |  H   |  J    |  K    |  L   |   ;   |   '  |
            // | SHIFT |  Z  |  X  |  C   |  V   |  B   |   SHIFT  |  NUMPAD |  | FUNCTION | SHIFT   |  N   |  M    |  ,    |  .   |   /   | CTRL |
            //                     | CTRL | DEL  | GUI  |  SPACE | NAV     |  |   RET    |  SPACE  | DEL  | BSPC  | R-ALT |
            bindings = <
            &kp ESC   &kp Q &kp W &kp E &kp R &kp T                                                  &kp Y &kp U  &kp I     &kp O   &kp P    &kp BSLH
            &hml LALT A &hml LGUI S &hml LCTRL D &hml LSHFT F &kp G                                    &kp H &hmr RSHFT J &hmr RCTRL K &hmr RGUI L &hmr RALT SEMI &kp GRAVE
            &kp LSHFT &kp Z &kp X &kp C &kp V &kp B &kp LSHFT &mo NUMPAD            &mo FUNCTION &kp LSHFT &kp N &kp M  &kp COMMA &kp DOT &kp FSLH &kp RCTRL
                                  &kp LCTRL &kp DEL &kp LGUI &lt NAV SPACE       &lt FUNCTION RET &kp SPACE &kp BSPC &kp DEL &kp RALT
            >;

        };
        
        function_layer {
            label = "FUNCTION";
            // ---------------------------------------------------------------------------------------------------------------------------------
            // | BT_NXT|BT_PRV|BT_CLR|BTSEL0|BTSEL1|BTSEL2|                                         |      |RGB_TOG|RGB_BRI|RGB_BRD|RGB_EFF|      |
            // | OUT_USB| OUT_BLE|      |BTSEL3|BTSEL4|      |                                         |      |RGB_HUI|RGB_SAI|RGB_SAD|RGB_HUD|      |
            // |BT_CLR_ALL|   |      |      |      |      |      | LOCK |      |      |      | PREV | PLAY  | NEXT  | MUTE | VOL- | VOL+ |
            //                       |      |      |      |      |      |      |      |      |      |      |
            bindings = <
            &bt BT_NXT &bt BT_PRV &bt BT_CLR &bt BT_SEL 0 &bt BT_SEL 1 &bt BT_SEL 2              &trans &rgb_ug RGB_TOG &rgb_ug RGB_BRI &rgb_ug RGB_BRD &rgb_ug RGB_EFF &trans
            &out OUT_USB &out OUT_BLE &trans     &bt BT_SEL 3 &bt BT_SEL 4 &trans                    &trans &rgb_ug RGB_HUI &rgb_ug RGB_SAI &rgb_ug RGB_SAD &rgb_ug RGB_HUD &trans
            &bt BT_CLR_ALL &trans &trans &trans &trans &trans &trans &to LOCK        &trans &trans  &kp C_PREV &kp C_PP &kp C_NEXT &kp C_MUTE &kp C_VOL_DN &kp C_VOL_UP
                                 &trans &trans &trans &trans &trans        &trans &trans &trans &trans &trans
            >;
        };

        nav_layer {
            label = "NAV";
            // ---------------------------------------------------------------------------------------------------------------------------------
            // |  F1   |  F2  |  F3  |  F4  |  F5  |  F6  |                                         |  F7  |  F8  |  F9  | F10  |  F11  |  F12  |
            // | HOME  | END  | PGDN | PGUP |      |      |                                         | LEFT | DOWN |  UP  | RIGHT|   [   |   ]   |
            // |       |      |      |      |      |      |      |      |      |      |      |      |      |      |      |      |   -   |   _   |
            //                       | CTRL | L-ALT| SHIFT|      |      |      |      |      |      |      |
            bindings = <
            &kp F1  &kp F2  &kp F3  &kp F4  &kp F5  &kp F6                                        &kp F7  &kp F8  &kp F9  &kp F10 &kp F11 &kp F12
            &kp HOME &kp END &kp PG_DN &kp PG_UP &trans &trans                                    &kp LEFT &kp DOWN  &kp UP &kp RIGHT &kp LEFT_BRACKET &kp RIGHT_BRACKET
            &trans &trans &trans &trans &trans &trans &trans &trans         &trans &trans &trans &trans &trans &trans &kp MINUS &kp UNDERSCORE
                               &trans &kp LCTRL &kp LALT &kp LCTRL &trans          &trans &trans  &trans &trans &trans
            >;
        };

        numpad_layer {
            label = "NUMPAD";
            // ---------------------------------------------------------------------------------------------------------------------------------
            // |       |      |      |      |      |      |                                         |   /  |  7/&   |  8/*  |  9/(  |   -  |      |
            // |       |      |      |      |      |      |                                         |   *  |  4/$   |  5/%  |  6/^  |   +  | EQUAL|
            // |       |      |      |      |      |      |      |      |      |      |      |      |  0/) |  1/!   |  2/@  |  3/#  |   .  | Enter|
            //                       | CTRL | L-ALT| SHIFT|      |      |      |      |      |      |      |
            bindings = <
            &trans &trans &trans &trans &trans &trans                                      &kp KP_DIVIDE &kp N7 &kp N8 &kp N9 &kp KP_MINUS &trans
            &trans &trans &trans &trans &trans &trans                                      &kp KP_MULTIPLY &kp N4 &kp N5 &kp N6 &kp KP_PLUS &kp EQUAL
            &trans &trans &trans &trans &trans &trans &trans &trans        &trans &trans  &kp N0 &kp N1 &kp N2 &kp N3 &kp KP_DOT &kp KP_ENTER
                               &trans &kp LCTRL &kp LALT &kp LSHFT &trans          &trans &trans  &trans &trans &trans
            >;
        };

        lock_layer {
            label = "LOCK";
            bindings = <
            &none &none &none &none &none &none        &none &none &none &none &none &none
            &none &none &none &none &none &none        &none &none &none &none &none &none
            &none &none &none &none &none &none &none &none     &none &none &none &none &none &none &none &none
                           &none &none &none &none &none     &none &none &none &none &none
            >;
        };
    };
};
`; 