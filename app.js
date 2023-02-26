import * as THREE from "three";

main();

function main() {
  console.log("Press 'Shift + H' to show all keybinds.");

  let globalDelayStep = "10";
  let time = 0.0;
  let timeStep = 0.005;
  let completenessRatio = 0.0;
  let rotationDecelerationFactor = timeStep * 0.01;
  let sizeScalarStep = 0.05;

  let sharedColor = new THREE.Color();
  sharedColor.setHex(genRandomHexTriplet());

  let endColor = new THREE.Color();
  endColor.setHex(genRandomHexTriplet());

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

  let isLightingIgnored = false;
  let basicMaterial = new THREE.MeshBasicMaterial({ color: sharedColor });
  let phongMaterial = new THREE.MeshPhongMaterial({
    color: sharedColor,
  });
  let materialObj = { 0: phongMaterial, 1: basicMaterial };

  let movementAllowed = false;
  let translationAllowed = true;
  let rotationAllowed = true;
  let foreverIncrement = 0;

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

  let cubeMesh = new THREE.Mesh(boxGeometry, phongMaterial);
  let cubeMesh2 = new THREE.Mesh(boxGeometry, phongMaterial);

  cubeMesh2.translateX(2);

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
  scene.add(cubeMesh2);

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
  canvas.addEventListener("drag", handleManualRotation);

  // "global" events
  addEventListener("keydown", handleGlobalKeydown);

  requestAnimationFrame(render);

  /* ======================================= FUNCTIONS ======================================== */

  function printKeybinds() {
    console.log("Shift + X:\tToggle Wireframe");
    console.log("Shift + G:\tToggle Movement");
    console.log("Shift + B:\tToggle Rotation");
    console.log("Shift + H:\tPrint Keybinds");
    console.log("Ctrl + X:\tCycle Meshes");
    console.log("Ctrl + M:\tPrint Displayed Mesh");
    console.log("Alt + X:\tToggle Lighting");
    console.log("Alt + G:\tToggle Translation");

    console.log("");
  }

  function toggleMovement() {
    movementAllowed ? (movementAllowed = false) : (movementAllowed = true);

    handleTranslation();
    handleRotation();
  }

  function toggleTranslation() {
    translationAllowed
      ? (translationAllowed = false)
      : (translationAllowed = true);

    handleTranslation();
  }

  function handleTranslation() {
    if (movementAllowed) {
      if (translationAllowed) {
        foreverIncrement += 0.01;
        let distance = Math.sin(foreverIncrement) / 200;
        // console.log(`distance:\t${distance}`);

        meshObj[meshObjIndex].translateOnAxis(
          THREE.Object3D.DEFAULT_UP,
          distance
        );

        setTimeout(handleTranslation, globalDelayStep);
      }
    }
  }

  function toggleRotation() {
    rotationAllowed ? (rotationAllowed = false) : (rotationAllowed = true);

    handleRotation();
  }

  function handleRotation() {
    if (movementAllowed) {
      if (rotationAllowed) {
        // console.log(
        //   `cubeMesh.rotation.x:\t${cubeMesh.rotation.x}\ncubeMesh.rotation.y:\t${cubeMesh.rotation.y}\ncubeMesh.rotation.z:\t${cubeMesh.rotation.z}`
        // );
        // console.log(`.getWorldDirection():\t${cubeMesh.getWorldDirection()}`);

        // meshObj[meshObjIndex].rotation.x += timeStep;
        meshObj[meshObjIndex].rotation.y += timeStep;

        setTimeout(handleRotation, globalDelayStep);
      }
    }
  }

  function toggleLightingIgnore() {
    console.log(`isLightingIgnored:\t${isLightingIgnored}`);
    console.log(`currentMesh:`);
    console.log(meshObj[meshObjIndex]);

    isLightingIgnored
      ? (isLightingIgnored = false)
      : (isLightingIgnored = true);

    if (isLightingIgnored) {
      for (let key in meshObj) {
        meshObj[key].material = basicMaterial;
      }
    } else {
      for (let key in meshObj) {
        meshObj[key].material = phongMaterial;
      }
    }
  }

  function toggleWireframe() {
    for (let indx in materialObj) {
      materialObj[indx].wireframe
        ? (materialObj[indx].wireframe = false)
        : (materialObj[indx].wireframe = true);
    }
  }

  function handleGlobalKeydown(event) {
    if (event.ctrlKey == true) {
      if (event.key == "x") {
        changeMesh();
      }
      if (event.key == "m") {
        printCurrentMesh();
      }
    }

    if (event.shiftKey == true) {
      if (event.key == "X") {
        toggleWireframe();
      }

      if (event.key == "G") {
        toggleMovement();
      }

      if (event.key == "B") {
        toggleRotation();
      }

      if (event.key == "H") {
        printKeybinds();
      }
    }

    if (event.altKey == true) {
      if (event.key == "x") {
        toggleLightingIgnore();
      }
      if (event.key == "g") {
        toggleTranslation();
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

  function handleManualRotation(event) {
    let movementX = event.screenX - previousScreenX;
    let movementY = event.screenY - previousScreenY;
    // console.log(`\tevent.movementX:\t${movementX}`);
    // console.log(`\tevent.movementY:\t${movementY}`);

    // console.log(
    //   `.getWorldDirection: ${meshObj[meshObjIndex].getWorldDirection()}`
    // );
    console.log("up:");
    console.dir(meshObj[meshObjIndex].up);
    // console.log(
    //   `.localToWorld:${meshObj[meshObjIndex].localToWorld(
    //     meshObj[meshObjIndex.up]
    //   )}`
    // );

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
      `sharedColor:\n\tr: ${sharedColor.r}\n\tg: ${sharedColor.g}\n\tb: ${sharedColor.b}`
    );
    console.log(
      `endColor:\n\tr: ${endColor.r}\n\tg: ${endColor.g}\n\tb: ${endColor.b}`
    );

    changeColor();
  }

  function changeColor() {
    if (allowColorChanging) {
      // "smooth transition" between colors:

      // check if all elements in the arrays are equal
      if (colorsLookSimilar(sharedColor.toArray(), endColor.toArray())) {
        // they are the same color: get a new color
        let randomHexTrip = genRandomHexTriplet();
        console.log(`randomHexTrip:\t${randomHexTrip}`);

        endColor.setHex(randomHexTrip);
        console.log(
          `endColor:\n\tr: ${endColor.r}\n\tg: ${endColor.g}\n\tb: ${endColor.b}`
        );
      } else {
        sharedColor.lerp(endColor, timeStep);

        completenessRatio += timeStep;

        if (completenessRatio == 1.0) {
          completenessRatio = 0.0;
        }
      }

      console.log(
        `sharedColor:\n\tr: ${sharedColor.r}\n\tg: ${sharedColor.g}\n\tb: ${sharedColor.b}`
      );

      // console.log(`.getHexString():\t\t${sharedColor.getHexString()}`);
      // console.log(`.getHex():\t\t\t\t${sharedColor.getHex()}`);

      // update internal color property in mesh objects
      phongMaterial.color.set(sharedColor.getHex());

      if (isLightingIgnored) {
        basicMaterial.color.set(sharedColor.getHex());
      }

      // EPILEPSY WARNING @ low delays
      setTimeout(() => {
        requestAnimationFrame(changeColor);
      }, globalDelayStep);
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

  function genRandomHexTriplet() {
    // generate a string like "123edf".
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

    let completeHexNotation = "0x" + randomColorHex.join("");

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

    let similarityRange = 0.1;

    // console.log(`a_rgb:\t${a_rgb}`);
    // console.log(`b_rgb:\t${b_rgb}`);

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
