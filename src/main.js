import { Application, Assets, Sprite, Rectangle } from "pixi.js";
import ToolsManager from "./managers/ToolsManager.js";
import DrawManager from "./managers/DrawManger.js";
import "../style.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

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
        DrawManager.onPointerDown(event.global);
    });

    app.stage.on('pointermove', (event) => {
        DrawManager.onPointerMove(event.global);
    });

    app.stage.on('pointerup', (event) => {
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
        drawManager.setTool(null); // Pauses shape drawing so you can pick elements
        console.log("DrawManager paused: Selection Mode Active");
    }));

    ToolsManager.addTool(ToolsManager.getTool("Move Tool", ["fa-solid", "fa-up-down-left-right"], () => {
        drawManager.setTool(null); // Pauses shape drawing so you can drag objects
        console.log("DrawManager paused: Move Mode Active");
    }));

    ToolsManager.addTool(ToolsManager.getTool("Scale Tool", ["fa-solid", "fa-up-right-and-down-left-from-center"], () => {
        drawManager.setTool(null); // Pauses shape drawing so you can resize objects
        console.log("DrawManager paused: Scale Mode Active");
    }));

    ToolsManager.addTool(ToolsManager.getTool("Delete Tool", ["fa-solid", "fa-trash-can"], () => {
        // Instant action: If you write a selection deletion method later, call it here!
        console.log("Delete Tool clicked: Removing selected shape vectors");
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

    undoBtn.addEventListener("click", () => {

    });

    redoBtn.addEventListener("click", () => {

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
