/**
 * Created by joonhaengLee on 11/3/20
 */


function initThreeView(){

    var myobj = document.getElementById("polygonVis");
    if(myobj.children.length > 0) myobj.children[0].remove()

    var polyhedron;
    var edges = {};
    var faces = {};
    var selection = [];

    console.log('global')
    console.log(global)

    console.log("initThreeView")

    var raycaster, controls;
    var mouse = new THREE.Vector2();

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(45, document.getElementById('polygonVis').offsetWidth / document.getElementById('polygonVis').offsetHeight,0.1,1000);
    camera.lookAt(new THREE.Vector3(0,0,0));

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor("#FFFFFF");
    renderer.setSize( document.getElementById('polygonVis').offsetWidth, document.getElementById('polygonVis').offsetHeight );
    document.getElementById('polygonVis').appendChild(renderer.domElement);

    // Controls
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    camera.position.set( 20, 30, 10 );
    controls.update();

    // light
    var directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(0, 40, 0);
    scene.add(directionalLight1);
    var directionalLight4 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight4.position.set(0, -40, 0);
    scene.add(directionalLight4);
    var directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight2.position.set(40, -12, 0);
    scene.add(directionalLight2);
    var directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight3.position.set(-40, -12, 0);
    scene.add(directionalLight3);
    var directionalLight4 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight4.position.set(0, 12, 40);
    scene.add(directionalLight4);
    var directionalLight5 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight5.position.set(0, 12 , -40);
    scene.add(directionalLight5);

    // Display geometry group
    group = new THREE.Group();
    scene.add( group );
    displayPolyhedron();

    document.addEventListener( 'click', onClick, false );

    // 2. MESH TRIANGLES
    for(i=0; i<global.faceList.length;i++){

        tempVertextList = []

        for (j=0; j<global.faceList[i].length;j++){
            tempVertextList.push(global.vertexList[global.faceList[i][j]][0])
            tempVertextList.push(global.vertexList[global.faceList[i][j]][1])
            tempVertextList.push(global.vertexList[global.faceList[i][j]][2])
        }
        var newGeo = new THREE.BufferGeometry();
        var newGeoMaterial = new THREE.MeshBasicMaterial( { color: 0xA9A9A9 , side : 2, transparent: true, opacity: 0.3 } );
        newGeo.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array(tempVertextList), 3 ) );
        var mesh = new THREE.Mesh( newGeo, newGeoMaterial );
        mesh.name = "face_" + i
        //group.add(mesh)
    }

    // raycaster

    raycaster = new THREE.Raycaster();
    raycaster.params.Line.threshold = 0.1;

    animate();

    // this code is from https://github.com/6849-2020/edge-unfolder/blob/master/index.html
    // this code excerpt is taken from Lee Stemkoski
    // https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/Polyhedra.html


    function animate(){

        requestAnimationFrame(animate);
        renderer.render(scene,camera);
    }

    function onClick( event ) {
        event.preventDefault();
        canvasX = document.getElementById('polygonVis').getBoundingClientRect().x
        canvasY = document.getElementById('polygonVis').getBoundingClientRect().y


        mouse.x = ((event.clientX - canvasX) / document.getElementById('polygonVis').offsetWidth) * 2 - 1;
        mouse.y = -((event.clientY - canvasY) / document.getElementById('polygonVis').offsetHeight) * 2 + 1;
        //console.log( mouse.x , mouse.y)

        raycaster.setFromCamera( mouse, camera );
        const intersects = raycaster.intersectObjects(group.children, true);

        if ( intersects.length > 0 ) {
            var uuid = intersects[0].object.uuid;
            console.log(uuid)
            console.log(intersects[0].object.name)

            console.log(global.edges)

            if (uuid in global.edges) {
                console.log("hi")


                if(global.edges[uuid].selected){
                    selection.splice(selection.indexOf(parseInt(intersects[0].object.name.split("_")[1])),1)
                    intersects[0].object.material = edgeMaterial;
                }else{
                    selection.push(parseInt(intersects[0].object.name.split("_")[1]))
                    intersects[0].object.material = edgeMaterialSelected;
                }
                global.edges[uuid].selected = !global.edges[uuid].selected;
                intersects[0].object.material.needsUpdate = true;


                recomputeEdgeUnfolding(selection)


            }
        }

    }

}
async function liveUnfold(faces,edges,edge_object,edge_clicked){

    var face_to_update =[]
    face_to_update.push(edge_clicked.edge_faces_old[0])
    face_to_update.push(edge_clicked.edge_faces_old[1])

    var edge_index  = edge_clicked.index

    var unfold_Not_Cut = false

    while(face_to_update.length>0){ // let's iterate faces.

        var f_index = face_to_update.pop()

        if(!unfold_Not_Cut){
            var face_edge_update_index = faces[f_index].face_edges.indexOf(edge_index) // unfold booleans
            faces[f_index].face_edges_linked[face_edge_update_index] = !faces[f_index].face_edges_linked[face_edge_update_index] // update booleans
        }

        var faceGroup = checkFaceGroup(faces, f_index)[0];
        var left_edges = checkFaceGroup(faces, f_index)[2];
        var face_Hinge_Index = checkFaceGroup(faces, f_index)[3];
        var face_Hinge_Edge_Index = checkFaceGroup(faces, f_index)[4];

        if(remaining_Faces.length == 1) {
            console.log(group)
            break;
        }

        if(!faces[f_index].face_edges_linked[face_edge_update_index] || (unfold_Not_Cut) ){

            unfold_Not_Cut = false
            // case 1 linked -> unlinked
            // case 1.1 just update
            if(left_edges == 0){ // trim face from others --> cut the piece from other faces.
                //console.log("you just made an island")
            }
            else if(left_edges == 1){ // should be unfold using left single edge.
                // Series Rotation
                await series_Face_Rotation( group, faces, faceGroup, face_Hinge_Edge_Index )
                // remove unfolded faces
                remaining_Faces = remaining_Faces.filter(n=> !faceGroup.includes(n))

                var f = faces[face_Hinge_Index]
                for (var edge in edges){
                    if (edges[edge].index == f.face_edges[face_Hinge_Edge_Index]){
                        edges[edge].flattened = true
                    }
                }
                // change fixed edge color
                var edge_toFix_index = f.face_edges[face_Hinge_Edge_Index]
                var edge_object_toFix = scene.getObjectByName( "edge_" + edge_toFix_index);
                edge_object_toFix.material = edgeMaterialFixed;

                f.folded == false
                f.face_edges_flattened[face_Hinge_Edge_Index] = true

                var f_next = f.face_nextFace[face_Hinge_Edge_Index] // face to update( number)
                faces[f_next].face_edges_flattened[faces[f_next].face_edges.indexOf(edge_toFix_index)] = true

                if(left_edges = checkFaceGroup(faces, f_next)[2] == 1){
                    unfold_Not_Cut = true
                    face_to_update.push(f_next)
                }
            }
            else{ // nothing happen.

            }
            // case 1.2 unfold
        }
        else{
            // case 2 unlinked -> linked
            // case 2.1 just update
            // case 2.2 refold

            break;
        }
    }
    return 1

}

