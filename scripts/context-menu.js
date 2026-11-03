
const ButtonType = Object.freeze({
        onClick: "onClick",         //callback on Click
        onHover: "onHover",         //callback on Hover
        subMenu: "subMenu",         //create sub menu on Hover
        function: "function"        //callback on start
});

const ObjectType = Object.freeze({
        Token: "token",
        Light: "light",
        Door: "door",
        Note: "note",
        Empty: "empty"
});

export class SCM {

    static menu = null;

    constructor(event) {
        this.cleanupExistingMenu();
        const hoveredObject = this.getHoveredObject(event.target);
        this.event = event;
        this.originX = this.event.nativeEvent.clientX;
        this.originY = this.event.nativeEvent.clientY;
        this.targetObject = hoveredObject.object;
        this.contextType = hoveredObject.type || ObjectType.Empty;
        this.menu = this.createMenu(this.originX, this.originY);
        this.controlledToken = canvas.tokens.controlled[0];

        const moduleName = "shius-context-menu";
        const allSettings = {};
        for (let [key, setting] of game.settings.settings.entries()) {
            if (setting.namespace === moduleName) {
                allSettings[setting.key] = game.settings.get(moduleName, setting.key);
            }
        }

        this.settings = allSettings;
        SCM.menu = this;
        console.log("SCM | Context Type:", this);
    }

    static getMenu(){
        return this.menu;
    }

    getHoveredObject(obj){
        let currentObj = obj;
        let foundObject = null;
        let foundType = null;

        while (currentObj) {
            if (currentObj.wall && currentObj.wall.document && currentObj.wall.document.door > 0) {
                foundObject = currentObj.wall;
                foundType = ObjectType.Door;
                break;
            }

            if (currentObj.document && currentObj.document.documentName && currentObj.constructor.name.includes('Token') ) {
                foundObject = currentObj;
                foundType = ObjectType.Token;
                break;
            }

            if (currentObj.document && currentObj.document.documentName && currentObj.constructor.name.includes('Note') ) {
                foundObject = currentObj;
                foundType = ObjectType.Note;
                break;
            }

            if (currentObj.light && currentObj.light.document) {
                foundObject = currentObj.light;
                foundType = ObjectType.Light;
                break;
            }

            currentObj = currentObj.parent;
        }
        
        return { object: foundObject, type: foundType };
    }

    createMenu(screenX, screenY, subMenu = false) {
        const menu = document.createElement('div');
        menu.menuParent = null;
        menu.childMenus = [];

        menu.classList.add('shius-context-menu');

        if (subMenu) {
            menu.classList.add('shius-context-submenu');
        }

        Object.assign(menu.style, {
            position: 'fixed',
            left: `${screenX}px`,
            top: `${screenY}px`,
        });

        
        setTimeout(() => {
            const closeMenu = (e) => {
                
                if (!this.isClickInsideMenu(e)) {
                    menu.remove();
                    document.removeEventListener('pointerdown', closeMenu);
                }
                
            };
            document.addEventListener('pointerdown', closeMenu);
        }, 50);
        

        return menu;
    }

    createMenuButton(label, buttonType, callback, menu = this.menu) {
        let button = document.createElement('div');
        button.classList.add('shius-context-menu-button');

        let innerText = document.createElement('div');
        innerText.classList.add('shius-context-menu-button-label');
        innerText.innerHTML = label;

        button.appendChild(innerText);

        switch (buttonType) {
            case ButtonType.onClick:
                button.onclick = callback;
                break;
            case ButtonType.onHover:
                button.onmouseover = callback;
                break;
        }
        menu.appendChild(button);
        return button;
    };

