/* Intersection structure:
 * t:        ray parameter (float), i.e. distance of intersection point to ray's origin
 * position: position (THREE.Vector3) of intersection point
 * normal:   normal (THREE.Vector3) of intersection point
 * material: material of the intersection object
 */
class Intersection {
	constructor() {
		this.t = 0;
		this.position = new THREE.Vector3();
		this.normal = new THREE.Vector3();
		this.material = null;
	}
	set(isect) {
		this.t = isect.t;
		this.position = isect.position;
		this.normal = isect.normal;
		this.material = isect.material;
	}
}

/* Plane shape
 * P0: a point (THREE.Vector3) that the plane passes through
 * n:  plane's normal (THREE.Vector3)
 */
class Plane {
	constructor(P0, n, material) {
		this.P0 = P0.clone();
		this.n = n.clone();
		this.n.normalize();
		this.material = material;
	}
	// Given ray and range [tmin,tmax], return intersection point.
	// Return null if no intersection.
	intersect(ray, tmin, tmax) {
		let temp = this.P0.clone();
		temp.sub(ray.o); // (P0-O)
		let denom = ray.d.dot(this.n); // d.n
		if(denom==0) { return null;	}
		let t = temp.dot(this.n)/denom; // (P0-O).n / d.n
		if(t<tmin || t>tmax) return null; // check range
		let isect = new Intersection();   // create intersection structure
		isect.t = t;
		isect.position = ray.pointAt(t);
		isect.normal = this.n;
		isect.material = this.material;
		return isect;
	}
}

/* Sphere shape
 * C: center of sphere (type THREE.Vector3)
 * r: radius
 */
class Sphere {
	constructor(C, r, material) {
		this.C = C.clone();
		this.r = r;
		this.r2 = r*r;
		this.material = material;
	}
	intersect(ray, tmin, tmax) {
// ===YOUR CODE STARTS HERE===
		let A = 1;
		let B = ray.o.clone().sub(this.C).multiplyScalar(2).dot(ray.d.clone());
		let C = ray.o.clone().sub(this.C).lengthSq() - this.r2;
		let delta = B * B - 4 * A * C;
		if (delta >= 0) {
			let t1 = (-B + Math.sqrt(B*B - 4*A*C)) / (2*A);
			let t2 = (-B - Math.sqrt(B*B - 4*A*C)) / (2*A);
			let t = null;
			if (t2 <= tmax && t2 >= tmin) {
				t = t2;
			}
			else{
				if (t1 <= tmax && t1 >= tmin) {
					t = t1;
				}
				else {
					return null
				}
			}
			let intersection = new Intersection();
			intersection.t = t;
			intersection.position = ray.pointAt(t);
			intersection.normal = intersection.position.clone().sub(this.C).normalize();
			intersection.material = this.material;
			return intersection;
		}
// ---YOUR CODE ENDS HERE---
		return null;
	}
}

class Triangle {
	/* P0, P1, P2: three vertices (type THREE.Vector3) that define the triangle
	 * n0, n1, n2: normal (type THREE.Vector3) of each vertex */
	constructor(P0, P1, P2, material, n0, n1, n2) {
		this.P0 = P0.clone();
		this.P1 = P1.clone();
		this.P2 = P2.clone();
		this.material = material;
		if(n0) this.n0 = n0.clone();
		if(n1) this.n1 = n1.clone();
		if(n2) this.n2 = n2.clone();

		// below you may pre-compute any variables that are needed for intersect function
		// such as the triangle normal etc.
// ===YOUR CODE STARTS HERE===
		this.normal = this.P1.clone().sub(this.P0).cross(this.P2.clone().sub(this.P0)).normalize();
// ---YOUR CODE ENDS HERE---
	} 

	intersect(ray, tmin, tmax) {
// ===YOUR CODE STARTS HERE===
		let D = ray.direction();
		let a1 = D.x;
		let a2 = D.y;
		let a3 = D.z;
		let b1 = this.P2.x - this.P0.x;
		let b2 = this.P2.y - this.P0.y;
		let b3 = this.P2.z - this.P0.z;
		let c1 = this.P2.x - this.P1.x;
		let c2 = this.P2.y - this.P1.y;
		let c3 = this.P2.z - this.P1.z;
		let d1 = this.P2.x - ray.origin().x;
		let d2 = this.P2.y - ray.origin().y;
		let d3 = this.P2.z - ray.origin().z;
		let matrix = new THREE.Matrix3();
		matrix.set(a1, a2, a3, b1, b2, b3, c1, c2, c3);
		if (matrix.determinant() == 0) {
			return null;
		}
		let t_nume = new THREE.Matrix3();
		t_nume.set(d1, d2, d3, b1, b2, b3, c1, c2, c3);
		let deno = new THREE.Matrix3();
		deno.set(a1, a2, a3, b1, b2, b3, c1, c2, c3);
		let alpha_nume = new THREE.Matrix3();
		alpha_nume.set(a1, a2, a3, d1, d2, d3, c1, c2, c3);
		let beta_nume = new THREE.Matrix3();
		beta_nume.set(a1, a2, a3, b1, b2, b3, d1, d2, d3);
		let t = t_nume.determinant() / deno.determinant();
		let alpha = alpha_nume.determinant() / deno.determinant();
		let beta = beta_nume.determinant() / deno.determinant();
		if (t> tmax || t < tmin) {
			return null;
		}
		if (alpha >= 0 && beta >= 0 && t >= 0 && (alpha + beta <= 1)) {
			let intersection = new Intersection();
			intersection.t = t;
			intersection.position = ray.pointAt(t);
			if (this.n0 && this.n1 && this.n2) {
				intersection.normal = (this.n0.clone().multiplyScalar(alpha).add(this.n1.clone().multiplyScalar(beta)).add(this.n2.clone().multiplyScalar(1-alpha-beta))).normalize();
			}
			else {
				intersection.normal = this.normal;
			}
			intersection.material = this.material;
			return intersection;
		}
		else {
			return null
		}
// ---YOUR CODE ENDS HERE---
		return null;
	}
}

function shapeLoadOBJ(objstring, material, smoothnormal) {
	loadOBJFromString(objstring, function(mesh) { // callback function for non-blocking load
		if(smoothnormal) mesh.computeVertexNormals();
		for(let i=0;i<mesh.faces.length;i++) {
			let p0 = mesh.vertices[mesh.faces[i].a];
			let p1 = mesh.vertices[mesh.faces[i].b];
			let p2 = mesh.vertices[mesh.faces[i].c];
			if(smoothnormal) {
				let n0 = mesh.faces[i].vertexNormals[0];
				let n1 = mesh.faces[i].vertexNormals[1];
				let n2 = mesh.faces[i].vertexNormals[2];
				shapes.push(new Triangle(p0, p1, p2, material, n0, n1, n2));
			} else {
				shapes.push(new Triangle(p0, p1, p2, material));
			}
		}
	}, function() {}, function() {});
}

/* ========================================
 * You can define additional Shape classes,
 * as long as each implements intersect function.
 * ======================================== */
