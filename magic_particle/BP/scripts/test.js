import { MolangVariableMap, system, Vector, world } from "@minecraft/server";
import { Transformation, Executor, Calculator } from "./lib/core"

const overworld = world.getDimension("overworld");
const player = Array.from(overworld.getPlayers())[0];
const 变换器 = new Transformation();
let target = null;

system.runInterval(() => {
    if (player) {
        let EntityRaycastOptions = { maxDistance: 100 };
        let entities = player.getEntitiesFromViewDirection(EntityRaycastOptions);
        if (entities.length > 0) {
            target = entities[0];

            const center = target.entity.getHeadLocation();
            const 执行器 = new Executor(center, 5 * 20,()=>{
                //初始化时执行
            });
            执行器.onTick(() => {
                const option = { start: 0, end: 2 * Math.PI };
                let points = Calculator.calculatePoints((t) => {
                    const r = 3 * (1 - Math.cos(t));
                    const point = [
                        Math.cos(t) * r,
                        0,
                        Math.sin(t) * r
                    ];
                    return point;
                }, option);
                points = 变换器.rotationTransformation(points, 'z', Math.PI/2);
                Executor.render("minecraft:basic_flame_particle", center, points,overworld);
            });

        }
    }
}, 5 * 20);