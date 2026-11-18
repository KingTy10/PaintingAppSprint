import { DrawState } from "./DrawState";

class LineDrawState extends DrawState {
    drawShape(graphics) {
        graphics
            .moveTo(this.firstX, this.firstY)
            .lineTo(this.lastX, this.lastY)
            // Lines only use stroke, they have no filled area.
            .stroke({ color: 0x000000, width: 4 });
    }
}
export default LineDrawState;