var maxWidth = 50;
var onDarkTheme = false;
var onDithering = false;
var currentImg = new Image();

var redValue = 1;
var greenValue = 1;
var blueValue = 1;

window.onload = function() {
    darkTheme(onDarkTheme);
}

function changeMaxWidth(newMaxWidth) {
    maxWidth = newMaxWidth;
    genBraille();
}

function switchDithering(toDithering) {
    onDithering = toDithering;
    genBraille();
}

function darkTheme(toDarkTheme) {
    onDarkTheme = toDarkTheme;
    document.getElementById("brailleText").style.background = ((toDarkTheme) ? '#333' : '#ccc');
    document.getElementById("brailleText").style.color = ((toDarkTheme) ? '#ccc' : '#333');
    genBraille();
}

function getChar(current) {
    allZeros = true;
    for (var i = 0; i < current.length; i++)
        if (current[i] != 0) {
            allZeros = false;
            break;
        }
    if (!allZeros) {
        totalValue = (current[0] << 0) + (current[1] << 1) + (current[2] << 2) + (current[4] << 3) + (current[5] << 4) + (current[6] << 5) + (current[3] << 6) + (current[7] << 7);
    } else {
        totalValue = 4;
    }
    return String.fromCharCode(0x2800 + totalValue);
}

function nearestMultiple(num, mult) {
    return num - (num % mult);
}

function genBraille() {
    if (currentImg == undefined) return;
    var canvas = document.createElement("canvas");

    // Place image on canvas and keep aspect ratio
    var width = currentImg.width;
    var height = currentImg.height;
    if (currentImg.width != (maxWidth * 2)) {
        width = maxWidth * 2;
        height = width * currentImg.height / currentImg.width;
    }

    canvas.width = nearestMultiple(width, 2);
    canvas.height = nearestMultiple(height, 4);

    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF"; // Get rid of alpha
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(currentImg, 0, 0, canvas.width, canvas.height);

    if (onDithering) {
        [ctx, canvas] = rgb2bin(ctx, canvas);
    }

    var fullOutput = "";

    for (var imgy = 0; imgy < canvas.height; imgy += 4) {
        for (var imgx = 0; imgx < canvas.width; imgx += 2) {
            var current = [0, 0, 0, 0, 0, 0, 0, 0];
            var cindex = 0;
            for (var x = 0; x < 2; x++) {
                for (var y = 0; y < 4; y++) {
                    var temp = ctx.getImageData(imgx + x, imgy + y, 1, 1).data;
                    var pixelColourAvg = ((temp[0] / redValue) + (temp[1] / greenValue) + (temp[2] / blueValue)) / 3;
                    if (onDarkTheme) {
                        if (pixelColourAvg > 128) current[cindex] = 1;
                    } else {
                        if (pixelColourAvg < 128) current[cindex] = 1;
                    }
                    cindex++;
                }
            }
            fullOutput += getChar(current);
        }
        fullOutput += "\n";
    }
    document.getElementById("brailleText").value = fullOutput;
    document.getElementById("charCount").innerHTML = fullOutput.length;
}

function redChanged(redObject) {
    realValue = redObject.value || 100
    redValue = realValue / 100;
    document.getElementById("redCounter").value = realValue;
    document.getElementById("redSlider").value = realValue;
    genBraille();
}

function greenChanged(greenObject) {
    realValue = greenObject.value || 100
    greenValue = realValue / 100;
    document.getElementById("greenCounter").value = realValue;
    document.getElementById("greenSlider").value = realValue;
    genBraille();
}

function blueChanged(blueObject) {
    realValue = blueObject.value || 100
    blueValue = realValue / 100;
    document.getElementById("blueCounter").value = realValue;
    document.getElementById("blueSlider").value = realValue;
    genBraille();
}


function handleKeyDown(event) {
    if (event.keyCode == 13 && !event.shiftKey) {
        event.preventDefault();
        var ctx = document.createElement('canvas').getContext('2d');
        var brailleValue = document.getElementById("brailleText").value;
        var brailleList = brailleValue.split("\n");
        ctx.canvas.width = Math.max.apply(null, brailleList.map(brailleValue => ctx.measureText(brailleValue).width));
        ctx.canvas.height = 7 * brailleList.length;
        var heightPerMessage = ctx.canvas.height / brailleList.length;
        for (var i = 0; i < brailleList.length; i++) {
            if (i == 0) {
                ctx.fillText(brailleList[i], 0, 5);
            } else {
                ctx.fillText(brailleList[i], 0, 7 + (i * heightPerMessage));
            }
        }
        currentImg.src = ctx.canvas.toDataURL();
        currentImg.onload = function() {
            genBraille();
        };
    }
}

function handleDrop(event) {
    event.preventDefault();
    var fileInput;
    if (event.clipboardData !== undefined) {
        if (event.clipboardData.files.length > 0) {
            fileInput = event.clipboardData.files[0];
        } else {
            fileInput = event.clipboardData.getData("text")
        }
    } else if (event.dataTransfer !== undefined) {
        if (event.dataTransfer.files.length > 0) {
            fileInput = event.dataTransfer.files[0];
        } else {
            fileInput = event.dataTransfer.getData("text");
        }
    }

    if (fileInput == undefined) {
        throw new TypeError("Couldn't get input");
    }
    fileChanged(fileInput);
}

function fileChanged(input) {
    currentImg = new Image();
    if (typeof(input) == "string") {
        currentImg.src = input
        currentImg.crossOrigin = "Anonymous";
        currentImg.onload = function() {
            genBraille();
        };
    } else {
        var reader = new FileReader();
        reader.onload = function(event) {
            currentImg.src = event.target.result;
            genBraille();
        };

        reader.readAsDataURL(input);
    }
}
