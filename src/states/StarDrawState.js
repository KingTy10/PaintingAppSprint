import { DrawState } from "./DrawState";

class StarDrawState extends DrawState {
    drawShape(graphics) {
        // Distance from the click to the mouse sets the star's size.
        const radius = Math.hypot(this.lastX - this.firstX, this.lastY - this.firstY);

        graphics
            // x, y, points, outerRadius, innerRadius
            .star(this.firstX, this.firstY, 5, radius, radius / 2)
            .fill({ color: 0x000000, alpha: 0.5 })
            .stroke({ color: 0x000000, width: 4 });
    }
}
export default StarDrawState;