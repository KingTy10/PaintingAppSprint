import { Graphics } from "pixi.js";
import { DrawState } from "./DrawState";

class CircleDrawState extends DrawState {
    drawShape() {
        const radiusX = Math.abs(this.lastX - this.firstX) / 2;
        const radiusY = Math.abs(this.lastY - this.firstY) / 2;
        const centerX = (this.firstX + this.lastX) / 2;
        const centerY = (this.firstY + this.lastY) / 2;

        const ellipse = new Graphics()
            .ellipse(centerX, centerY, radiusX, radiusY)
            .fill({ color: 0x000000, alpha: 0.5 })
            .stroke({ color: 0x000000, width: 4 }); // Fixed typo 'with' -> 'width'

        this.stage.addChild(ellipse);
    }
}
export default CircleDrawState;