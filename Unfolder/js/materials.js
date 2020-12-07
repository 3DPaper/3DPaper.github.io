// Material Setup for threeVis

var polygonOffset = 0.5
var material, material2, material3
var edgeMaterial, edgeMaterialSelected, edgeMaterialFixed

edgeMaterial = new THREE.MeshLambertMaterial( {
    color: 0x000000
} );
edgeMaterialSelected = new THREE.MeshLambertMaterial( {
    color: 0x40E0D0
} );
edgeMaterialFixed = new THREE.MeshLambertMaterial( {
    color: 0xff9900 //0x838383
} );

material = new THREE.MeshPhongMaterial({
    flatShading:true,
    side:THREE.FrontSide,
    polygonOffset: true,
    polygonOffsetFactor: polygonOffset, // positive value pushes polygon further away
    polygonOffsetUnits: 1,
    wireframe: false,
});

material2 = new THREE.MeshPhongMaterial({
    flatShading:true,
    side:THREE.BackSide,
    polygonOffset: true,
    polygonOffsetFactor: polygonOffset, // positive value pushes polygon further away
    polygonOffsetUnits: 1,
    wireframe: false,
});

material3 = new THREE.MeshPhongMaterial({
    wireframe: true,
});

material.color.setStyle( "#c1c1c1"); // #ec008b
material2.color.setStyle( "#dddddd");
material3.color.setStyle( "#000000");