async function rotateFace( group,faces, face, edge_vector_0, edge_vector_1 , angle ){

    // face : face object
    // edge_vector_0 : Starting Vector of rotating axis in 3D space
    // edge_vector_0 : Ending Vector of rotating axis in 3D space
    // rotation angle

    var vector0 = new THREE.Vector3(face.geometry.vertices[0].x,face.geometry.vertices[0].y,face.geometry.vertices[0].z)
    var vector1 = new THREE.Vector3(face.geometry.vertices[1].x,face.geometry.vertices[1].y,face.geometry.vertices[1].z)
    var vector2 = new THREE.Vector3(face.geometry.vertices[2].x,face.geometry.vertices[2].y,face.geometry.vertices[2].z)

    var axisVector = edge_vector_1.sub(edge_vector_0).normalize()
    var theta = Math.PI - angle/ 180 * Math.PI;

    face.geometry.matrixWorldNeedsUpdate = false

    face.position.sub( edge_vector_0 )
    face.position.applyAxisAngle(axisVector,theta);
    face.rotateOnWorldAxis(axisVector, theta);
    face.position.add( edge_vector_0 );

    face.updateMatrixWorld();

    vector0.applyMatrix4( face.matrixWorld );
    vector1.applyMatrix4( face.matrixWorld );
    vector2.applyMatrix4( face.matrixWorld );
    face.geometry.vertices[0] = vector0
    face.geometry.vertices[1] = vector1
    face.geometry.vertices[2] = vector2

    // add latest position
    faces[face.index].position = [vector0.x,vector0.y,vector0.z,vector1.x,vector1.y,vector1.z,vector2.x,vector2.y,vector2.z]

    // REMOVE SELECTED FACE and RECREATE NEW FACE,
    // FACE NAME and INDEX SHOULD BE SAME
    var geometry = new THREE.Geometry();
    geometry.vertices.push(vector0);
    geometry.vertices.push(vector1);
    geometry.vertices.push(vector2);
    geometry.faces.push(new THREE.Face3(0, 1, 2))
    geometry.faces.push(new THREE.Face3(0, 1, 2))

    if(!faces[face.index].grouped) geometry.faces.push(new THREE.Face3(0, 1, 2))
    else geometry.faces.push(new THREE.Face3(0, 1, 1))

    geometry.faces.push(new THREE.Face3(0, 1, 1))
    geometry.faces[0].materialIndex = 0
    geometry.faces[1].materialIndex = 1
    geometry.faces[2].materialIndex = 2
    geometry.computeFaceNormals();


    //var meshMaterial = new THREE.MeshLambertMaterial( { color: 0x0000ff, opacity: 1, transparent: true, } );
    var mesh = new THREE.Mesh( geometry, [material,material2,material3]);
    mesh.name = face.name
    mesh.index = face.index
    if(!liveUnfoldMode) mesh.visible = false
    else mesh.visible = true

    var toRemove;
    for (var i = 0 ; i<group.children.length ; i++){
        if (group.children[i].name == face.name){
            toRemove = i
            break;
        }
    }
    group.remove(group.children[toRemove])

    group.add( mesh );

    return 1;
}

