import { DrawState } from "./DrawState";

class LineDrawState extends DrawState {
    drawShape(graphics) {
        const points = [
            { x: this.firstX, y: this.firstY },
            { x: this.lastX, y: this.lastY },
        ];

        // Not closed: a line has no inside, so it never gets a fill.
        this.paint(graphics, points, false);
    }
}
export default LineDrawState;