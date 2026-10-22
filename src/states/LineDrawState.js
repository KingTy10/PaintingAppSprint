import { Graphics } from "pixi.js";
import { DrawState } from "./DrawState";

class LineDrawState extends DrawState {
    drawShape() {
        const line = new Graphics()
            // Move cursor to mouse click start
            .moveTo(this.firstX, this.firstY)
            // Trace path to mouse release end
            .lineTo(this.lastX, this.lastY)
            // Lines only use stroke, they do not have a filled area
            .stroke({ color: 0x000000, width: 4 });

        this.stage.addChild(line);
    }
}
export default LineDrawState;