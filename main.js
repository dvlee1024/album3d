import * as THREE from './libs/threejs/three.module.js'
import * as config from './config-dev.js'

const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

const IMAGE_AREA = window.innerWidth * window.innerHeight / 9

const albumObj = new THREE.Object3D()
let COUNT_IMAGE = 0
const ANGLE_OF_IMAGE = Math.PI * 2 / COUNT_IMAGE
const R = 1600

let picList = []

export function main() {
    initBmob()

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-7, 10, 15);
    scene.add(light);

    scene.add(albumObj)


    camera.position.set(0, 0, 2300);
    animate()

    initAlbum()
}

function initBmob() {
    Bmob.initialize(config.BMOB_SECRET_KEY, config.BMOB_API_CODE);
}

export function initAlbum() {
    const query = Bmob.Query("painting");
    query.find().then(data => {
        console.log(data)
        COUNT_IMAGE = 30
        for (let id in data) {
            if (id >= 30)
                return
            let pic = data[id]

            addPic(albumObj, id, pic.url)
        }
    });
}

function addPic(parent, id, url) {
    let angle = id / COUNT_IMAGE * Math.PI * 2
    let x = R * Math.sin(angle)
    let y = R * Math.cos(angle)


    const texture = new THREE.TextureLoader().load(config.SERVER + url, function (tex) {
        const imgScale = Math.sqrt(IMAGE_AREA / texture.image.naturalWidth / texture.image.naturalHeight)

        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({
            map: texture
        });
        const picMesh = new THREE.Mesh(geometry, material);
        picMesh.scale.set(texture.image.width * imgScale, texture.image.height * imgScale, texture.image.height * imgScale / 20)
        picMesh.position.set(x, (Math.random() - 0.5) * texture.image.height * imgScale * 1.5, y)
        parent.add(picMesh);
        picList.push(picMesh)
    });
}

function animate() {
    requestAnimationFrame(animate);
    albumObj.rotateY(0.002)
    renderer.render(scene, camera);

    for (let pic of picList) {
        let wPos = new THREE.Vector3();
        pic.getWorldPosition(wPos)
        pic.lookAt(wPos.add(new THREE.Vector3(0, 0, 1)))
    }
}