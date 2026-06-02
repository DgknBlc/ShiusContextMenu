const isInvalidClick = (event) => {

    if (!canvas.tokens.active) {
        return true; 
    }
    
    return event.nativeEvent.button !== 1 || event.metaKey;
}

const _contextMenu = (event) => {

    if (!game.settings.get("shius-context-menu", "canPlayerUse") && !game.user.isGM) {
        return;
    }

    if (isInvalidClick(event)) return;

    let _menu = new ShiusContextMenu(event);
    _menu.buildContextMenu();
};

export const addEventListener = () => {

    Hooks.once("canvasReady", () => {
        console.log("ShiusContextMenu | Listening for contextmenu events");

        canvas.stage.on('pointerdown', _contextMenu);
    });
}

class ShiusContextMenu {

    static ObjectType = Object.freeze({
        Token: "token",
        Light: "light",
        Door: "door",
        Empty: "empty"
    });

    static ButtonType = Object.freeze({
        onClick: "onClick",
        onHover: "onHover",
        subMenu: "subMenu"
    });
    
    constructor(event) {
        this.cleanupExistingMenu();
        const hoveredObject = this.getHoveredObject(event.target);
        this.event = event;
        this.targetObject = hoveredObject.object;
        this.contextType = hoveredObject.type || ShiusContextMenu.ObjectType.Empty;
        this.menu = this.createMenu(this.event.nativeEvent.clientX, this.event.nativeEvent.clientY);
        this.controlledToken = canvas.tokens.controlled[0];
        console.log("ShiusContextMenu | Context Type:", this);
    }

    getHoveredObject(obj){
        let currentObj = obj;
        let foundObject = null;
        let foundType = null;

        while (currentObj) {

            if (currentObj.wall && currentObj.wall.document && currentObj.wall.document.door > 0) {
                foundObject = currentObj.wall;
                foundType = ShiusContextMenu.ObjectType.Door;
                break;
            }

            if (currentObj.document && currentObj.document.documentName) {
                foundObject = currentObj;
                foundType = ShiusContextMenu.ObjectType.Token;
                break;
            }

            if (currentObj.light && currentObj.light.document) {
                foundObject = currentObj.light;
                foundType = ShiusContextMenu.ObjectType.Light;
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
        button.innerHTML = label;

        switch (buttonType) {
            case ShiusContextMenu.ButtonType.onClick:
                button.onclick = callback;
                break;
            case ShiusContextMenu.ButtonType.onHover:
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
        button.innerHTML = label + '▸';

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

        switch (this.contextType) {
            case ShiusContextMenu.ObjectType.Token:
                break;
            case ShiusContextMenu.ObjectType.Door:
                break;
            case ShiusContextMenu.ObjectType.Light:
                break;
            case ShiusContextMenu.ObjectType.Empty:
                break;
        }

        this.testMenu();

        document.body.appendChild(this.menu);

    }

    testMenu(menu = this.menu) {
        let subMenu = this.createSubMenu("New Menu", menu);

        let submenu1Item1 = this.createMenuButton("Submenu 1 Item 1", ShiusContextMenu.ButtonType.onClick, () => {
            console.log("Clicked Submenu 1 Item 1");
            this.removeMenu();
        }, subMenu);

        let subMenu2 = this.createSubMenu("Sub Sub Menu", subMenu);

        let submenu2Item1 = this.createMenuButton("Sub Submenu Item 1", ShiusContextMenu.ButtonType.onClick, () => {
            console.log("Clicked Sub Submenu Item 1");
            this.removeMenu();
        }, subMenu2);

        let subMenu21 = this.createSubMenu("Sub Sub Sub Menu", subMenu2);
        let submenu2Item2 = this.createMenuButton("Sub Sub Submenu Item 1", ShiusContextMenu.ButtonType.onClick, () => {
            console.log("Clicked Sub Sub Submenu Item 1");
            this.removeMenu();
        }, subMenu21);

        let subMenu3 = this.createSubMenu("Sub Sub Menu 2", subMenu);

        let submenu3Item1 = this.createMenuButton("Sub Submenu 2 Item 1", ShiusContextMenu.ButtonType.onClick, () => {
            console.log("Clicked Sub Submenu 2 Item 1");
            this.removeMenu();
        }, subMenu3);


        let _subMenu = this.createSubMenu("New Menu 2");

        let _submenu1Item1 = this.createMenuButton("Submenu 2 Item 1", ShiusContextMenu.ButtonType.onClick, () => {
            console.log("Clicked Submenu 2 Item 1");
            this.removeMenu();
        }, _subMenu);


        let mainButton = this.createMenuButton(`📌(X: ${this.event.data.global.x.toFixed(2)}, Y: ${this.event.data.global.y.toFixed(2)})`, ShiusContextMenu.ButtonType.onClick, (e) => {
            console.log("Clicked Main Menu Button");
            this.removeMenu();
        });
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



}


