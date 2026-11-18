// Resizes shapes. Remembers each shape's position and size before and after,
// so undo can put them back exactly.
export default class ScaleShapesAction {
    // before and after are lists of { x, y, scaleX, scaleY }, one per shape.
    constructor(shapes, before, after) {
        this.shapes = shapes;
        this.before = before;
        this.after = after;
    }

    execute() { this.apply(this.after); }
    undo()    { this.apply(this.before); }

    apply(states) {
        this.shapes.forEach((shape, i) => {
            shape.x = states[i].x;
            shape.y = states[i].y;
            shape.scale.set(states[i].scaleX, states[i].scaleY);
        });
    }
}