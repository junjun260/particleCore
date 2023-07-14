import { MolangVariableMap, system, Vector, world } from "@minecraft/server";

class Matrix {
    constructor(row, column, initialValue = 0, arr = []) {
        this.row = row;
        this.column = column;
        this.matrix = [];
        for (let m = 0; m < row; m++) {
            const row_arr = [];
            for (let n = 0; n < column; n++) {
                row_arr.push(initialValue);
            }
            this.matrix.push(row_arr);
        }
        this.initialize(arr);
    }

    initialize(arr) {
        if (arr.length > this.row || arr[0].length > this.column) {
            console.log('the Array not meet requit!');
            return;
        }
        arr.forEach((row, m) => {
            row.forEach((v, n) => {
                this.matrix[m][n] = v;
            })
        });
    }

    vectorDot(arr1, arr2) {
        return arr1.reduce((sum, value, i) => sum + value * arr2[i], 0);
    }

    multiply(matrix) {
        if (this.column != matrix.row) {
            console.log('Matrix dimensions do not match for multiplication');
            return;
        }
        const matrixT = matrix.transpose();
        const arr = this.matrix.map(A_row => matrixT.matrix.map(B_row => this.vectorDot(A_row, B_row)));
        return new Matrix(arr.length, arr[0].length, 0, arr);
    }

    transpose() {
        const arr = this.matrix[0].map((_, i) => this.matrix.map(row => row[i]));
        return new Matrix(this.column, this.row, 0, arr);
    }

    toArray() {
        return this.matrix;
    }
}

/*let matrixA = new Matrix(3,3);
console.log(matrixA)
matrixA.initialize([[1,1,1]])
console.log(matrixA.transpose());
console.log(matrixA.transpose().multiply(matrixA));
let matrixA = new Matrix(2,2,0,[[1,2],[3,4]]);
let matrixB = new Matrix(2,3,0,[[1,2,3],[4,5,6]]);
//console.log(matrixA.multiply(matrixB));
//console.log(matrixB.multiply(matrixA));
*/


class Transformation {

    toHomogeneous(coordinates) {
        const arr = coordinates.map(coord => [...coord, 1]);
        //console.log(arr)
        return new Matrix(arr.length, arr[0].length, 0, arr);
    }

    scaleTransformation(coordMatrix, scaleVector) {
        //onst homogenousCoords = this.toHomogeneous(coordinates);
        const scaleArr = [
            [scaleVector[0], 0, 0, 0],
            [0, scaleVector[1], 0, 0],
            [0, 0, scaleVector[2], 0],
            [0, 0, 0, 1]
        ];
        const scaleMatrix = new Matrix(4, 4, 0, scaleArr);
        return scaleMatrix.multiply(coordMatrix);
    }

    rotation(coordMatrix, axis, angle) {
        //const homogenousCoords = this.toHomogeneous(coordinates);
        let rotationArr = [];
        switch (axis) {
            case 'x':
                rotationArr = [
                    [Math.cos(angle), -Math.sin(angle), 0, 0],
                    [Math.sin(angle), Math.cos(angle), 0, 0],
                    [0, 0, 1, 0],
                    [0, 0, 0, 1]
                ];
                break;
            case 'y':
                rotationArr = [
                    [Math.cos(angle), 0, -Math.sin(angle), 0],
                    [0, 1, 0, 0],
                    [Math.sin(angle), 0, Math.cos(angle), 0],
                    [0, 0, 0, 1]
                ];
                break;
            case 'z':
                rotationArr = [
                    [1, 0, 0, 0],
                    [0, Math.cos(angle), -Math.sin(angle), 0],
                    [0, Math.sin(angle), Math.cos(angle), 0],
                    [0, 0, 0, 1]
                ];
                break;
        }
        const rotationMatrix = new Matrix(4, 4, 0, rotationArr);
        return rotationMatrix.multiply(coordMatrix);
    }

    translation(coordMatrix, translationVector) {
        //const homogenousCoords = this.toHomogeneous(coordinates);
        const translationArr = [
            [1, 0, 0, translationVector[0]],
            [0, 1, 0, translationVector[1]],
            [0, 0, 1, translationVector[2]],
            [0, 0, 0, 1]
        ];
        const translationMatrix = new Matrix(4, 4, 0, translationArr);
        return translationMatrix.multiply(coordMatrix);
    }
}


