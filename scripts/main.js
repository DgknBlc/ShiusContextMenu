import { addEventListener } from "./context-menu.js";


Hooks.once('init', async function () {
    console.log("ShiusContextMenu | Initializing Module");

    game.settings.register("shius-context-menu","canPlayerUse", {
        name: "Can Player Use",
        hint: "Allow players to use the context menu.",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
    });

    addEventListener();
});