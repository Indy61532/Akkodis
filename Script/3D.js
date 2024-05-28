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

// Načtení GLTF modelu
const loader = new THREE.GLTFLoader();
let model;
loader.load('/Images/planet.gltf', function (gltf) {
    model = gltf.scene;
    console.log('Model loaded successfully:', model);
    scene.add(model);

    // Umístění modelu pro lepší viditelnost
    model.position.set(0, 0, 0);
    resizeModel(model); // Nastavení počáteční velikosti modelu

    // Umístění kamery
    camera.position.set(0, 1, 10);
    camera.lookAt(0, 0, 0); // Ujisti se, že kamera míří na model

    const animate = function () {
        requestAnimationFrame(animate);
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
