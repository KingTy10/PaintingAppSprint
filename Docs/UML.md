# Painting App: UML Diagrams

How the app is put together, and the design patterns it uses.

| Notation | Meaning |
|---|---|
| Solid line, hollow triangle | Inheritance (`extends`) |
| Dashed line, hollow triangle | Implements an interface |
| Hollow diamond | Holds / keeps a list of |
| Dashed arrow | Uses / creates |
| Underlined member | Static |
| *Italic* method | Abstract (each child class must provide it) |
| Yellow box | Note |

---

## 1. Architecture Overview

The big picture: `main.js` builds the toolbar and sends mouse events to `DrawManager`, which passes them to the active tool. Every change to the drawing goes through `HistoryManager` as an action, so it can be undone.

```mermaid
classDiagram
    direction LR

    class MainJS {
        <<module>>
        toolbar buttons
        mouse events
        keyboard shortcuts
    }
    class ToolsManager {
        <<singleton>>
        +addToolGroup()
        +getTool()
        +getColorPicker()
    }
    class DrawManager {
        <<singleton>>
        +tools
        +currentTool
        +setTool(name)
        +deleteSelected()
        +restyleSelected(changes)
        +groupSelected()
        +ungroupSelected()
    }
    class Tool {
        <<interface>>
        drawing tools, Select, Move, Scale
    }
    class HistoryManager {
        <<singleton>>
        +perform(action)
        +undo()
        +redo()
    }
    class Action {
        <<interface>>
        7 action classes
    }
    class StyleManager {
        <<singleton>>
        +current()
    }

    MainJS ..> ToolsManager : builds toolbar
    MainJS ..> DrawManager : mouse events, buttons
    MainJS ..> HistoryManager : undo / redo
    MainJS ..> StyleManager : color pickers, dropdowns
    DrawManager o-- Tool : tools / currentTool
    DrawManager ..> HistoryManager : perform()
    Tool ..> HistoryManager : perform()
    HistoryManager o-- Action : undo / redo stacks
    Tool ..> StyleManager : reads style
```

---

## 2. State Pattern

**What it does:** the canvas behaves differently depending on the active tool (draw a shape, select, move, scale), with no `if`/`else` on the tool type. `DrawManager` forwards every mouse event to `currentTool`, and each tool class handles it its own way. Switching tools just swaps which object is in `currentTool`.

**Files:** `managers/DrawManager.js`, everything in `states/`

```mermaid
classDiagram
    direction TB

    class DrawManager {
        <<singleton>>
        +tools : Object
        +currentTool : Tool
        +setTool(toolName)
        +onPointerDown(position, shiftKey)
        +onPointerMove(position)
        +onPointerUp(position)
    }

    class Tool {
        <<interface>>
        +onPointerDown(position, shiftKey)
        +onPointerMove(position)
        +onPointerUp(position) Graphics or null
    }

    class DrawState {
        <<abstract>>
    }
    class SelectState {
        +selected : Graphics[]
        +shapeAt(x, y)
        +clearSelection()
        +drawHighlight()
    }
    class MoveState {
        +select : SelectState
    }
    class ScaleState {
        +select : SelectState
    }

    class CircleDrawState
    class RectangleDrawState
    class LineDrawState
    class StarDrawState
    class PolygonDrawState

    DrawManager o-- Tool : currentTool
    Tool <|.. DrawState
    Tool <|.. SelectState
    Tool <|.. MoveState
    Tool <|.. ScaleState
    DrawState <|-- CircleDrawState
    DrawState <|-- RectangleDrawState
    DrawState <|-- LineDrawState
    DrawState <|-- StarDrawState
    DrawState <|-- PolygonDrawState
    MoveState ..> SelectState : reads selection
    ScaleState ..> SelectState : reads selection

    note for Tool "Not a real class: JavaScript has no interfaces.<br>Every tool has these methods, so any tool<br>can be the current state."
    note for DrawManager "Toolbar buttons call setTool('circle'), setTool('move') ...<br>which swaps in a different tool object."
```

---

## 3. Command Pattern (Undo / Redo)

**What it does:** every change to the drawing is an action object with `execute()` (do it) and `undo()` (reverse it). `HistoryManager` keeps two stacks: `perform()` runs an action and pushes it onto the undo stack; `undo()` reverses the top action and moves it to the redo stack; `redo()` does the opposite. Each new feature only needed its own action class to become undoable.

