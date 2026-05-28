const ObjectTypes = Object.freeze({
    Token: "token",
    Light: "light",
    Door: "door",
});

const cleanupExistingMenu = () => {
    const existingMenu = document.getElementById('shius-context-menu');
    if (existingMenu) existingMenu.remove();
};

const isInvalidClick = (event) => {
    return event.nativeEvent.button !== 1 || event.metaKey;
}

const getHoveredObject = (obj) => {
    let currentObj = obj;
    let foundObject = null;
    let foundType = null;

    while (currentObj) {
        
        if (currentObj.wall && currentObj.wall.document && currentObj.wall.document.door > 0) {
            foundObject = currentObj.wall;
            foundType = ObjectTypes.Door;
            break;
        }
        
        if (currentObj.document && currentObj.document.documentName) {
            foundObject = currentObj;
            foundType = ObjectTypes.Token
            break;
        }

        if (currentObj.light && currentObj.light.document) {
            foundObject = currentObj.light;
            foundType = ObjectTypes.Light;
            break;
        }
        
        currentObj = currentObj.parent;
    }
    return { object: foundObject, type: foundType };
}

const initializeContextMenu = (event) => {
    cleanupExistingMenu();

    const screenX = event.nativeEvent.clientX;
    const screenY = event.nativeEvent.clientY;
    
    const menu = document.createElement('div');
    menu.id = 'shius-context-menu';
    menu.classList.add('shius-context-menu');

    Object.assign(menu.style, {
        position: 'fixed',
            left: `${screenX}px`,
            top: `${screenY}px`,
    });

    let hoveredObject = getHoveredObject(event.target);

    if (hoveredObject.object) {
        initializeContextMenuForObject(menu, hoveredObject, event);
    } else {
        initializeContextMenuForEmptySpace(menu, event);
    }

    document.body.appendChild(menu);
    
    setTimeout(() => {
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('pointerdown', closeMenu);
            }
        };
        document.addEventListener('pointerdown', closeMenu);
    }, 50);
}

const initializeContextMenuForObject = (menu, target, event) => {

    let foundObject = target.object;
    let type = target.type;
       
    const objName = foundObject.document.documentName;
    
    const printLogBtn = createMenuButton(`Print Console`, (e) => {
        e.stopPropagation(); 
        console.log(`► Selected: ${objName}`);
        console.log(`► All DAta:`, foundObject.document);
        menu.remove();
    });

    const chatLogBtn = createMenuButton(`Chat Log`, (e) => {
        e.stopPropagation(); 
        const chatContent = `
            <div style="background: rgba(0,0,0,0.1); padding: 5px; border-left: 3px solid #782e22;">
                <h3 style="margin: 0 0 5px 0;">Obje Yakalandı</h3>
                <b>İsim:</b> ${objName}<br>
                <b>Tür:</b> ${foundObject.document.documentName}
            </div>
        `;
        
        ChatMessage.create({
            speaker: ChatMessage.getSpeaker(),
            content: chatContent
        });
        menu.remove();
    });

    menu.appendChild(printLogBtn);
    menu.appendChild(chatLogBtn);
}

const createMenuButton = (label, onClick) => {
    const btn = document.createElement('div');
    btn.classList.add('shius-context-menu-button');
    btn.innerHTML = label;
    btn.onclick = onClick;
    return btn;
};

const initializeContextMenuForEmptySpace = (menu, event) => {
    const emptySpaceBtn = createMenuButton(`📌(X: ${event.data.global.x.toFixed(2)}, Y: ${event.data.global.y.toFixed(2)})`, (e) => {
        menu.remove();
    });
    menu.appendChild(emptySpaceBtn);
};

const _contextMenu = (event) => {

    if (isInvalidClick(event)) return;

    initializeContextMenu(event);
};

console.log("ShiusContextMenu | Module Loaded.");

Hooks.once("canvasReady", () => {
    canvas.stage.on('pointerdown', _contextMenu);
});
