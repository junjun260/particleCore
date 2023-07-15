import { MolangVariableMap, system, Vector, world } from "@minecraft/server";
import { Transformation, Executor, Calculator } from "./lib/core"

const overworld = world.getDimension("overworld");
const player = Array.from(overworld.getPlayers())[0];
const 变换器 = new Transformation();
let target = null;

const option = { start: 0, end: 2 * Math.PI, d: 0.1 };
let points = Calculator.calculateCubePoints([0,0,0],3);

system.runInterval(() => {
    if (player) {
        let EntityRaycastOptions = { maxDistance: 100 };
        let entities = player.getEntitiesFromViewDirection(EntityRaycastOptions);
        if (entities.length > 0) {
            target = entities[0];

            const center = target.entity.getHeadLocation();
            const 执行器 = new Executor(center, 5 * 20, () => {});
            执行器.onTick(() => {
                let points1 = 变换器.rotationTransformation(points,'z',Math.PI/2);
                Executor.render("minecraft:basic_flame_particle", overworld, center, points1);
            });

        }
    }
}, 5 * 20);