import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'

export default class Sketch {
    constructor(options) {
        this.time = 0
        this.container = options.dom
        this.scene = new THREE.Scene()

        this.camera = new THREE.PerspectiveCamera(70, this.width / this.height, 0.01, 10)
        this.camera.position.z = 1

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        })

        this.controls = new OrbitControls(this.camera, this.renderer.domElement)

        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.container.appendChild(this.renderer.domElement)

        this.resize()
        this.setupResize()
        this.addObjects()
        this.render()
    }

    resize() { 
        this.width = this.container.offsetWidth
        this.height = this.container.offsetHeight
        this.renderer.setSize(this.width, this.height)
        this.camera.aspect = this.width / this.height
        this.camera.updateProjectionMatrix()
    }

    setupResize() {
        window.addEventListener('resize', this.resize.bind(this))
    }

    addObjects() {
        this.geometry = new THREE.PlaneGeometry(1, 1, 10, 10)
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            wireframe: true
        })

        this.mesh = new THREE.Points(this.geometry, this.material)
        this.scene.add(this.mesh)
    }

    render() {
        this.time += 0.5

        this.material.uniforms.time.value = this.time

        this.mesh.rotation.x = this.time / 2000
        this.mesh.rotation.y = this.time / 1000

        this.renderer.render(this.scene, this.camera)
        window.requestAnimationFrame(this.render.bind(this))
    }
}

new Sketch({
    dom: document.getElementById('container')
})