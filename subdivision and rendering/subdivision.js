/* CMPSCI 373 Homework 4: Subdivision Surfaces */

const panelSize = 600;
const fov = 35;
const aspect = 1;
let scene, renderer, camera, material, orbit, light, surface=null;
let nsubdiv = 0;

let coarseMesh = null;	// the original input triangle mesh
let currMesh = null;		// current triangle mesh

let flatShading = true;
let wireFrame = false;

let objStrings = [
	box_obj,
	ico_obj,
	torus_obj,
	twist_obj,
	combo_obj,
	pawn_obj,
	bunny_obj,
	head_obj,
	hand_obj,
	klein_obj
];

let objNames = [
	'box',
	'ico',
	'torus',
	'twist',
	'combo',
	'pawn',
	'bunny',
	'head',
	'hand',
	'klein'
];

function id(s) {return document.getElementById(s);}
function message(s) {id('msg').innerHTML=s;}

function eqSet(set1, set2) {
    if (set1.size !== set2.size) {
		return false;
	}
    for (var e of set1) {
		if (!set2.has(e)) {
			return false;
		}
	}
    return true;
}

function Sethas(map, set) {
	for (var e of map.keys()) {
		if (eqSet(e, set)) {
			return true;
		}
	}
	return false;
}

function Setget(map, set) {
	for (var e of map.keys()) {
		if (eqSet(e, set)) {
			return map.get(e);
		}
	}
	return null;
}

function Setset(map, set, value) {
	for (var e of map.keys()) {
		if (eqSet(e, set)) {
			map.set(e, value);
		}
	}
}

