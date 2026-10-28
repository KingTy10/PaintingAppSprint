export default class MoveShapesAction {
    constructor(shapes, dx, dy) {
        this.shapes = shapes;
        this.dx = dx;
        this.dy = dy;
    }
    execute() { for (const s of this.shapes) { s.x += this.dx; s.y += this.dy; } }
    undo()    { for (const s of this.shapes) { s.x -= this.dx; s.y -= this.dy; } }
}