    createSubMenu(label, menu = this.menu) {
        let submenu = this.createMenu(0, 0, true);

        submenu.menuParent = menu;
        menu.childMenus.push(submenu);

        let button = document.createElement('div');
        button.classList.add('shius-context-menu-button');

        let innerText = document.createElement('div');
        innerText.classList.add('shius-context-menu-button-label');
        innerText.innerHTML = label + '▸';

        button.appendChild(innerText);

        const cleanSubMenu = () => {
            setTimeout(() => {

                let isHoveringSubMenu = false;

                for (let childMenu of submenu.childMenus) {
                    if (childMenu.matches(':hover')) {
                        isHoveringSubMenu = true;
                        break;
                    }
                }

                if (submenu && !submenu.matches(':hover') && !button.matches(':hover') && !isHoveringSubMenu) {
                    submenu.remove();
                    button.style.backgroundColor = "var(--scm-button-bg)";
                }

            }, 50); 
        }

        button.onmouseover = (e) => {

            if (e.srcElement.className == "shius-context-menu-button-label"){
                return;
            }

            button.style.backgroundColor = "var(--scm-button-hover-bg)";

            const buttonRect = e.srcElement.getBoundingClientRect();

            Object.assign(submenu.style, {
                left: `${buttonRect.right}px`,
                top: `${buttonRect.top}px`,
            });

            submenu.onmouseleave = cleanSubMenu;

            document.body.appendChild(submenu);
        };

        button.onmouseleave = cleanSubMenu;
        
        menu.appendChild(button);

        return submenu;
    }

    buildContextMenu() {
        this.buildFromConfig(SCM.MenuActions);

        if (this.menu.childNodes.length === 0) {
            this.removeMenu();
            return;
        }

        document.body.appendChild(this.menu);
    }

    testMenu(menu = this.menu) {
        let button1 = this.createMenuButton("Label : " + this.contextType.toString().toUpperCase(), ButtonType.onHover, () => {
            console.log("Hovered Test Button");
        }, menu);

        let subMenu = this.createSubMenu("New Menu", menu);

        let submenu1Item1 = this.createMenuButton("Submenu 1 Item 1", ButtonType.onClick, () => {
            console.log("Clicked Submenu 1 Item 1");
            this.removeMenu();
        }, subMenu);

        let subMenu2 = this.createSubMenu("Sub Sub Menu", subMenu);

        let submenu2Item1 = this.createMenuButton("Sub Submenu Item 1", ButtonType.onClick, () => {
            console.log("Clicked Sub Submenu Item 1");
            this.removeMenu();
        }, subMenu2);

        let subMenu21 = this.createSubMenu("Sub Sub Sub Menu", subMenu2);
        let submenu2Item2 = this.createMenuButton("Sub Sub Submenu Item 1", ButtonType.onClick, () => {
            console.log("Clicked Sub Sub Submenu Item 1");
            this.removeMenu();
        }, subMenu21);

        let subMenu3 = this.createSubMenu("Sub Sub Menu 2", subMenu);

        let submenu3Item1 = this.createMenuButton("Sub Submenu 2 Item 1", ButtonType.onClick, () => {
            console.log("Clicked Sub Submenu 2 Item 1");
            this.removeMenu();
        }, subMenu3);

        let _subMenu = this.createSubMenu("New Menu 2", menu);

        let _submenu1Item1 = this.createMenuButton("Submenu 2 Item 1", ButtonType.onClick, () => {
            console.log("Clicked Submenu 2 Item 1");
            this.removeMenu();
        }, _subMenu);


        let mainButton = this.createMenuButton(`📌(X: ${this.event.data.global.x.toFixed(2)}, Y: ${this.event.data.global.y.toFixed(2)}) which is supposed to be a very long text`, ButtonType.onClick, (e) => {
            console.log("Clicked Main Menu Button");
            this.removeMenu();
        }, menu);

    }

    cleanupExistingMenu(menuName = 'shius-context-menu') {
        const existingMenus = document.getElementsByClassName(menuName);
        for (let menu of existingMenus) {
            menu.remove();
        }
    };

    removeMenu(menu = this.menu) {
        for (let childMenu of menu.childMenus) {
            this.removeMenu(childMenu);
        }
        menu.remove();
    }

