/* * * * * * * * * * * * * *
*    class polygonVis      *
* * * * * * * * * * * * * */


class polygonVis{

    constructor(parentElement,OBJ){
        this.parentElement = parentElement;
        this.OBJ = OBJ;

        window.onload = this.initVis();

    }

    initVis(){

        let vis = this

        console.log(document.getElementById(vis.parentElement))
        //vis.width = $("#" + matrix.parentElement).width();

        vis.scene = new THREE.Scene();
        vis.camera = new THREE.PerspectiveCamera(90, 1,0.1,1000);
        //document.getElementById(vis.parentElement).offsetWidth / document.getElementById(vis.parentElement).offsetHeight
        //document.getElementById('3DVis').innerWidth / document.getElementById('3DVis').innerHeight

        vis.ambientLight = new THREE.AmbientLight(0xffffff,1);
        vis.scene.add(vis.ambientLight);

        vis.objLoader = new THREE.OBJLoader();
        vis.objLoader.load(vis.parentElement, function(mesh){

            vis.scene.add(mesh);

            mesh.position.set(0,0,0);
            mesh.scale.x = mesh.scale.y = mesh.scale.z = 100;


        })

        vis.camera.lookAt(new THREE.Vector3(0,0,0));

        vis.renderer = new THREE.WebGLRenderer();
        //vis.renderer.setSize( document.getElementById('3DVis').offsetWidth, document.getElementById('3DVis').offsetHeight );
        vis.renderer.setSize( 100, 100 );

        d3.select("#" + vis.parentElement).append(vis.renderer.domElement)

        vis.controls = new THREE.OrbitControls( vis.camera, vis.renderer.domElement );
        vis.camera.position.set( 0, 100, 100 );
        vis.controls.update();

        vis.animate();
    }

    animate(){

        let vis = this;

        requestAnimationFrame(animate);
        vis.renderer.render(vis.scene,vis.camera);

    }

}
