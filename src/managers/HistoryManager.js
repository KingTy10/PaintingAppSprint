// Remembers every action so it can be undone and redone.
//   undoStack: actions that have been done, newest last
//   redoStack: actions that were undone, newest last
class HistoryManager {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
    }

    // Do a new action and remember it.
    perform(action) {
        action.execute();
        this.undoStack.push(action);

        // Doing something new means the undone actions can't come back.
        this.redoStack = [];
    }

    undo() {
        const action = this.undoStack.pop();
        if (!action) return;   // nothing to undo

        action.undo();
        this.redoStack.push(action);
    }

    redo() {
        const action = this.redoStack.pop();
        if (!action) return;   // nothing to redo

        action.execute();
        this.undoStack.push(action);
    }
}

// One shared history for the whole app, same style as your DrawManager.
export default new HistoryManager();