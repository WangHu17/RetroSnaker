hasAI = true;

var maxAICount = 5;
var AI = [];
var level = 1;
var AITimer;

function randomGenerateAI() {
    var x = parseInt(80 + Math.random() * 400);
    var y = parseInt(Math.random() * 480);
    var temp = new Snack(x, y, toward.RIGHT, 5, "orange");
    snack.push(temp);
}

function initAI() {

    for (var i = 0 ; i < maxAICount ; i ++) {
        randomGenerateAI();
    }

}

function aiLevel0() {//此难度AI毫无智商
    for (var i = 1 ; i < snack.length ; i ++) {
        var isLine = Math.random() > 0.8;
        if (!isLine) {
            var ran = parseInt(Math.random() * 4);
            if (ran == 0) {
                snack[i].changeToward = {change:toward.UP, act:snack[i].turnUp};
            } else if (ran == 1) {
                snack[i].changeToward = {change:toward.DOWN, act:snack[i].turnDown};
            } else if (ran == 2) {
                snack[i].changeToward = {change:toward.LEFT, act:snack[i].turnLeft};
            } else if (ran == 3) {
                snack[i].changeToward = {change:toward.RIGHT, act:snack[i].turnRight};
            }
        }
    }
}
AI.push(aiLevel0);

function aiLevel1() {//此难度AI具备一些躲避四周墙体的能力
    for (var i = 1 ; i < snack.length ; i ++) {
        avoidWall(snack[i]);
        avoidSnack(snack[i]);
    }
}
AI.push(aiLevel1);

function startAI() {
    AITimer = setInterval(function () {
        AI[level]();
    }, 1000 / frame);
}

function avoidWall(snack) {//躲避四周墙体
    if (snack.snackBody[0].lx > 430 && snack.nowToward == toward.RIGHT) {
        if (snack.snackBody[0].ly > 250) {
            snack.changeToward = {change:toward.UP, act:snack.turnUp};
        } else {
            snack.changeToward = {change:toward.DOWN, act:snack.turnDown};
        }
    } else if (snack.snackBody[0].lx < 50 && snack.nowToward == toward.LEFT) {
        if (snack.snackBody[0].ly > 250) {
            snack.changeToward = {change:toward.UP, act:snack.turnUp};
        } else {
            snack.changeToward = {change:toward.DOWN, act:snack.turnDown};
        }
    } else if (snack.snackBody[0].ly < 50 && snack.nowToward == toward.UP) {
        if (snack.snackBody[0].lx > 250) {
            snack.changeToward = {change:toward.LEFT, act:snack.turnLeft};
        } else {
            snack.changeToward = {change:toward.RIGHT, act:snack.turnRight};
        }
    } else if (snack.snackBody[0].ly > 430 && snack.nowToward == toward.DOWN) {
        if (snack.snackBody[0].lx > 250) {
            snack.changeToward = {change:toward.LEFT, act:snack.turnLeft};
        } else {
            snack.changeToward = {change:toward.RIGHT, act:snack.turnRight};
        }
    } else {//无危险情况下，随机转弯
        var changeToward = Math.random() > 0.995;
        if (changeToward) {
            if (snack.nowToward == toward.UP || snack.nowToward == toward.DOWN) {
                if (snack.snackBody[0].lx < 40) {
                    snack.changeToward = {change:toward.RIGHT, act:snack.turnRight};
                } else if (snack.snackBody[0].lx > 430) {
                    snack.changeToward = {change:toward.LEFT, act:snack.turnLeft};
                } else {
                    snack.changeToward = Math.random() > 0.5 ? {change:toward.LEFT, act:snack.turnLeft} : {change:toward.RIGHT, act:snack.turnRight};
                }
            } else {
                if (snack.snackBody[0].ly < 40) {
                    snack.changeToward = {change:toward.DOWN, act:snack.turnDown};
                } else if (snack.snackBody[0].ly > 430) {
                    snack.changeToward = {change:toward.UP, act:snack.turnUp};
                } else {
                    snack.changeToward = Math.random() > 0.5 ? {change:toward.UP, act:snack.turnUp} : {change:toward.DOWN, act:snack.turnDown};
                }
            }

        }
    }
}

