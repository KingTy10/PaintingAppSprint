import { Graphics } from "pixi.js";
import { DrawState } from "./DrawState";

class StarDrawState extends DrawState {
    drawShape() {
        const centerX = this.firstX;
        const centerY = this.firstY;
        
        // Distance from start click to drag location determines star size
        const radius = Math.sqrt(
            Math.pow(this.lastX - this.firstX, 2) + 
            Math.pow(this.lastY - this.firstY, 2)
        );

        // Ignore stationary clicks
        if (radius < 2) return;

        const star = new Graphics()
            // x, y, points, outerRadius, innerRadius
            .star(centerX, centerY, 5, radius, radius / 2)
            .fill({ color: 0x000000, alpha: 0.5 })
            .stroke({ color: 0x000000, width: 4 });

        this.stage.addChild(star);
    }
}
export default StarDrawState;
