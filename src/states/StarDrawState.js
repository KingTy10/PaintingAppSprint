import { DrawState } from "./DrawState";

class StarDrawState extends DrawState {
    drawShape(graphics) {
        // Distance from the click to the mouse sets the star's size.
        const outer = Math.hypot(this.lastX - this.firstX, this.lastY - this.firstY);
        const inner = outer / 2;

        // 10 corners, alternating between the tips and the dents,
        // starting with a tip pointing straight up.
        const points = [];
        for (let i = 0; i < 10; i++) {
            const radius = i % 2 === 0 ? outer : inner;
            const angle = -Math.PI / 2 + (i * Math.PI) / 5;
            points.push({
                x: this.firstX + radius * Math.cos(angle),
                y: this.firstY + radius * Math.sin(angle),
            });
        }

        this.paint(graphics, points, true);
    }
}
export default StarDrawState;