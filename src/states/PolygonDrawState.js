import { DrawState } from "./DrawState";

// Parent class for the custom shapes. You drag out a box (like the rectangle),
// and the shape is stretched to fill it.
//
// Each shape lists its corners in `corners` as fractions of that box:
// [0, 0] = top-left, [1, 1] = bottom-right, [0.5, 0.5] = the middle.
export class PolygonDrawState extends DrawState {
    corners = [];

    drawShape(graphics) {
        // The drag box, right side up whichever way you drag.
        const x = Math.min(this.firstX, this.lastX);
        const y = Math.min(this.firstY, this.lastY);
        const width = Math.abs(this.lastX - this.firstX);
        const height = Math.abs(this.lastY - this.firstY);

        // Turn each [fx, fy] fraction into a real spot on the canvas.
        const points = this.corners.map(([fx, fy]) => ({
            x: x + fx * width,
            y: y + fy * height,
        }));

        this.paint(graphics, points, true);
    }
}

// A plus sign: each arm is a third of the box wide.
export class PlusDrawState extends PolygonDrawState {
    corners = [
        [1/3, 0], [2/3, 0], [2/3, 1/3], [1, 1/3],
        [1, 2/3], [2/3, 2/3], [2/3, 1], [1/3, 1],
        [1/3, 2/3], [0, 2/3], [0, 1/3], [1/3, 1/3],
    ];
}

// A house: pointed roof with overhanging edges, then the walls.
export class HouseDrawState extends PolygonDrawState {
    corners = [
        [0.5, 0],                          // roof peak
        [1, 0.45], [0.85, 0.45],           // right edge of roof, in to the wall
        [0.85, 1], [0.15, 1],              // bottom of the walls
        [0.15, 0.45], [0, 0.45],           // left wall up, out to the roof edge
    ];
}

// A lightning bolt.
export class BoltDrawState extends PolygonDrawState {
    corners = [
        [0.6, 0], [0, 0.55], [0.45, 0.55],     // top, slash down-left, step right
        [0.25, 1],                              // bottom tip
        [1, 0.4], [0.55, 0.4], [0.8, 0],       // slash up-right, step left, back to top
    ];
}

// A bookmark: a rectangle with a V-shaped notch cut out of the bottom.
export class BookmarkDrawState extends PolygonDrawState {
    corners = [
        [0, 0], [1, 0], [1, 1],
        [0.5, 0.75],                       // the notch
        [0, 1],
    ];
}

// A shield: slightly curved-looking top, coming to a point at the bottom.
export class ShieldDrawState extends PolygonDrawState {
    corners = [
        [0, 0.1], [0.5, 0], [1, 0.1],
        [1, 0.55], [0.5, 1], [0, 0.55],
    ];
}