**Files:** everything in `actions/`, `managers/HistoryManager.js`, `managers/DrawManager.js`, `states/MoveState.js`, `states/ScaleState.js`

```mermaid
classDiagram
    direction TB

    class HistoryManager {
        <<singleton>>
        +undoStack : Action[]
        +redoStack : Action[]
        +perform(action)
        +undo()
        +redo()
    }

    class Action {
        <<interface>>
        +execute()
        +undo()
    }

    class AddShapeAction {
        +stage
        +shape
    }
    class DeleteShapesAction {
        +items : shape + layer position
    }
    class MoveShapesAction {
        +shapes
        +dx
        +dy
    }
    class ScaleShapesAction {
        +before
        +after
    }
    class RestyleShapesAction {
        +before : styles
        +after : styles
    }
    class GroupShapesAction {
        +group : Container
    }
    class UngroupShapesAction {
        +records
    }

    HistoryManager o-- "*" Action : undoStack / redoStack
    Action <|.. AddShapeAction
    Action <|.. DeleteShapesAction
    Action <|.. MoveShapesAction
    Action <|.. ScaleShapesAction
    Action <|.. RestyleShapesAction
    Action <|.. GroupShapesAction
    Action <|.. UngroupShapesAction


    note for HistoryManager "perform(): execute, push to undoStack, clear redoStack<br>undo(): pop undoStack, undo(), push to redoStack<br>redo(): pop redoStack, execute(), push to undoStack"
    note for Action "Not a real class: every action just has execute() and undo().<br>Created by DrawManager (add, delete, restyle, group, ungroup),<br>MoveState (move) and ScaleState (scale), then handed to perform()."
```

---

## 4. Template Method Pattern (Drawing Shapes)

**What it does:** `DrawState` handles everything shapes have in common: the click-and-drag, the live preview, throwing away accidental clicks, and drawing the fill and border (`paint()`). Each shape only fills in one step, `drawShape()`, which works out its corner points. `PolygonDrawState` goes one level further: it does `drawShape()` once for all five custom shapes, which only list their corners.

**Files:** everything ending in `DrawState.js` in `states/`, plus `states/Borders.js`

```mermaid
classDiagram
    direction TB

    class DrawState {
        <<abstract>>
        +firstX, firstY, lastX, lastY
        +style
        +onPointerDown(position)
        +onPointerMove(position)
        +onPointerUp(position) Graphics
        +redraw()
        +paint(graphics, points, closed)
        +drawShape(graphics)*
    }

    class CircleDrawState {
        +drawShape(graphics)
    }
    class RectangleDrawState {
        +drawShape(graphics)
    }
    class LineDrawState {
        +drawShape(graphics)
    }
    class StarDrawState {
        +drawShape(graphics)
    }
    class PolygonDrawState {
        +corners : number[][]
        +drawShape(graphics)
    }
    class PlusDrawState {
        +corners
    }
    class HouseDrawState {
        +corners
    }
    class BoltDrawState {
        +corners
    }
    class BookmarkDrawState {
        +corners
    }
    class ShieldDrawState {
        +corners
    }

    class Borders {
        <<module>>
        +dashes(points, closed, dashLength, gapLength)
        +dots(points, closed, spacing)
    }

    Borders <.. DrawState : dashed / dotted borders
    DrawState <|-- CircleDrawState
    DrawState <|-- RectangleDrawState
    DrawState <|-- LineDrawState
    DrawState <|-- StarDrawState
    DrawState <|-- PolygonDrawState
    PolygonDrawState <|-- PlusDrawState
    PolygonDrawState <|-- HouseDrawState
    PolygonDrawState <|-- BoltDrawState
    PolygonDrawState <|-- BookmarkDrawState
    PolygonDrawState <|-- ShieldDrawState

    note for DrawState "redraw() is the template:<br>1. clear the shape<br>2. drawShape() works out the corners (each shape's job)<br>3. paint() draws the fill and the solid, dashed or dotted border"
```

---

## 5. Composite Pattern (Grouping)

**What it does:** a group is a Pixi `Container` that holds shapes, or other groups. To the rest of the app, a group looks like one object, so Select, Move, Scale and Delete work on groups with no extra code. Restyling reaches inside groups (even nested ones) to recolor every shape.

**Files:** `actions/GroupShapesAction.js`, `actions/UngroupShapesAction.js`, `actions/RestyleShapesAction.js`

