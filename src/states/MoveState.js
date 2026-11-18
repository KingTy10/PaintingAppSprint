import HistoryManager from "../managers/HistoryManager.js";
import MoveShapesAction from "../actions/MoveShapesAction.js";

// The Move tool: drag to slide every selected shape by the same amount.
// If nothing is selected, it grabs whatever shape is under the mouse.
class MoveState {
    constructor(selectTool) {
        this.select = selectTool;   // to read (and show) the selection
        this.shapes = [];           // the shapes being moved
        this.startX = null;
        this.startY = null;
        this.dx = 0;                // how far they've moved so far
        this.dy = 0;
        this.isDragging = false;
    }

    onPointerDown(position) {
        // Nothing selected? Grab the shape under the mouse, if there is one.
        if (this.select.selected.length === 0) {
            const shape = this.select.shapeAt(position.x, position.y);
            if (shape) {
                this.select.selected = [shape];
            }
        }

        this.shapes = [...this.select.selected];
        if (this.shapes.length === 0) return;   // nothing to move

        this.startX = position.x;
        this.startY = position.y;
        this.dx = 0;
        this.dy = 0;
        this.isDragging = true;
    }

    onPointerMove(position) {
        if (!this.isDragging) return;
        this.moveTo(position);
    }

    onPointerUp(position) {
        if (!this.isDragging) return null;

        this.moveTo(position);
        this.isDragging = false;

        const { dx, dy } = this;
        if (dx === 0 && dy === 0) return null;   // just a click, nothing moved

        // The shapes already moved during the preview. Put them back, and let
        // the action move them for real, so undo knows exactly what happened.
        for (const shape of this.shapes) {
            shape.x -= dx;
            shape.y -= dy;
        }
        HistoryManager.perform(new MoveShapesAction(this.shapes, dx, dy));
        this.select.drawHighlight();

        // Not a new shape, so DrawManager has nothing to record.
        return null;
    }

    // Live preview: shift the shapes so they follow the mouse.
    moveTo(position) {
        const newDx = position.x - this.startX;
        const newDy = position.y - this.startY;

        // Only move by the change since last time.
        for (const shape of this.shapes) {
            shape.x += newDx - this.dx;
            shape.y += newDy - this.dy;
        }

        this.dx = newDx;
        this.dy = newDy;
        this.select.drawHighlight();   // keep the blue boxes on the shapes
    }
}

export default MoveState;