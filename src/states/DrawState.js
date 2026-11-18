import { Graphics } from "pixi.js";

export class DrawState {
    // Drags shorter than this (in pixels) count as a click and are thrown away.
    static MinimumSize = 2;

    firstX = null;
    firstY = null;
    lastX = null;
    lastY = null;
    isDrawing = false;
    graphics = null;   // the shape being drawn

    constructor(stage) {
        this.stage = stage;
    }

    onPointerDown(position) {
        this.firstX = position.x;
        this.firstY = position.y;
        this.lastX = position.x;
        this.lastY = position.y;
        this.isDrawing = true;

        // Create the shape right away so it shows while dragging.
        this.graphics = new Graphics();
        this.stage.addChild(this.graphics);
        this.redraw();
    }

    onPointerMove(position) {
        if (!this.isDrawing) return;

        this.lastX = position.x;
        this.lastY = position.y;
        this.redraw();
    }

    // Finishes the shape and returns it, or null if it was just a click.
    onPointerUp(position) {
        if (!this.isDrawing) return null;

        this.lastX = position.x;
        this.lastY = position.y;
        this.redraw();
        this.isDrawing = false;

        const shape = this.graphics;
        this.graphics = null;

        const size = Math.hypot(this.lastX - this.firstX, this.lastY - this.firstY);
        if (size < DrawState.MinimumSize) {
            shape.removeFromParent();
            shape.destroy();
            return null;
        }

        return shape;
    }

    // Wipes the shape and draws it again at the current mouse position.
    redraw() {
        this.graphics.clear();
        this.drawShape(this.graphics);
    }

    // Each shape class fills this in.
    drawShape(graphics) {
        throw new Error(`${this.constructor.name} must implement drawShape()`);
    }
}