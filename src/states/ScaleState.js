import HistoryManager from "../managers/HistoryManager.js";
import ScaleShapesAction from "../actions/ScaleShapesAction.js";

// The Scale tool: drag away from the selected shapes to make them bigger,
// toward them to make them smaller. Everything selected grows together.
// If nothing is selected, it grabs whatever shape is under the mouse.
class ScaleState {
    static MinimumScale = 0.05;  // stops shapes shrinking to nothing or flipping
    static MinimumGrab = 10;     // grabbing right at the center would make tiny moves huge

    constructor(selectTool) {
        this.select = selectTool;   // to read (and show) the selection
        this.shapes = [];           // the shapes being resized
        this.before = [];           // their position and size when the drag began
        this.centerX = null;        // the point everything grows from
        this.centerY = null;
        this.startDistance = 0;     // how far from the center the drag began
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
        if (this.shapes.length === 0) return;   // nothing to resize

        // Remember where everything was, for undo.
        this.before = this.shapes.map(snapshot);

        // The center of one big box around all the selected shapes.
        let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
        for (const shape of this.shapes) {
            const b = shape.getBounds();
            left = Math.min(left, b.x);
            top = Math.min(top, b.y);
            right = Math.max(right, b.x + b.width);
            bottom = Math.max(bottom, b.y + b.height);
        }
        this.centerX = (left + right) / 2;
        this.centerY = (top + bottom) / 2;

        this.startDistance = Math.max(this.distanceFromCenter(position), ScaleState.MinimumGrab);
        this.isDragging = true;
    }

    onPointerMove(position) {
        if (!this.isDragging) return;
        this.scaleTo(position);
    }

    onPointerUp(position) {
        if (!this.isDragging) return null;

        this.scaleTo(position);
        this.isDragging = false;

        const after = this.shapes.map(snapshot);
        const changed = after.some((a, i) =>
            a.x !== this.before[i].x || a.y !== this.before[i].y ||
            a.scaleX !== this.before[i].scaleX || a.scaleY !== this.before[i].scaleY
        );
        if (!changed) return null;   // just a click, nothing resized

        // The shapes are already at their new size from the preview. The action
        // sets the exact same values, so performing it just records the step.
        HistoryManager.perform(new ScaleShapesAction(this.shapes, this.before, after));
        this.select.drawHighlight();

        // Not a new shape, so DrawManager has nothing to record.
        return null;
    }

    // Live preview: resize the shapes based on how far the mouse is from the center.
    scaleTo(position) {
        // Twice as far from the center as where you started = twice as big.
        const factor = Math.max(
            this.distanceFromCenter(position) / this.startDistance,
            ScaleState.MinimumScale
        );

        this.shapes.forEach((shape, i) => {
            const was = this.before[i];

            // Push each shape away from (or pull it toward) the center as it
            // grows, so a group grows together instead of piling up.
            shape.x = this.centerX + (was.x - this.centerX) * factor;
            shape.y = this.centerY + (was.y - this.centerY) * factor;
            shape.scale.set(was.scaleX * factor, was.scaleY * factor);
        });

        this.select.drawHighlight();   // keep the blue boxes on the shapes
    }

    distanceFromCenter(position) {
        return Math.hypot(position.x - this.centerX, position.y - this.centerY);
    }
}

// A shape's current position and size.
function snapshot(shape) {
    return { x: shape.x, y: shape.y, scaleX: shape.scale.x, scaleY: shape.scale.y };
}

export default ScaleState;