import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
// import * as THREE from 'three';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { gsap } from "gsap"
const canvas = document.getElementById("experience-canvas");
const renderer = new THREE.WebGLRenderer({canvas: canvas,alpha:false, antialias: true});
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let lighton = true;
const exposureHigh = -3;
const exposureLow = -5;
let camera,scene,controls, intersects, intersect;
let openedModal = null;
let clickedObject = null, mute = false;
const raycastObjects = [];
const pink = 0xFF5BCF;
let last_intersect = null;
let modals; 
modals ={
    about:  document.querySelector(".modal.about"),
    games:  document.querySelector(".modal.games"),
    nlp:    document.querySelector(".modal.nlp"),
    contact: document.querySelector(".modal.contact"),
    help: document.querySelector(".modal.help"),
    portfolio: document.querySelector(".modal.portfolio"),
};
console.log(modals)
let duration,durationPos,durationRot,durationSca,rotateX,rotateY,rotateZ,scaleX,scaleY,scaleZ,positionX,positionY,positionZ,ease;
let open = null

let objects ; 

const sounds = {
    night: new Audio ( "./sounds/chinese_drums.mp3" ),
    // day: new Audio ( "./sounds/classical_chinese_music.mp3" ),
    // day: new Audio ( "chinese-ancient-style-dizi-melody-etlx-solo-247346.mp3" ),
    day: new Audio ( "peace-of-mind-254203.mp3" ),
    // day: new Audio ("hoi-an-ancient-charm-147064.mp3"),

    hover: new Audio ( "./sounds/pop_clean.mp3" ) 
}

const background_colors = {
    day : new THREE.Color ( 0x220000 ),
    night : new THREE.Color ( 0x0 )
}

let backgroundMusic = sounds.day;

function setupScene() {
    
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.shadowMap.enabled = true;
    renderer.toneMappingExposure = Math.pow(2, -3);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);
    
    camera = new THREE.PerspectiveCamera(10,window.innerWidth / window.innerHeight,0.1,1000);
    camera.position.set(-12  , 12, 12);
    
    scene = new THREE.Scene();
    scene.castShadow = true;
    scene.background = background_colors.day;
    
    
}

function setupControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.update();  
}

function setupLight() {
    
    const redlight = new THREE.PointLight( 0xff0000,2, 5, );
    redlight.position.set( 3, 3, 1 );
    scene.add( redlight );
    const greenlight = new THREE.PointLight( 0xffff,2, 5, 1);
    greenlight.position.set(-1, 2,-3.5);
    scene.add( greenlight );
    const lampLight = new THREE.PointLight( 0xffffff,10, 2, 2);
    lampLight.position.set(-1.601, 0.789, -1.741 );
    scene.add( lampLight );
    
    const topLight = new THREE.DirectionalLight(0xffffff, 10);
    topLight.position.set(0,5,0);
    scene.add(topLight);    
    
    const hemisphereLight = new THREE.HemisphereLight(0x404040,0x400000,2);
    hemisphereLight.position.set(3,0,3);
    scene.add(hemisphereLight);
    
    const ambientLight = new THREE.AmbientLight(0xffffff,2);
    scene.add(ambientLight);
}

