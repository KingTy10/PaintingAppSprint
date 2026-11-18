// Changes the look of shapes: fill color, border color, thickness, fill on/off
// or border type. Only the parts in `changes` are touched, so changing the fill
// color keeps each shape's own border. Undo puts each shape's old style back.
export default class RestyleShapesAction {
    constructor(selected, changes) {
        // Groups don't have a style themselves, so reach inside them.
        this.shapes = selected.flatMap(shapesIn);
        this.before = this.shapes.map((shape) => ({ ...shape.recipe.style }));
        this.after = this.before.map((style) => ({ ...style, ...changes }));
    }

    execute() {
        this.shapes.forEach((shape, i) => shape.recipe.restyle(shape, this.after[i]));
    }

    undo() {
        this.shapes.forEach((shape, i) => shape.recipe.restyle(shape, this.before[i]));
    }
}

// Every real shape in something that's selected: the shape itself,
// or every shape inside a group (even groups inside groups).
function shapesIn(item) {
    if (item.isGroup) {
        return item.children.flatMap(shapesIn);
    }
    return item.recipe ? [item] : [];
}