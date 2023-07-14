import { MolangVariableMap, system, Vector, world } from "@minecraft/server";

const overworld = world.getDimension("overworld");

class ParticleCore {
    spawnLine(effectName, p1, p2, d) {
        const vector = { x: p2.x - p1.x, y: p2.y - p1.y, z: p2.z - p1.z };
        const length = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2) + Math.pow(vector.z, 2));
        for (let i = 0; i < length; i += d) {
            const dv = { x: vector.x / length, y: vector.y / length, z: vector.z / length };
            let dr = {
                x: p1.x + dv.x * i,
                y: p1.y + dv.y * i,
                z: p1.z + dv.z * i
            };
            //let color = { alpha: 0, blue: 0, green: 1, red: 0 };
            overworld.spawnParticle(effectName, dr, new MolangVariableMap());
        }
    }
    spawnCircle(effectName, position, r, yaw, pitch, da) {
        let ps = [];
        for (let a = 0; a < 2 * Math.PI; a += da) {
            let dr = {
                x: position.x + Math.sin(yaw) * Math.cos(a + pitch) * r,
                y: position.y,
                z: position.z + Math.sin(yaw) * Math.sin(a + pitch) * r
            };
            ps.push(dr);
            //overworld.spawnParticle(effectName, dr, new MolangVariableMap());
        }
        this.spawnParticleTimeLine(effectName, ps, 10, 2);
    }
    spawnPoygon(effectName, position, n, r, s, yaw, pitch, d) {
        let a = 0;
        let ps = [];
        for (let i = 1; i <= n; i++) {
            //角度计算
            a += 2 * Math.PI / n;
            let dr = {
                x: position.x + Math.sin(yaw) * Math.cos(a + pitch) * r,
                y: position.y,
                z: position.z + Math.sin(yaw) * Math.sin(a + pitch) * r
            };
            ps.push(dr);
        }
        //连接点
        for (let i = 0; i < n; i++) {
            this.spawnLine(effectName, ps[i], ps[(i + s) % n], d);
        }
        return ps;
    }
    spawnSphere(effectName, p, r, fill, da, db) {
        let ps = [];
        for (let a = 0; a < 2 * Math.PI; a += da) {
            for (let b = 0; b < 2 * Math.PI; b += db) {
                let dr = {
                    x: p.x + Math.sin(b) * Math.cos(a) * r,
                    y: p.y + Math.cos(b) * r,
                    z: p.z + Math.sin(b) * Math.sin(a) * r
                };
                ps.push(dr);
                //overworld.spawnParticle(effectName, dr, new MolangVariableMap());
            }
        }
        return ps;
        /*let currentPosition = 0;
        system.runInterval(() => {
            for (let i = 0; i < 20; i++) {
                overworld.spawnParticle(effectName, ps[currentPosition % ps.length], new MolangVariableMap());
                currentPosition++;
            }
        }, 1);*/
    }
    spawnParticleTimeLine(effectName, ps, speed, tick) {
        let currentPosition = 0;
        system.runInterval(() => {
            for (let i = 0; i < speed; i++) {
                overworld.spawnParticle(effectName, ps[currentPosition % ps.length], new MolangVariableMap());
                currentPosition++;
            }
        }, tick);
    }
    drawCurve(effectName, position, referVector, ta, tb, dt, callback) {
        let ps = [];
        for (let t = ta; t < tb; t += dt) {
            let p = callback.call(null, t);
            ps.push(p);
            //world.sendMessage('' + t)
        }
        this.spawnParticleTimeLine(effectName, ps, 20, 1);
    };
}
const particleCore = new ParticleCore();