class Calculator {
    static Line(arr1, arr2, d) {
        const arr = [];
        const vector = {
            x: arr2[0] - arr1[0],
            y: arr2[1] - arr1[1],
            z: arr2[2] - arr1[2]
        };
        const length = Math.hypot(vector.x, vector.y, vector.z);
        const dv = {
            x: vector.x / length,
            y: vector.y / length,
            z: vector.z / length
        };
        for (let i = 0; i < length; i += d) {
            const point = [
                arr1[0] + dv.x * i,
                arr1[1] + dv.y * i,
                arr1[2] + dv.z * i
            ];
            arr.push(point);
        }
        return arr;
    }

    static calculateCubeEdges(center, edgeLength) {
        const halfEdge = edgeLength / 2;
        const [x, y, z] = center;
        return [
            [x - halfEdge, y - halfEdge, z - halfEdge], // 0
            [x + halfEdge, y - halfEdge, z - halfEdge], // 1
            [x - halfEdge, y + halfEdge, z - halfEdge], // 2
            [x + halfEdge, y + halfEdge, z - halfEdge], // 3
            [x - halfEdge, y - halfEdge, z + halfEdge], // 4
            [x + halfEdge, y - halfEdge, z + halfEdge], // 5
            [x - halfEdge, y + halfEdge, z + halfEdge], // 6
            [x + halfEdge, y + halfEdge, z + halfEdge], // 7
        ];
    }

