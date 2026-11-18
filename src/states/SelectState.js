import { Graphics } from "pixi.js";

// The Select tool.
//   Click a shape:       selects it (click empty space to deselect everything)
//   Drag a box:          selects every shape the box touches
//   Hold Shift:          adds to the selection instead of replacing it
//   Shift + click shape: removes it if it was already selected
class SelectState {
    // A drag shorter than this (in pixels) counts as a click.
    static ClickDistance = 3;

    constructor(shapes, overlay) {
        this.shapes = shapes;     // container that holds the drawn shapes
        this.overlay = overlay;   // container on top, for the blue boxes

        this.selected = [];       // the shapes that are selected right now

        // Draws the blue outline around each selected shape.
        this.highlight = new Graphics();
        this.overlay.addChild(this.highlight);

        // The blue box you drag out (only exists while dragging).
        this.box = null;
        this.firstX = null;
        this.firstY = null;
        this.lastX = null;
        this.lastY = null;
        this.addToSelection = false;
    }

    onPointerDown(position, shiftKey = false) {
        this.firstX = position.x;
        this.firstY = position.y;
        this.lastX = position.x;
        this.lastY = position.y;
        this.addToSelection = shiftKey;

        this.box = new Graphics();
        this.overlay.addChild(this.box);
        this.drawBox();
    }

    onPointerMove(position) {
        if (!this.box) return;

        this.lastX = position.x;
        this.lastY = position.y;
        this.drawBox();
    }

    onPointerUp(position) {
        if (!this.box) return null;

        this.lastX = position.x;
        this.lastY = position.y;

        // The drag box only shows while dragging.
        this.box.removeFromParent();
        this.box.destroy();
        this.box = null;

        const dragDistance = Math.hypot(this.lastX - this.firstX, this.lastY - this.firstY);

        if (dragDistance < SelectState.ClickDistance) {
            this.selectAt(this.lastX, this.lastY);
        } else {
            this.selectInBox(this.dragRect());
        }

        this.drawHighlight();

        // Selecting isn't a shape, so there's nothing for undo to record.
        return null;
    }

    // ---- Picking shapes ----

    // Click: the top shape under the point.
    selectAt(x, y) {
        const shape = this.shapeAt(x, y);

        if (!this.addToSelection) {
            this.selected = shape ? [shape] : [];
        } else if (shape) {
            // Shift + click toggles the shape in or out of the selection.
            if (this.selected.includes(shape)) {
                this.selected = this.selected.filter((s) => s !== shape);
            } else {
                this.selected.push(shape);
            }
        }
    }

    // Drag: every shape that overlaps the box.
    selectInBox(rect) {
        const found = this.shapes.children.filter((shape) =>
            overlaps(shape.getBounds(), rect)
        );

        if (!this.addToSelection) {
            this.selected = [];
        }
        for (const shape of found) {
            if (!this.selected.includes(shape)) {
                this.selected.push(shape);
            }
        }
    }

    // The top shape under the point, or null. Shapes drawn later sit on top,
    // so check from the end of the list.
    shapeAt(x, y) {
        const shapes = this.shapes.children;
        for (let i = shapes.length - 1; i >= 0; i--) {
            const b = shapes[i].getBounds();
            if (x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) {
                return shapes[i];
            }
        }
        return null;
    }

    clearSelection() {
        this.selected = [];
        this.drawHighlight();
    }

    // ---- Drawing the blue boxes ----

    // The drag box, right side up whichever way you drag.
    dragRect() {
        return {
            x: Math.min(this.firstX, this.lastX),
            y: Math.min(this.firstY, this.lastY),
            width: Math.abs(this.lastX - this.firstX),
            height: Math.abs(this.lastY - this.firstY),
        };
    }

    drawBox() {
        const { x, y, width, height } = this.dragRect();
        this.box
            .clear()
            .rect(x, y, width, height)
            .fill({ color: 0x0099ff, alpha: 0.1 })
            .stroke({ color: 0x0099ff, width: 1 });
    }

    // A blue outline around each selected shape.
    drawHighlight() {
        // Forget shapes that are no longer on the canvas (e.g. undone).
        this.selected = this.selected.filter((shape) => shape.parent === this.shapes);

        this.highlight.clear();
        for (const shape of this.selected) {
            const b = shape.getBounds();
            this.highlight
                .rect(b.x - 4, b.y - 4, b.width + 8, b.height + 8)
                .stroke({ color: 0x0099ff, width: 2 });
        }
    }
}

// True if two rectangles { x, y, width, height } overlap.
function overlaps(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x &&
           a.y < b.y + b.height && a.y + a.height > b.y;
}

export default SelectState;