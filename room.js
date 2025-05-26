import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';

const canvas = document.getElementById("experience-canvas");
const renderer = new THREE.WebGLRenderer({canvas: canvas,alpha:false, antialias: true});
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let lighton = true;
const exposureHigh = -3;
const exposureLow = -5;
let camera,scene,controls, intersects, intersectRayObject, hoveredObject;
let openedModal = null;
let clickedObject = null, mute = false;
const raycastObjects = [];

const modals = {
    about:  document.querySelector(".modal.about"),
    games:  document.querySelector(".modal.games"),
    nlp:    document.querySelector(".modal.nlp")
};

const sounds = {
    night: new Audio ( "./sounds/chinese_drums.mp3" ),
    // day: new Audio ( "./sounds/classical_chinese_music.mp3" ),
    // day: new Audio ( "chinese-ancient-style-dizi-melody-etlx-solo-247346.mp3" ),
    day: new Audio ( "peace-of-mind-254203.mp3" ),
    // day: new Audio ("hoi-an-ancient-charm-147064.mp3"),

    hover: new Audio ( "./sounds/pop.mp3" ) 
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
    
    const hemisphereLight = new THREE.HemisphereLight(0x004040,0x400000,2);
    hemisphereLight.position.set(3,0,3);
    scene.add(hemisphereLight);
    
    const ambientLight = new THREE.AmbientLight(0x808070,2);
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
    console.log(children)
    children.forEach((element) => {
        if ( element.name.includes("Raycaster") ) {
           
            if (element.name.includes("NLP")) {
                element.children[0].userData.initialPosition = new THREE.Vector3().copy(element.position);
            } if (element.name.includes("switch")) {
                element.children[0].rotateX ( -Math.PI / 16);
            }
            element.userData.initialRotation = new THREE.Vector3().copy(element.rotation);
            element.userData.initialPosition= new THREE.Vector3().copy(element.position);
            element.userData.initialScale = new THREE.Vector3().copy(element.scale);
            console.log(element);
            raycastObjects.push(element)
            }
        }
    )
    console.log("raycastObjects",raycastObjects)
}



function animate (){
    renderer.render ( scene, camera );
    controls.update();
};

const duration = 1;
function startHoverAnimation(object) {

    if ( ! object ) return;
    sounds.hover.cloneNode().play();
    if ( object.name.includes ( "Controller" ) ) {

        gsap.to(object.scale, {
            duration: duration,
            x:object.userData.initialScale.x * 1.8,y:object.userData.initialScale.y * 1.8,z:object.userData.initialScale.z * 1.8,
            ease: "back.out(1.8)"
        });
        gsap.to(object.position, {
            duration: duration * 2,
            y: object.userData.initialPosition.y + .15,
            ease: "back.out(1.8)"
        });   
        gsap.to(object.rotation, {
            duration: duration * 2,
            x: object.userData.initialRotation.x + Math.PI / 4,
            ease: "back.out(1.8)"
        });
    } else if ( object.name.includes ( "switch" ) ) {
        if ( !lighton) { return; }
        gsap.to(object.scale, {
            duration: duration,
            x:object.userData.initialScale.x * 1.8,y:object.userData.initialScale.y * 1.8,z:object.userData.initialScale.z * 1.8,
            ease: "back.out(1.8)"
        });
    } else if ( object.name.includes ( "Bayern" )) {
        gsap.to(object.position, {
            duration: duration * 2,
            z: object.userData.initialPosition.z + .15,
            ease: "back.out(1.8)"
        }); 
    } else if ( object.name.includes ( "NLP" ) ) {
        gsap.to(object.scale, {
            duration: duration,
            x:object.userData.initialScale.x * 1.8,y:object.userData.initialScale.y * 1.8,z:object.userData.initialScale.z * 1.8,
            ease: "back.out(1.8)"
        });
        gsap.to(object.children[0].rotation, {
            duration: duration * 3,
            y: object.userData.initialRotation.y - Math.PI * 8 / 6,
            ease: "bounce.out"
        });
    
     } else if (object.name.includes ( "phone" )) {
        gsap.to(object.scale, {
            duration: duration,
            x:object.userData.initialScale.x * 1.8,y:object.userData.initialScale.y * 1.8,z:object.userData.initialScale.z * 1.8,
            ease: "back.out(1.8)"
        });
     }
    
}



function endHoverAnimation ( object ) {
if ( ! object ) { return;}
    if ( object.name.includes ( "Controller" ) ) {
        gsap.to(object.rotation, {
           duration: duration * 2,
           x: object.userData.initialRotation.x ,
           ease: "back.out(1.8)"
        });
        gsap.to(object.scale, {
            duration: duration,
            x:object.userData.initialScale.x ,y:object.userData.initialScale.y ,z:object.userData.initialScale.z ,
            ease: "back.out(1.8)"
        });
        gsap.to(object.position, {
            duration: duration * 2,
            y: object.userData.initialPosition.y ,
            ease: "back.out(1.8)"
        });   

    } else if ( object.name.includes ( "switch" ) ) {
        if ( !lighton) { return; }
        gsap.to(object.scale, {
            duration: duration,
            x:object.userData.initialScale.x ,y:object.userData.initialScale.y ,z:object.userData.initialScale.z ,
            ease: "back.out(1.8)"
        });
    } else if ( object.name.includes ( "Bayern" )) {
        gsap.to(object.scale, {
            duration: duration,
            x:object.userData.initialScale.x ,y:object.userData.initialScale.y ,z:object.userData.initialScale.z ,
            ease: "back.out(1.8)"
        });
            gsap.to(object.position, {
            duration: duration * 2,
            z: object.userData.initialPosition.z ,
            ease: "back.out(1.8)"
        });   
    } else if ( object.name.includes ( "NLP" ) ) {
        gsap.to(object.scale, {
        duration: duration,
            x:object.userData.initialScale.x ,y:object.userData.initialScale.y ,z:object.userData.initialScale.z ,
         ease: "back.out(1.8)"
        });
        gsap.to(object.children[0].rotation, {
            duration: duration * 3,
            y: object.userData.initialRotation.y,
            ease: "power3.out"
        });
    
    } else if (object.name.includes( "phone" )) {
        gsap.to(object.scale, {
        duration: duration,
            x:object.userData.initialScale.x ,y:object.userData.initialScale.y ,z:object.userData.initialScale.z ,
         ease: "back.out(1.8)"
        });
    }

 
}