function checkFaceGroup(faces, face_to_update) {

    var boundary_Edge = 0; // temporary 0 value
    var f = faces[face_to_update]
    var fSingle = []
    var fGroup = []
    var f_hinge = []
    var f_hinge_edge = []

    if (f.grouped) fSingle.push(...f.group);
    else fSingle.push(face_to_update)

    fGroup.push(...fSingle)

    while(fSingle.length>0){
        var face_visit = fSingle.pop()

        for ( var i = 0 ; i < 3 ; i++){
            if( (faces[face_visit].face_edges_linked[i] == true) && (faces[face_visit].face_edges_flattened[i] == true)){
                if (!fGroup.includes(faces[face_visit].face_nextFace[i])){
                    if (!fSingle.includes(faces[face_visit].face_nextFace[i])){
                        fGroup.push(faces[face_visit].face_nextFace[i])
                        fSingle.push(faces[face_visit].face_nextFace[i])
                    }
                }
            }
        }
    }


    var left_edges = 0;
    for (var l = 0; l < fGroup.length; l++) {
        boundary_Edge += (3 - faces[l].face_edges_dummy.reduce((a, b) => a + b))
        for (var m = 0; m < 3; m++) {
            if ((!faces[fGroup[l]].face_edges_dummy[m]) && (faces[fGroup[l]].face_edges_linked[m]) && (!faces[fGroup[l]].face_edges_flattened[m])) {
                left_edges += 1
                f_hinge_edge.push(m)
                f_hinge.push(fGroup[l])

            }
        }
    }

    fGroup.splice(fGroup.indexOf(f_hinge[0]),1)

    fGroup.unshift(f_hinge[0])


    var result = [fGroup, boundary_Edge, left_edges, f_hinge, f_hinge_edge]
    return result
}

async function series_Face_Rotation(group, faces, face_to_Rotate, edge_to_fold_index){

    // find specific face
    var face_object // a face to rotate
    var array = []

    async function asyncCall(){
        for (var i = 0; i < group.children.length; i++){
            if(group.children[i].index == faces[face_to_Rotate[0]].index) {
                face_object = group.children[i]
                array.push(...faces[face_to_Rotate[0]].position)
                break;
            }
        }
        return 1
    }
    await asyncCall()

    var face_to_Rotate_Selected =[];

    for (var k = 0; k < face_to_Rotate.length; k++ ){

        faces[face_to_Rotate[k]].folded == false

        for (var l = 0; l < group.children.length; l++){
            if(group.children[l].index == face_to_Rotate[k]) {
                face_to_Rotate_Selected.push(group.children[l])
            }
        }
    }

    for (var k = 0; k < face_to_Rotate.length; k++ ){
        const edge_vector_0 = new THREE.Vector3(parseFloat(array[edge_to_fold_index*3+0]),parseFloat(array[edge_to_fold_index*3+1]),parseFloat(array[edge_to_fold_index*3+2]))
        const edge_vector_1 = new THREE.Vector3(parseFloat(array[((edge_to_fold_index+1)%3)*3+0]),parseFloat(array[((edge_to_fold_index+1)%3)*3+1]),parseFloat(array[((edge_to_fold_index+1)%3)*3+2]))
        await rotateFace( group, faces, face_to_Rotate_Selected[k], edge_vector_0, edge_vector_1, faces[face_to_Rotate[0]].face_edges_angle[edge_to_fold_index])
    }

    return 1


}

async function recomputeEdgeUnfolding(selection) {

    await displayPolyhedron();

    for (var i =0; i<selection.length;i++) {
        //console.log("for loop :",i)

        var edge_object = group.getObjectByName("edge_" + selection[i])
        //console.log(edge_object)

        if(edges[edge_object.uuid].selected) edge_object.material = edgeMaterial;
        else edge_object.material = edgeMaterialSelected;

        edges[edge_object.uuid].selected = !edges[edge_object.uuid].selected;
        edge_object.material.needsUpdate = true;

        await liveUnfold(faces, edges, edge_object, edges[edge_object.uuid]);
    }

}





