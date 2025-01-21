import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { DeviceOrientationControls } from 'three/addons/controls/DeviceOrientationControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

class App {
  constructor() {
    this.init();
    this.setupScene();
    this.setupLights();
    this.setupControls();
    this.addObjects();
    this.animate();
  }

  init() {
    this.container = document.getElementById('scene-container');
    this.scene = new THREE.Scene();
    
    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 1.6, 3);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);

    // XR support
    this.renderer.xr.enabled = true;
    document.body.appendChild(VRButton.createButton(this.renderer));

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  setupScene() {
    // Load HDR environment map
    new RGBELoader()
      .setPath('https://threejs.org/examples/textures/equirectangular/')
      .load('venice_sunset_1k.hdr', (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        this.scene.background = texture;
        this.scene.environment = texture;
        
        document.getElementById('loading').classList.add('hidden');
      });
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
  }

  setupControls() {
    if (window.DeviceOrientationEvent && /Mobi|Android/i.test(navigator.userAgent)) {
      this.controls = new DeviceOrientationControls(this.camera);
      // Request device orientation permissions on iOS
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        document.addEventListener('click', () => {
          DeviceOrientationEvent.requestPermission()
            .then(response => {
              if (response === 'granted') {
                this.controls.connect();
              }
            })
            .catch(console.error);
        }, { once: true });
      }
    } else {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
    }
  }

  addObjects() {
    // Add a reflective sphere
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      metalness: 1,
      roughness: 0.2,
      envMapIntensity: 1
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(-1, 1, 0);
    this.scene.add(sphere);

    // Add a torus knot
    const torusGeometry = new THREE.TorusKnotGeometry(0.4, 0.1, 100, 16);
    const torusMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      metalness: 0.5,
      roughness: 0.3
    });
    const torusKnot = new THREE.Mesh(torusGeometry, torusMaterial);
    torusKnot.position.set(1, 1, 0);
    this.scene.add(torusKnot);

    // Add a ground plane
    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    const planeMaterial = new THREE.MeshStandardMaterial({
      color: 0x808080,
      metalness: 0,
      roughness: 0.8
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    this.scene.add(plane);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    this.renderer.setAnimationLoop(() => {
      if (this.controls.update) this.controls.update();
      this.renderer.render(this.scene, this.camera);
    });
  }
}

// Start the application
new App();