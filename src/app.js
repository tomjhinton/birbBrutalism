import './style.scss'
import * as THREE from 'three'
import gsap from 'gsap'


import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'


import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'


import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const canvas = document.querySelector('canvas.webgl')
const gtlfLoader = new GLTFLoader()


const scene = new THREE.Scene()
 // scene.background = new THREE.Color( 0xffffff )








const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () =>{



  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2 ))


})


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0,0,.5)
scene.add(camera)

const controls = new OrbitControls(camera, canvas)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
})
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
//renderer.setClearColor( 0x000000, 1)
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()


const light = new THREE.PointLight( 0xff0000, 1, 100 );
light.position.set( 50, 50, 50 );
scene.add( light );

let sceneGroup, windomM, building, glass

let texArr = ['concrete.png', 'concrete2.png', 'concrete3.png']
let materialArr = []

let num = 5


let coverArr = []
let create = function(){
for(let i= num; i< num+10; i++){
gtlfLoader.load(
  'block.glb',
  (gltf) => {
    gltf.scene.scale.set(Math.random() * (num /3),.5,Math.random() * (num /3))
    sceneGroup = gltf.scene
    sceneGroup.needsUpdate = true
    sceneGroup.position.y += i * .5 - 2.5
    sceneGroup.position.z -= Math.random()
    sceneGroup.position.x -= Math.random()


    sceneGroup.rotation.z -= Math.random()

    sceneGroup.rotation.y -= Math.random()
    scene.add(sceneGroup)
    console.log(sceneGroup)


    windomM = gltf.scene.children.find((child) => {
      return child.name === 'window'
    })

    building = gltf.scene.children.find((child) => {
      return child.name === 'building'
    })






    building.material = new THREE.MeshMatcapMaterial({  side: THREE.DoubleSide})
    const matcapTexture = new THREE.TextureLoader().load(texArr[Math.floor(Math.random() * texArr.length)])
  building.material.matcap = matcapTexture

  const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
    depthWrite: true,
    clipShadows: true,
    wireframe: false,
    side: THREE.DoubleSide,
    uniforms: {

      uTime: {
        value: 0
      },

      uResolution: { type: 'v2', value: new THREE.Vector2() },
      uValueA: {
        value: Math.random()
      },
      uValueB: {
        value: Math.random()
      },
      uValueC: {
        value: Math.random()
      }

    }
  })
  windomM.material = shaderMaterial

  materialArr.push(shaderMaterial)

  }
)
}
num+=2
}

create()
let titular = document.getElementById('titular')

titular.addEventListener('click', function (e) {
  create()
});

const geometry = new THREE.PlaneGeometry( 100, 100 );
const material = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide} );
const plane = new THREE.Mesh( geometry, material );
plane.rotation.x = - Math.PI / 2;
plane.position.y -= .51
scene.add( plane );

controls.maxPolarAngle = Math.PI / 2 - 0.1
controls.enableZoom = false;
const clock = new THREE.Clock()

const tick = () =>{

  const elapsedTime = clock.getElapsedTime()


  // Update controls
  controls.update()

  camera.position.y+= Math.sin(elapsedTime) * .02
    camera.position.x+= Math.cos(elapsedTime) * .02

    scene.rotation.x +=.001
      scene.rotation.y +=.0001


if(materialArr.length){
  if(materialArr[0].uniforms.uResolution.value.x === 0 && materialArr[0].uniforms.uResolution.value.y === 0 ){
    materialArr[0].uniforms.uResolution.value.x = renderer.domElement.width
    materialArr[0].uniforms.uResolution.value.y = renderer.domElement.height
  }

  materialArr.map(x=> {
    x.uniforms.uTime.value = elapsedTime
  })
}
  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
