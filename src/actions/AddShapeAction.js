export default class AddShapeAction 
{ constructor(stage, shape) 
    {
        this.stage = stage;
        this.shape = shape;

    }
    execute() {this.stage.addChild(this.shape);}
    undo() {this.stage.removeChild(this.shape);}

}