async function load3DModel() {
    
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync( './room_blossom.glb' );
    
    const model = gltf.scene;

    const skybox = await loader.loadAsync( 'sakura_forest.glb' );
    
    const skybox_model = skybox.scene;
    scene.add( model ); 
    scene.add( skybox_model );


    let children  = scene.children[6].children;
     children.forEach((element) => {
         if ( element.name.includes("Raycast") ) {
            if (element.children.length) {
                element.children[0].userData.newScale = new THREE.Vector3(1,1,1);
                element.children[0].userData.initialScale = new THREE.Vector3().copy(element.children[0].scale);
                element.children[0].userData.newColor =  new THREE.Color().copy(element.children[0].material.color);
                element.children[0].userData.initialColor = new THREE.Color().copy(element.children[0].material.color);
                element.children[0].userData.newRotation = new THREE.Vector3(0,0,0)
                element.children[0].userData.initialRotation = new THREE.Vector3().copy(element.children[0].rotation)
                element.children[0].userData.duration = 2;
            }
            if (element.name.includes("NLP")) {
                element.children[0].userData.newScale = new THREE.Vector3(1.5,1,1);
                element.children[0].userData.newRotation = new THREE.Vector3(0,-Math.PI * 1.3,0);
                element.userData.newRotation = new THREE.Vector3(0,0,0);
                element.userData.newScale = new THREE.Vector3(1.5,1.5,1.5);
                element.userData.newPosition = new THREE.Vector3(0,0,0);
                element.userData.modal = modals.nlp;
            } else if (element.name.includes("switch")) {
                element.children[0].rotateX(-Math.PI / 16)
                element.children[0].userData.newRotation = new THREE.Vector3( (     Math.PI / 8),0,0);
                element.children[0].userData.initialRotation = new THREE.Vector3( -( Math.PI / 16),0,0);
                element.userData.newRotation = new THREE.Vector3(0,0,0);
                element.userData.newScale = new THREE.Vector3(1.5,1.5,1.5);
                element.userData.newPosition = new THREE.Vector3(0,0,0);
            }  else if (element.name.includes("monitor")) {
                element.userData.newRotation = new THREE.Vector3(0,0,0);
                element.userData.newScale = new THREE.Vector3(1.5,1.5,1.5);
                element.userData.newPosition = new THREE.Vector3(0,0,0);
                element.userData.modal = modals.help;
                element.children[0].userData.newColor = new THREE.Color(pink)
            }  else if (element.name.includes("Controller")) {
                element.userData.newRotation = new THREE.Vector3(Math.PI/4,0,0);
                element.userData.newScale = new THREE.Vector3(1.5,1.5,1.5);
                element.userData.newPosition = new THREE.Vector3(0,.15,0);
                element.userData.modal = modals.games;    
            }  else if (element.name.includes("phone")) {
                element.children[0].userData.newColor = new THREE.Color(pink)
                element.userData.newRotation = new THREE.Vector3(0,0,Math.PI / 4);
                element.userData.newScale = new THREE.Vector3(1.5,1.5,1.5);
                element.userData.newPosition = new THREE.Vector3(0,0,0);
                element.userData.modal = modals.contact;  
            } else if (element.name.includes("Keyboard")) {
                element.userData.newRotation = new THREE.Vector3(0,0,Math.PI / 8);
                element.userData.newScale = new THREE.Vector3(1.5,1.5,1.5);
                element.userData.newPosition = new THREE.Vector3(0,0,0);
                element.userData.modal = modals.portfolio;
            } else if (element.name.includes("Bayern")) {
                element.userData.newRotation = new THREE.Vector3(0,0,0);
                element.userData.newScale = new THREE.Vector3(1,1,1);
                element.userData.newPosition = new THREE.Vector3(0,0,.15);
                element.userData.modal = modals.about;
            } 
            element.userData.small = true;
            element.userData.big = false;
            element.userData.hover = false;
            element.userData.clicked = false;
            element.userData.open = false;
            element.userData.closed = true;
            element.userData.duration = 1;
            element.userData.ease = "back.out(1.8)"
            element.userData.initialRotation = new THREE.Vector3().copy(element.rotation);
            element.userData.initialPosition= new THREE.Vector3().copy(element.position);
            element.userData.initialScale = new THREE.Vector3().copy(element.scale);
            raycastObjects.push(element)
        }
    }
)
    objects = {
        help: raycastObjects.find(object=> object.name.includes("monitor")),
        games: raycastObjects.find(object=> object.name.includes("Controller")),
        nlp: raycastObjects.find(object=> object.name.includes("NLP")),
        contact: raycastObjects.find(object=> object.name.includes("phone")),
        portfolio: raycastObjects.find(object=> object.name.includes("Keyboard")),
        switchButton: raycastObjects.find(object=> object.name.includes("switch")),
        about: raycastObjects.find(object=> object.name.includes("Bayern")),
    }
    console.log(objects)
    setupButtons();
    intro_button.textContent = "Enter Room";
    console.log(raycastObjects)
}