    isClickInsideMenu(event, menu = this.menu) {
        let isInside = false;

        if (menu.contains(event.target)) {
            isInside = true;
        } else {
            for (let childMenu of menu.childMenus) {
                isInside = this.isClickInsideMenu(event, childMenu);
                if (isInside) break;
            }
        }
        return isInside;
    }

    buildFromConfig(actions, currentMenu = this.menu) {
        let hasActions = false;
        for (let action of actions) {

            if (action.contexts && !action.contexts.includes(this.contextType)) {
                continue;
            }

            if (action.condition && !action.condition(action)) {
                continue;
            }

            hasActions = true;

            if (action.type === ButtonType.subMenu) {
  
                let subMenu = this.createSubMenu(action.label, currentMenu);
                
                if (action.children && action.children.length > 0) {
                    this.buildFromConfig(action.children, subMenu); 
                }

            } else if (action.type === ButtonType.function) {

                action.callback();

            } else {
                
                this.createMenuButton(action.label, action.type, (e) => {
                    e.stopPropagation();
                    
                    if (action.callback) {
                        action.callback(e);
                    }
                    
                    if (action.type === ButtonType.onClick) {
                        this.removeMenu();
                    }
                    
                }, currentMenu);
            }
        }
        if (!hasActions) {
            this.createMenuButton("Empty", ButtonType.onHover, null, currentMenu);
        }
    }

