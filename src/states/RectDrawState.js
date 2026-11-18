import { DrawState } from "./DrawState";

class RectangleDrawState extends DrawState {
    drawShape(graphics) {
        // Top-left corner and size, so dragging in any direction works.
        const x = Math.min(this.firstX, this.lastX);
        const y = Math.min(this.firstY, this.lastY);
        const width = Math.abs(this.lastX - this.firstX);
        const height = Math.abs(this.lastY - this.firstY);

        const points = [
            { x, y },
            { x: x + width, y },
            { x: x + width, y: y + height },
            { x, y: y + height },
        ];

        this.paint(graphics, points, true);
    }
}
export default RectangleDrawState;