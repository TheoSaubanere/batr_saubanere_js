let canvas;
let engine;
let scene;
let inputStates = {};

window.onload = startGame;

function startGame() {
    canvas = document.querySelector("#myCanvas");
    engine = new BABYLON.Engine(canvas, true);
    scene = createScene();

    scene.enablePhysics();
    
    modifySettings();

    let tank = scene.getMeshByName("myPandaTank");


    engine.runRenderLoop(() => {
        let deltaTime = engine.getDeltaTime();

        tank.move();
        
        scene.render();
    });
}

function createScene() {
    let scene = new BABYLON.Scene(engine);
    scene.enablePhysics();

    createGround(scene);
    createWalls(scene);
    createLights(scene);
    
    scene.spheres = [];
    for(let i = 0; i < 10; i++) {
        scene.spheres[i] = createSphere(scene, i);
    }
    scene.bamboo = [];
    for(let i = 0; i < 10; i++) {
        scene.bamboo[i] = createBamboo(scene, i);
    }

    let tank = createTank(scene);

    let followCamera = createFollowCamera(scene, tank);
    scene.activeCamera = followCamera;

    scene.registerBeforeRender(
        tank.crunchcrunch = () => {

            for(let i = 0; i < 10; i++) {
                if (scene.bamboo[i].intersectsMesh(tank, false)){
                    scene.bamboo[i].dispose();
                }
            }   
        }
    );
 
   return scene;
}

function createGround(scene) {
    var ground = BABYLON.Mesh.CreateGround("ground1", 1000, 1000, 2, scene);
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);

    const groundMat = new BABYLON.StandardMaterial("groundMat");
    groundMat.diffuseTexture = new BABYLON.Texture("images/ground.jpg");
    ground.material = groundMat;
    ground.checkCollisions = true;

    return ground;
}

function createWalls(scene){
    var wallNorth = BABYLON.MeshBuilder.CreateBox("wallNorth", {height:1000, depth:10, width:1000}, scene);
    wallNorth.position.z = 500;
    wallNorth.rotation.y = - Math.PI ;
    wallNorth.checkCollisions = true;
    wallNorth.physicsImpostor = new BABYLON.PhysicsImpostor(wallNorth, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);

    var wallSouth = BABYLON.MeshBuilder.CreateBox("wallSouth", {height:1000, depth:10, width:1000}, scene);
    wallSouth.position.z = -500;
    wallSouth.checkCollisions = true;
    wallSouth.physicsImpostor = new BABYLON.PhysicsImpostor(wallSouth, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);

    var wallWest = BABYLON.MeshBuilder.CreateBox("wallWest", {height:1000, depth:10, width:1000}, scene);
    wallWest.position.x = -500;
    wallWest.rotation.y = - Math.PI / 2;
    wallWest.checkCollisions = true;
    wallWest.physicsImpostor = new BABYLON.PhysicsImpostor(wallWest, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);

    var wallEast = BABYLON.MeshBuilder.CreateBox("wallEast", {height:1000, depth:10, width:1000}, scene);
    wallEast.position.x = 500;
    wallEast.rotation.y = Math.PI / 2;
    wallEast.checkCollisions = true;
    wallEast.physicsImpostor = new BABYLON.PhysicsImpostor(wallEast, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);

    const wallMat = new BABYLON.StandardMaterial("wallMat");
    wallMat.diffuseTexture = new BABYLON.Texture("images/bambooWall.jpg");
    wallNorth.material = wallMat;
    wallSouth.material = wallMat;
    wallEast.material = wallMat;
    wallWest.material = wallMat;
}

function createLights(scene) {
    let light = new BABYLON.HemisphericLight("dir0", new BABYLON.Vector3(0, 1, 0), scene);
    light.color = new BABYLON.Color3.Red;
}

function createFreeCamera(scene) {
    let camera = new BABYLON.FreeCamera("freeCamera", new BABYLON.Vector3(0, 50, 0), scene);
    camera.attachControl(canvas);
    camera.checkCollisions = true; 
    camera.applyGravity = true;

    camera.keysUp.push('z'.charCodeAt(0));
    camera.keysDown.push('s'.charCodeAt(0));
    camera.keysLeft.push('q'.charCodeAt(0));
    camera.keysRight.push('d'.charCodeAt(0));
    camera.keysUp.push('Z'.charCodeAt(0));
    camera.keysDown.push('S'.charCodeAt(0));
    camera.keysLeft.push('Q'.charCodeAt(0));
    camera.keysRight.push('D'.charCodeAt(0));

    return camera;
}

function createFollowCamera(scene, target) {
    let camera = new BABYLON.FollowCamera("tankFollowCamera", target.position, scene, target);

    camera.radius = 50; // how far from the object to follow
	camera.heightOffset = 14; // how high above the object to place the camera
	camera.rotationOffset = 180; // the viewing angle
	camera.cameraAcceleration = .1; // how fast to move
	camera.maxCameraSpeed = 5; // speed limit

    return camera;
}