```mermaid
classDiagram
    direction TB

    class Container {
        <<Pixi>>
        +x, y
        +scale
        +children
        +getBounds()
    }
    class Graphics {
        <<Pixi>>
        +recipe : DrawState
    }
    class ShapeGroup {
        +isGroup : true
    }

    class GroupShapesAction
    class UngroupShapesAction
    class RestyleShapesAction
    class SelectState
    class MoveState
    class ScaleState
    class DeleteShapesAction

    Container <|-- Graphics : leaf - one shape
    Container <|-- ShapeGroup : composite
    ShapeGroup o-- "2..*" Container : children - shapes or groups

    GroupShapesAction ..> ShapeGroup : creates
    UngroupShapesAction ..> ShapeGroup : takes apart
    RestyleShapesAction ..> ShapeGroup : reaches inside
    SelectState ..> Container : selects any
    MoveState ..> Container : moves any
    ScaleState ..> Container : scales any
    DeleteShapesAction ..> Container : deletes any

    note for ShapeGroup "Not its own class in the code: a Pixi Container<br>created in GroupShapesAction with isGroup = true."
    note for UngroupShapesAction "Bakes the group's position and scale into<br>each shape, so nothing jumps when ungrouped."
```

---

## 6. Singleton and Prototype Patterns

**Singleton:** each manager file ends with `export default new ...()`, so the whole app shares one `DrawManager`, one `HistoryManager` and one `StyleManager`.

**Prototype:** when a shape is finished, its tool makes a copy of *itself* (`snapshot()`), frozen at that exact drag and style, and stores it on the shape as its `recipe`. Restyling later asks the recipe to redraw the shape in a new style. `new this.constructor(...)` makes the copy the right type (star, house, ...) without `DrawState` needing to know which shape it is.

**Files:** `managers/DrawManager.js`, `managers/HistoryManager.js`, `managers/StyleManager.js`, `states/DrawState.js`, `actions/RestyleShapesAction.js`

```mermaid
classDiagram
    direction LR

    class DrawManager {
        <<singleton>>
    }
    class HistoryManager {
        <<singleton>>
    }
    class StyleManager {
        <<singleton>>
        +fillColor
        +strokeColor
        +strokeWidth
        +filled
        +borderType
        +current()
    }

    class DrawState {
        <<abstract>>
        +snapshot() DrawState
        +restyle(shape, style)
    }
    class Graphics {
        <<Pixi>>
        +recipe : DrawState
    }
    class RestyleShapesAction

    DrawState ..> DrawState : snapshot() copies itself
    Graphics --> DrawState : recipe
    RestyleShapesAction ..> Graphics : recipe.restyle(shape, style)
    DrawState ..> StyleManager : current()

    note for StyleManager "export default new StyleManager()<br>One shared instance for the whole app."
    note for DrawState "snapshot(): new this.constructor(...), then copy<br>the drag points and style. Works for every shape."
```

---

## 7. Sequence: Drawing a Shape, Then Undoing It

All the patterns working together, from mouse press to Ctrl+Z.

```mermaid
sequenceDiagram
    actor User
    participant Main as main.js
    participant DM as DrawManager
    participant Tool as RectangleDrawState
    participant SM as StyleManager
    participant HM as HistoryManager
    participant Act as AddShapeAction
    participant Layer as shapes layer

    User->>Main: press mouse
    Main->>DM: onPointerDown(position)
    DM->>Tool: onPointerDown(position)
    Tool->>SM: current()
    SM-->>Tool: style
    Tool->>Layer: addChild(preview)

    loop while dragging
        User->>Main: move mouse
        Main->>DM: onPointerMove(position)
        DM->>Tool: onPointerMove(position)
        Tool->>Tool: redraw() → drawShape() → paint()
    end

    User->>Main: release mouse
    Main->>DM: onPointerUp(position)
    DM->>Tool: onPointerUp(position)
    Tool->>Tool: shape.recipe = snapshot()
    Tool-->>DM: finished shape
    DM->>Layer: removeChild(preview)
    DM->>HM: perform(new AddShapeAction(layer, shape))
    HM->>Act: execute()
    Act->>Layer: addChild(shape)

    User->>Main: Ctrl+Z
    Main->>HM: undo()
    HM->>Act: undo()
    Act->>Layer: removeChild(shape)
    Main->>DM: tools.select.clearSelection()
```
