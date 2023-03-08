import { RNG } from "rot-js";
import { Game } from "../game";
import { Actor, ActorType } from "./actor";
import { Point } from "../point";
import { Glyph } from "../glyph";
import { Critter } from "./critter";
import { WorldMap } from "../mapgen/world-map";
import { Biome } from "../mapgen/voronoi";
import * as _ from "lodash";


type SpawnTableEntry = (Game,Point) => Actor;
type SpawnTable = Array<SpawnTableEntry>;

export class Spawner implements Actor {
    glyph: Glyph;
    type: ActorType.Spawner;
    position: Point;
    phase: number;
    spawns: Array<Actor>;
    startingBiome: Biome;

    constructor(private game: Game, private map: WorldMap, private count: number, private freq: number) {
        this.glyph = new Glyph(" ", "black", "white");
        this.type = ActorType.Spawner;
        this.position = new Point(0,0);
        this.phase = -1;
        this.spawns = [];

        this.startingBiome = this.map.biomes.find( i => i.name === "lightForest");

    }

    public despawn(a:Actor) {
        if (this.spawns.includes(a)) {
            let idx = this.spawns.indexOf(a);
            this.spawns.splice(idx,1);
            this.game.removeActor(a);
            console.log("despawned", a);
        }
    }

    act(): Promise<any> {
        this.phase += 1;
        let tries = 0;
        let maxtries = 10;
        let player_pos = this.game.getPlayerPosition();
        if (this.phase % this.freq === 0) {
            // TODO: despawn by distance/age
            let to_despawn = [];
            for (let spawn of this.spawns) {
                let dist = Math.sqrt(Math.pow(player_pos.x - spawn.position.x,2) + Math.pow(player_pos.y - spawn.position.y,2));
                console.log("checking actor dist,",dist,spawn);
                if (dist > 14) {
                    to_despawn.push(spawn);
                }
            }
            for (let spawn of to_despawn) {
                console.log("despawning actor,", spawn);
                this.despawn(spawn);
            }
            console.log("spawner at phase ",this.phase, "/ this.freq, attempting to spawn");
            while (this.spawns.length < this.count) {
                tries += 1;
                if (tries > maxtries) {
                    break;
                }
                let r1 = Math.floor(20 - Math.random() * 40);
                let r2 = Math.floor(20 - Math.random() * 40);
                let spawn_pos = new Point(player_pos.x + r1, player_pos.y + r2);
                if (!this.game.mapIsPassable(spawn_pos.x, spawn_pos.y)) {
                    continue;
                }
                console.log("spawning new entity", spawn_pos);
                let spawn_table = this.getSpawnTable(spawn_pos);
                let spawn_r = RNG.getUniformInt(0, spawn_table.length - 1);
                let spawner = spawn_table[spawn_r];
                let critter = spawner(this.game, spawn_pos);
                // let critter = new Critter(this.game, "bird", spawn_pos, new Glyph("b"));
                this.spawns.push(critter);
                this.game.addActor(critter);
            }
            console.log("at maximum spawns:", this.spawns)
            this.phase = 0;
        } else { 
            // console.log("spawner at phase ",this.phase, "/ this.freq")
        }
        return Promise.resolve();
    }

    getStartPoint():Point {
        return this.map.cells.points[this.startingBiome.cell]
    }

    getSpawnTable(pos:Point):SpawnTable {
        // TODO look up by biome
        let biome = this.map.getTileBiome(pos.x, pos.y);
        if (biome.name === "lightForest") {
            return [Spawner.quail,
                Spawner.quail,
                Spawner.squirrel,
                Spawner.squirrel,
                Spawner.rabbit]    
        } else if (biome.name === "steppe") {
            return [Spawner.grouse,
                Spawner.grouse,
                Spawner.squirrel,
                Spawner.quail,
                Spawner.hare]    
        } else if (biome.name === "grasslands") {
            return [Spawner.grouse,
                    Spawner.partridge,
                    Spawner.hare,
                    Spawner.boar]
        } else if (biome.name === "scrublands") {
            return [Spawner.grouse,
                Spawner.quail,
                Spawner.rabbit,
                Spawner.rabbit,
                Spawner.boar]        
        } else if (biome.name === "darkForest") {
            return [Spawner.partridge,
                    Spawner.deer,
                    Spawner.deer,
                    Spawner.partridge,
                    Spawner.fox,
                    Spawner.moose]
        }
        console.log("error, reached end of spawn tables?");
        return [Spawner.partridge,
            Spawner.grouse,
            Spawner.squirrel,
            Spawner.hare,
            Spawner.rabbit]

    }


    static boar(game: Game, pos:Point): Critter {
        return new Critter(game, "boar", pos, new Glyph("b"));
    }

    static deer(game: Game, pos:Point): Critter {
        return new Critter(game, "deer", pos, new Glyph("d"));
    }

    static fox(game: Game, pos:Point): Critter {
        return new Critter(game, "fox", pos, new Glyph("f"));
    }

    static grouse(game: Game, pos:Point): Critter {
        return new Critter(game, "grouse", pos, new Glyph("g"));
    }

    static hare(game:Game, pos:Point): Critter  {
        return new Critter(game, "hare", pos, new Glyph("h"));
    }

    static moose(game: Game, pos:Point): Critter {
        return new Critter(game, "moose", pos, new Glyph("m"));
    }

    static partridge(game: Game, pos:Point): Critter {
        return new Critter(game, "partridge", pos, new Glyph("p"));
    }

    static quail(game:Game, pos:Point): Critter  {
        return new Critter(game, "quail", pos, new Glyph("q"));
    }

    static rabbit(game:Game, pos:Point): Critter  {
        return new Critter(game, "rabbit", pos, new Glyph("r"));
    }

    static squirrel(game:Game, pos:Point): Critter  {
        return new Critter(game, "squirrel", pos, new Glyph("s"));
    }

}

