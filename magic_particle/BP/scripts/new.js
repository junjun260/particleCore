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

class Matrix {
    transpose(matrix) {
        let matrixT = [];
        matrix[0].forEach((arr, rankIndex) => {
            //列
            let rank = [];
            matrix.forEach((rowArr) => {
                //行
                rank.push(rowArr[rankIndex]);
            });
            matrixT.push(rank);
        });
        return matrixT;
    }
    dot(arr1, arr2) {
        //数组对应元素相乘
        let value = 0;
        arr1.forEach((v, index) => {
            value += arr1[index] * arr2[index];
        });
        return value;
    }
    multiply(matrixA, matrixB) {
        //计算新矩阵大小
        let A_ranklength = matrixA[0].length;
        let B_rowlength = matrixB.length;
        if (A_ranklength == B_rowlength) {
            let matrix = [];
            let matrixBT = this.transpose(matrixB);
            //对矩阵A遍历 行
            matrixA.forEach((A_rowArr, A_rowIndex) => {
                //创建行数组 row
                let rowArr = [];
                matrixBT.forEach((B_rowArr, B_rowIndex) => {
                    //计算
                    let value = this.dot(A_rowArr, B_rowArr);
                    rowArr.push(value);
                });
                matrix.push(rowArr);
            });
            return matrix;
        } else console.log('matrix不满足要求');
    };
}
const matrix = new Matrix();

function Line(arr1, arr2, d) {
    const arr = [];
    const vector = { x: arr2[0] - arr1[0], y: arr2[1] - arr1[1], z: arr2[2] - arr1[2] };
    const length = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2) + Math.pow(vector.z, 2));
    for (let i = 0; i < length; i += d) {
        const dv = { x: vector.x / length, y: vector.y / length, z: vector.z / length };
        arr.push([arr1[0] + dv.x * i, arr1[1] + dv.y * i, arr1[2] + dv.z * i]);
    }
    return arr;
}


function 计算器cube() {
    let 边界坐标组 = [];
    //下边
    边界坐标组.push([+0.5, -0.5, +0.5]);
    边界坐标组.push([+0.5, -0.5, -0.5]);
    边界坐标组.push([-0.5, -0.5, +0.5]);
    边界坐标组.push([-0.5, -0.5, -0.5]);
    //上边
    边界坐标组.push([+0.5, +0.5, +0.5]);
    边界坐标组.push([+0.5, +0.5, -0.5]);
    边界坐标组.push([-0.5, +0.5, +0.5]);
    边界坐标组.push([-0.5, +0.5, -0.5]);

    //连接
    let arr0 = Line([+0.5, -0.5, +0.5], [+0.5, -0.5, -0.5], 0.1);
    let arr1 = Line([+0.5, -0.5, -0.5], [-0.5, -0.5, +0.5], 0.1);
    let arr2 = Line([-0.5, -0.5, +0.5], [-0.5, -0.5, -0.5], 0.1);
    let arr3 //= Line([-0.5, -0.5, -0.5], [+0.5, -0.5, +0.5], 0.1);//41

    let arr4 = Line([+0.5, +0.5, +0.5], [+0.5, +0.5, -0.5], 0.1);
    let arr5 = Line([+0.5, +0.5, -0.5], [-0.5, +0.5, +0.5], 0.1);
    let arr6 = Line([-0.5, +0.5, +0.5], [-0.5, +0.5, -0.5], 0.1);
    let arr7 = Line([-0.5, +0.5, -0.5], [+0.5, +0.5, +0.5], 0.1);

    let arr8 = Line([+0.5, -0.5, +0.5], [+0.5, +0.5, +0.5], 0.1);
    let arr9 = Line([+0.5, -0.5, -0.5], [+0.5, +0.5, -0.5], 0.1);
    let arr10 = Line([-0.5, -0.5, +0.5], [-0.5, +0.5, +0.5], 0.1);
    let arr11 = Line([-0.5, -0.5, -0.5], [-0.5, +0.5, -0.5], 0.1);

    let newArr = 边界坐标组.concat(arr0, arr1, arr2,/* arr3,*/ arr4, arr5, arr6, arr7, arr8, arr9, arr10, arr11);

    return newArr;
}

