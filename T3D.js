is3D = true;
toward = {DOWN:{x:0, y:1, rotateY:0},LEFT:{x:-1, y:0, rotateY:45},UP:{x:0, y:-1, rotateY:90},RIGHT:{x:1, y:0, rotateY:-45}};//重新定义方向枚举，加入旋转方向，用来设置蛇头的朝向
//下面两个系数是3D渲染系数，用来在渲染时使图像更像3D效果，不影响蛇移动和触碰物体的判定，因为蛇的移动和判定是根据虚拟的lx和ly来做的
var T3D_X = 1;//3D渲染x轴系数。
var T3D_Y = 0.7;//3D渲染y轴系数，因为3D的角度，y轴不会像2D的时候那么长，在显示时会适当的压缩。

function repaint3D() {
    for (var i = 0 ; i < snack.length ; i ++) {
        for (var j = 0 ; j < snack[i].snackBody.length ; j ++) {
            snack[i].snackBody[j].style.display = "block";
            snack[i].snackBody[j].style.left = snack[i].snackBody[j].lx * T3D_X - 10 + "px";
            snack[i].snackBody[j].style.top = snack[i].snackBody[j].ly * T3D_Y - 10 + "px";
            snack[i].snackBody[j].style.zIndex = snack[i].snackBody[j].ly;
        }
        snack[i].snackBody[0].getElementsByClassName("circle")[0].getElementsByTagName("span")[0].innerText = "囧";
        snack[i].snackBody[0].style.zIndex = "999";
        snack[i].snackBody[0].getElementsByClassName("circle")[0].getElementsByTagName("span")[0].style.transform = "rotateY(" + snack[i].nowToward.rotateY + "deg)";//控制囧字的朝向
    }
    for (var i = 0 ; i < things.length ; i ++) {
        things[i].style.display = "block";
        things[i].style.left = things[i].lx * T3D_X - 10 + "px";
        things[i].style.top = things[i].ly * T3D_Y - 10 + "px";
    }
}

function changeTo3D() {//将游戏场地沿x轴拉伸45度
    is3D = true;
    chessBoard.style.width = "500px"
    chessBoard.style.height = "350px"
    chessBoard.style.transition = "transform 2s";
    chessBoard.style.transform = "skew(-45deg)";
    T3D_Y = 0.7;
    T3D_X = 1;
    for (var i = 0 ; i < squareSet.length ; i ++) {//将地面纹理进行3D处理
        for (var j = 0 ; j < squareSet[i].length ; j ++) {
            squareSet[i][j].style.width = "20px";
            squareSet[i][j].style.height = "14px";
            // squareSet[i][j].style.transform = "skew(-45deg)";
        }
    }
    for (var i = 0 ; i < snack.length ; i ++) {//将蛇身变成球体
        for (var j = 0 ; j < snack[i].snackBody.length ; j ++) {
            snack[i].snackBody[j].style.transition = "transform 2s";
            rendering3D(snack[i].snackBody[j]);
        }
        snack[i].snackBody[0].getElementsByClassName("circle")[0].getElementsByTagName("span")[0].style.transform = "rotateY(" + snack[i].nowToward.rotateY + "deg)";
    }
    for (var i = 0 ; i < things.length ; i ++) {//将物体变成球体效果
        things[i].style.display = "block";
        things[i].style.transform = "skew(0deg)";
        things[i].style.transition = "transform 2s";
        things[i].style.transform = "skew(45deg)";
        // things[i].getElementsByClassName("over_circle")[0].style.backgroundImage = "radial-gradient(circle at center, white, blueviolet)";
        things[i].getElementsByClassName("shadow")[0].style.display = "inline-block";
    }
    repaint();
}

function rendering3D(obj, color) {//在创建新的身体或者物体的时候，直接渲染为3D效果
    obj.style.transform = "skew(45deg)";
    obj.getElementsByClassName("over_circle")[0].style.backgroundImage = "radial-gradient(circle at center, white, " + color + ")";
    obj.getElementsByClassName("shadow")[0].style.display = "inline-block";
}