import { Container } from "pixi.js";
import CircleDrawState from "../states/CircleDrawState.js";
import RectDrawState from "../states/RectDrawState.js";
import LineDrawState from "../states/LineDrawState.js";
import StarDrawState from "../states/StarDrawState.js";
import {
    PlusDrawState,
    HouseDrawState,
    BoltDrawState,
    BookmarkDrawState,
    ShieldDrawState,
} from "../states/PolygonDrawState.js";
import SelectState from "../states/SelectState.js";
import MoveState from "../states/MoveState.js";
import ScaleState from "../states/ScaleState.js";
import HistoryManager from "./HistoryManager.js";
import AddShapeAction from "../actions/AddShapeAction.js";
import DeleteShapesAction from "../actions/DeleteShapesAction.js";
import GroupShapesAction from "../actions/GroupShapesAction.js";
import UngroupShapesAction from "../actions/UngroupShapesAction.js";
import RestyleShapesAction from "../actions/RestyleShapesAction.js";

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
            plus: new PlusDrawState(this.shapes),
            house: new HouseDrawState(this.shapes),
            bolt: new BoltDrawState(this.shapes),
            bookmark: new BookmarkDrawState(this.shapes),
            shield: new ShieldDrawState(this.shapes),
            select: new SelectState(this.shapes, this.overlay),
        };
        // Move reads the selection, so it's created after Select.
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
        // Select, Move and Scale (and "none") keep it.
        const keepsSelection = toolName === null || toolName === "select" ||
                               toolName === "move" || toolName === "scale";
        if (!keepsSelection) {
            this.tools.select.clearSelection();
        }

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

    // Changes the look of the selected shapes as one undoable step,
    // e.g. restyleSelected({ fillColor: 0xff0000 }).
    restyleSelected(changes) {
        const select = this.tools.select;
        if (select.selected.length === 0) return;   // nothing selected

        HistoryManager.perform(new RestyleShapesAction([...select.selected], changes));
        select.drawHighlight();   // a thicker border can change the size
    }

    // Puts the selected shapes (2 or more) into one group, then selects the group.
    groupSelected() {
        const select = this.tools.select;
        const shapes = [...select.selected];
        if (shapes.length < 2) return;   // need at least two to group

        const action = new GroupShapesAction(this.shapes, shapes);
        HistoryManager.perform(action);

        select.selected = [action.group];
        select.drawHighlight();
    }

    // Breaks apart every selected group, then selects the shapes that were inside.
    ungroupSelected() {
        const select = this.tools.select;
        const groups = select.selected.filter((shape) => shape.isGroup);
        if (groups.length === 0) return;   // no groups selected

        const others = select.selected.filter((shape) => !shape.isGroup);
        const freed = groups.flatMap((group) => [...group.children]);

        HistoryManager.perform(new UngroupShapesAction(this.shapes, groups));

        select.selected = [...others, ...freed];
        select.drawHighlight();
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