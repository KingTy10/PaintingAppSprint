import { Application, Assets, Sprite, Rectangle } from "pixi.js";
import ToolsManager from "./managers/ToolsManager.js";
import DrawManager from "./managers/DrawManager.js";
import "../style.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import HistoryManager from "./managers/HistoryManager.js";
(async () => {
    // Create a new application
    const app = new Application();

    // Initialize the application
    const container = document.getElementById("pixi-container");

    await app.init({
        background: "#aaaaaa",
        resizeTo: container

    });


    DrawManager.initialize(app);

    app.stage.eventMode = 'static';
    app.stage.hitArea = app.screen;


    app.stage.on('pointerdown', (event) => {
        DrawManager.onPointerDown(event.global, event.shiftKey);
    });

    app.stage.on('globalpointermove', (event) => {
        DrawManager.onPointerMove(event.global);
    });

    app.stage.on('pointerup', (event) => {
        DrawManager.onPointerUp(event.global);
    });

    // Releasing the mouse outside the canvas still finishes the shape.
    app.stage.on('pointerupoutside', (event) => {
        DrawManager.onPointerUp(event.global);
    });


    ToolsManager.addToolGroup("Shapes", ["fa-solid", "fa-shapes"], [
        ToolsManager.getTool("Ellipse", ["fa-regular", "fa-circle"], () => {
            DrawManager.setTool("circle");
        }),
        ToolsManager.getTool("Rectangle", ["fa-regular", "fa-square"], () => {
            DrawManager.setTool("rectangle");
        }),
        ToolsManager.getTool("Line", ["fa-solid", "fa-lines-leaning"], () => {
            DrawManager.setTool("line");
        }),
        ToolsManager.getTool("Star", ["fa-regular", "fa-star"], () => {
            DrawManager.setTool("star");
        }),
    ]);

    let fillColorPicker = ToolsManager.getColorPicker("Fill Color");
    let strokeColorPicker = ToolsManager.getColorPicker("Stroke Color");
    let strokeInput = document.getElementById("stroke");

    ToolsManager.addTool(fillColorPicker);
    ToolsManager.addTool(strokeColorPicker);

    ToolsManager.addTool(ToolsManager.getTool("Select Tool", ["fa-solid", "fa-arrow-pointer"], () => {
        DrawManager.setTool("select"); // Pauses shape drawing so you can pick elements

    }));

    ToolsManager.addTool(ToolsManager.getTool("Move Tool", ["fa-solid", "fa-up-down-left-right"], () => {
        DrawManager.setTool("move"); // Pauses shape drawing so you can drag objects
    }));

    ToolsManager.addTool(ToolsManager.getTool("Scale Tool", ["fa-solid", "fa-up-right-and-down-left-from-center"], () => {
        DrawManager.setTool("scale"); // Pauses shape drawing so you can resize objects
        console.log("DrawManager paused: Scale Mode Active");
    }));

    ToolsManager.addTool(ToolsManager.getTool("Delete Tool", ["fa-solid", "fa-trash-can"], () => {
         DrawManager.deleteSelected();// Instant action: If you write a selection deletion method later, call it here!
    }));

    ToolsManager.addTool(ToolsManager.getTool("Group Tool", ["fa-solid", "fa-object-group"], () => {
        console.log("Group Tool clicked: Combining items");
    }));

    ToolsManager.addTool(ToolsManager.getTool("Ungroup Tool", ["fa-regular", "fa-object-group"], () => {
        console.log("Ungroup Tool clicked: Splitting items");
    }));
    container.appendChild(app.canvas);
    let undoBtn = document.getElementById("undo");
    let redoBtn = document.getElementById("redo");
    //This is the main buttno linking btn doesnt exist without it neva delete dumb dumb 

    // Undo/redo can move or remove shapes, so clear the selection too,
    // otherwise a blue outline could be left on a shape that's gone.
    const undo = () => {
        HistoryManager.undo();
        DrawManager.tools.select.clearSelection();
    };
    const redo = () => {
        HistoryManager.redo();
        DrawManager.tools.select.clearSelection();
    };

    undoBtn.addEventListener("click", undo);
    redoBtn.addEventListener("click", redo);

    // Keyboard shortcuts: Ctrl+Z to undo, Ctrl+Y or Ctrl+Shift+Z to redo.
    window.addEventListener("keydown", (e) => {
        // Let text boxes (like the stroke width) keep their own undo.
        if (e.target.tagName === "INPUT") return;
        if (e.key === "Delete" || e.key === "Backspace") {
            e.preventDefault();
            DrawManager.deleteSelected();
            return;
        }
        if (!e.ctrlKey && !e.metaKey) return;

        const key = e.key.toLowerCase();

        if (key === "z" && !e.shiftKey) {
            e.preventDefault();
            undo();
        } else if (key === "y" || (key === "z" && e.shiftKey)) {
            e.preventDefault();
            redo();
        }
    });
    // Load the bunny texture
    /*const texture = await Assets.load("./assets/bunny.png");

    // Create a bunny Sprite
    const bunny = new Sprite(texture);

    // Center the sprite's anchor point
    bunny.anchor.set(0.5);

    // Move the sprite to the center of the screen
    bunny.position.set(app.screen.width / 2, app.screen.height / 2);

    // Add the bunny to the stage
    app.stage.addChild(bunny);

    // Listen for animate update
    app.ticker.add((time) => {
        // Just for fun, let's rotate mr rabbit a little.
        // * Delta is 1 if running at 100% performance *
        // * Creates frame-independent transformation *
        bunny.rotation += 0.1 * time.deltaTime;
    });*/
})();
