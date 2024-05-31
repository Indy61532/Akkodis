// /Script/3D.js

// Inicializace scény, kamery a rendereru
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

// Přidání světla
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5).normalize();
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040); // měkké světlo
scene.add(ambientLight);

// Debug krychle pro kontrolu, zda jsou světla a kamera správně nastaveny
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 0, 0);
scene.add(cube);

// Funkce pro změnu velikosti modelu podle velikosti kontejneru
function resizeModel(model) {
    const container = document.getElementById('container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const baseScaleFactor = isMobileDevice() ? 0.35 : 0.3; // Základní škálovací faktor pro zvětšení modelu na mobilních zařízeních
    const scaleFactor = baseScaleFactor * Math.min(containerWidth, containerHeight) / 500; // Normalizovaný měřítkový faktor

    model.scale.set(scaleFactor, scaleFactor, scaleFactor);
}

// Funkce pro detekci mobilních zařízení
function isMobileDevice() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

// Funkce pro detekci modifikátorů
function detectModifiers(model) {
    let hasSkeleton = false;
    let hasMorphTargets = false;

    model.traverse((node) => {
        if (node.isSkinnedMesh) {
            hasSkeleton = true;
        }
        if (node.morphTargetInfluences && node.morphTargetInfluences.length > 0) {
            hasMorphTargets = true;
        }
    });

    if (hasSkeleton) {
        console.log('Model contains a skeleton for skeletal animation.');
    } else {
        console.log('Model does not contain a skeleton.');
    }

    if (hasMorphTargets) {
        console.log('Model contains morph targets.');
    } else {
        console.log('Model does not contain morph targets.');
    }
}

// Načtení GLTF modelu
const loader = new THREE.GLTFLoader();
let model;
let mixer; // Přidáme proměnnou pro animační mixer
const clock = new THREE.Clock(); // Přidáme hodiny pro animační mixer

loader.load('Images/planet2.gltf', function (gltf) {
    model = gltf.scene;
    console.log('Model loaded successfully:', model);
    scene.add(model);

    // Umístění modelu pro lepší viditelnost
    model.position.set(0, 0, 0);
    resizeModel(model); // Nastavení počáteční velikosti modelu

    // Detekce modifikátorů
    detectModifiers(model);

    // Získání animačního mixéru
    mixer = new THREE.AnimationMixer(model);

    // Pokud jsou k dispozici animace, přidejte je k mixéru
    if (gltf.animations.length > 0) {
        console.log('Model contains animations:', gltf.animations.length);
        gltf.animations.forEach((clip, index) => {
            const action = mixer.clipAction(clip);
            action.play();
            console.log(`Playing animation clip ${index}:`, clip);

            // Převod daného čísla na procento
            const number = g;
            const totalFrames = 62627;
            const percentage = number / totalFrames;
            const duration = clip.duration;
            const targetTime = percentage * duration;

            // Nastavení času animace
            action.time = targetTime;
            mixer.update(0); // Aktualizace mixéru pro přehrání animace na cílový čas
        });
    } else {
        console.log('Model does not contain animations.');
    }

    // Umístění kamery
    camera.position.set(0, 1, 10);
    camera.lookAt(0, 0, 0); // Ujisti se, že kamera míří na model

    const animate = function () {
        requestAnimationFrame(animate);

        // Aktualizace animačního mixéru
        if (mixer) {
            mixer.update(clock.getDelta()); // Aktualizace mixéru s každým snímkem
        }

        // Debugging: Výpis pozice modelu
        if (model) {
            console.log('Model position:', model.position);
            console.log('Model rotation:', model.rotation);
        }

        renderer.render(scene, camera);
    };
    animate();
}, undefined, function (error) {
    console.error('An error happened while loading the model:', error);
});

// Proměnné pro manipulaci s myší a dotykem
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotation = { x: 0, y: 0 };

// Funkce pro manipulaci s myší
function onMouseDown(event) {
    event.preventDefault();
    isDragging = true;
    previousMousePosition = { x: event.clientX, y: event.clientY };
}

function onMouseMove(event) {
    event.preventDefault();
    if (isDragging && model) {
        const deltaMove = { x: event.clientX - previousMousePosition.x, y: event.clientY - previousMousePosition.y };

        rotation.x += deltaMove.y * 0.005;
        rotation.y += deltaMove.x * 0.005;

        rotation.x = THREE.MathUtils.clamp(rotation.x, -Math.PI / 7.5, Math.PI / 6);

        model.rotation.x = rotation.x;
        model.rotation.y = rotation.y;

        previousMousePosition = { x: event.clientX, y: event.clientY };
    }
}

function onMouseUp(event) {
    event.preventDefault();
    isDragging = false;
}

// Funkce pro manipulaci s dotykem
function onTouchStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    previousMousePosition = { x: touch.clientX, y: touch.clientY };
    isDragging = true;
}

function onTouchMove(event) {
    event.preventDefault();
    if (isDragging && model) {
        const touch = event.touches[0];
        const deltaMove = { x: touch.clientX - previousMousePosition.x, y: touch.clientY - previousMousePosition.y };

        rotation.x += deltaMove.y * 0.005;
        rotation.y += deltaMove.x * 0.005;

        rotation.x = THREE.MathUtils.clamp(rotation.x, -Math.PI / 7.5, Math.PI / 6);

        model.rotation.x = rotation.x;
        model.rotation.y = rotation.y;

        previousMousePosition = { x: touch.clientX, y: touch.clientY };
    }
}

function onTouchEnd(event) {
    event.preventDefault();
    isDragging = false;
}

// Event listenery pro manipulaci s myší a dotykem
if (isMobileDevice()) {
    document.addEventListener('touchstart', onTouchStart, { passive: false });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd, { passive: false });
} else {
    document.addEventListener('mousedown', onMouseDown, { passive: false });
    document.addEventListener('mousemove', onMouseMove, { passive: false });
    document.addEventListener('mouseup', onMouseUp, { passive: false });
}

// Přizpůsobení velikosti okna a kontejneru
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    if (model) {
        resizeModel(model); // Aktualizace velikosti modelu při změně velikosti okna
    }
});

// Debugging renderer background color
renderer.setClearColor(0x000000, 1); // Nastavte na jinou barvu, například bílou: 0xffffff