function avoidSnack(nowSnack) {//尝试避开其他蛇
    var suggestToward = new Map();
    for (var i = 0 ; i < snack.length ; i ++) {
        if (nowSnack == snack[i]) {
            continue;
        }
        for (var j = 0 ; j < snack[i].snackBody.length ; j ++ ) {
            var distance = getDistance(nowSnack.snackBody[0], snack[i].snackBody[j]);
            if (distance < 60) {
                var result = analysis(nowSnack.snackBody[0], snack[i].snackBody[j], nowSnack, snack[i]);
                if (result != null) {
                    var temp = suggestToward.get(result);
                    if (temp == null) {
                        suggestToward.set(result, 1);
                    } else {
                        suggestToward.set(result, suggestToward.get(result) + 1);
                    }
                }
            }
        }
    }
    if (suggestToward.size > 0) {//当有多个建议朝向的时候，选择建议次数最多的朝向
        var maxToward = null;
        var maxValue = 0;
        for (var [key, value] of suggestToward) {
            if (value > maxValue) {
                maxToward = key;
            }
        }
        if (maxToward == toward.UP) {
            nowSnack.changeToward = {change:toward.UP, act:nowSnack.turnUp};
        } else if (maxToward == toward.DOWN) {
            nowSnack.changeToward = {change:toward.DOWN, act:nowSnack.turnDown};
        } else if (maxToward == toward.LEFT) {
            nowSnack.changeToward = {change:toward.LEFT, act:nowSnack.turnLeft};
        } else if (maxToward == toward.RIGHT) {
            nowSnack.changeToward = {change:toward.RIGHT, act:nowSnack.turnRight};
        }
    }
}

function analysis(a, b, snackA, snackB) {//当A蛇的头部与B蛇的某节身体b接近时，分析A蛇是否需要转向
    var bNowToward = getBallToward(b, snackB);
    var aNowToward = getBallToward(a, snackA);

    var dangrousX = false;
    var dangrousY = false;

    // console.log(JSON.stringify(aNowToward) + "--" + JSON.stringify(bNowToward) + "--" + a.lx + "--" + b.lx);
    if (a.lx < b.lx && bNowToward != toward.RIGHT && aNowToward != toward.LEFT) {//a在b左侧，b向左移动且不与a相同方向
        dangrousX = true;
    } else if (a.lx >= b.lx && bNowToward != toward.LEFT && aNowToward != toward.RIGHT)  {//a在b右侧，b向右移动且不与a相同方向
        dangrousX = true;
    }

    if (a.ly < b.ly && bNowToward != toward.DOWN && aNowToward != toward.UP) {//a在b上方，b向上移动且不与a方向相同
        dangrousY = true;
    } else if (a.ly >= b.ly && bNowToward != toward.UP && aNowToward != toward.DOWN) {//a在b下方，b向下移动且不与a方向相同
        dangrousY = true;
    }

    if (dangrousX && dangrousY) {
        if (aNowToward == toward.UP || aNowToward == toward.DOWN) {
            if (a.lx > 250) {
                return toward.LEFT;
            } else {
                return toward.RIGHT;
            }
        } else {
            if (a.ly > 250) {
                return toward.UP;
            } else {
                return toward.DOWN;
            }
        }
    } else {
        return null;
    }
}

function getBallToward(ball, nowSnack) {//获得某个蛇的某节身体的移动方向
    if (ball.point.length == 0) {
        return nowSnack.nowToward;
    } else {
        if (ball.point[0].speedX == 1) {
            return toward.RIGHT;
        } else if (ball.point[0].speedX == -1) {
            return toward.LEFT;
        } else if (ball.point[0].speedY == 1) {
            return toward.DOWN;
        } else if (ball.point[0].speedY == -1) {
            return toward.UP;
        }
    }
}
