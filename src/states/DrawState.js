export class DrawState {
    firstX = null;
    firstY = null;
    lastX = null;
    lastY = null;
    isDrawing = false;

    constructor(stage) {
        this.stage = stage;
    }

    onPointerDown(position) {
        this.firstX = position.x;
        this.firstY = position.y;
        this.isDrawing = true;
    }

    onPointerMove(position) {
        if (this.isDrawing) {
            this.lastX = position.x;
            this.lastY = position.y;
        }
    }

    onPointerUp(position) {
        if (!this.isDrawing) return null;

        this.lastX = position.x;
        this.lastY = position.y;
        this.isDrawing = false;
        
        // This is a placeholder that our child classes will fill in
        this.drawShape();
    }
}