function animate (){
    renderer.render ( scene, camera );
    controls.update();
}




let intro_button;



function setupButtons () {
    
    document.querySelectorAll( ".exit" )
    .forEach( (button) =>
        button.addEventListener ( "click" , (e) => {
            const modal = e.target.closest ( ".modal" );
            handleClick(objectOfModal(modal))
        })
    )

    intro_button = document.querySelector( ".exit.intro" );
    intro_button.addEventListener ( "click" , (e) => {
        const modal = e.target.closest ( ".modal" );
        modal.style.display = "none";
        backgroundMusic.play()});

    document.querySelector (".mute").addEventListener ("click", () => {
        if (mute) {
            backgroundMusic.play();
        } else {
            backgroundMusic.pause();
        }
        mute = ! mute;
    });
    document.querySelector ("button.help").addEventListener ("click", () => {
        console.log(objects.help)
        handleClick(objects.help)
    });
    document.querySelector ("button.theme").addEventListener ("click", () => {
        handleClick(objects.switchButton)
    });


}

function setupTouch () {
    
    window.addEventListener( "pointermove", onHover );
    window.addEventListener ( "pointerdown", onHover);
    window.addEventListener( "pointerup", onClick );
    
}

function setupAudio () {
    sounds.day.loop = true;
    sounds.night.loop = true;
}

function onWindowResize () {
    if (openedModal) {
        canvas.style.width = "50%";
        canvas.style.overflow ="hidden";
        camera.aspect = canvas.clientWidth / window.innerHeight ;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth /2 ,window.innerHeight );
        
    } else {
        
        canvas.style.width = "100%";
        camera.aspect = window.innerWidth/ window.innerHeight ;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth  ,window.innerHeight );
        
    }
}

function hoverAnimation(object) {
    object.userData.big = false;
    object.userData.small = false;
    const shrink = !(object.userData.hover || object.userData.clicked);
    // shrink object to initial state
    if (shrink) {
        duration = 1;
        durationPos = 1;
        durationRot = 1;
        durationSca = 1;
        scaleX = 1;
        scaleY = 1;
        scaleZ = 1;
        rotateX = 0;
        rotateY = 0;
        rotateZ = 0;
        positionX = 0;
        positionY = 0;
        positionZ = 0;
    } 
    // expand object to 
    else {
        sounds.hover.cloneNode().play();
        scaleX = object.userData.newScale.x;
        scaleY = object.userData.newScale.y;
        scaleZ = object.userData.newScale.z;
        rotateX = object.userData.newRotation.x;
        rotateY = object.userData.newRotation.y;
        rotateZ = object.userData.newRotation.z;
        positionX = object.userData.newPosition.x;
        positionY = object.userData.newPosition.y;
        positionZ = object.userData.newPosition.z;
    } 
    gsap.to(object.scale, {
        duration: object.userData.duration,
        x: object.userData.initialScale.x * scaleX,
        y: object.userData.initialScale.y * scaleY,
        z: object.userData.initialScale.z * scaleZ,
        ease: object.userData.ease,
    });
    gsap.to(object.rotation, {
        duration: object.userData.duration,
        x: object.userData.initialRotation.x + rotateX,
        y: object.userData.initialRotation.y + rotateY,
        z: object.userData.initialRotation.z + rotateZ,
        ease: object.userData.ease,

    });
    gsap.to(object.position, {
        duration: object.userData.duration,
        x: object.userData.initialPosition.x + positionX,
        y: object.userData.initialPosition.y + positionY,
        z: object.userData.initialPosition.z + positionZ,
        ease: object.userData.ease,
        onComplete: () => {

            //hover animation
            if (shrink) {
                // expand again
                if (object.userData.clicked || object.userData.hover) {
                    hoverAnimation(object);
                } else {
                    object.userData.small = true;
                }
            } else {
                // shrink again
                if (!object.userData.clicked && !object.userData.hover) {
                    hoverAnimation(object);
                } else {
                    object.userData.big = true;
                }
            }

            // click animation
           
        }
    });
}

