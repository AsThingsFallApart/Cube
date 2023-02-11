import * as THREE from "three";

main();

function main() {
  let timeStep = 0.0;
  let cubeColor = [0.0, 0.0, 0.0];
  let allowColorChanging = false;
  const canvas = document.querySelector("#c");
  console.log(`App.js loaded.`);

  // let textNode = document.createElement("p");

  // textNode.textContent = "yuh";

  // let body = document.getElementsByClassName("body")[0];
  // body.appendChild(textNode);

  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;

  console.log(`canvas.width: ${canvas.width}`);
  console.log(`canvas.height: ${canvas.height}`);

  canvas.width = windowWidth;
  canvas.height = windowHeight;

  console.log(`canvas.width: ${canvas.width}`);
  console.log(`canvas.height: ${canvas.height}`);

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
  let sizeScalar = 1.0;

  let boxWidth = 1.0 * sizeScalar;
  let boxHeight = 1.0 * sizeScalar;
  let boxDepth = 1.0 * sizeScalar;
  let geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  // create a material for the box
  let material = new THREE.MeshPhongMaterial({ color: rgbToHex(cubeColor) });

  let cube = new THREE.Mesh(geometry, material);

  scene.add(cube);

  renderer.render(scene, camera);

  let color = 0xffffff;
  let intensity = 1;
  let light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);

  let interactableArea = document.getElementsByClassName("interactableArea")[0];

  interactableArea.addEventListener("click", toggleColorChanging);
  interactableArea.addEventListener("scroll", scaleSize);

  requestAnimationFrame(render);

  function scaleSize(event) {}

  function toggleColorChanging() {
    console.log(`Click received.`);
    allowColorChanging
      ? (allowColorChanging = false)
      : (allowColorChanging = true);
    console.log(`\tallowColorChanging: ${allowColorChanging}`);

    changeColor();
  }

  function changeColor() {
    if (allowColorChanging) {
      // go up and down red, green, or blue
      console.log(
        `Intial RGB values: ${cubeColor[0]}, ${cubeColor[1]}, ${cubeColor[2]}`
      );

      cubeColor = genRandomHexColor();
      console.log(`\tThe new color: ${cubeColor}.`);

      // change color
      material.color.set(cubeColor);

      // EPILEPSY WARNING @ low delays
      setTimeout(() => {
        requestAnimationFrame(changeColor);
      }, "10");
    }
  }

  function render() {
    // convert 'time' to seconds
    timeStep += 0.001;
    // console.log(`timeStep: ${timeStep}`);

    cube.rotation.x = timeStep;
    // cube.rotation.y = time;
    cube.rotation.z = timeStep;

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

    return "#" + randomColorHex.join("");
  }

  function hexToRGB(hex) {
    let rgb = [];
    let r, g, b;

    if (hex.substring(1) == "#") {
      hex = hex.substring(1, hex.length);
    }

    // extact red
    r = hex.substring(2);
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
}