    static calculateCubePoints(center, edgeLength, d) {
        const edges = Calculator.calculateCubeEdges(center, edgeLength);
        const edgePairs = [[0, 1], [1, 3], [3, 2], [2, 0], [4, 5], [5, 7], [7, 6], [6, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
        const lines = edgePairs.flatMap(pair => {
            const start = edges[pair[0]];
            const end = edges[pair[1]];
            return CubeCalculator.Line(start, end, d);
        });
        return edges.concat(lines);
    }

    static calculateCirclePoints(center, da) {
        const arr = [];
        for (let a = 0; a < 2 * Math.PI; a += da) {
            const point = [
                center[0] + Math.cos(a) * r,
                center[1] + 0,
                center[2] + Math.sin(a) * r
            ];
            arr.push(point);
        }
        return arr;
    }

    static calculatePoygonEdges(center, n, r) {
        const arr = [];
        let angle = 0;
        for (let i = 1; i <= n; i++) {
            //角度计算
            angle += 2 * Math.PI / n;
            const point = [
                center[0] + Math.cos(a) * r,
                center[1] + 0,
                center[2] + Math.sin(a) * r
            ];
            arr.push(point);
        }
        return arr;
    }

    static calculatePoygonPoints(center, n, r, s, d) {
        const edges = Calculator.calculatePoygonEdges(center, n, r);
        const Lines = edges.map((_, i) => {
            return Calculator.Line(edges[i], edges[(i + s) % n], d);
        });
        return edges.concat(edges);
    }

    static calculateSpherePoints(center, r, da, db) {
        const arr = [];
        for (let a = 0; a < 2 * Math.PI; a += da) {
            for (let b = 0; b < 2 * Math.PI; b += db) {
                const point = [
                    center[0] + Math.cos(a) * r,
                    center[1] + 0,
                    center[2] + Math.sin(a) * r
                ];
                arr.push(point);
            }
        }
        return arr;
    }

    static calculatePoints(callback, option) {
        let option_ = {
            start: 0,
            end: 1,
            dt: 0.1
        };
        option_ = Object.assign(option_, option);
        const arr = [];
        for (let t = option_.start; t < option_.end; t += option_.dt) {
            const point = callback.call(null, t);
            arr.push(point);
        }
        return arr;
    };
}


class Executor {
    constructor(initProgram, location, maxLifeTick = 20 * 3) {
        this.location = location || { x: 0, y: 0, z: 0 };
        this.lifeTick = 0;
        this.maxLifeTick = maxLifeTick;
        this.initialize(initProgram);
    }

    setLocation(location) {
        this.location = location;
    }

    getLocation() {
        return this.location;
    }

    // 初始化时执行的方法
    initialize(initProgram) {
        console.log('Executor is initialized.');
        // 在这里执行预先设置好的程序
        if (typeof initProgram === 'function') {
            initProgram();
        }
    }

    // 结束执行器寿命时执行的方法
    terminate(callback) {
        console.log('Executor is terminating.');
        // 在这里添加结束时要执行的代码
        if (typeof callback === 'function') {
            callback();
        }
    }

    // 每tick执行的方法
    onTick(callback) {
        console.log('A tick has occurred.');
        // 在这里添加每tick要执行的代码
        system.runInterval(() => {
            if (this.lifeTick < this.maxLifeTick) {
                if (typeof callback === 'function') {
                    callback();
                }
                this.lifeTick++;
            } else {
                this.terminate();
            }
        }, 1); // 设置时间间隔为1秒
    }

    // 渲染器
    static render(effectName, coordObj, coordinates) {
        coordinates.forEach((arr) => {
            let dr = { x: arr[0] + coordObj.x, y: arr[1] + coordObj.y, z: arr[2] + coordObj.z };
            overworld.spawnParticle(effectName, dr, new MolangVariableMap());
        });
    }
}

const overworld = world.getDimension("overworld");
const player = Array.from(overworld.getPlayers())[0];
const 变换器 = new Transformation();
let target = null;
/*
//world.afterEvents.itemUseOn.subscribe((e) => {
    //const center = e.faceLocation;
    const 执行器 = new Executor(() => {
        world.sendMessage('初始化成功');
        const cube = Calculator.calculateCubeEdges([0, 0, 0], 1);
        const coordMatrix = 变换器.toHomogeneous(cube).transpose();
        const cubes = 变换器.translation(coordMatrix, [0, 2, 0]).transpose().toArray();
        Executor.render("minecraft:basic_flame_particle", center, cubes, 0.1);
    }, center, 60);
    执行器.onTick(() => {
        world.sendMessage('Tick:' + 执行器.lifeTick);
    });
    执行器.terminate(() => {
        world.sendMessage('结束');
    });
//});
*/

/*
let 坐标组 = CubeCalculator.calculateCubeEdges([0, 0, 0], 1);
let 变换器 = new Transformation();
let 执行器 = new Executor();
*/

system.runInterval(() => {
    if (player) {
        let EntityRaycastOptions = { maxDistance: 100 };
        let entities = player.getEntitiesFromViewDirection(EntityRaycastOptions);
        if (entities.length > 0) {
            target = entities[0];
            /*
            const 坐标组矩阵 = 变换器.toHomogeneous(坐标组).transpose();
            //console.log(坐标组矩阵);
            //const 坐标组矩阵1 = 变换器.scaleTransformation(坐标组矩阵, [3 * Math.sin(system.currentTick), 3 * Math.sin(system.currentTick), 3 * Math.sin(system.currentTick)]);
            //console.log(  坐标组矩阵1);
            //const 坐标组矩阵2 = 变换器.rotation(坐标组矩阵1, 'y', system.currentTick);
            //console.log(  坐标组矩阵2);
            const 坐标组矩阵3 = 变换器.translation(坐标组矩阵, [3 * Math.sin(system.currentTick), 0,0]);
            //console.log(坐标组矩阵3);
            执行器.render("minecraft:basic_flame_particle", target.entity.location, 坐标组矩阵3.transpose().toArray(), 0.1);
            const coordMatrix = 变换器.toHomogeneous(cube).transpose();
            const cubes = 变换器.translation(coordMatrix, [0, 2, 0]).transpose().toArray();
        */
            const center = target.entity.getHeadLocation();
            const 执行器 = new Executor(() => {
                world.sendMessage('初始化成功');
            }, center, 5 * 20);
            执行器.onTick(() => {
                //world.sendMessage('Tick:' + 执行器.lifeTick);
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
                const coordMatrix = 变换器.toHomogeneous(points).transpose();
                points = 变换器.rotation(coordMatrix, 'z', 90).transpose().toArray();
                Executor.render("minecraft:basic_flame_particle", center, points, 0.1);
            });
            执行器.terminate(() => {
                world.sendMessage('结束');
            });
        }
    }
}, 5 * 20);