let zMovement = 5;
function createTank(scene) {
    let tank = new BABYLON.MeshBuilder.CreateBox("myPandaTank", {height:6, depth:6, width:6}, scene);
    let tankMaterial = new BABYLON.StandardMaterial("tankMaterial", scene);
    tankMaterial.diffuseTexture = new BABYLON.Texture("images/panda.jpg", scene);
    tankMaterial.diffuseColor = new BABYLON.Color3.Red;
    tankMaterial.emissiveColor = new BABYLON.Color3.Green;
    tank.material = tankMaterial;
    tank.applyGravity = true;

    tank.position.y = 4;
    tank.speed = 2;
    tank.frontVector = new BABYLON.Vector3(1, 0, 1);

    tank.move = () => {
        let yMovement = 0;
       
        if (tank.position.y > 2) {
            zMovement = 0;
            yMovement = -2;
        } 

        if(inputStates.up) {
            tank.moveWithCollisions(tank.frontVector.multiplyByFloats(tank.speed, tank.speed, tank.speed));
        }    
        if(inputStates.down) {
            tank.moveWithCollisions(tank.frontVector.multiplyByFloats(-tank.speed, -tank.speed, -tank.speed));

        }  
        if(inputStates.left) {
            tank.rotation.y -= 0.015;
            tank.frontVector = new BABYLON.Vector3(Math.sin(tank.rotation.y), 0, Math.cos(tank.rotation.y));
        }    
        if(inputStates.right) {
            tank.rotation.y += 0.015;
            tank.frontVector = new BABYLON.Vector3(Math.sin(tank.rotation.y), 0, Math.cos(tank.rotation.y));
        }
    }

    return tank;
}

function createSphere(scene, id) {
    let sphere = BABYLON.MeshBuilder.CreateSphere("mySphere" + id, {diameter: 5, segments: 32}, scene);
    sphere.material = new BABYLON.StandardMaterial("sphereMaterial", scene);
    sphere.material.diffuseTexture = new BABYLON.Texture("images/cible.png", scene);
    sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.9 }, scene);

    let xrand = Math.floor(Math.random()*500 - 250);
    let zrand = Math.floor(Math.random()*500 - 250);
    
    sphere.position.x = xrand;
    sphere.position.y = 5;
    sphere.position.z = zrand;
    sphere.frontVector = new BABYLON.Vector3(xrand,zrand,1);

    sphere.checkCollisions = true;

    return sphere;
}

function createBamboo(scene, id) {
    let bamboo = BABYLON.MeshBuilder.CreateCylinder("myBamboo" + id, {height: 30, diameter: 2}, scene);
    bamboo.material = new BABYLON.StandardMaterial("bambooMaterial", scene);
    bamboo.material.diffuseTexture = new BABYLON.Texture("images/bamboo.jpg", scene);
    bamboo.physicsImpostor = new BABYLON.PhysicsImpostor(bamboo, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 2, restitution: 0.9 }, scene);

    let xrand = Math.floor(Math.random()*500 - 250);
    let zrand = Math.floor(Math.random()*500 - 250);
    
    bamboo.position.x = xrand;
    bamboo.position.y = 15;
    bamboo.position.z = zrand;
    bamboo.frontVector = new BABYLON.Vector3(xrand,zrand,1);

    bamboo.checkCollisions = true;

    return bamboo;
}

window.addEventListener("resize", () => {
    engine.resize()
});

function modifySettings() {
    scene.onPointerDown = () => {
        if(!scene.alreadyLocked) {
            console.log("requesting pointer lock");
            canvas.requestPointerLock();
        } else {
            console.log("Pointer already locked");
        }
    }

    document.addEventListener("pointerlockchange", () => {
        let element = document.pointerLockElement || null;
        if(element) {
            scene.alreadyLocked = true;
        } else {
            scene.alreadyLocked = false;
        }
    })

    inputStates.left = false;
    inputStates.right = false;
    inputStates.up = false;
    inputStates.down = false;
    inputStates.space = false;
    
    window.addEventListener('keydown', (event) => {
        if ((event.key === "ArrowLeft") || (event.key === "q")|| (event.key === "Q")) {
           inputStates.left = true;
        } else if ((event.key === "ArrowUp") || (event.key === "z")|| (event.key === "Z")){
           inputStates.up = true;
        } else if ((event.key === "ArrowRight") || (event.key === "d")|| (event.key === "D")){
           inputStates.right = true;
        } else if ((event.key === "ArrowDown")|| (event.key === "s")|| (event.key === "S")) {
           inputStates.down = true;
        }  else if (event.key === " ") {
           inputStates.space = true;
        }
    }, false);

    window.addEventListener('keyup', (event) => {
        if ((event.key === "ArrowLeft") || (event.key === "q")|| (event.key === "Q")) {
           inputStates.left = false;
        } else if ((event.key === "ArrowUp") || (event.key === "z")|| (event.key === "Z")){
           inputStates.up = false;
        } else if ((event.key === "ArrowRight") || (event.key === "d")|| (event.key === "D")){
           inputStates.right = false;
        } else if ((event.key === "ArrowDown")|| (event.key === "s")|| (event.key === "S")) {
           inputStates.down = false;
        }  else if (event.key === " ") {
           inputStates.space = false;
        }
    }, false);
}

