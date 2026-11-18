# Painting App

A browser-based drawing app built with **JavaScript** and **PixiJS**. Draw shapes, style them with colors and dashed or dotted borders, then select, move, resize, group and delete them, with full undo and redo.

**Live demo:** https://kingty10.github.io/PaintingAppSprint/

---

## Features

- **Shapes:** ellipse, rectangle, line and star, plus five custom shapes: plus sign, house, lightning bolt, bookmark and shield. Shapes preview live while you drag.
- **Styles:** fill color, border color, border thickness, fill or no fill, and solid, dashed (`- - -`) or dotted (`· · ·`) borders.
- **Restyling:** select shapes and change any color or style to update them.
- **Select:** click a shape, or drag a box to select several. Hold **Shift** to add to the selection.
- **Move and Scale:** drag the selected shapes to move them, or drag away from or toward them to resize. Several shapes move and scale together.
- **Delete:** remove the selected shapes.
- **Group / Ungroup:** combine shapes into one object that selects, moves, scales, deletes and restyles as one. Groups can contain other groups.
- **Undo / Redo** for every change.

## Controls

| Action | How |
|---|---|
| Draw a shape | Pick it from **Shapes** or **Custom Shapes**, then click and drag |
| Select | **Select** tool, then click a shape or drag a box |
| Add to selection | Hold **Shift** while clicking or dragging |
| Move / resize | **Move** or **Scale** tool, then drag |
| Delete | Trash can button, or **Delete** / **Backspace** |
| Group / ungroup | Group buttons, or **Ctrl+G** / **Ctrl+Shift+G** |
| Undo | Undo button, or **Ctrl+Z** |
| Redo | Redo button, or **Ctrl+Y** / **Ctrl+Shift+Z** |

## Built With

- [PixiJS 8](https://pixijs.com/): 2D rendering
- [Vite](https://vitejs.dev/): development server and build
- [Font Awesome](https://fontawesome.com/): toolbar icons
- GitHub Actions + GitHub Pages: automatic deployment

## Getting Started

You need [Node.js](https://nodejs.org/) installed.

```bash
git clone https://github.com/KingTy10/PaintingAppSprint.git
cd PaintingAppSprint
npm install
npm run dev
```

Then open the `localhost` link that Vite prints.

## Project Structure

```
src/
├── main.js            Builds the toolbar and connects mouse, keyboard and buttons
├── managers/
│   ├── DrawManager.js     Holds the active tool and sends mouse events to it
│   ├── HistoryManager.js  Undo and redo stacks
│   ├── StyleManager.js    Current colors, thickness and border style
│   └── ToolsManager.js    Builds the toolbar buttons
├── states/            One class per tool
│   ├── DrawState.js       Shared drawing logic: dragging, preview, fill and border
│   ├── CircleDrawState.js, RectDrawState.js, LineDrawState.js, StarDrawState.js
│   ├── PolygonDrawState.js  The five custom shapes
│   ├── SelectState.js, MoveState.js, ScaleState.js
│   └── Borders.js         Math for dashed and dotted borders
└── actions/           One class per undoable change
    ├── AddShapeAction.js, DeleteShapesAction.js
    ├── MoveShapesAction.js, ScaleShapesAction.js, RestyleShapesAction.js
    └── GroupShapesAction.js, UngroupShapesAction.js
```

## Design Patterns

- **State:** each tool is its own class. `DrawManager` forwards mouse events to whichever tool is active, so adding a tool never changes the event code.
- **Command:** every change is an action with `execute()` and `undo()`, stored by `HistoryManager`. Each new feature became undoable just by adding an action class.
- **Template Method:** `DrawState` handles dragging, previewing and drawing. Each shape only provides its corner points.
- **Composite:** a group is a container that can hold shapes or other groups, and the rest of the app treats it like a single shape.
- **Singleton:** one shared `DrawManager`, `HistoryManager` and `StyleManager`.
- **Prototype:** each finished shape keeps a copy of the tool that drew it, so it can be redrawn in a new style.

UML diagrams for each pattern are in [`docs/UML.md`](docs/UML.md).

## Known Issues

- **Selection uses bounding boxes:** clicking the empty corner around a star or lightning bolt still selects it.
- **Resizing is uniform only:** there are no handles to stretch just the width or height, and borders and dashes get thicker or thinner as shapes are resized.
- **Custom shapes stretch** to the box you drag, so they can look squashed in a very wide or tall box.
- **Ellipses are drawn as many short straight sides** (needed for dashed borders), so very large ones can look slightly faceted.
- **No rotation.**
- **No selecting inside a group:** you have to ungroup first.
- **Nothing is saved:** refreshing the page clears the drawing.

## Future Ideas

- Imported background images to draw on top of
- Themes: light, dark, retro, and color themes like pink, blue, orange and red

## A Note on the Commit History

Part of this project was written on a peer's laptop, so some commits in the history appear under their name or account instead of mine. The project is mine; those commits were simply made from a borrowed computer.
