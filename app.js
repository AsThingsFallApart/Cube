import * as THREE from "three";

main();

function main() {
  let cubeColor = "#ED36E9";
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

  addEventListener("resize", (event) => {
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
  let material = new THREE.MeshPhongMaterial({ color: cubeColor });

  let cube = new THREE.Mesh(geometry, material);

  scene.add(cube);

  renderer.render(scene, camera);

  requestAnimationFrame(render);

  let color = 0xffffff;
  let intensity = 1;
  let light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);

  let interactableArea = document.getElementsByClassName("interactableArea")[0];

  interactableArea.addEventListener("click", changeColor);

  function changeColor(event) {
    // generate a random color
    cubeColor =
      "#" + (0x1000000 + Math.random() * 0xffffff).toString(16).substring(1, 7);
    console.log(`Click received.`);
    console.log(`\tThe new color: ${cubeColor}.`);

    // change color
    material.color.set(cubeColor);

    // EPILEPSY WARNING
    // requestAnimationFrame(changeColor);
  }

  function render(time) {
    // convert 'time' to seconds
    time *= 0.0005;

    cube.rotation.x = time;
    cube.rotation.y = time;

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }
}
