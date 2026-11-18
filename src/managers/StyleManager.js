// Holds the current style: what new shapes will look like.
// The color pickers, the thickness box and the style dropdowns change it.
class StyleManager {
    constructor() {
        this.fillColor = 0x808080;    // gray
        this.fillAlpha = 1;           // 1 = solid, 0 = see-through
        this.filled = true;           // false = "no fill", outline only
        this.strokeColor = 0x000000;  // black
        this.strokeWidth = 4;         // border thickness, 0 = no border
        this.borderType = "solid";    // "solid", "dashed" or "dotted"
    }

    // A copy of the current style. Each shape keeps its own copy, so changing
    // a color later doesn't change shapes that are already drawn.
    current() {
        return {
            fillColor: this.fillColor,
            fillAlpha: this.fillAlpha,
            filled: this.filled,
            strokeColor: this.strokeColor,
            strokeWidth: this.strokeWidth,
            borderType: this.borderType,
        };
    }

    // Turns 0xff8800 into "#ff8800", the format the color pickers use.
    toHex(color) {
        return "#" + color.toString(16).padStart(6, "0");
    }
}

// One shared style for the whole app, same as your other managers.
export default new StyleManager();