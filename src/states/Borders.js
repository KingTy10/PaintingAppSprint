// Math for dashed and dotted borders. Pixi can only draw solid lines, so we
// walk along the shape's outline and work out where each dash or dot goes.
//
// An outline is a list of corner points [{ x, y }, ...]. "closed" means the
// last corner connects back to the first (a rectangle); a line isn't closed.

// Lays the outline out as one long path, and records how far along the path
// each corner is. That lets us find "the point 37 pixels along the outline".
function measure(points, closed) {
    const path = closed ? [...points, points[0]] : points;
    const distances = [0];

    for (let i = 1; i < path.length; i++) {
        const step = Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
        distances.push(distances[i - 1] + step);
    }

    return { path, distances, total: distances[distances.length - 1] };
}

// The point that is `d` pixels along the path.
function pointAt({ path, distances }, d) {
    // Find which straight piece of the outline d lands on.
    let i = 1;
    while (i < distances.length - 1 && distances[i] < d) {
        i++;
    }

    const pieceLength = distances[i] - distances[i - 1];
    const t = pieceLength > 0 ? (d - distances[i - 1]) / pieceLength : 0;

    return {
        x: path[i - 1].x + (path[i].x - path[i - 1].x) * t,
        y: path[i - 1].y + (path[i].y - path[i - 1].y) * t,
    };
}

// The dashes for a dashed border. Each dash is a list of points
// (a dash that goes around a corner has the corner in the middle).
export function dashes(points, closed, dashLength, gapLength) {
    const outline = measure(points, closed);
    const result = [];

    for (let start = 0; start < outline.total; start += dashLength + gapLength) {
        const end = Math.min(start + dashLength, outline.total);
        const dash = [pointAt(outline, start)];

        // Include any corners the dash goes around.
        for (let i = 1; i < outline.path.length - 1; i++) {
            if (outline.distances[i] > start && outline.distances[i] < end) {
                dash.push(outline.path[i]);
            }
        }

        dash.push(pointAt(outline, end));
        result.push(dash);
    }

    return result;
}

// Where each dot goes for a dotted border, evenly spaced along the outline.
export function dots(points, closed, spacing) {
    const outline = measure(points, closed);
    const result = [];

    // On a closed shape, stop before the end so the last dot doesn't land on
    // top of the first one. On a line, go all the way to the end.
    const stopAt = closed ? outline.total - spacing / 2 : outline.total + 0.001;

    for (let d = 0; d < stopAt; d += spacing) {
        result.push(pointAt(outline, d));
    }

    return result;
}