/*
const player = Array.from(overworld.getPlayers())[0];
let target = null;
system.runInterval(() => {
    if (player) {
        let EntityRaycastOptions = { maxDistance: 100 };
        let entities = player.getEntitiesFromViewDirection(EntityRaycastOptions);
        if (entities.length > 0) {
            target = entities[0];
            //let location = {x:target.location.x,y:target.headLocation.y+1,z:target.location.z};
            particleCore.spawnLine("minecraft:basic_flame_particle", player.location, target.location, 0.1);
            particleCore.spawnPoygon("minecraft:basic_flame_particle", target.location, 6, 5, 2, 0.1);             
            particleCore.spawnCircle("minecraft:basic_flame_particle", target.location, 5, 0.1);            
             particleCore.spawnCircle("minecraft:basic_flame_particle", target.location, 6, 0.05);             
             particleCore.spawnCircle("minecraft:basic_flame_particle", target.location, 10, 0.05);            
         particleCore.spawnPoygon("minecraft:basic_flame_particle", target.location, 3, 10, 1, 0.05);                          
         let ps = particleCore.spawnSphere("minecraft:basic_flame_particle", target.location, 5, false, 0.2, 0.1); 
          particleCore.spawnParticleTimeLine("minecraft:basic_flame_particle", ps, 10, 1);           
             let ps1 = particleCore.spawnSphere("minecraft:basic_flame_particle", target.location, 10, false, 0.1, 0.2);              
             let ps2 = particleCore.spawnCircle("minecraft:basic_flame_particle", target.location, 20, 0.03);      
          let ps3 = particleCore.spawnSphere("minecraft:basic_flame_particle", { x: target.location.x + 20, y: target.location.y, z: target.location.z }, 4, false, 0.06, 0.2);              
             particleCore.spawnParticleTimeLine("minecraft:basic_flame_particle", ps1, 20, 2);              
            particleCore.spawnParticleTimeLine("minecraft:basic_flame_particle", ps2, 20, 2);              
                     particleCore.spawnParticleTimeLine("minecraft:basic_flame_particle", ps3, 20, 2);              
            
            particleCore.drawCurve("minecraft:basic_flame_particle", target.location, { x: 0, y: 0, z: 1 }, 0, 2 * Math.PI,0.1, (t) => {
                let r = 10;
                let dr = {
                    x: target.location.x + Math.cos(t) * r,
                    y: target.location.y,
                    z: target.location.z + Math.sin(t) * r
                };
                world.sendMessage('dr:'+dr.x+'t:'+t);
                return dr;
            });
            //

            //魔法阵001
            //1
            particleCore.spawnCircle("minecraft:basic_flame_particle", target.location, 3.5, Math.PI / 4, 0, 0.1);
            particleCore.spawnCircle("minecraft:basic_flame_particle", target.location, 3, Math.PI / 4, 0, 0.1);
            //2
            particleCore.spawnCircle("minecraft:basic_flame_particle", target.location, 7, Math.PI / 4, 0, 0.1);
            particleCore.spawnCircle("minecraft:basic_flame_particle", target.location, 6.5, Math.PI / 4, 0, 0.1);
            //3
            particleCore.spawnCircle("minecraft:basic_flame_particle", target.location, 9.5, Math.PI / 4, 0, 0.08);
            particleCore.spawnCircle("minecraft:basic_flame_particle", target.location, 9, Math.PI / 4, 0, 0.08);

            particleCore.spawnPoygon("minecraft:basic_flame_particle", target.location, 3, 10, 1, Math.PI / 4, 0, 0.1);
            let ps = particleCore.spawnPoygon("minecraft:basic_flame_particle", target.location, 3, 9, 1, Math.PI / 4, 2 * Math.PI / 6, 0.1);
            particleCore.spawnPoygon("minecraft:basic_flame_particle", target.location, 3, 6.5, 1, Math.PI / 4, 2 * Math.PI / 6, 0.1);

            particleCore.spawnCircle("minecraft:basic_flame_particle", ps[0], 2, Math.PI / 4, 0, 0.1);
            particleCore.spawnCircle("minecraft:basic_flame_particle", ps[0], 1.5, Math.PI / 4, 0, 0.1);

            particleCore.spawnCircle("minecraft:basic_flame_particle", ps[1], 2, Math.PI / 4, 0, 0.1);
            particleCore.spawnCircle("minecraft:basic_flame_particle", ps[1], 1.5, Math.PI / 4, 0, 0.1);

            particleCore.spawnCircle("minecraft:basic_flame_particle", ps[2], 2, Math.PI / 4, 0, 0.1);
            particleCore.spawnCircle("minecraft:basic_flame_particle", ps[2], 1.5, Math.PI / 4, 0, 0.1);


        }

    }
}, 20);
*/

/*
world.afterEvents.entityHitEntity.subscribe((e) => {
    let type = e.damagingEntity.typeId;
    world.sendMessage("e:" + type);
});
world.afterEvents.entityRemoved.subscribe((e) => {
    world.sendMessage("r:" + e.removedEntity);
});
world.afterEvents.entitySpawn.subscribe((e) => {
    world.sendMessage("es:" + e.entity.typeId);
    world.sendMessage("esID:" + e.entity.id);
});
world.afterEvents.itemStartUse.subscribe((e) => {
    world.sendMessage("item" + e.itemStack.typeId);
    world.sendMessage("time" + e.useDuration);
});
world.afterEvents.itemReleaseUse.subscribe((e) => {
    world.sendMessage("item_re" + e.itemStack.typeId);
    world.sendMessage("time_re" + e.useDuration);
});
world.afterEvents.itemStartUseOn.subscribe((e) => {
    world.sendMessage("item_on" + e.itemStack.typeId);
});
world.beforeEvents.itemUse.subscribe((e) => {
    world.sendMessage("item_on_before" + e.itemStack.typeId);
});
world.afterEvents.entityDie.subscribe((e) => {
    world.sendMessage("ED: " + e.deadEntity.id);
});

*/