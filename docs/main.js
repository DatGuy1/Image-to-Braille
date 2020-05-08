var maxWidth = 50;
var inverted = false;
var dithering = false;
var currentImg;

var redValue = 1;
var greenValue = 1;
var blueValue = 1;

window.onload = function() {
    darkTheme(inverted);
}

function darkTheme(toDarkTheme) {
    document.getElementById("text").style.background = ((toDarkTheme) ? '#333' : '#ccc');
    document.getElementById("text").style.color = ((toDarkTheme) ? '#ccc' : '#333');
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

    if (dithering) rgb2bin();

    var output_line = "";

    for (var imgy = 0; imgy < canvas.height; imgy += 4) {
        for (var imgx = 0; imgx < canvas.width; imgx += 2) {
            var current = [0, 0, 0, 0, 0, 0, 0, 0];
            var cindex = 0;
            for (var x = 0; x < 2; x++) {
                for (var y = 0; y < 4; y++) {
                    var temp = ctx.getImageData(imgx + x, imgy + y, 1, 1).data;
                    var pixelColourAvg = ((temp[0] / redValue) + (temp[1] / greenValue) + (temp[2] / blueValue)) / 3;
                    if (inverted) {
                        if (pixelColourAvg > 128) current[cindex] = 1;
                    } else {
                        if (pixelColourAvg < 128) current[cindex] = 1;
                    }
                    cindex++;
                }
            }
            output_line += getChar(current);
        }
        output_line += "\n";
    }
    document.getElementById("text").value = output_line;
    document.getElementById("charcount").innerHTML = output_line.length;
}

function redChanged(redObject) {
    document.getElementById("redSlider").value = redObject.value;
    document.getElementById("redCounter").value = redObject.value;
    redValue = this.value;
    genBraille();
}

function greenChanged(greenObject) {
    document.getElementById("greenSlider").value = greenObject.value;
    document.getElementById("greenCounter").value = greenObject.value;
    greenValue = this.value;
    genBraille();
}

function blueChanged(blueObject) {
    document.getElementById("blueSlider").value = blueObject.value;
    document.getElementById("blueCounter").value = blueObject.value;
    blueValue = this.value;
    genBraille();
}

function handleDrop(event) {
    event.preventDefault();
    fileChanged(event.dataTransfer.files[0] || event.dataTransfer.getData("text"));
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
            console.log(event);
            currentImg.src = event.target.result;
            genBraille();
        };

        reader.readAsDataURL(input);
    }
}
