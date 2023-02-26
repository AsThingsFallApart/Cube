import * as THREE from "three";

main();

function main() {
  let time = 0.0;
  let timeStep = 1.0;
  let rotationDecelerationFactor = timeStep * 0.01;
  let sizeScalarStep = 0.05;

  let sharedColor = new THREE.Color();
  sharedColor = hexToRGB(genRandomHexColor());

  let endColor = [0.0, 0.0, 0.0];
  endColor = hexToRGB(genRandomHexColor());

  let allowColorChanging = false;

  let previousScreenX = 0;
  let previousScreenY = 0;
  let rotationXStep = 0.05;
  let rotationYStep = 0.05;

  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;

  const canvas = document.querySelector("#c");
  canvas.draggable = true;
  canvas.height = windowHeight;
  canvas.width = windowWidth;

  addEventListener("resize", () => {
    console.log(`aspect: ${window.innerWidth / window.innerHeight}`);
    console.log(`\twindowWidth: ${window.innerWidth}`);
    console.log(`\twindowHeight: ${window.innerHeight}`);

    aspect = window.width / window.height;
    camera.aspect = aspect;
    renderer.setViewport(0, 0, windowWidth, windowHeight);
  });

  const renderer = new THREE.WebGLRenderer({ canvas });

  // create a 'PerspectiveCamera' object
  let fov = 75;
  let aspect = windowWidth / windowHeight;
  let near = 0.1;
  let far = 10;
  let camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  // move the camera forward on the z-axis so the frustrum is looking down the -z direction
  camera.position.z = 5;

  // create a 'Scene' object
  const scene = new THREE.Scene();

  // create the geometry for a box
  let boxWidth = 1.0;
  let boxHeight = 1.0;
  let boxDepth = 1.0;
  let boxGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  // create a material for whatever geometry
  let phongMaterial = new THREE.MeshPhongMaterial({
    color: rgbToHex(sharedColor),
  });

  let cubeMesh = new THREE.Mesh(boxGeometry, phongMaterial);

  let sphereRadius = 0.7;
  let sphereWidthSegments = 32;
  let sphereHeightSegmens = 16;
  let sphereGeometry = new THREE.SphereGeometry(
    sphereRadius,
    sphereWidthSegments,
    sphereHeightSegmens
  );

  let sphereMesh = new THREE.Mesh(sphereGeometry, phongMaterial);

  let meshObj = { 0: cubeMesh, 1: sphereMesh };
  let meshObjIndex = 0;

  scene.add(meshObj[meshObjIndex]);

  // let test3jsColor = new THREE.Color(0xcf7d9d);
  // scene.background = test3jsColor;

  renderer.render(scene, camera);

  let color = 0xffffff;
  let intensity = 1;
  let light = new THREE.DirectionalLight(color, intensity);
  light.position.set(0, 1, 20);
  scene.add(light);

  let interactableArea = document.getElementsByClassName("interactableArea")[0];

  interactableArea.addEventListener("click", toggleColorChanging);
  interactableArea.addEventListener("wheel", scaleSize);

  let invisibleDiv = document.createElement("div");
  invisibleDiv.classList = "invisibleDiv";
  interactableArea.appendChild(invisibleDiv);

  canvas.addEventListener("dragstart", handleDragStart);
  canvas.addEventListener("drag", handleRotation);

  // "global" events
  addEventListener("keydown", handleGlobalKeydown);

  requestAnimationFrame(render);

  /* ======================================= FUNCTIONS ======================================== */

  function toggleWireframe() {
    console.log(`phongMaterial.wireframe:\t${phongMaterial.wireframe}`);
    phongMaterial.wireframe
      ? (phongMaterial.wireframe = false)
      : (phongMaterial.wireframe = true);
  }

  function handleGlobalKeydown(event) {
    if (event.ctrlKey == true) {
      if (event.key == "x") {
        changeMesh();
      }
      if (event.key == "b") {
        printCurrentMesh();
      }
    }

    if (event.shiftKey == true) {
      if (event.key == "X") {
        console.log("Pressing shift + x...");
        toggleWireframe();
      }
    }
  }

  function printCurrentMesh() {
    console.dir(meshObj[meshObjIndex]);
  }

  function changeMesh() {
    console.log(`Object.keys(meshObj).length:\t${Object.keys(meshObj).length}`);
    console.log(`meshObjIndex:\t${meshObjIndex}`);

    console.log(meshObj[meshObjIndex].geometry);

    scene.remove(meshObj[meshObjIndex]);
    ``;
    meshObjIndex++;
    // reset object iterator
    if (meshObjIndex == Object.keys(meshObj).length) {
      meshObjIndex = 0;
    }
    console.log(`Object.keys(meshObj):\t${Object.keys(meshObj)}`);
    scene.add(meshObj[meshObjIndex]);

    console.log(scene.children);
  }

  function handleDragStart(event) {
    event.dataTransfer.setDragImage(invisibleDiv, 0, 0);
    event.dataTransfer.dropEffect = "none";
    event.dataTransfer.effectAllowed = "none";
  }

  function handleRotation(event) {
    let movementX = event.screenX - previousScreenX;
    let movementY = event.screenY - previousScreenY;
    // console.log(`\tevent.movementX:\t${movementX}`);
    // console.log(`\tevent.movementY:\t${movementY}`);

    if (event.buttons == 1) {
      // "main button" (usually left mouse button) pressed
      // console.log(`left mouse button pressed...`);
      if (movementX > 0) {
        meshObj[meshObjIndex].rotation.y += rotationYStep;
      }
      if (movementX < 0) {
        meshObj[meshObjIndex].rotation.y += rotationYStep * -1;
      }
      if (movementY > 0) {
        meshObj[meshObjIndex].rotation.x += rotationXStep;
      }
      if (movementY < 0) {
        meshObj[meshObjIndex].rotation.x += rotationYStep * -1;
      }
    }

    previousScreenX = event.screenX;
    previousScreenY = event.screenY;
  }

  function scaleSize(event) {
    // deltaY > 0 -> make bigger ("scroll in" feeling)
    // deltaY < 0 -> make smaller ("zoom out" feeling)

    if (event.deltaY > 0) {
      meshObj[meshObjIndex].geometry.scale(
        1.0 + sizeScalarStep,
        1.0 + sizeScalarStep,
        1.0 + sizeScalarStep
      );
    }
    if (event.deltaY < 0) {
      meshObj[meshObjIndex].geometry.scale(
        1.0 - sizeScalarStep,
        1.0 - sizeScalarStep,
        1.0 - sizeScalarStep
      );
    }
  }

  function toggleColorChanging() {
    allowColorChanging
      ? (allowColorChanging = false)
      : (allowColorChanging = true);

    console.log(`\tallowColorChanging: ${allowColorChanging}`);

    console.log(
      `sharedColor:\n\tr: ${sharedColor[0]}\n\tg: ${sharedColor[1]}\n\tb: ${sharedColor[2]}`
    );
    console.log(
      `endColor:\n\tr: ${endColor[0]}\n\tg: ${endColor[1]}\n\tb: ${endColor[2]}`
    );

    changeColor();
  }

  function changeColor() {
    if (allowColorChanging) {
      // "smooth transition" between colors:

      // check if all elements in the arrays are equal
      if (colorsLookSimilar(sharedColor, endColor)) {
        // they are the same color: get a new color
        let randomHexColor = genRandomHexColor();
        let inRGB = hexToRGB(randomHexColor);
        endColor = inRGB;
        console.log(
          `endColor:\n\tr: ${endColor[0]}\n\tg: ${endColor[1]}\n\tb: ${endColor[2]}`
        );
        phongMaterial;
      } else {
        // transition colors
        if (sharedColor[0] <= endColor[0]) {
          sharedColor[0] += timeStep;
        } else {
          sharedColor[0] -= timeStep;
        }

        if (sharedColor[1] <= endColor[1]) {
          sharedColor[1] += timeStep;
        } else {
          sharedColor[1] -= timeStep;
        }

        if (sharedColor[2] <= endColor[2]) {
          sharedColor[2] += timeStep;
        } else {
          sharedColor[2] -= timeStep;
        }
      }

      console.log(
        `sharedColor:\n\tr: ${sharedColor[0]}\n\tg: ${sharedColor[1]}\n\tb: ${sharedColor[2]}`
      );

      // change color
      phongMaterial.color.set(rgbToHex(sharedColor));

      // EPILEPSY WARNING @ low delays
      setTimeout(() => {
        requestAnimationFrame(changeColor);
      }, "10");
    }
  }

  function render() {
    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  function rgbToHex(rgb) {
    let conversion = rgb.map(function (x) {
      x = parseInt(x).toString(16);
      return x.length == 1 ? "0" + x : x;
    });

    return "#" + conversion.join("");
  }

  function genRandomHexColor() {
    // generate a string like "#123edf".
    let randomColorHex = [];
    let numToHex = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
    ];

    for (let i = 0; i < 6; i++) {
      // get num from 0 to 15
      let randomNum = Math.floor(Math.random() * 16);
      // console.log(`Random number: ${randomNum}`);

      // map int to hex string
      randomColorHex.push(numToHex[randomNum]);
      // console.log(`randomColorHex: ${randomColorHex}`);
    }

    let completeHexNotation = "#" + randomColorHex.join("");

    return completeHexNotation;
  }

  function hexToRGB(hex) {
    let rgb = [];
    let r, g, b;

    if (hex.substring(0, 1) == "#") {
      hex = hex.substring(1, hex.length);
    }

    // extact red
    r = hex.substring(0, 2);
    // convert
    r = parseInt(r, 16);

    // extract green
    g = hex.substring(2, 4);
    g = parseInt(g, 16);

    // extract blue
    b = hex.substring(4, 6);
    b = parseInt(b, 16);

    rgb.push(r);
    rgb.push(g);
    rgb.push(b);

    return rgb;
  }

  function colorsLookSimilar(a_rgb, b_rgb) {
    // return boolean 'true' if 'a_rgb' with within a RGB range with 'b_rgb'
    let redSimilar = false;
    let greenSimilar = false;
    let blueSimilar = false;

    let similarityRange = 5;

    if (
      a_rgb[0] > b_rgb[0] - similarityRange &&
      a_rgb[0] < b_rgb[0] + similarityRange
    ) {
      redSimilar = true;
    }
    if (
      a_rgb[1] > b_rgb[1] - similarityRange &&
      a_rgb[1] < b_rgb[1] + similarityRange
    ) {
      greenSimilar = true;
    }
    if (
      a_rgb[2] > b_rgb[2] - similarityRange &&
      a_rgb[2] < b_rgb[2] + similarityRange
    ) {
      blueSimilar = true;
    }

    if (redSimilar && greenSimilar && blueSimilar) {
      return true;
    } else {
      return false;
    }
  }
}
