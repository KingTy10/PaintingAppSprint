// Breaks groups apart so their shapes are separate again. Undo regroups them.
//
// If a group was moved or scaled, its shapes don't know that: the group's own
// position and scale were doing it. So when a shape leaves the group, the
// group's position and scale get "baked into" the shape, and it stays exactly
// where it was on screen.
export default class UngroupShapesAction {
    constructor(layer, groups) {
        this.layer = layer;
        this.groups = groups;
        this.records = [];   // filled in by execute()
    }

    execute() {
        this.records = this.groups.map((group) => ({
            group,
            index: this.layer.getChildIndex(group),
            children: [...group.children],
            // each child's position and size inside the group, for undo
            before: group.children.map((c) => ({ x: c.x, y: c.y, scaleX: c.scale.x, scaleY: c.scale.y })),
        }));

        // Highest layer first, so breaking one group apart never shifts the
        // spot of a group we haven't handled yet.
        const highestFirst = [...this.records].sort((a, b) => b.index - a.index);

        for (const { group, index, children } of highestFirst) {
            this.layer.removeChild(group);

            children.forEach((child, i) => {
                // Bake the group's position and scale into the shape.
                child.x = group.x + group.scale.x * child.x;
                child.y = group.y + group.scale.y * child.y;
                child.scale.set(group.scale.x * child.scale.x, group.scale.y * child.scale.y);

                // The shapes take the group's spot, in their original order.
                this.layer.addChildAt(child, index + i);
            });
        }
    }

    undo() {
        // Lowest layer first: the mirror image of execute().
        const lowestFirst = [...this.records].sort((a, b) => a.index - b.index);

        for (const { group, index, children, before } of lowestFirst) {
            children.forEach((child, i) => {
                child.x = before[i].x;
                child.y = before[i].y;
                child.scale.set(before[i].scaleX, before[i].scaleY);
                group.addChild(child);
            });
            this.layer.addChildAt(group, index);
        }
    }
}