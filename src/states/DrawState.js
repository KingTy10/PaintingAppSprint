import { Graphics } from "pixi.js";
import StyleManager from "../managers/StyleManager.js";
import { dashes, dots } from "./Borders.js";

export class DrawState {
    // Drags shorter than this (in pixels) count as a click and are thrown away.
    static MinimumSize = 2;

    firstX = null;
    firstY = null;
    lastX = null;
    lastY = null;
    isDrawing = false;
    graphics = null;   // the shape being drawn
    style = null;      // the colors and border this shape is drawn with

    constructor(stage) {
        this.stage = stage;
    }

    onPointerDown(position) {
        this.firstX = position.x;
        this.firstY = position.y;
        this.lastX = position.x;
        this.lastY = position.y;
        this.isDrawing = true;

        // Lock in the current style for this shape.
        this.style = StyleManager.current();

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

        // Give the shape a frozen copy of this tool, so it can be redrawn
        // later in a different color or style.
        shape.recipe = this.snapshot();

        return shape;
    }

    // Wipes the shape and draws it again at the current mouse position.
    redraw() {
        this.graphics.clear();
        this.drawShape(this.graphics);
    }

    // A copy of this tool, frozen at this exact drag and style.
    // It's the shape's "recipe": it knows how to draw that exact shape again.
    snapshot() {
        const copy = new this.constructor(this.stage);
        copy.firstX = this.firstX;
        copy.firstY = this.firstY;
        copy.lastX = this.lastX;
        copy.lastY = this.lastY;
        copy.style = { ...this.style };
        return copy;
    }

    // Redraws a finished shape with a new style (used by the recipe).
    restyle(shape, style) {
        this.style = style;
        shape.clear();
        this.drawShape(shape);
    }

    // Each shape class fills this in. It works out its corner points
    // and hands them to paint().
    drawShape(graphics) {
        throw new Error(`${this.constructor.name} must implement drawShape()`);
    }

    // Draws a shape from its corner points, using this.style.
    // closed = true if the last corner joins back to the first (has an inside).
    paint(graphics, points, closed) {
        const style = this.style;
        const flat = points.flatMap((p) => [p.x, p.y]);   // [x1, y1, x2, y2, ...]

        // ---- Fill (only shapes with an inside) ----
        const hasFill = closed && style.filled;
        if (hasFill) {
            graphics.poly(flat).fill({ color: style.fillColor, alpha: style.fillAlpha });
        }

        // ---- Border ----
        // With no fill, a 0-width border would make the shape invisible,
        // so it always gets at least a thin one.
        const width = hasFill ? style.strokeWidth : Math.max(style.strokeWidth, 1);
        if (width <= 0) return;

        const color = style.strokeColor;

        if (style.borderType === "dashed") {
            // Thicker borders get longer dashes, so they still look like dashes.
            for (const dash of dashes(points, closed, width * 3 + 4, width * 2 + 3)) {
                graphics.moveTo(dash[0].x, dash[0].y);
                for (const p of dash.slice(1)) {
                    graphics.lineTo(p.x, p.y);
                }
            }
            graphics.stroke({ color, width });
        } else if (style.borderType === "dotted") {
            for (const p of dots(points, closed, width * 2 + 4)) {
                graphics.circle(p.x, p.y, width / 2);
            }
            graphics.fill({ color });
        } else {
            if (closed) {
                graphics.poly(flat);
            } else {
                graphics.moveTo(points[0].x, points[0].y);
                for (const p of points.slice(1)) {
                    graphics.lineTo(p.x, p.y);
                }
            }
            graphics.stroke({ color, width });
        }
    }
}