function onHover( event ) {
    
    pointer.x = ( event.clientX / canvas.clientWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera( pointer, camera );
    
    if ( scene.children.length < 7  ) {
        return;
    }
    intersects = raycaster.intersectObjects( raycastObjects );
    intersect = intersects.length ? intersects[0].object : null;
    
    if (last_intersect != intersect) {

        // shrink last intersect
        if (last_intersect) {
            if (!last_intersect.userData.clicked) {
                last_intersect.userData.hover = false;
                if (last_intersect.userData.big) {
                    hoverAnimation(last_intersect);
                } 
            }
        }

        //expand new intersect
        if (intersect) {
            document.body.style.cursor = "pointer";
            intersect.userData.hover = true;
            if (intersect.userData.small) {
                hoverAnimation(intersect);
            } 
        } else {
            document.body.style.cursor = "default";
        }
        
        last_intersect = intersect
    }
}

function handleModalOf (object) {
    let modal;
    if (object) {

        if (object == objects.help) {
            modal = modals.help
        }
        else if (object == objects.about) {
            modal = modals.about;
        }
        else if (object == objects.contact) {
            modal = modals.contact;
        }
        else if (object == objects.games) {
            modal = modals.games;
        }
        else if (object == objects.nlp) {
            modal = modals.nlp;
        }
        else if (object == objects.portfolio) {
            modal = modals.portfolio;
        }
        console.log(modal)
        
        if (object.userData.clicked) {
            openedModal = true;
            modal.style.display = "flex";
        } else {
            openedModal = false;
            modal.style.display = "none";
        }
        onWindowResize();  
    }
}

function onClick () {
    if (intersect ) {
        handleClick(intersect);
    }
}

// modals ={
//     about:  document.querySelector(".modal.about"),
//     games:  document.querySelector(".modal.games"),
//     nlp:    document.querySelector(".modal.nlp"),
//     contact: document.querySelector(".modal.contact"),
//     help: document.querySelector(".modal.help"),
//     portfolio: document.querySelector(".modal.portfolio"),
// };
function objectOfModal (modal) {
    if (modal == modals.about) {
        return objects.about;
    } 
    else if (modal == modals.games) {
        return objects.games;
    } 
    if (modal == modals.nlp) {
        return objects.nlp;
    } 
    if (modal == modals.contact) {
        return objects.contact;
    } 
    if (modal == modals.portfolio) {
        return objects.portfolio;
    } 
    if (modal == modals.help) {
        return objects.help;
    } 
}
function clickAnimation (object) {
    object.userData.closed = false;
    object.userData.opened = false;
    if (object.name.includes("switch")) {
        changeTheme(object)
    } 
    if (object.userData.clicked) {
        if (object.children.length){
            gsap.to (object.children[0].material.color, {
                duration: object.children[0].userData.duration,
                r: object.children[0].userData.newColor.r,
                g: object.children[0].userData.newColor.g,
                b: object.children[0].userData.newColor.b,
                ease: ease,
            });
            gsap.to (object.children[0].scale, {
                duration: object.children[0].userData.duration,
                x: object.children[0].userData.initialScale.x * object.children[0].userData.newScale.x,
                y: object.children[0].userData.initialScale.y * object.children[0].userData.newScale.y,
                z: object.children[0].userData.initialScale.z * object.children[0].userData.newScale.z,
                ease: ease,
            });
            gsap.to (object.children[0].rotation, {
                duration: object.children[0].userData.duration,
                x: object.children[0].userData.initialRotation.x + object.children[0].userData.newRotation.x ,
                y: object.children[0].userData.initialRotation.y + object.children[0].userData.newRotation.y ,
                z: object.children[0].userData.initialRotation.z + object.children[0].userData.newRotation.z ,
                ease: ease,
                onComplete: () => {
                    if (!object.userData.clicked) {
                        clickAnimation (object)
                    }
                    else {
                        object.userData.opened = true;
                         if (object.name.includes("switch")) {
                            changeTheme(object)
                        }
                    }
                }
            })
        }
    } 
    else {
         if (object.children.length){
            gsap.to (object.children[0].material.color, {
                r: object.children[0].userData.initialColor.r,
                g: object.children[0].userData.initialColor.g,
                b: object.children[0].userData.initialColor.b,
            });
            gsap.to (object.children[0].scale, {
                duration: object.children[0].userData.duration,
                x: object.children[0].userData.initialScale.x,
                y: object.children[0].userData.initialScale.y,
                z: object.children[0].userData.initialScale.z,
                ease: ease,
            });
            gsap.to (object.children[0].rotation, {
                 duration: durationRot,
                x: object.children[0].userData.initialRotation.x,
                y: object.children[0].userData.initialRotation.y,
                z: object.children[0].userData.initialRotation.z,
                ease: ease,
                onComplete: () => {
                    if (object.userData.clicked) {
                        clickAnimation (object)
                    }
                    else {
                        object.userData.closed = true;
                        if (object.name.includes("switch")) {
                            changeTheme(object)
                        }
                    }
                }
            })
        }
    }
}

function handleClick(newClick) {
    console.log(newClick)
    if (newClick.name.includes("switch")) {
        if (newClick.userData.clicked) {
            newClick.userData.clicked = false;
            newClick.userData.hover = false;
            if (newClick.userData.big) {
                hoverAnimation (newClick);
            }
            if (newClick.userData.opened) {
                clickAnimation (newClick)
            }
        } else {
            newClick.userData.clicked = true;
            newClick.userData.hover = true;
            if (newClick.userData.small) {
                hoverAnimation (newClick);
            }
            if (newClick.userData.closed) {
                clickAnimation (newClick)
            }
        }
    } 
    else {

        // new object clicked
        if (open != newClick) {
            if ( open ) {
                open.userData.clicked = false;
                open.userData.hover = false;
                handleModalOf(open);
                if (open.userData.big) {
                    hoverAnimation (open);
                }
                if (open.userData.opened) {
                    clickAnimation (open)
                }
                open = null;
            }
            if (newClick)  {
                newClick.userData.clicked = true;
                newClick.userData.hover = true;
                handleModalOf(newClick);
                if (newClick.userData.small) {
                    hoverAnimation (newClick);
                }
                if (newClick.userData.closed) {
                    clickAnimation (newClick)
                }
                open = newClick;
            } 
        } 
        // close this click object
        else {
            if (newClick) {
                newClick.userData.clicked = false;
                newClick.userData.hover = false;
                handleModalOf(newClick);
                if (newClick.userData.big) {
                    hoverAnimation (newClick);
                }
                if (newClick.userData.opened) {
                    clickAnimation (newClick)
                }
                open = null;
            }
        }
    }
}

function changeTheme(object) {
    console.log(object)
    if (object.userData.clicked) {        
        renderer.toneMappingExposure = Math.pow(2, exposureLow);
        scene.background = background_colors.night; 
        handleMusic ();
    } else {
        renderer.toneMappingExposure = Math.pow(2,exposureHigh);
        scene.background = background_colors.day;
        handleMusic();
    }
}

function handleMusic () {
    backgroundMusic.pause();
    backgroundMusic = objects.switchButton.userData.clicked ? sounds.night : sounds.day;
    if (!mute) backgroundMusic.play();
}
    


 function main () {
    setupAudio ();
    setupScene();
    load3DModel();
    setupLight();
    setupControls();
    setupTouch ();
    controls.listenToKeyEvents (renderer.domElement);
    
    window.addEventListener( 'resize', onWindowResize );
    gsap;
}

main();