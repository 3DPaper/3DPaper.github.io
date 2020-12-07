// This function has been developed by Joonhaenag Lee(joonhaenglee@gsd.harvard.edu) and Eyal Perry(eyalp@mit.edu) for MIT.6.849 in 2020 Fall.

async function displayPolyhedron() {

    polyhedron = global
    console.log(global)
    polyhedron.vertex = global.vertexList
    polyhedron.face = global.faceList
    polyhedron.edge = global.edgeList
    console.log(global.vertex.length)

    var liveUnfoldMode = true

    while (group.children.length > 0) {
        group.remove(group.children[0]);
    }
    edges = {};
    faces = {};
    remaining_Faces = []
    var face_count = 0;
    var remaining_Faces_count = polyhedron.face.length

    var geometry = new THREE.Geometry();
    var geometry_dummy = new THREE.Geometry();

    for (var i = 0; i < polyhedron.vertex.length; i++) {
        geometry.vertices.push(new THREE.Vector3(polyhedron.vertex[i][0], polyhedron.vertex[i][1], polyhedron.vertex[i][2]));
        geometry_dummy.vertices.push(new THREE.Vector3(polyhedron.vertex[i][0], polyhedron.vertex[i][1], polyhedron.vertex[i][2]));
    }

    var new_f_to_old_f = [];
    var face_divided = []; // store divided faces e.g) 4 triangulated rectangle
    for (var i = 0; i < polyhedron.face.length; i++) {
        var f = polyhedron.face[i];
        if (f.length == 3) { // face is triangle
            geometry.faces.push(new THREE.Face3(f[0], f[1], f[2]));
            geometry_dummy.faces.push(new THREE.Face3(f[0], f[1], f[2]));
            new_f_to_old_f.push(i);

            faces[face_count] = {
                folded: true,
                grouped: false,
                group: [],
                index: face_count,
                face_vertices: [f[0], f[1], f[2]],
                face_edges: [null,null,null], // 0 is place holder for now
                face_edges_linked: [true,true,true],
                face_edges_flattened: [false,false,false],
                face_edges_dummy: [false,false,false],
                face_edges_angle:[0,0,0], // 0 is place holder for now
                face_nextFace: [null,null,null],
                name:'face_' + face_count,
                position: [polyhedron.vertex[f[0]][0],polyhedron.vertex[f[0]][1],polyhedron.vertex[f[0]][2],polyhedron.vertex[f[1]][0],polyhedron.vertex[f[1]][1],polyhedron.vertex[f[1]][2],polyhedron.vertex[f[2]][0],polyhedron.vertex[f[2]][1],polyhedron.vertex[f[2]][2]]
            }
            face_count +=1
            remaining_Faces.push(i)
            remaining_Faces_count += 1

            // add face dictionary
        } else { // face !triangle
            // do a simple triangulation
            // add a new vertex at the center
            var v = new THREE.Vector3(0, 0, 0);
            for (var j = 0; j < f.length; j++) {
                v.add(geometry.vertices[f[j]]);
            }
            v.divideScalar(f.length);
            var v_idx = geometry.vertices.length;
            geometry.vertices.push(v);
            geometry_dummy.vertices.push(v);

            var face_divided_temp = [] // temporary array to store grouped faces
            for (var j = 0; j < f.length; j++) {
                face_divided_temp.push(face_count+j)
            }
            for (var j = 0; j < f.length; j++) {
                geometry.faces.push(new THREE.Face3(f[j], f[(j + 1) % f.length], v_idx));
                geometry_dummy.faces.push(new THREE.Face3(f[j], f[(j + 1) % f.length], v_idx));
                new_f_to_old_f.push(i);

                faces[face_count] = {
                    folded: true,
                    grouped: true,
                    group: face_divided_temp,
                    index: face_count,
                    face_vertices: [f[j], f[(j + 1) % f.length], v_idx],
                    face_edges: [null,null,null], // 0 is place holder for now
                    face_edges_linked: [true,true,true],
                    face_edges_flattened: [false,true,true],
                    face_edges_dummy: [false,true,true],
                    face_edges_angle:[0,0,0], // 0 is place holder for now
                    face_nextFace: [null,face_divided_temp[(j+1)%(face_divided_temp.length)],face_divided_temp[((j-1)+face_divided_temp.length)%face_divided_temp.length]],
                    name:'face_' + face_count,
                    position: [polyhedron.vertex[f[j]][0],polyhedron.vertex[f[j]][1],polyhedron.vertex[f[j]][2],polyhedron.vertex[f[(j + 1) % f.length]][0],polyhedron.vertex[f[(j + 1) % f.length]][1],polyhedron.vertex[f[(j + 1) % f.length]][2],geometry.vertices[v_idx][0],geometry.vertices[v_idx][1],geometry.vertices[v_idx][2]]
                }
                face_count +=1
                remaining_Faces.push(i)
                remaining_Faces_count += 1
            }
            face_divided.push(face_divided_temp)
        }
    }

    geometry.computeFaceNormals();
    geometry_dummy.computeFaceNormals();

    var mesh = new THREE.Mesh( geometry, material );
    mesh.material.side = THREE.FrontSide; // front faces
    mesh.renderOrder = 1;
    group.add( mesh );

    var mesh = new THREE.Mesh( geometry_dummy, material );
    mesh.material.side = THREE.FrontSide; // front faces
    mesh.renderOrder = 1;
    mesh.name = 'dummy';

    if(liveUnfoldMode) mesh.visible = false

    group.add( mesh );

    // this is reduendent step to remove original mesh and create new meshs, but each triangle is one object
    v = group.children[0].geometry.vertices
    for (var i = 0; i < group.children[0].geometry.faces.length; i++) {
        var geometry = new THREE.Geometry();
        f = group.children[0].geometry.faces[i]
        // add vertices
        geometry.vertices.push(v[f.a]);
        geometry.vertices.push(v[f.b]);
        geometry.vertices.push(v[f.c]);

        // add faces ( we are only dealing with triangles
        geometry.faces.push(new THREE.Face3(0, 1, 2));
        geometry.faces.push(new THREE.Face3(0, 1, 2))

        geometry.faces[0].materialIndex = 0
        geometry.faces[1].materialIndex = 1

        // create mesh and add it to group
        geometry.computeFaceNormals();
        var mesh = new THREE.Mesh( geometry, [material,material2] );
        mesh.name = 'face_' + i
        mesh.index = i
        if(!liveUnfoldMode) mesh.visible = false

        group.add( mesh );

        // assigning two colors in mesh by duplicating face
        //https://stackoverflow.com/questions/48177470/adding-a-different-colour-to-each-side-of-this-obj

    }

    // edges
    for (var i = 0; i < polyhedron.edge.length; i++) {
        let e = polyhedron.edge[i];

        geometry = group.children[0].geometry // This line added
        var edge = cylinderMesh(geometry.vertices[e[0]], geometry.vertices[e[1]], edgeMaterial);
        edge.name = 'edge_' + i
        //edge.index = i

        group.add(edge);

        var edge_faces = [];
        var edge_faces_old = [];// this is needed for storing number of triangulated faces
        var normals = [];
        var vertexVector = [];
        var planeVector = [];
        for (var j = 0; j < geometry.faces.length; j++) {
            let f = geometry.faces[j];

            // check if this face has this edge
            if ((f.a == e[0]) + (f.a == e[1]) + (f.b == e[0]) + (f.b == e[1]) + (f.c == e[0]) + (f.c == e[1]) == 2) {
                edge_faces.push(new_f_to_old_f[j]);
                edge_faces_old.push(j);
                normals.push(f.normal);

                if ( (f.a == e[0]) + (f.a == e[1]) +  (f.b == e[0]) + (f.b == e[1]) == 2){
                    faces[j].face_edges[0] =i
                    vertexVector.push((geometry.vertices[f.c].clone()).sub((geometry.vertices[f.a].clone().add(geometry.vertices[f.b].clone())).multiplyScalar(0.5)))
                    planeVector.push( (geometry.vertices[f.a].clone().sub(geometry.vertices[f.b].clone())).cross((geometry.vertices[f.a].clone().sub(geometry.vertices[f.c].clone()))))

                }
                else if( (f.b == e[0]) + (f.b == e[1]) +  (f.c == e[0]) + (f.c == e[1]) == 2 ){
                    faces[j].face_edges[1] =i
                    vertexVector.push((geometry.vertices[f.a].clone()).sub((geometry.vertices[f.b].clone().add(geometry.vertices[f.c].clone())).multiplyScalar(0.5)))
                    planeVector.push( (geometry.vertices[f.b].clone().sub(geometry.vertices[f.c].clone())).cross((geometry.vertices[f.b].clone().sub(geometry.vertices[f.a].clone()))))
                }
                else{
                    faces[j].face_edges[2] =i
                    vertexVector.push((geometry.vertices[f.b].clone()).sub((geometry.vertices[f.c].clone().add(geometry.vertices[f.a].clone())).multiplyScalar(0.5)))
                    planeVector.push( (geometry.vertices[f.c].clone().sub(geometry.vertices[f.a].clone())).cross((geometry.vertices[f.c].clone().sub(geometry.vertices[f.b].clone()))))
                }
                //console.log(vertex)
            }
        }
        //var MVTestVector = []
        var convex ;
        var mv =  vertexVector[1].dot(planeVector[0])
        //console.log(mv)
        if(mv>0) convex = false;
        else convex = true;

        let dp = normals[0].dot(normals[1]);

        var angle;
        if(convex){angle = 180 - (Math.acos(dp) * 180 / Math.PI);}
        else{ angle =  (Math.acos(dp) * 180 / Math.PI) - 180;}
        //https://stackoverflow.com/questions/10612829/tetrahedron-orientation-for-triangle-meshes

        edges[edge.uuid] = {
            selected: false,
            hover: false,
            index: i,
            angle: angle,
            edge_faces: edge_faces,
            flattened: false, // added
            edge_vertices: e, // added
            edge_faces_old: edge_faces_old, // added
        }
    }
    // add adjacent face list in faces by iterating edges
    for (var edge in edges) {
        var linked = edges[edge].edge_faces_old
        //var linked = edges[edge].edge_faces
        for ( var i =0; i<2; i++){ // assume that edge have two adjacent faces
            var index = faces[linked[i]].face_edges.indexOf(edges[edge].index)
            faces[linked[i]].face_nextFace[index] = linked[(i+1)%2]
            faces[linked[i]].face_edges_angle[index] = edges[edge].angle
        }
    }
    group.remove(group.children[0]);

    global.edges = edges

    tempEdgeAngleList = []
    for (edge in edges){
        //console.log(edges[edge].angle)
        tempEdgeAngleList.push( edges[edge].angle * 1)
    }
    global.edgeAngles = tempEdgeAngleList

    return 1;
}

function cylinderMesh(point1, point2, material) {
    var direction = new THREE.Vector3().subVectors(point2, point1);
    var arrow = new THREE.ArrowHelper(direction.clone().normalize(), point1);
    var rotation = new THREE.Euler().setFromQuaternion(arrow.quaternion);
    var edgeGeometry = new THREE.CylinderGeometry( 0.2, 0.2, direction.length(), 8, 4 );
    var edge = new THREE.Mesh(edgeGeometry, material);
    var position = new THREE.Vector3().addVectors(point1, direction.multiplyScalar(0.5));
    edge.position.set(position.x, position.y, position.z);
    edge.rotation.set(rotation.x, rotation.y, rotation.z);
    return edge;
}