function subdivide() {
	let currVerts = currMesh.vertices;
	let currFaces = currMesh.faces;
	let newVerts = [];
	let newFaces = [];
	/* You can access the current mesh data through
	 * currVerts and currFaces arrays.
	 * Compute one round of Loop's subdivision and
	 * output to newVerts and newFaces arrays.
	 */
// ===YOUR CODE STARTS HERE===
	let edge = new Map();   //map, (1, 23) --> {2 indices + neighboring vertices of edge + index of new insert vertex}
	let vertex_adjacency = new Map();   //map, num --> Set()
	let count = 0;
	for (let i = 0; i < currVerts.length; i++) {
		count += 1;
		newVerts.push(currVerts[i].clone());
	}
	for(let i = 0; i < currFaces.length; i++) {
		let minab = Math.min(currFaces[i].a, currFaces[i].b);
		let maxab = Math.max(currFaces[i].a, currFaces[i].b);
		let minbc = Math.min(currFaces[i].b, currFaces[i].c);
		let maxbc = Math.max(currFaces[i].b, currFaces[i].c);
		let minac = Math.min(currFaces[i].c, currFaces[i].a);
		let maxac = Math.max(currFaces[i].c, currFaces[i].a);
		let edge1 = new Set([minab, maxab]);
		let edge2 = new Set([minbc, maxbc]);
		let edge3 = new Set([minac, maxac]);
		if (vertex_adjacency.has(currFaces[i].a)) {
			let data = vertex_adjacency.get(currFaces[i].a);
			vertex_adjacency.set(currFaces[i].a, data.add(currFaces[i].b).add(currFaces[i].c));
		}
		else {
			let s = new Set([currFaces[i].b, currFaces[i].c]);
			vertex_adjacency.set(currFaces[i].a, s);
		}
		if (vertex_adjacency.has(currFaces[i].b)) {
			let data = vertex_adjacency.get(currFaces[i].b);
			vertex_adjacency.set(currFaces[i].b, data.add(currFaces[i].a).add(currFaces[i].c));
		}
		else {
			let s = new Set([currFaces[i].a, currFaces[i].c]);
			vertex_adjacency.set(currFaces[i].b, s);
		}
		if (vertex_adjacency.has(currFaces[i].c)) {
			let data = vertex_adjacency.get(currFaces[i].c);
			vertex_adjacency.set(currFaces[i].c, data.add(currFaces[i].a).add(currFaces[i].b));
		}
		else {
			let s = new Set([currFaces[i].a, currFaces[i].b]);
			vertex_adjacency.set(currFaces[i].c, s);
		}
		if (!Sethas(edge, edge1)) {
			edge.set(edge1, {v0: minab, v1: maxab, n0: currFaces[i].c, n1: null, index: null});
		}
		else {
			let e = Setget(edge,edge1);
			e.n1 = currFaces[i].c;
			e.index = count;
			Setset(edge, edge1, e);
			let data = Setget(edge,edge1);
			let newx, newy, newz = 0;
			newx = currVerts[data.v0].x * (3/8) + currVerts[data.n0].x * (1/8) + currVerts[data.v1].x * (3/8) + currVerts[data.n1].x * (1/8);
			newy = currVerts[data.v0].y * (3/8) + currVerts[data.n0].y * (1/8) + currVerts[data.v1].y * (3/8) + currVerts[data.n1].y * (1/8);
			newz = currVerts[data.v0].z * (3/8) + currVerts[data.n0].z * (1/8) + currVerts[data.v1].z * (3/8) + currVerts[data.n1].z * (1/8);
			count += 1;
			newVerts.push(new THREE.Vector3(newx, newy, newz));
		}
		if (!Sethas(edge, edge2)) {
			edge.set(edge2, {v0: minbc, v1: maxbc, n0: currFaces[i].a, n1: null, index: null});
		}
		else {
			let e = Setget(edge,edge2);
			e.n1 = currFaces[i].a;
			e.index = count;
			Setset(edge, edge2, e);
			let data = Setget(edge,edge2);
			let newx, newy, newz = 0;
			newx = currVerts[data.v0].x * (3/8) + currVerts[data.n0].x * (1/8) + currVerts[data.v1].x * (3/8) + currVerts[data.n1].x * (1/8);
			newy = currVerts[data.v0].y * (3/8) + currVerts[data.n0].y * (1/8) + currVerts[data.v1].y * (3/8) + currVerts[data.n1].y * (1/8);
			newz = currVerts[data.v0].z * (3/8) + currVerts[data.n0].z * (1/8) + currVerts[data.v1].z * (3/8) + currVerts[data.n1].z * (1/8);
			count += 1;
			newVerts.push(new THREE.Vector3(newx, newy, newz));
		}
		if (!Sethas(edge, edge3)) {
			edge.set(edge3, {v0: minac, v1: maxac, n0: currFaces[i].b, n1: null, index: null});
		}
		else {
			let e = Setget(edge,edge3);
			e.n1 = currFaces[i].b;
			e.index = count;
			Setset(edge, edge3, e);
			let data = Setget(edge,edge3);
			let newx, newy, newz = 0;
			newx = currVerts[data.v0].x * (3/8) + currVerts[data.n0].x * (1/8) + currVerts[data.v1].x * (3/8) + currVerts[data.n1].x * (1/8);
			newy = currVerts[data.v0].y * (3/8) + currVerts[data.n0].y * (1/8) + currVerts[data.v1].y * (3/8) + currVerts[data.n1].y * (1/8);
			newz = currVerts[data.v0].z * (3/8) + currVerts[data.n0].z * (1/8) + currVerts[data.v1].z * (3/8) + currVerts[data.n1].z * (1/8);
			count += 1;
			newVerts.push(new THREE.Vector3(newx, newy, newz));
		}
	}
	for (let i = 0; i < currFaces.length; i++) {
		let minab = Math.min(currFaces[i].a, currFaces[i].b);
		let maxab = Math.max(currFaces[i].a, currFaces[i].b);
		let minbc = Math.min(currFaces[i].b, currFaces[i].c);
		let maxbc = Math.max(currFaces[i].b, currFaces[i].c);
		let minac = Math.min(currFaces[i].c, currFaces[i].a);
		let maxac = Math.max(currFaces[i].c, currFaces[i].a);
		let edge1 = new Set([minab, maxab]);
		let edge2 = new Set([minbc, maxbc]);
		let edge3 = new Set([minac, maxac]);
		let newV01 = Setget(edge,edge1).index;
		let newV02 = Setget(edge,edge3).index;
		let newV12 = Setget(edge,edge2).index;
		let P0 = currFaces[i].a;
		let P1 = currFaces[i].b;
		let P2 = currFaces[i].c;
		newFaces.push(new THREE.Face3(P0, newV01, newV02));
		newFaces.push(new THREE.Face3(newV01, P1, newV12));
		newFaces.push(new THREE.Face3(newV01, newV12, newV02));
		newFaces.push(new THREE.Face3(newV02, newV12, P2));
	}
	for (let i of vertex_adjacency.keys()) {
		let cur = currVerts[i];
		let k = vertex_adjacency.get(i).size;
		let weight = (1/k) * (5/8 - Math.pow((3/8 + (1/4)*Math.cos(2*Math.PI/k)), 2));
		let newx = 0;
		let newy = 0;
		let newz = 0;
		for (element of vertex_adjacency.get(i).values()) {
			newx += weight * currVerts[element].x;
			newy += weight * currVerts[element].y;
			newz += weight * currVerts[element].z;
		}
		newx += (1-k*weight) * cur.x;
		newy += (1-k*weight) * cur.y;
		newz += (1-k*weight) * cur.z;
		newVerts[i] = new THREE.Vector3(newx, newy, newz);
	}
	console.log(edge);
// ---YOUR CODE ENDS HERE---
	/* Overwrite current mesh with newVerts and newFaces */
	currMesh.vertices = newVerts;
	currMesh.faces = newFaces;
	/* Update mesh drawing */
	updateSurfaces();
}

