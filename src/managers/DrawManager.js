import { Container } from "pixi.js";
import CircleDrawState from "../states/CircleDrawState.js";
import RectDrawState from "../states/RectDrawState.js";
import LineDrawState from "../states/LineDrawState.js";
import StarDrawState from "../states/StarDrawState.js";
import SelectState from "../states/SelectState.js";
import HistoryManager from "./HistoryManager.js";
import AddShapeAction from "../actions/AddShapeAction.js";
import DeleteShapesAction from "../actions/DeleteShapesAction.js";
import MoveState from "../states/MoveState.js";
import ScaleState from "../states/ScaleState.js";


class DrawManager {
    constructor() {
        this.initialized = false;
        this.app = null;
        this.tools = null;
        this.currentTool = null;
        this.shapes = null;    // container for every drawn shape
        this.overlay = null;   // container on top, for selection boxes
    }

    initialize(app) {
        // Prevent duplicate initialization and double mouse-listener bugs
        if (this.initialized) return;

        this.app = app;

        // Two layers: shapes underneath, selection boxes on top. Keeping them
        // apart means the Select tool can never select its own blue boxes.
        this.shapes = new Container();
        this.overlay = new Container();
        this.app.stage.addChild(this.shapes, this.overlay);

        // 1. Build the tools now that app is loaded
        this.tools = {
            circle: new CircleDrawState(this.shapes),
            rectangle: new RectDrawState(this.shapes),
            line: new LineDrawState(this.shapes),
            star: new StarDrawState(this.shapes),
            select: new SelectState(this.shapes, this.overlay),
            
        };
          this.tools.move = new MoveState(this.tools.select);
          this.tools.scale = new ScaleState(this.tools.select);

        // 2. Safely set the default active drawing tool
        this.currentTool = this.tools.rectangle;
        this.initialized = true;

        console.log("DrawManager successfully initialized as a Singleton instance.");
    }

    setTool(toolName) {
        if (!this.initialized) return;

        // Picking a drawing tool means you're done with the selection.
        // Select (and "none", used by Move/Scale for now) keep it.
        // Select, Move (and "none", used by Scale for now) keep it.
        const keepsSelection = toolName === null || toolName === "select" || toolName === "move" || toolName === "scale";
        if (!keepsSelection) {
            this.tools.select.clearSelection();
        }

                // Select, Move and Scale (and "none") keep it.
        
        // null means "no drawing tool": clicking on the canvas does nothing.
        if (toolName === null) {
            this.currentTool = null;
            console.log("Tool changed to: none");
            return;
        }

        if (this.tools[toolName]) {
            this.currentTool = this.tools[toolName];
            console.log(`Tool changed to: ${toolName}`);
        } else {
            console.warn(`Tool "${toolName}" does not exist.`);
        }
    }
    // Deletes every selected shape as one undoable step.
    deleteSelected() {
        const shapes = [...this.tools.select.selected];
        if (shapes.length === 0) return;   // nothing selected

        HistoryManager.perform(new DeleteShapesAction(this.shapes, shapes));
        this.tools.select.clearSelection();
    }

    // 3. Optional Safety Guard: "?." ensures clicking before initialization doesn't throw a crash error
    onPointerDown(position, shiftKey = false) {
        this.currentTool?.onPointerDown(position, shiftKey);
    }

    onPointerMove(position) {
        this.currentTool?.onPointerMove(position);
    }

    onPointerUp(position) {
        const shape = this.currentTool?.onPointerUp(position);

        // A real shape was drawn (not just a click): record it so it can be undone.
        if (shape) {
            shape.removeFromParent();   // the action puts it back for real
            HistoryManager.perform(new AddShapeAction(this.shapes, shape));
        }
    }
}

// Instantiate the architecture single instance automatically on export
const drawManagerInstance = new DrawManager();
export default drawManagerInstance;