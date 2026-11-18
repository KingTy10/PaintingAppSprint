import { DrawState } from "./DrawState";

class CircleDrawState extends DrawState {
    drawShape(graphics) {
        const radiusX = Math.abs(this.lastX - this.firstX) / 2;
        const radiusY = Math.abs(this.lastY - this.firstY) / 2;
        const centerX = (this.firstX + this.lastX) / 2;
        const centerY = (this.firstY + this.lastY) / 2;

        // An ellipse is drawn as lots of tiny straight sides, so dashed and
        // dotted borders can follow it. Bigger ellipses get more sides.
        const sides = Math.max(24, Math.ceil((radiusX + radiusY) / 2));
        const points = [];
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            points.push({
                x: centerX + radiusX * Math.cos(angle),
                y: centerY + radiusY * Math.sin(angle),
            });
        }

        this.paint(graphics, points, true);
    }
}
export default CircleDrawState;