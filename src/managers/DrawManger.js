import CircleDrawState from "../states/CircleDrawState.js";
import RectDrawState from "../states/RectDrawState.js";
import LineDrawState from "../states/LineDrawState.js";
import StarDrawState from "../states/StarDrawState.js";

class DrawManager {
    constructor() {
        this.initialized = false;
        this.app = null;
        this.tools = null;
        this.currentTool = null;
    }

    initialize(app) {
        // Prevent duplicate initialization and double mouse-listener bugs
        if (this.initialized) return;
        
        this.app = app;
        
        // 1. Build the tools using the stage now that app is loaded
        this.tools = {
            circle: new CircleDrawState(this.app.stage),
            rectangle: new RectDrawState(this.app.stage),
            line: new LineDrawState(this.app.stage),
            star: new StarDrawState(this.app.stage)
        };

        // 2. Safely set the default active drawing tool
        this.currentTool = this.tools.rectangle;
        this.initialized = true;
        
        console.log("DrawManager successfully initialized as a Singleton instance.");
    }

    setTool(toolName) {
        if (!this.initialized) return;

        if (this.tools[toolName]) {
            this.currentTool = this.tools[toolName];
            console.log(`Tool changed to: ${toolName}`);
        } else {
            console.warn(`Tool "${toolName}" does not exist.`);
        }
    }

    // 3. Optional Safety Guard: "?." ensures clicking before initialization doesn't throw a crash error
    onPointerDown(position) {
        this.currentTool?.onPointerDown(position);
    }

    onPointerMove(position) {
        this.currentTool?.onPointerMove(position);
    }

    onPointerUp(position) {
        this.currentTool?.onPointerUp(position);
    }
}

// Instantiate the architecture single instance automatically on export
const drawManagerInstance = new DrawManager();
export default drawManagerInstance;
