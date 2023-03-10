import * as THREE from "three";
import { SrcAlphaFactor } from "three";
import { VertexNormalsHelper } from "three/addons";

main();

function main() {
  console.log("Press 'Shift + H' to print all keybinds.");

  let globalDelayStep = "10";
  let time = 0.0;
  let timeStep = 0.01;
  let rotationAdjustmentFactor = 0.00005;
  let sizeScalarStep = 0.0008;

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

  let canvas = document.querySelector("#c");
  canvas.draggable = true;

  let isLightingIgnored = false;
  let basicMaterial = new THREE.MeshBasicMaterial({ color: sharedColor });
  let phongMaterial = new THREE.MeshPhongMaterial({
    color: sharedColor,
  });
  let materialObj = { 0: phongMaterial, 1: basicMaterial };

  let movementAllowed = true;
  let translationAllowed = false;
  let xRotationAllowed = false;
  let foreverIncrement = 0;

  let allowNormalVisualization = false;

  let raycaster = new THREE.Raycaster();
  let pointer = new THREE.Vector2();

  let zRotationAllowed = false;

  const renderer = new THREE.WebGLRenderer({ canvas });

  // create a 'PerspectiveCamera' object
  let fov = 75;
  let aspect = windowWidth / windowHeight;
  let near = 0.001;
  let far = 10;
  let camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  // move the camera forward on the z-axis so the frustrum is looking down the -z direction
  camera.position.z = 4;

  console.dir(camera);
  console.log(
    `Camera's position:\n\tx:\t${camera.position.x}\n\ty:\t${camera.position.y}\n\tz:\t${camera.position.z}`
  );

  // create a 'Scene' object
  const scene = new THREE.Scene();

  // create the geometry for a box
  let boxWidth = 1.0;
  let boxHeight = 1.0;
  let boxDepth = 1.0;
  let boxGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

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
  // scene.add(cubeMesh2);

  renderer.render(scene, camera);

  let color = 0xffffff;
  let intensity = 1;
  let light = new THREE.DirectionalLight(color, intensity);
  light.position.set(0, 1, 20);
  scene.add(light);

  let arrowLength = 1;
  let arrowColor = 0xff0000;
  let cubeNormalsVisualizer = new VertexNormalsHelper(
    meshObj[0],
    arrowLength,
    arrowColor
  );
  let sphereNormalsVisualizer = new VertexNormalsHelper(
    meshObj[1],
    arrowLength,
    arrowColor
  );
  let normalsVisualizerObj = {
    0: cubeNormalsVisualizer,
    1: sphereNormalsVisualizer,
  };
  let normalsVisualizerObjIndex = 0;

  cubeMesh.material.vertexColors = true;

  console.dir(cubeMesh);
  // let colors = new Float32Array();
  // for (let i = 0; i < 108; i++) {
  //   colors.push(Math.random());
  // }

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays
  // https://stackoverflow.com/questions/41670308/three-buffergeometry-how-do-i-manually-set-face-colors#:~:text=geometry.setAttribute%20%28%27color%27%2C%20new%20THREE.BufferAttribute%20%28colors%2C%203%29%29%3B%20In%20the,three.js%20built-in%20material%2C%20in%20the%20material%20definition%2C%20set

  // cubeMesh.geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  let interactableArea = document.getElementsByClassName("interactableArea")[0];

  interactableArea.addEventListener("click", paintFace);
  interactableArea.addEventListener("wheel", handleWheel);
  window.addEventListener("resize", fitCanvasToWindow);

  // make default drag image invisible by setting to an empty div
  let invisibleDiv = document.createElement("div");
  invisibleDiv.classList = "invisibleDiv";
  interactableArea.appendChild(invisibleDiv);

  canvas.addEventListener("dragstart", handleDragStart);
  canvas.addEventListener("drag", handleManualRotation);

  // "global" events
  window.addEventListener("keydown", handleGlobalKeydown);
  window.addEventListener("pointermove", castRay);

  fitCanvasToWindow();
  requestAnimationFrame(render);

  /* ======================================= FUNCTIONS ======================================== */

  // adjust canvas to window's dimensions
  function fitCanvasToWindow(event) {
    canvas.width = interactableArea.clientWidth;
    canvas.height = interactableArea.clientHeight;

    camera.aspect = canvas.width / canvas.height;
    renderer.setSize(canvas.width, canvas.height, false);
    camera.updateProjectionMatrix();
  }

  function toggleZRotation() {
    zRotationAllowed ? (zRotationAllowed = false) : (zRotationAllowed = true);

    handleRotation();
  }

  function castRay(event) {
    // to use threejs's Raycaster object,
    // 2D corodinates have to be in normalized device coordinates ("NDC") form
    //  NDC formula: {x: (client / window) * 2 - 1, y: (client / window) * 2 + 1)}
    //  window_topLeft = (-1, 1), window_bottomRight = (1, -1)
    let NDC_x = (event.clientX / window.innerWidth) * 2 - 1;
    let NDC_y = -(event.clientY / window.innerHeight) * 2 + 1;

    // console.log(`NDC_x:\t${NDC_x}`);
    // console.log(`NDC_y:\t${NDC_y}`);

    pointer.set(NDC_x, NDC_y);

    raycaster.setFromCamera(pointer, camera);
  }

  function visualizePointerHover() {}

  function paintFace(event) {
    console.dir(raycaster);

    let rayIntersections = raycaster.intersectObject(meshObj[meshObjIndex]);

    console.log(rayIntersections);

    if (rayIntersections.length > 0) {
      for (let i = 0; i < rayIntersections.length; i++) {
        let positionsBuffer =
          rayIntersections[i].object.geometry.getAttribute("position");

        console.log(positionsBuffer);

        let aVertex = new THREE.Vector3(
          positionsBuffer.getX(rayIntersections[i].face.a),
          positionsBuffer.getY(rayIntersections[i].face.a),
          positionsBuffer.getZ(rayIntersections[i].face.a)
        );
        let bVertex = new THREE.Vector3(
          positionsBuffer.getX(rayIntersections[i].face.b),
          positionsBuffer.getY(rayIntersections[i].face.b),
          positionsBuffer.getZ(rayIntersections[i].face.b)
        );
        let cVertex = new THREE.Vector3(
          positionsBuffer.getX(rayIntersections[i].face.c),
          positionsBuffer.getY(rayIntersections[i].face.c),
          positionsBuffer.getZ(rayIntersections[i].face.c)
        );

        // console.log(
        //   `selectedTriangle:\n\ta:\t(${aVertex.x},\n\t\t${aVertex.y},\n\t\t${aVertex.z})\n\tb:\t(${bVertex.x},\n\t\t${bVertex.y},\n\t\t${bVertex.z})\n\tc:\t(${cVertex.x},\n\t\t${cVertex.y},\n\t\t${cVertex.z})`
        // );

        // need a color attribute buffer
      }
    }

    // console.dir(meshObj[meshObjIndex]);
  }

  function toggleNormalVisualization() {
    allowNormalVisualization
      ? (allowNormalVisualization = false)
      : (allowNormalVisualization = true);

    handleNormalVisualization();
  }

  function handleNormalVisualization() {
    if (allowNormalVisualization) {
      scene.add(normalsVisualizerObj[normalsVisualizerObjIndex]);
    } else {
      scene.remove(normalsVisualizerObj[normalsVisualizerObjIndex]);
    }
  }

  function printKeybinds() {
    console.log("Shift + X:\tToggle Wireframe");
    console.log("Shift + G:\tToggle Movement");
    console.log("Shift + B:\tToggle X-Axis Rotation");
    console.log("Shift + H:\tPrint Keybinds");
    console.log("Shift + E:\tCycle Colors");
    console.log("Shift + N:\tVisualize Normals");
    console.log("Shift + T:\tToggle Z-Axis Rotation");
    console.log("Ctrl + X:\tCycle Meshes");
    console.log("Ctrl + M:\tPrint Debug Info");
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

        // distance is in the range (0, 1)
        let distance = Math.sin(foreverIncrement) / 200;
        // console.log(`distance:\t${distance}`);

        // console.log(`x:\t${meshObj[meshObjIndex].position.x}`);
        // console.log(`y:\t${meshObj[meshObjIndex].position.y}`);
        // console.log(`z:\t${meshObj[meshObjIndex].position.z}`);

        meshObj[meshObjIndex].translateOnAxis(
          THREE.Object3D.DEFAULT_UP,
          distance
        );

        setTimeout(handleTranslation, globalDelayStep);
      }
    }
  }

  function toggleXRotation() {
    xRotationAllowed ? (xRotationAllowed = false) : (xRotationAllowed = true);

    handleRotation();
  }

  function handleRotation() {
    if (movementAllowed) {
      if (xRotationAllowed) {
        // console.log(
        //   `cubeMesh.rotation.x:\t${cubeMesh.rotation.x}\ncubeMesh.rotation.y:\t${cubeMesh.rotation.y}\ncubeMesh.rotation.z:\t${cubeMesh.rotation.z}`
        // );
        // console.log(`.getWorldDirection():\t${cubeMesh.getWorldDirection()}`);

        // meshObj[meshObjIndex].rotation.x += timeStep;
        meshObj[meshObjIndex].rotation.y += timeStep;
      }

      if (zRotationAllowed) {
        meshObj[meshObjIndex].rotation.z += timeStep;
      }

      setTimeout(handleRotation, globalDelayStep);
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
        printDebugInfo();
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
        toggleXRotation();
      }

      if (event.key == "H") {
        printKeybinds();
      }

      if (event.key == "E") {
        toggleColorChanging();
      }

      if (event.key == "N") {
        toggleNormalVisualization();
      }

      if (event.key == "T") {
        toggleZRotation();
      }

      if (event.key == "R") {
        resetState();
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

  function printDebugInfo() {
    console.log("\nCurrent Mesh:");
    console.dir(meshObj[meshObjIndex]);
    console.log("Current Color:");
    console.log(
      `\tr:\t${sharedColor.r}\n\tg:\t${sharedColor.g}\n\tb:\t${sharedColor.b}`
    );
    console.log("Timestep:");
    console.log(timeStep);

    console.log("Window:");
    console.log(`\taspect: ${window.innerWidth / window.innerHeight}`);
    console.log(`\twindowWidth: ${window.innerWidth}`);
    console.log(`\twindowHeight: ${window.innerHeight}`);

    console.log(`\tcanvas.width: ${canvas.width}`);
    console.log(`\tcanvas.height: ${canvas.height}\n`);

    console.log(`\tdiv.width: ${interactableArea.clientWidth}`);
    console.log(`\tdiv.height: ${interactableArea.clientHeight}`);

    console.dir(canvas);
    console.dir(interactableArea);

    console.log("");
  }

  function changeMesh() {
    console.log(`Object.keys(meshObj).length:\t${Object.keys(meshObj).length}`);
    console.log(`meshObjIndex:\t${meshObjIndex}`);

    scene.remove(meshObj[meshObjIndex]);
    scene.remove(normalsVisualizerObj[normalsVisualizerObjIndex]);

    meshObjIndex++;
    normalsVisualizerObjIndex++;

    // reset object iterators
    if (meshObjIndex == Object.keys(meshObj).length) {
      meshObjIndex = 0;
    }
    console.log(`Object.keys(meshObj):\t${Object.keys(meshObj)}`);

    if (normalsVisualizerObjIndex == Object.keys(normalsVisualizerObj).length) {
      normalsVisualizerObjIndex = 0;
    }

    scene.add(meshObj[meshObjIndex]);

    if (allowNormalVisualization) {
      scene.add(normalsVisualizerObj[normalsVisualizerObjIndex]);
    }

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
    // console.log("up:");
    // console.dir(meshObj[meshObjIndex].up);
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

  function handleWheel(event) {
    if (event.deltaY != 0) {
      moveCameraOnZ(event);
    }

    if (event.deltaX != 0) {
      tuneTime(event);
    }

    // console.log(`deltaX:\t${event.deltaX}`);
  }

  function moveCameraOnZ(event) {
    console.log(`camera.position.z:\t${camera.position.z}`);

    if (event.deltaY > 0) {
      camera.position.z += sizeScalarStep * event.deltaY;
    } else {
      camera.position.z += sizeScalarStep * event.deltaY;
    }
  }

  function scaleSize(event) {
    // deltaY > 0 -> make bigger ("scroll in" feeling)
    // deltaY < 0 -> make smaller ("zoom out" feeling)

    // console.log(`deltaY:\t${event.deltaY}`);

    if (event.deltaY < 0) {
      meshObj[meshObjIndex].geometry.scale(
        1.0 + sizeScalarStep * event.deltaY,
        1.0 + sizeScalarStep * event.deltaY,
        1.0 + sizeScalarStep * event.deltaY
      );
    }
    if (event.deltaY > 0) {
      meshObj[meshObjIndex].geometry.scale(
        1.0 + sizeScalarStep * event.deltaY,
        1.0 + sizeScalarStep * event.deltaY,
        1.0 + sizeScalarStep * event.deltaY
      );
    }
  }

  function tuneTime(event) {
    // deltaX < 0 -> increase time step
    // deltaX > 0 -> decrease time step

    if (event.deltaX < 0) {
      timeStep -= event.deltaX * rotationAdjustmentFactor;
    }
    if (event.deltaX > 0) {
      timeStep -= event.deltaX * rotationAdjustmentFactor;
    }
  }

  function toggleColorChanging() {
    allowColorChanging
      ? (allowColorChanging = false)
      : (allowColorChanging = true);

    // console.log(`\tallowColorChanging: ${allowColorChanging}`);

    // console.log(
    //   `sharedColor:\n\tr: ${sharedColor.r}\n\tg: ${sharedColor.g}\n\tb: ${sharedColor.b}`
    // );
    // console.log(
    //   `endColor:\n\tr: ${endColor.r}\n\tg: ${endColor.g}\n\tb: ${endColor.b}`
    // );

    changeColor();
  }

  function changeColor() {
    if (allowColorChanging) {
      // "smooth transition" between colors:

      // check if all elements in the arrays are equal
      if (colorsLookSimilar(sharedColor.toArray(), endColor.toArray())) {
        // they are the same color: get a new color
        let randomHexTrip = genRandomHexTriplet();
        // console.log(`randomHexTrip:\t${randomHexTrip}`);

        endColor.setHex(randomHexTrip);
        // console.log(
        //   `endColor:\n\tr: ${endColor.r}\n\tg: ${endColor.g}\n\tb: ${endColor.b}`
        // );
      } else {
        if (timeStep > 0) {
          sharedColor.lerp(endColor, timeStep);
        } else {
          sharedColor.lerp(endColor, 0.01);
        }
      }

      // console.log(
      //   `sharedColor:\n\tr: ${sharedColor.r}\n\tg: ${sharedColor.g}\n\tb: ${sharedColor.b}`
      // );

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

    if (allowNormalVisualization) {
      normalsVisualizerObj[normalsVisualizerObjIndex].update();
    }

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

    let similarityRange = 0.05;

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
