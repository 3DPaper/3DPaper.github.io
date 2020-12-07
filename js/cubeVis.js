/**
 * Created by joonhaengLee on 11/3/20
 */

global = {
        "name":"Tetrahedron",
        "category":["Platonic Solid"],
        "vertexList":[[0,0,1.732051],[1.632993,0,-0.5773503],[-0.8164966,1.414214,-0.5773503],[-0.8164966,-1.414214,-0.5773503]],
        "edgeList":[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]],
        "faceList":[[0,1,2],[0,2,3],[0,3,1],[1,3,2]]
}


var group, camera, scene, renderer, raycaster;
var box;

var edges = {};
var faces = {};


var mouse = new THREE.Vector2();
var edgeMaterial = new THREE.MeshBasicMaterial( {
    color: 0xD3D3D3
} );
var edgeMaterialSelected = new THREE.MeshBasicMaterial( {
    color: 0x00ffee
} );

init();
animate();

function init(){

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(100, document.getElementById('3d-demo').offsetWidth / document.getElementById('3d-demo').offsetHeight,0.1,1000);
    camera.lookAt(new THREE.Vector3(0,0,0));

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor("#FFFFFF");
    renderer.setSize( document.getElementById('3d-demo').offsetWidth, document.getElementById('3d-demo').offsetHeight );
    document.getElementById('3d-demo').appendChild(renderer.domElement);

    // Controls
    var controls = new THREE.OrbitControls( camera, renderer.domElement );
    camera.position.set( 1, 1, 2 );
    controls.update();

    // Display geometry group
    group = new THREE.Group();
    scene.add( group );


    //raycaster
    raycaster = new THREE.Raycaster();
    raycaster.params.Line.threshold = 0.1;

    document.addEventListener( 'click', onClick, false );

    for(i=0; i<global.faceList.length;i++){

        tempVertextList = []

        for (j=0; j<global.faceList[i].length;j++){
            tempVertextList.push(global.vertexList[global.faceList[i][j]][0])
            tempVertextList.push(global.vertexList[global.faceList[i][j]][1])
            tempVertextList.push(global.vertexList[global.faceList[i][j]][2])
        }
        //console.log(tempVertextList)
        var newGeo = new THREE.BufferGeometry();
        var newGeoMaterial = new THREE.MeshBasicMaterial( { color: 0xA9A9A9, side : 2, transparent: true, opacity: 0.3 } );
        newGeo.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array(tempVertextList), 3 ) );
        var mesh = new THREE.Mesh( newGeo, newGeoMaterial );
        mesh.name = "face_" + i
        mesh.renderOrder = 1;
        group.add(mesh)
    }

    // let e
    for (i = 0; i<global.edgeList.length;i++){

        let e = global.edgeList[i];

        //first vertex
        //console.log("edge", i)
        vector1 = new THREE.Vector3(global.vertexList[global.edgeList[i][0]][0] ,global.vertexList[global.edgeList[i][0]][1], global.vertexList[global.edgeList[i][0]][2])
        vector2 = new THREE.Vector3(global.vertexList[global.edgeList[i][1]][0] ,global.vertexList[global.edgeList[i][1]][1], global.vertexList[global.edgeList[i][1]][2])

        var edge = cylinderMesh(vector1,vector2, edgeMaterial)
        edge.name = "edge_" + i

        // this code is reference from Eyal P,eyalp@mit.edu
        edges[edge.uuid] = {
            selected: false,
            index: i,
        }
        group.add(edge)


    }
    //console.log(scene)

}
function animate(){

    group.rotation.y += 0.001;
    requestAnimationFrame(animate);
    renderer.render(scene,camera);


}

function cylinderMesh(point1, point2, material) {
    var direction = new THREE.Vector3().subVectors(point2, point1);
    var arrow = new THREE.ArrowHelper(direction.clone().normalize(), point1);
    var rotation = new THREE.Euler().setFromQuaternion(arrow.quaternion);
    var edgeGeometry = new THREE.CylinderGeometry( 0.1, 0.1, direction.length(), 8, 4 );
    var edge = new THREE.Mesh(edgeGeometry, material);
    var position = new THREE.Vector3().addVectors(point1, direction.multiplyScalar(0.5));
    edge.position.set(position.x, position.y, position.z);
    edge.rotation.set(rotation.x, rotation.y, rotation.z);
    return edge;
}

function onClick( event ) {
    event.preventDefault();
    canvasX = document.getElementById('3d-demo').getBoundingClientRect().x
    canvasY = document.getElementById('3d-demo').getBoundingClientRect().y

    mouse.x = ((event.clientX - canvasX) / document.getElementById('3d-demo').offsetWidth) * 2 - 1;
    mouse.y = -((event.clientY - canvasY) / document.getElementById('3d-demo').offsetHeight) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );
    const intersects = raycaster.intersectObjects(group.children, true);
    //console.log(intersects)

    if ( intersects.length > 0 ) {
        var uuid = intersects[0].object.uuid;
        if (uuid in edges) {
            //console.log(intersects[0]);
            if (edges[uuid].selected) {
                intersects[0].object.material = edgeMaterial;
            } else {
                intersects[0].object.material = edgeMaterialSelected;
            }
            edges[uuid].selected = !edges[uuid].selected;
            intersects[0].object.material.needsUpdate = true;
        }
    }

}
