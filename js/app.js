import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'
import texture from '../img/test.jpg'
import simVertex from './shaders/simVertex.glsl'
import simFragment from './shaders/simFragment.glsl'

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

        this.setupFBO()
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

    setupFBO() {

        this.size = 32
        this.geometry = new THREE.BufferGeometry()

        const data = new Float32Array(this.size * this.size * 4)
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const index = i * this.size + j
                data[index * 4 + 0] = Math.random() * 2 - 1
                data[index * 4 + 1] = Math.random() * 2 - 1
                data[index * 4 + 2] = 0
                data[index * 4 + 3] = 1
            }
        }
        
        this.positions = new THREE.DataTexture(data, this.size, this.size, THREE.RGBAFormat, THREE.FloatType)
        this.positions.needsUpdate = true

        this.sceneFBO = new THREE.Scene()
        this.cameraFBO = new THREE.OrthographicCamera(-1, 1, 1, -1, -2, 2)
        this.cameraFBO.position.z = 1
        this.cameraFBO.lookAt(new THREE.Vector3(0, 0, 0))
        let geo = new THREE.PlaneGeometry(2, 2, 2, 2)
        this.simMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            wireframe: true
        })
        this.simMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                uTexture: { value: this.positions }
            },
            vertexShader: simVertex,
            fragmentShader: simFragment,
        })
        this.simMesh = new THREE.Mesh(geo, this.simMaterial)
        this.sceneFBO.add(this.simMesh)

        this.renderTarget = new THREE.WebGLRenderTarget(this.size, this.size, {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType
        })

        this.renderTarget1 = new THREE.WebGLRenderTarget(this.size, this.size, {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType
        })
    }

    addObjects() {
        this.size = 32
        this.geometry = new THREE.BufferGeometry()
        const positions = new Float32Array(this.size * this.size * 3)
        const uvs = new Float32Array(this.size * this.size * 2)
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const index = i * this.size + j
                positions[index * 3 + 0] = (j / this.size) - 0.5
                positions[index * 3 + 1] = (i / this.size) - 0.5
                positions[index * 3 + 2] = 0
                uvs[index * 2 + 0] = j / (this.size - 1)
                uvs[index * 2 + 1] = i / (this.size - 1)
            }
        }
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        this.geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))

        const data = new Float32Array(this.size * this.size * 4)
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const index = i * this.size + j
                data[index * 4 + 0] = Math.random() * 2 - 1
                data[index * 4 + 1] = Math.random() * 2 - 1
                data[index * 4 + 2] = 0
                data[index * 4 + 3] = 1
            }
        }
        
        this.positions = new THREE.DataTexture(data, this.size, this.size, THREE.RGBAFormat, THREE.FloatType)
        this.positions.needsUpdate = true
    
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                // uTexture: { value: new THREE.TextureLoader().load(texture)}
                uTexture: { value: this.positions }
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

        this.renderer.setRenderTarget(this.renderTarget)
        this.renderer.render(this.sceneFBO, this.cameraFBO)

        this.renderer.setRenderTarget(null)
        this.renderer.render(this.scene, this.camera)

        const tmp = this.renderTarget
        this.renderTarget = this.renderTarget1
        this.renderTarget1 = tmp

        this.material.uniforms.uTexture.value = this.renderTarget.texture
        this.simMaterial.uniforms.uTexture.value = this.renderTarget1.texture

        window.requestAnimationFrame(this.render.bind(this))
    }
}

new Sketch({
    dom: document.getElementById('container')
})