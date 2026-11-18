import { Container } from "pixi.js";

// Puts several shapes into one group, so they select, move, scale and delete
// as one object. Undo takes them back out to exactly where they were.
export default class GroupShapesAction {
    constructor(layer, shapes) {
        this.layer = layer;     // the container the shapes live in
        this.shapes = shapes;

        // A group is just a container holding the shapes.
        this.group = new Container();
        this.group.isGroup = true;   // so Ungroup can tell groups from shapes

        this.items = [];             // filled in by execute(): { shape, index }
    }

    execute() {
        // Remember each shape's layer position, lowest first.
        this.items = this.shapes
            .map((shape) => ({ shape, index: this.layer.getChildIndex(shape) }))
            .sort((a, b) => a.index - b.index);

        // The group goes where the top-most shape was. All the other grouped
        // shapes were below it, so that spot moves down by one for each.
        const topIndex = this.items[this.items.length - 1].index;
        const groupIndex = topIndex - (this.items.length - 1);

        // Moving them in lowest first keeps their order inside the group.
        for (const { shape } of this.items) {
            this.group.addChild(shape);
        }
        this.layer.addChildAt(this.group, groupIndex);
    }

    undo() {
        this.layer.removeChild(this.group);

        // Lowest first, each shape goes back into its old spot.
        for (const { shape, index } of this.items) {
            this.layer.addChildAt(shape, index);
        }
    }
}