function 缩放变换器(坐标组, 缩放向量) {
    //转换成齐次矩阵
    let 矩阵组 = [];
    坐标组.forEach((arr, i) => {
        arr[3] = 1;
        //world.sendMessage('                 '  + arr);
        矩阵组.push(arr)
    });
    let 缩放矩阵 = [
        [缩放向量[0], 0, 0, 0],
        [0, 缩放向量[1], 0, 0],
        [0, 0, 缩放向量[2], 0],
        [0, 0, 0, 1]
    ];
    return matrix.multiply(矩阵组, 缩放矩阵);
}

function 旋转变换器(坐标组, 旋转轴, a) {
    //转换成齐次矩阵
    let 矩阵组 = [];
    坐标组.forEach((arr, i) => {
        arr[3] = 1;
        //world.sendMessage('                 '  + arr);
        矩阵组.push(arr)
    });

    let 旋转矩阵 = [];

    switch (旋转轴) {
        case 'x':
            旋转矩阵 = [
                [Math.cos(a), -Math.sin(a), 0, 0],
                [Math.sin(a), Math.cos(a), 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1]
            ];
            break;
        case 'y':
            旋转矩阵 = [
                [Math.cos(a),0, -Math.sin(a), 0],
                [0, 1, 0, 0],
                [Math.sin(a), 0, Math.cos(a), 0],
                [0, 0, 0, 1]
            ];
            break;
        case 'z':
            旋转矩阵 = [
                [1, 0, 0, 0],
                [0, Math.cos(a), -Math.sin(a), 0],
                [0, Math.sin(a), Math.cos(a), 0],
                [0, 0, 0, 1]
            ];
            break;
    }

    return matrix.multiply(矩阵组, 旋转矩阵);
}

function 平移变换器(坐标组, 平移向量) {
    //转换成齐次矩阵
    let 矩阵组 = [];
    坐标组.forEach((arr, i) => {
        arr[3] = 1;
        矩阵组.push(arr)
    });
    let 平移矩阵 = [
        [1, 0, 0, 平移向量[0]],
        [0, 1, 0, 平移向量[1]],
        [0, 0, 1, 平移向量[2]],
        [0, 0, 0, 1]
    ];
    return matrix.transpose(matrix.multiply(平移矩阵,matrix.transpose(矩阵组)));
}

function 渲染器(effectName, 坐标组2, 矩阵组) {
    矩阵组.forEach((arr, i) => {
        let dr = { x: arr[0] + 坐标组2.x, y: arr[1] + 坐标组2.y, z: arr[2] + 坐标组2.z };
        overworld.spawnParticle(effectName, dr, new MolangVariableMap());
    });
}

const player = Array.from(overworld.getPlayers())[0];
let target = null;

let 坐标组 = 计算器cube();

system.runInterval(() => {
    if (player) {
        let EntityRaycastOptions = { maxDistance: 100 };
        let entities = player.getEntitiesFromViewDirection(EntityRaycastOptions);
        if (entities.length > 0) {
            target = entities[0];
            //world.sendMessage('zzzzz')
            //let 坐标组1 = 缩放变换器(坐标组, [3 * Math.sin(system.currentTick), 3 * Math.sin(system.currentTick), 3 * Math.sin(system.currentTick)]);
            let 坐标组1 = 平移变换器(坐标组,[5,0,0]);
            //let 坐标组1 = 旋转变换器(坐标组, 'y', system.currentTick);
            //world.sendMessage(''+坐标组1);
            //world.sendMessage(''+target.entity.location.x);

            渲染器("minecraft:basic_flame_particle", target.entity.location, 坐标组1);
        }
    }
}, 10);