import { KEYS, DIRS } from "rot-js";
import { Game } from "../game";
import { Actor, ActorType } from "./actor";
import { Critter } from "./critter";

import { Point } from "../point";
import { Glyph } from "../glyph";
import { InputUtility } from "../input-utility";

export class Player implements Actor {
    glyph: Glyph;
    type: ActorType;
    private keyMap: { [key: number]: number }

    constructor(private game: Game, public position: Point) {
        this.glyph = new Glyph("@", "yellow","#32926F");
        this.type = ActorType.Player;

        this.keyMap = {};
        this.keyMap[KEYS.VK_W] = 0; // up
        this.keyMap[KEYS.VK_E] = 1;
        this.keyMap[KEYS.VK_D] = 2; // right
        this.keyMap[KEYS.VK_C] = 3;
        this.keyMap[KEYS.VK_S] = 4; // down
        this.keyMap[KEYS.VK_Z] = 5;
        this.keyMap[KEYS.VK_A] = 6; // left
        this.keyMap[KEYS.VK_Q] = 7;
    }

    act(): Promise<any> {
        return InputUtility.waitForInput(this.handleInput.bind(this));
    }

    move(newPoint:Point): boolean {
        if (this.game.mapContainsEntity(newPoint.x, newPoint.y)) {
            let actor = this.game.mapContainsEntity(newPoint.x, newPoint.y);
            console.log("entering tile with actor, ",actor);
            if (actor.type === ActorType.NPC) {
                console.log("entering town");

                this.game.showTownMenu();
                return true;
            } else if (actor.type === ActorType.Critter) {
                let critter = actor as Critter;
                console.log("caught critter ", critter.name);
            }
        }
        if (!this.game.mapIsPassable(newPoint.x, newPoint.y)) {
            return;
        }
        this.position = newPoint;
        return true;
    }

    private handleInput(event: KeyboardEvent): boolean {
        let validInput = false;
        let code = event.keyCode;
        if (code in this.keyMap) {
            let diff = DIRS[8][this.keyMap[code]];
            let newPoint = new Point(this.position.x + diff[0], this.position.y + diff[1]);
            let moveResult = this.move(newPoint);
            if (moveResult == true) {
                validInput = true;
            } else {
                return;
            }
            // if (!this.game.mapIsPassable(newPoint.x, newPoint.y)) {
            //     return;
            // }
            // this.position = newPoint;
            // validInput = true;
        } else if (code === KEYS.VK_SPACE) {
            this.game.checkBox(this.position.x, this.position.y);
            validInput = true;
        } else if (code === KEYS.VK_RETURN) {
            this.game.toggleZoom();
            validInput = true
        }
        return validInput;
    }
}