    static MenuActions = [
        {
            label: "Ping",
            type: ButtonType.onClick,
            contexts: null,
            condition: (action) => true,
            callback: (e) => {
                let contextMenu = SCM.getMenu();
                let vDuration = 2;
                
                let canvasPos = {x: contextMenu.originX, y: contextMenu.originY}
                let targetObject = contextMenu.targetObject;
                
                if (targetObject && contextMenu.contextType === ObjectType.Token) {
                    const gridSize = canvas.dimensions.size
                    canvasPos = {x: targetObject.x + (targetObject.document.width * gridSize / 2), y: targetObject.y + (targetObject.document.height * gridSize / 2)};
                } else {
                    canvasPos = canvas.canvasCoordinatesFromClient(canvasPos);
                }

                canvas.ping(canvasPos, {style : "CustomPing", duration :  vDuration * 1000, Image : "icons/pings/chevron.webp" , ImageColor : game.user.color})
            }
        },
        {
            label: "Target",
            type: ButtonType.onClick,
            contexts: [ObjectType.Token, ObjectType.Empty],
            condition: (action) => {
                action.label = SCM.getMenu().targetObject?.isTargeted ? "Untarget" : "Target";
                return SCM.getMenu().targetObject || canvas.tokens.controlled.length > 0;
            },
            callback: (e) => {
                
                let contextMenu = SCM.getMenu();

                if (contextMenu.contextType === ObjectType.Empty) {
                    
                    let selectedObjects = canvas.tokens.controlled;

                    selectedObjects[0].setTarget(true, { releaseOthers: true });
                    for (let selObj of selectedObjects) {
                        selObj.setTarget(true, { releaseOthers: false });
                    }
                    
                } else if (contextMenu.contextType === ObjectType.Token) {

                    let targetObject = SCM.getMenu().targetObject;
                    let isTargeted = targetObject.isTargeted;

                    targetObject.setTarget(!isTargeted, { releaseOthers: false });
                }

            }
        },
        {
            label: "Release Targets",
            type: ButtonType.onClick,
            contexts: [ObjectType.Token, ObjectType.Empty],
            condition: (action) => game.user.targets.size > 0,
            callback: (e) => {
                
                for (const target of game.user.targets) {
                    target.setTarget(false, { releaseOthers: false });
                }
                
            }
        },
        {
            label: "View",
            type: ButtonType.subMenu,
            contexts: [ObjectType.Token, ObjectType.Note],
            condition: (action) => true,
            children: [
                {
                    label: "Portrait",
                    type: ButtonType.onClick,
                    contexts: [ObjectType.Token],
                    condition: (action) => SCM.getMenu().targetObject.actor?.img,
                    callback: (e) => {
                        let targetObject = SCM.getMenu().targetObject;
                        const uuid = targetObject.document.uuid;
                        const name = targetObject.document.name || "İsimsiz Obje";

                        const gridSize = canvas.dimensions.size
                        const canvasPos = {x: targetObject.x + (targetObject.document.width * gridSize / 2), y: targetObject.y + (targetObject.document.height * gridSize / 2)};
                        canvas.ping(canvasPos, {style : "CustomPing", duration :  1 * 1000, Image : "icons/pings/chevron.webp" , ImageColor : game.user.color})

                        if (SCM.getMenu().settings.viewChatMessage) {ChatMessage.create({
                            user: game.user._id,
                            blind: true,
                            content: "User Viewed Portrait of @UUID[" + uuid + "]{" + name + "}"
                        });}

                        const popout = new ImagePopout(targetObject.actor.img, {
                            title: name,
                            shareable: game.user.isGM,
                            uuid: uuid
                        });
                    
                        popout.render(true);
                    }
                },
                {
                    label: "Image",
                    type: ButtonType.onClick,
                    contexts: [ObjectType.Token, ObjectType.Note],
                    condition: (action) => SCM.getMenu().targetObject.document?.texture?.src,
                    callback: (e) => {
                        let targetObject = SCM.getMenu().targetObject;
                        const uuid = targetObject.document.uuid;
                        const name = targetObject.document.name || "İsimsiz Obje";

                        const gridSize = canvas.dimensions.size
                        const canvasPos = {x: targetObject.x + (targetObject.document.width * gridSize / 2), y: targetObject.y + (targetObject.document.height * gridSize / 2)};
                        canvas.ping(canvasPos, {style : "CustomPing", duration :  1 * 1000, Image : "icons/pings/chevron.webp" , ImageColor : game.user.color})

                        if (SCM.getMenu().settings.viewChatMessage) {ChatMessage.create({
                            user: game.user._id,
                            blind: true,
                            content: "User Viewed Image of @UUID[" + uuid + "]{" + name + "}"
                        });}

                        const popout = new ImagePopout(targetObject.document.texture.src, {
                            title: name,
                            shareable: game.user.isGM,
                            uuid: uuid
                        });
                    
                        popout.render(true);
                    }
                }
            ]
        },
        {
            label: "Set Light",
            type: ButtonType.onClick,
            contexts: [ObjectType.Token],
            condition: (action) => SCM.getMenu().targetObject || canvas.tokens.controlled.length > 0,
            callback: (e) => {

                let targetObject = SCM.getMenu().targetObject;

                console.log(targetObject.document.light);

                const _dimVal = targetObject.document.light.dim ?? 60 ;
                const _brightVal = targetObject.document.light.bright ?? 30;
                const _angleVal = targetObject.document.light.angle ?? 360;
                const _colorVal = targetObject.document.light.color ?? '#ffaa00';
                const _alphaVal = targetObject.document.light.alpha ?? 0.4;


                const dialogContent = `
                    <form style="margin-bottom: 10px;">
                        <div class="form-group">
                            <label>Dim Light:</label>
                            <div class="form-fields">
                                <input type="number" id="light-dim" value="${_dimVal}" autofocus>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Bright Light:</label>
                            <div class="form-fields">
                                <input type="number" id="light-bright" value="${_brightVal}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Angle:</label>
                            <div class="form-fields">
                                <input type="number" id="light-angle" value="${_angleVal}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Color:</label>
                            <div class="form-fields">
                                <input type="color" id="light-color" value="${_colorVal}" style="height: 30px;">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Opacity (Alpha):</label>
                            <div class="form-fields">
                                <input type="range" id="light-alpha" value="${_alphaVal}" min="0" max="1" step="0.05">
                            </div>
                        </div>
                    </form>
                `;
            
                new Dialog({
                    title: `${targetObject.document.name} - Light Setting`,
                    content: dialogContent,
                    buttons: {

                        apply: {
                            icon: '<i class="fas fa-check"></i>',
                            label: "Apply",
                            callback: async (html) => {

                                const dimVal = Number(html.find('#light-dim').val());
                                const brightVal = Number(html.find('#light-bright').val());
                                const angleVal = Number(html.find('#light-angle').val());;
                                const colorVal = html.find('#light-color').val();
                                const alphaVal = Number(html.find('#light-alpha').val());
                            

                                await targetObject.document.update({
                                    light: {
                                        active: true,
                                        dim: dimVal,
                                        bright: brightVal,
                                        color: colorVal,
                                        alpha: alphaVal,
                                        angle: angleVal > 360 ? 360 : angleVal,
                                        animation: { type: "torch", speed: 3, intensity: 3 } 
                                    }
                                });

                                for (const controlled of canvas.tokens.controlled) {
                                    await controlled.document.update({
                                        light: {
                                            active: true,
                                            dim: dimVal,
                                            bright: brightVal,
                                            color: colorVal,
                                            alpha: alphaVal,
                                            angle: angleVal > 360 ? 360 : angleVal,
                                            animation: { type: "torch", speed: 3, intensity: 3 } 
                                        }
                                    });
                                }
                            }
                        },
                        cancel: {
                            icon: '<i class="fas fa-times"></i>',
                            label: "Cancel"
                        }
                    },
                    default: "apply"
                }).render(true);
            }
        },
        {
            label: "Light Off",
            type: ButtonType.onClick,
            contexts: [ObjectType.Token],
            condition: (action) => {
                let isControlledLight = false;
                for (const controlled of canvas.tokens.controlled) {
                    isControlledLight = controlled.document.light.dim > 0;
                    if (isControlledLight) {
                        break;
                    }
                }
                return SCM.getMenu().targetObject.document.light.dim > 0 || isControlledLight
            },
            callback: async (e) => {
                let targetObject = SCM.getMenu().targetObject;

                const _angleVal = targetObject.document.light.angle ?? 360;
                const _colorVal = targetObject.document.light.color ?? '#ffaa00';
                const _alphaVal = targetObject.document.light.alpha ?? 0.4;

                for (const controlled of canvas.tokens.controlled) {
                    await controlled.document.update({
                        light: {
                            active: true,
                            dim: 0,
                            bright: 0,
                            angle: _angleVal,
                            color: _colorVal,
                            alpha: _alphaVal,
                            animation: {
                                type: "torch",
                                speed: 3,
                                intensity: 3
                            }
                        } 
                    });
                }

                await targetObject.document.update({
                    light: {
                        active: true,
                        dim: 0,
                        bright: 0,
                        angle: _angleVal,
                        color: _colorVal,
                        alpha: _alphaVal,
                        animation: {
                            type: "torch",
                            speed: 3,
                            intensity: 3
                        }
                    } 
                });
            }
        },
        {
            label: "GM Menu",
            type: ButtonType.subMenu,
            contexts: null,
            condition: (action) => game.user.isGM,
            children: [
                {
                    label: "Debug",
                    type: ButtonType.onClick,
                    contexts: false,
                    condition: (action) => {
                        action.label = SCM.getMenu().settings.debugMode ? "Debug Off" : "Debug On";
                        return false;
                    },
                    callback: (e) => {
                        let flag = SCM.getMenu().settings.debugMode;
                        game.settings.set("shius-context-menu", "debugMode", !flag);

                    }
                }
            ]
        },
        {
            label: "Debug Menu", 
            type: ButtonType.function,
            contexts: false,
            condition: (action) => SCM.getMenu().settings.debugMode,
            callback: () => {
                let contextMenu = SCM.getMenu();
                let subMenu = contextMenu.createSubMenu("Debug Menu");
                contextMenu.testMenu(subMenu)
            }
        }        
    ]
}