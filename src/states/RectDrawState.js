import { DrawState } from "./DrawState";

class RectangleDrawState extends DrawState {
    drawShape(graphics) {
        // Top-left corner and size, so dragging in any direction works.
        const x = Math.min(this.firstX, this.lastX);
        const y = Math.min(this.firstY, this.lastY);
        const width = Math.abs(this.lastX - this.firstX);
        const height = Math.abs(this.lastY - this.firstY);

        graphics
            .rect(x, y, width, height)
            .fill({ color: 0x000000, alpha: 0.5 })
            .stroke({ color: 0x000000, width: 4 });
    }
}
export default RectangleDrawState;