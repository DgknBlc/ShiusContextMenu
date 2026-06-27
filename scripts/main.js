import { SCM } from "./context-menu.js";

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

    game.settings.register("shius-context-menu","debugMode", {
        name: "Debug Mode",
        hint: "Enables Debug Test Menu",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
    });

    Hooks.on("canvasReady", () => {
        console.log("ShiusContextMenu | Listening for contextmenu events");

        canvas.stage.on('pointerdown', _contextMenu);
    });
});

const _contextMenu = (event) => {

    if (!game.settings.get("shius-context-menu", "canPlayerUse") && !game.user.isGM) {
        return;
    }

    if (isInvalidClick(event)) return;

    let _menu = new SCM(event);
    _menu.buildContextMenu();
};

const isInvalidClick = (event) => {

    if (!canvas.tokens.active) {
        return true; 
    }
    
    return event.nativeEvent.button !== 1 || event.metaKey;
}