let switchButton;
function startClickAnimation (object) {
    if (object.name.includes ( 'switch' ) ){
        switchButton = object.children[0];
        gsap.to(switchButton.rotation, {
            duration: duration,
            x:  Math.PI / 16,
            ease: "back.out(1.8)"
         });
    }
}

function endClickAnimation (object) {
    if (object.name.includes ( 'switch' ) ){
        switchButton = object.children[0];
        gsap.to(switchButton.rotation, {
            duration: duration ,
            x: -Math.PI / 16,
            ease: "back.out(1.8)"
         });
    }
}

function setupButtons () {
    
    document.querySelectorAll( ".exit" )
    .forEach( (button) =>
        button.addEventListener ( "click" , (e) => {
            const modal = e.target.closest ( ".modal" );
            hideModal(modal);
            if ( clickedObject ) {
                clickedObject = null;
            }
        })
    )

    const intro_button = document.querySelector ( ".exit.intro" );
    intro_button.addEventListener ( "click" , () => {backgroundMusic.play()});

    document.querySelector (".mute").addEventListener ("click", () => {
        if (mute) {
            backgroundMusic.play();
        } else {
            backgroundMusic.pause();
        }
        mute = ! mute;
    });



}

function setupTouch () {
    
    window.addEventListener( "pointermove", onPointer );
    window.addEventListener ( "pointerdown", onPointer);
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

function onPointer( event ) {
    
    pointer.x = ( event.clientX / canvas.clientWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera( pointer, camera );
    
    if ( scene.children.length < 7  ) {
        return;
    }
    
    intersects = raycaster.intersectObjects( raycastObjects );
    
    console.log(raycastObjects)

    if ( intersects.length && intersects[0].object.name.includes("Raycaster")  ) {
            document.body.style.cursor = "pointer";
            intersectRayObject = intersects[0].object;
            
            if ( intersectRayObject != hoveredObject ) {

                handleOldHoveredObject();
                handleNewHoveredObject();
            } 
    } else {
        document.body.style.cursor = "default";
        intersectRayObject = null;
        
        handleOldHoveredObject();
    }
}

function handleNewHoveredObject () {
    startHoverAnimation(intersectRayObject);            
    hoveredObject = intersectRayObject;

}
function handleOldHoveredObject () {
    if ( hoveredObject && hoveredObject != clickedObject ) {
        endHoverAnimation(hoveredObject);
        hoveredObject = null;
    }
    
}

function onClick () {
    if ( intersectRayObject )  {

        if ( intersectRayObject != clickedObject ) {
            
            endHoverAnimation ( clickedObject );
            clickedObject = intersectRayObject;
            hideModal (openedModal);
            if ( intersectRayObject.name.includes ("Bayern") ) {
                openedModal = modals.about;
                showModal (openedModal);
            } else if ( intersectRayObject.name.includes ( "Controller" ) ) {
                openedModal = modals.games;
                showModal (openedModal);
            } else if ( intersectRayObject.name.includes ( "NLP" ) ) {
                openedModal = modals.nlp;
                showModal (openedModal);
            }
            
        } else {
            hideModal ( openedModal );
            clickedObject = null;
        }
        if (intersectRayObject.name.includes ( "switch" ) ) {
            if (lighton) {
                
                lighton = false;
                renderer.toneMappingExposure = Math.pow(2, exposureLow);
                scene.background = background_colors.night; 
                handleMusic ();
                startClickAnimation(intersectRayObject);
            } else {
                lighton = true;
                renderer.toneMappingExposure = Math.pow(2,exposureHigh);
                scene.background = background_colors.day;
                handleMusic();
                endClickAnimation (intersectRayObject);
            }
        }
    }
}

function handleMusic () {
    backgroundMusic.pause();
    backgroundMusic = lighton ? sounds.day : sounds.night;
    if (!mute) backgroundMusic.play();
}
    


function showModal ( modal ) {
    if (modal) {
 
        openedModal = modal;
        modal.style.display = "flex";
        onWindowResize();    
        // onPointer ("pointermove");
    }

}; 

function hideModal ( modal ) {
    if (modal) {
        openedModal = null;
     
        modal.style.display = "none";
        if (clickedObject) {

            endHoverAnimation(clickedObject);
            clickedObject = null;
        }
        onWindowResize();
        // onPointer ("pointermove");
    }
}

 function main () {
    setupAudio ();
    setupScene();
    load3DModel();
    setupLight();
    setupButtons ();
    setupControls();
    setupTouch ();
    controls.listenToKeyEvents (renderer.domElement);
    
    window.addEventListener( 'resize', onWindowResize );
    gsap;
}

main();