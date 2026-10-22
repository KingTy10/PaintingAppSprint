import { Graphics } from "pixi.js";
import { DrawState } from "./DrawState";

class RectangleDrawState extends DrawState {
    drawShape() {
        // Calculate top-left corner and bounding box bounds
        const x = Math.min(this.firstX, this.lastX);
        const y = Math.min(this.firstY, this.lastY);
        const width = Math.abs(this.lastX - this.firstX);
        const height = Math.abs(this.lastY - this.firstY);

        // Don't render accidental zero-sized clicks
        if (width === 0 || height === 0) return;

        const rectangle = new Graphics()
            .rect(x, y, width, height)
            .fill({ color: 0x000000, alpha: 0.5 })
            .stroke({ color: 0x000000, width: 4 });

        this.stage.addChild(rectangle);
    }
}
export default RectangleDrawState;