window.onload = function(e) {
	// create scene, camera, renderer and orbit controls
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100 );
	camera.position.set(-1, 1, 3);
	
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(panelSize, panelSize);
	renderer.setClearColor(0x202020);
	id('surface').appendChild(renderer.domElement);	// bind renderer to HTML div element
	orbit = new THREE.OrbitControls(camera, renderer.domElement);
	
	light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
	light.position.set(camera.position.x, camera.position.y, camera.position.z);	// right light
	scene.add(light);

	let amblight = new THREE.AmbientLight(0x202020);	// ambient light
	scene.add(amblight);
	
	// create materials
	material = new THREE.MeshPhongMaterial({color:0xCC8033, specular:0x101010, shininess: 50});
	
	// create current mesh object
	currMesh = new THREE.Geometry();
	
	// load first object
	loadOBJ(objStrings[0]);
}

function updateSurfaces() {
	currMesh.verticesNeedUpdate = true;
	currMesh.elementsNeedUpdate = true;
	currMesh.computeFaceNormals(); // compute face normals
	if(!flatShading) currMesh.computeVertexNormals(); // if smooth shading
	else currMesh.computeFlatVertexNormals(); // if flat shading
	
	if (surface!=null) {
		scene.remove(surface);	// remove old surface from scene
		surface.geometry.dispose();
		surface = null;
	}
	material.wireframe = wireFrame;
	surface = new THREE.Mesh(currMesh, material); // attach material to mesh
	scene.add(surface);
}

function loadOBJ(objstring) {
	loadOBJFromString(objstring, function(mesh) {
		coarseMesh = mesh;
		currMesh.vertices = mesh.vertices;
		currMesh.faces = mesh.faces;
		updateSurfaces();
		nsubdiv = 0;
	},
	function() {},
	function() {});
}

function onKeyDown(event) { // Key Press callback function
	switch(event.key) {
		case 'w':
		case 'W':
			wireFrame = !wireFrame;
			message(wireFrame ? 'wireframe rendering' : 'solid rendering');
			updateSurfaces();
			break;
		case 'f':
		case 'F':
			flatShading = !flatShading;
			message(flatShading ? 'flat shading' : 'smooth shading');
			updateSurfaces();
			break;
		case 's':
		case 'S':
		case ' ':
			if(nsubdiv>=5) {
				message('# subdivisions at maximum');
				break;
			}
			subdivide();
			nsubdiv++;
			updateSurfaces();
			message('# subdivisions = '+nsubdiv);
			break;
		case 'e':
		case 'E':
			currMesh.vertices = coarseMesh.vertices;
			currMesh.faces = coarseMesh.faces;
			nsubdiv = 0;
			updateSurfaces();
			message('# subdivisions = '+nsubdiv);
			break;
		case 'r':
		case 'R':
			orbit.reset();
			break;
			
	}
	if(event.key>='0' && event.key<='9') {
		let index = 9;
		if(event.key>'0')	index = event.key-'1';
		if(index<objStrings.length) {
			loadOBJ(objStrings[index]);
			message('loaded mesh '+objNames[index]);
		}
	}
}

window.addEventListener('keydown',  onKeyDown,  false);

function animate() {
	requestAnimationFrame( animate );
	//if(orbit) orbit.update();
	if(scene && camera)	{
		light.position.set(camera.position.x, camera.position.y, camera.position.z);
		renderer.render(scene, camera);
	}
}

animate();
