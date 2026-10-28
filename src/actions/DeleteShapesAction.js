export default class DeleteShapesAction {
    constructor(stage, shapes) {
        this.stage = stage;
        // remember each shape's layer position, lowest first
        this.items = shapes
            .map(shape => ({ shape, index: stage.getChildIndex(shape) }))
            .sort((a, b) => a.index - b.index);
    }
    execute() { for (const { shape } of this.items) this.stage.removeChild(shape); }
    undo() {
        for (const { shape, index } of this.items) {
            this.stage.addChildAt(shape, Math.min(index, this.stage.children.length));
        }
    }
}