// Pre3d, a JavaScript software 3d renderer.
// (c) Dean McNamee <dean@gmail.com>, Dec 2008.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.
//
// Here are a few notes about what was involved in making this code fast.
//
// - Being careful about painting The engine works in quads, 4 vertices per
//   face, no restriction on being coplanar, or on triangles.  If we were to
//   work only in triangles, we would have to do twice as many paints and
//   longer sorts, since we would double the polygon count.
//
//   Depending on the underlying rasterization system, strokes can be pretty
//   slow, slower than fills.  This is why overdraw is not a stroke.
//
// - Objects over Arrays
//   Because Arrays always go through the key lookup path (a[0] is a['0']), and
//   there is no way to do a named lookup (like a.0), it is faster to use
//   objects than arrays for fixed size storage.  You can think of this like
//   the difference between a List and Tuple in languages like python.  Modern
//   engines can do a better job accessing named properties, so we represented
//   our data as objects.  Profiling showed a huge difference, keyed lookup
//   used to be the most expensive operation in profiling, taking around ~5%.
//
//   There is also a performance (and convenience) balance betweening object
//   literals and constructor functions.  Small and obvious structures like
//   points have no constructor, and are expected to be created as object
//   literals.  Objects with many properties are created through a constructor.
//
// - Object creation / GC pressure
//   One of the trickiest things about a language like JavaScript is avoiding
//   long GC pauses and object churn.  You can do things like cache and reuse
//   objects, avoid creating extra intermediate objects, etc.  Right now there
//   has been a little bit of work done here, but there is more to be done.
//
// - Flattening
//   It is very tempting as a programmer to write generic routines, for example
//   math functions that could work on either 2d or 3d.  This is convenient,
//   but the caller already knows which they should be using, and the extra
//   overhead for generic routines turned out to be substantial.  Unrolling
//   specialized code makes a big difference, for example an early profile:
//   before:    2.5%    2.5%   Function: subPoints    // old general 2d and 3d
//   after:     0.3%    0.3%   Function: subPoints2d  // fast case 2d
//   after:     0.2%    0.2%   Function: subPoints3d  // fast case 3d
//
// - Don't use new if you don't have to
//   Some profiles showed that new (JSConstructCall) at about ~1%.  These were
//   for code like new Array(size);  Specifically for the Array constructor, it
//   ignores the object created and passed in via new, and returns a different
//   object anyway.  This means 'new Array()' and 'Array()' should be
//   interchangable, and this allows you to avoid the overhead for new.
//
// - Local variable caching
//   In most cases it should be faster to look something up in the local frame
//   than to evaluate the expression / lookup more than once.  In these cases
//   I generally try to cache the variable in a local var.
//
// You might notice that in a few places there is code like:
//   Blah.protype.someMethod = function someMethod() { }
// someMethod is duplicated on the function so that the name of the function
// is not anonymous, and it can be easier to debug and profile.

Pre3d = (function() {

  // 2D and 3D point / vector / matrix math.  Points and vectors are expected
  // to have an x, y and z (if 3d) property.  It is important to be consistent
  // when creating these objects to allow the JavaScript engine to properly
  // optimize the property access.  Create this as object literals, ex:
  //   var my_2d_point_or_vector = {x: 0, y: 0};
  //   var my_3d_point_or_vector = {x: 0, y: 0, z: 0};
  //
  // There is one convention that might be confusing.  In order to avoid extra
  // object creations, there are some "IP" versions of these functions.  This
  // stands for "in place", and they write the result to one of the arguments.

  function crossProduct(a, b) {
    // a1b2 - a2b1, a2b0 - a0b2, a0b1 - a1b0
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x
    };
  }

  function dotProduct2d(a, b) {
    return a.x * b.x + a.y * b.y;
  }
  function dotProduct3d(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  // a - b
  function subPoints2d(a, b) {
    return {x: a.x - b.x, y: a.y - b.y};
  }
  function subPoints3d(a, b) {
    return {x: a.x - b.x, y: a.y - b.y, z: a.z - b.z};
  }

  // c = a - b
  function subPoints2dIP(c, a, b) {
    c.x = a.x - b.x;
    c.y = a.y - b.y;
    return c;
  }
  function subPoints3dIP(c, a, b) {
    c.x = a.x - b.x;
    c.y = a.y - b.y;
    c.z = a.z - b.z;
    return c;
  }

  // a + b
  function addPoints2d(a, b) {
    return {x: a.x + b.x, y: a.y + b.y};
  }
  function addPoints3d(a, b) {
    return {x: a.x + b.x, y: a.y + b.y, z: a.z + b.z};
  }

  // c = a + b
  function addPoints2dIP(c, a, b) {
    c.x = a.x + b.x;
    c.y = a.y + b.y;
    return c;
  }
  function addPoints3dIP(c, a, b) {
    c.x = a.x + b.x;
    c.y = a.y + b.y;
    c.z = a.z + b.z;
    return c;
  }

  // a * s
  function mulPoint2d(a, s) {
    return {x: a.x * s, y: a.y * s};
  }
  function mulPoint3d(a, s) {
    return {x: a.x * s, y: a.y * s, z: a.z * s};
  }

  // |a|
  function vecMag2d(a) {
    var ax = a.x, ay = a.y;
    return Math.sqrt(ax * ax + ay * ay);
  }
  function vecMag3d(a) {
    var ax = a.x, ay = a.y, az = a.z;
    return Math.sqrt(ax * ax + ay * ay + az * az);
  }

  // a / |a|
  function unitVector2d(a) {
    return mulPoint2d(a, 1 / vecMag2d(a));
  }
  function unitVector3d(a) {
    return mulPoint3d(a, 1 / vecMag3d(a));
  }

  // Linear interpolation on the line along points (0, |a|) and (1, |b|).  The
  // position |d| is the x coordinate, where 0 is |a| and 1 is |b|.
  function linearInterpolate(a, b, d) {
    return (b-a)*d + a;
  }

  // Linear interpolation on the line along points |a| and |b|.  |d| is the
  // position, where 0 is |a| and 1 is |b|.
  function linearInterpolatePoints3d(a, b, d) {
    return {
      x: (b.x-a.x)*d + a.x,
      y: (b.y-a.y)*d + a.y,
      z: (b.z-a.z)*d + a.z
    }
  }

  // This represents an affine 4x4 matrix, stored as a 3x4 matrix with the last
  // row implied as [0, 0, 0, 1].  This is to avoid generally unneeded work,
  // skipping part of the homogeneous coordinates calculations and the
  // homogeneous divide.  Unlike points, we use a constructor function instead
  // of object literals to ensure map sharing.  The matrix looks like:
  //  e0  e1  e2  e3
  //  e4  e5  e6  e7
  //  e8  e9  e10 e11
  //  0   0   0   1
  function AffineMatrix(e0, e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11) {
    this.e0  = e0;
    this.e1  = e1;
    this.e2  = e2;
    this.e3  = e3;
    this.e4  = e4;
    this.e5  = e5;
    this.e6  = e6;
    this.e7  = e7;
    this.e8  = e8;
    this.e9  = e9;
    this.e10 = e10;
    this.e11 = e11;
  };

  // Matrix multiplication of AffineMatrix |a| x |b|.  This is unrolled,
  // and includes the calculations with the implied last row.
  function multiplyAffine(a, b) {
    // Avoid repeated property lookups by accessing into the local frame.
    var a0 = a.e0, a1 = a.e1, a2 = a.e2, a3 = a.e3, a4 = a.e4, a5 = a.e5;
    var a6 = a.e6, a7 = a.e7, a8 = a.e8, a9 = a.e9, a10 = a.e10, a11 = a.e11;
    var b0 = b.e0, b1 = b.e1, b2 = b.e2, b3 = b.e3, b4 = b.e4, b5 = b.e5;
    var b6 = b.e6, b7 = b.e7, b8 = b.e8, b9 = b.e9, b10 = b.e10, b11 = b.e11;

    return new AffineMatrix(
      a0 * b0 + a1 * b4 + a2 * b8,
      a0 * b1 + a1 * b5 + a2 * b9,
      a0 * b2 + a1 * b6 + a2 * b10,
      a0 * b3 + a1 * b7 + a2 * b11 + a3,
      a4 * b0 + a5 * b4 + a6 * b8,
      a4 * b1 + a5 * b5 + a6 * b9,
      a4 * b2 + a5 * b6 + a6 * b10,
      a4 * b3 + a5 * b7 + a6 * b11 + a7,
      a8 * b0 + a9 * b4 + a10 * b8,
      a8 * b1 + a9 * b5 + a10 * b9,
      a8 * b2 + a9 * b6 + a10 * b10,
      a8 * b3 + a9 * b7 + a10 * b11 + a11
    );
  }

  function makeIdentityAffine() {
    return new AffineMatrix(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0
    );
  }

  // http://en.wikipedia.org/wiki/Rotation_matrix
  function makeRotateAffineX(theta) {
    var s = Math.sin(theta);
    var c = Math.cos(theta);
    return new AffineMatrix(
      1, 0,  0, 0,
      0, c, -s, 0,
      0, s,  c, 0
    );
  }

  function makeRotateAffineY(theta) {
    var s = Math.sin(theta);
    var c = Math.cos(theta);
    return new AffineMatrix(
       c, 0, s, 0,
       0, 1, 0, 0,
      -s, 0, c, 0
    );
  }

  function makeRotateAffineZ(theta) {
    var s = Math.sin(theta);
    var c = Math.cos(theta);
    return new AffineMatrix(
      c, -s, 0, 0,
      s,  c, 0, 0,
      0,  0, 1, 0
    );
  }

  function makeTranslateAffine(dx, dy, dz) {
    return new AffineMatrix(
      1, 0, 0, dx,
      0, 1, 0, dy,
      0, 0, 1, dz
    );
  }

  function makeScaleAffine(sx, sy, sz) {
    return new AffineMatrix(
      sx,  0,  0, 0,
       0, sy,  0, 0,
       0,  0, sz, 0
    );
  }
  
  function makePerspectiveProjectionAffine(f, x0, y0) {
	return new AffineMatrix(
	  -f * y0,      0, x0,  0,
	       0,  f * y0, y0,  0,
	       0,       0,  1,  0
	);
  }
  
  function makeOrthographicProjectionAffine(s, x0, y0) {
	return new AffineMatrix(
		-s, 0,  0,  -x0,
	    0, s,  0,  -y0,
	    0, 0,  0,  -1
	);
  }

  // Return a copy of the affine matrix |m|.
  function dupAffine(m) {
    return new AffineMatrix(
        m.e0, m.e1, m.e2, m.e3,
        m.e4, m.e5, m.e6, m.e7,
        m.e8, m.e9, m.e10, m.e11);
  }

  // Return the transpose of the inverse done via the classical adjoint.  This
  // skips division by the determinant, so vectors transformed by the resulting
  // transform will not retain their original length.
  // Reference: "Transformations of Surface Normal Vectors" by Ken Turkowski.
  function transAdjoint(a) {
    var a0 = a.e0, a1 = a.e1, a2 = a.e2, a4 = a.e4, a5 = a.e5;
    var a6 = a.e6, a8 = a.e8, a9 = a.e9, a10 = a.e10;
    return new AffineMatrix(
      a10 * a5 - a6 * a9,
      a6 * a8 - a4 * a10,
      a4 * a9 - a8 * a5,
      0,
      a2 * a9 - a10 * a1,
      a10 * a0 - a2 * a8,
      a8 * a1 - a0 * a9,
      0,
      a6 * a1 - a2 * a5,
      a4 * a2 - a6 * a0,
      a0 * a5 - a4 * a1,
      0
    );
  }
  
  function makeAxisAngleRotationAffine(e, t) {
	  // I cos t + I (1 - cos t)ee^T + [e]_x sin t
	  var cost = Math.cos(t);
	  var sint = Math.sin(t);
	  var m1cost = 1 - cost;
	  var ex = e.x;
	  var ey = e.y;
	  var ez = e.z;
	   
	  return new AffineMatrix(
		cost + m1cost * ex * ex, 		ex * ey * m1cost -e.z * sint, 	ex * ez * m1cost + e.y * sint,	0,
		ey * ex * m1cost + e.z * sint,	cost + m1cost * e.y * e.y, 		ey * ez * m1cost - e.x * sint,	0,
		ez * ex * m1cost - e.y * sint,	ez * ey * m1cost + e.x * sint,	cost + m1cost * e.z * e.z,		0
	  );
  }

  // Transform the point |p| by the AffineMatrix |t|.
  function transformPoint(t, p) {
    return {
      x: t.e0 * p.x + t.e1 * p.y + t.e2  * p.z + t.e3,
      y: t.e4 * p.x + t.e5 * p.y + t.e6  * p.z + t.e7,
      z: t.e8 * p.x + t.e9 * p.y + t.e10 * p.z + t.e11
    };
  }

  // A Transform is a convenient wrapper around a AffineMatrix, and it is what
  // will be exposed for most transforms (camera, etc).
  function Transform() {
    this.reset();
  }

  // Reset the transform to the identity matrix.
  Transform.prototype.reset = function() {
    this.m = makeIdentityAffine();
  };

  // TODO(deanm): We are creating two extra objects here.  What would be most
  // effecient is something like multiplyAffineByRotateXIP(this.m), etc.
  Transform.prototype.rotateX = function(theta) {
    this.m =
        multiplyAffine(makeRotateAffineX(theta), this.m);
  };
  Transform.prototype.rotateXPre = function(theta) {
    this.m =
        multiplyAffine(this.m, makeRotateAffineX(theta));
  };

  Transform.prototype.rotateY = function(theta) {
    this.m =
        multiplyAffine(makeRotateAffineY(theta), this.m);
  };
  Transform.prototype.rotateYPre = function(theta) {
    this.m =
        multiplyAffine(this.m, makeRotateAffineY(theta));
  };

  Transform.prototype.rotateZ = function(theta) {
    this.m =
        multiplyAffine(makeRotateAffineZ(theta), this.m);
  };
  Transform.prototype.rotateZPre = function(theta) {
    this.m =
        multiplyAffine(this.m, makeRotateAffineZ(theta));
  };

  Transform.prototype.translate = function(dx, dy, dz) {
    this.m =
        multiplyAffine(makeTranslateAffine(dx, dy, dz), this.m);
  };
  Transform.prototype.translatePre = function(dx, dy, dz) {
    this.m =
        multiplyAffine(this.m, makeTranslateAffine(dx, dy, dz));
  };

  Transform.prototype.scale = function(sx, sy, sz) {
    this.m =
        multiplyAffine(makeScaleAffine(sx, sy, sz), this.m);
  };

  Transform.prototype.scalePre = function(sx, sy, sz) {
    this.m =
        multiplyAffine(this.m, makeScaleAffine(sx, sy, sz));
  };

  Transform.prototype.transformPoint = function(p) {
    return transformPoint(this.m, p);
  };

  Transform.prototype.multTransform = function(t) {
    this.m = multiplyAffine(this.m, t.m);
  };

  Transform.prototype.setDCM = function(u, v, w) {
    var m = this.m;
    m.e0 = u.x; m.e4 = u.y; m.e8 = u.z;
    m.e1 = v.x; m.e5 = v.y; m.e9 = v.z;
    m.e2 = w.x; m.e6 = w.y; m.e10 = w.z;
  };

  Transform.prototype.dup = function() {
    // TODO(deanm): This should be better.
    var tm = new Transform();
    tm.m = dupAffine(this.m);
    return tm;
  };
  
  
  function normalize(axis) {
	  var scale = 1 / vecMag3d(axis);
	  return { x: axis.x * scale, y: axis.y * scale, z: axis.z * scale };
  }
  
  Transform.prototype.rotateAroundAxis = function(axis, angle) {
	  var e = normalize(axis);
	  this.m = multiplyAffine(makeAxisAngleRotationAffine(e, angle), this.m);
  };

  // Transform and return a new array of points with transform matrix |t|.
  function transformPoints(t, ps) {
    var il = ps.length;
    var out = Array(il);
    for (var i = 0; i < il; ++i) {
      out[i] = transformPoint(t, ps[i]);
    }
    return out;
  }

  // Average a list of points, returning a new "centroid" point.
  function averagePoints(ps) {
    var avg = {x: 0, y: 0, z: 0};
    for (var i = 0, il = ps.length; i < il; ++i) {
      var p = ps[i];
      avg.x += p.x;
      avg.y += p.y;
      avg.z += p.z;
    }

    // TODO(deanm): 1 divide and 3 multiplies cheaper than 3 divides?
    var f = 1 / il;

    avg.x *= f;
    avg.y *= f;
    avg.z *= f;

    return avg;
  }

  // Push a and b away from each other.  This means that the distance between
  // a and be should be greater, by 2 units, 1 in each direction.
  function pushPoints2dIP(a, b) {
    var vec = unitVector2d(subPoints2d(b, a));
    if (isNaN(vec.x)) {
    	//sometimes b and a coincide
    	return;
    }
    addPoints2dIP(b, b, vec);
    subPoints2dIP(a, a, vec);
  }

  // RGBA is our simple representation for colors.
  function RGBA(r, g, b, a) {
    this.setRGBA(r, g, b, a);
  };

  RGBA.prototype.setRGBA = function(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  };

  RGBA.prototype.setRGB = function(r, g, b) {
    this.setRGBA(r, g, b, 1);
  };

  RGBA.prototype.invert = function() {
    this.r = 1 - this.r;
    this.g = 1 - this.g;
    this.b = 1 - this.b;
  };

  RGBA.prototype.dup = function() {
    return new RGBA(this.r, this.g, this.b, this.a);
  };

  // A QuadFace represents a polygon, either a four sided quad, or sort of a
  // degenerated quad triangle.  Passing null as i3 indicates a triangle.  The
  // QuadFace stores indices, which will generally point into some vertex list
  // that the QuadFace has nothing to do with.  At the annoyance of keeping
  // the data up to date, QuadFace stores a pre-calculated centroid and two
  // normals (two triangles in a quad).  This is an optimization for rendering
  // and procedural operations, and you must set them correctly.
  function QuadFace(i0, i1, i2, i3) {
    this.i0 = i0;
    this.i1 = i1;
    this.i2 = i2;
    this.i3 = i3;

    this.centroid = null;
    this.normal1 = null;
    this.normal2 = null;
  }

  QuadFace.prototype.isTriangle = function() {
    return (this.i3 === null);
  };

  QuadFace.prototype.setQuad = function(i0, i1, i2, i3) {
    this.i0 = i0;
    this.i1 = i1;
    this.i2 = i2;
    this.i3 = i3;
  };

  QuadFace.prototype.setTriangle = function(i0, i1, i2) {
    this.i0 = i0;
    this.i1 = i1;
    this.i2 = i2;
    this.i3 = null;
  };

  var TRANSPARENT = new RGBA(1, 1, 1, 0);
  // A Shape represents a mesh, a collection of QuadFaces.  The Shape stores
  // a list of all vertices (so they can be shared across QuadFaces), and the
  // QuadFaces store indices into this list.
  //
  // All properties of shapes are meant to be public, so access them directly.
  function Shape() {
    // Array of 3d points, our vertices.
    this.vertices = [ ];
    // Array of QuadFaces, the indices will point into |vertices|.
    this.quads = [ ];
    this.fillColor = TRANSPARENT;
    this.strokeColor = TRANSPARENT;
  }

  // A curve represents a bezier curve, either quadratic or cubic.  It is
  // the QuadFace equivalent for 3d paths.  Like QuadFace, the points are
  // indices into a Path.
  function Curve(ep, c0, c1) {
    this.ep = ep;  // End point.
    this.c0 = c0;  // Control point.
    this.c1 = c1;  // Control point.
  }

  Curve.prototype.isQuadratic = function() {
    return (this.c1 === null);
  };

  Curve.prototype.setQuadratic = function(ep, c0) {
    this.ep = ep;
    this.c0 = c0;
    this.c1 = null;
  };

  Curve.prototype.setCubic = function(ep, c0, c1) {
    this.ep = ep;
    this.c0 = c0;
    this.c1 = c1;
  };
  
  function Wireframe() {
	  this.points = [];
	  this.lines = [];
  }

  // A path is a collection of Curves.  The path starts implicitly at
  // (0, 0, 0), and then continues along each curve, each piece of curve
  // continuing where the last left off, forming a continuous path.
  function Path() {
    // An array of points.
    this.points = [ ];
    // The Curves index into points.
    this.curves = [ ];
    // Optional starting point.  If this is null, the path will start at the
    // origin (0, 0, 0).  Otherwise this is an index into points.
    this.starting_point = null;
  }

  // A camera is represented by a transform, and a focal length.
  function Camera() {
    this.transform = new Transform();
    this.focal_length = 1;
  }

  // TextureInfo is used to describe when and how a QuadFace should be
  // textured.  |image| should be something drawable by <canvas>, like a <img>
  // or another <canvas> element.  This also stores the 2d uv coordinates.
  function TextureInfo() {
    this.image = null;
    this.u0 = null;
    this.v0 = null;
    this.u1 = null;
    this.v1 = null;
    this.u2 = null;
    this.v2 = null;
    this.u3 = null;
    this.v3 = null;
  };

  // This is the guts, drawing 3d onto a <canvas> element.  This class does a
  // few things:
  //   - Manage the render state, things like colors, transforms, camera, etc.
  //   - Manage a buffer of quads to be drawn.  When you add something to be
  //     drawn, it will use the render state at the time it was added.  The
  //     pattern is generally to add some things, modify the render state, add
  //     some more things, change some colors, add some more, than draw.
  //     NOTE: The reason for buffering is having to z-sort.  We do not perform
  //     the rasterization, so something like a z-buffer isn't applicable.
  //   - Draw the buffer of things to be drawn.  This will do a background
  //     color paint, render all of the buffered quads to the screen, etc.
  //
  // NOTE: Drawing does not clear the buffered quads, so you can keep drawing
  // and adding more things and drawing, etc.  You must explicitly empty the
  // things to be drawn when you want to start fresh.
  //
  // NOTE: Some things, such as colors, as copied into the buffered state as
  // a reference.  If you want to update the color on the render state, you
  // should replace it with a new color.  Modifying the original will modify
  // it for objects that have already been buffered.  Same holds for textures.
  function Renderer(canvas_element) {
    // Should we z-sort for painters back to front.
    this.perform_z_sorting = true;
    // Should we inflate quads to visually cover up antialiasing gaps.
    this.draw_overdraw = true;
    // Should we skip backface culling.
    this.draw_backfaces = false;
    
    // whether to do perspective projection or isometric projection
    this.orthographicProjection = false;
    
    this.orthographicScale = 320;

    this.texture = null;
    this.fill_rgba = new RGBA(1, 0, 0, 1);

    this.stroke_rgba = null;

    this.normal1_rgba = null;
    this.normal2_rgba = null;

    this.canvas = canvas_element;
    this.ctx = canvas_element.getContext('2d');

    // The camera.
    this.camera = new Camera();

    // Object to world coordinates transformation.
    this.transform = new Transform();

    // Used for pushTransform and popTransform.  The current transform is
    // always r.transform, and the stack holds anything else.  Internal.
    this.transform_stack_ = [ ];

    // A callback before a QuadFace is processed during bufferShape.  This
    // allows you to change the render state per-quad, and also to skip a quad
    // by returning true from the callback.  For example:
    //   renderer.quad_callback = function(quad_face, quad_index, shape) {
    //     renderer.fill_rgba.r = quad_index * 40;
    //     return false;  // Don't skip this quad.
    //   };
    this.quad_callback = null;

    // Internals, don't access me.
    this.width_  = canvas_element.width;
    this.height_ = canvas_element.height;
    this.scale_ = this.height_ / 2;
    this.xoff_ = this.width_ / 2;

    this.buffered_quads_ = null;
    this.emptyBuffer();

    // We prefer these functions as they avoid the CSS color parsing path, but
    // if they're not available (Firefox), then augment the ctx to fall back.
    if (this.ctx.setStrokeColor == null) {
      this.ctx.setStrokeColor = function setStrokeColor(r, g, b, a) {
        var rgba = [
          Math.floor(r * 255),
          Math.floor(g * 255),
          Math.floor(b * 255),
          a
        ];
        this.strokeStyle = 'rgba(' + rgba.join(',') + ')';
      }
    }
    if (this.ctx.setFillColor == null) {
      this.ctx.setFillColor = function setFillColor(r, g, b, a) {
        var rgba = [
          Math.floor(r * 255),
          Math.floor(g * 255),
          Math.floor(b * 255),
          a
        ];
        this.fillStyle = 'rgba(' + rgba.join(',') + ')';
      }
    }
  }

  Renderer.prototype.pushTransform = function() {
    this.transform_stack_.push(this.transform.dup());
  };

  Renderer.prototype.popTransform = function() {
    // If the stack is empty we'll end up with undefined as the transform.
    this.transform = this.transform_stack_.pop();
  };

  Renderer.prototype.emptyBuffer = function() {
    this.buffered_quads_ = [ ];
  };

  /**
   * The projection transform did most of the work
   */
  Renderer.prototype.projectPointToCanvas = function projectPointToCanvas(p) {
    // We're looking down the z-axis in the negative direction...
	var z = p.z;
	if (z > 0) {
		return null;
	}
	return {x: p.x / z, y: p.y / z};
  };

  /**
   * Project a series of points
   */
  Renderer.prototype.projectPointsToCanvas =
      function projectPointsToCanvas(ps) {
    var il = ps.length;
    var out = Array(il);
    for (var i = 0; i < il; ++i) {
    	var p = ps[i];
	   	out[i] = {x: p.x / p.z, y: p.y / p.z};
    }
    return out;
  };
  
  /**
   * Do pretty much the same as projectPointsToCanvas, except
   * return null if one of the points is behind the camera. This
   * should be used if the points are part of the same object.
   * Ideally, one would compute the intersection of various objects with the
   * camera (focal) plane...
   */
  Renderer.prototype.projectPointsToCanvas2 =
      function projectPointsToCanvas2(ps) {
    var il = ps.length;
    var out = Array(il);
    for (var i = 0; i < il; ++i) {
    	var p = ps[i];
    	if (p.z < 0) {
	    	out[i] = {x: p.x / p.z, y: p.y / p.z};
    	}
    	else {
    		return null;
    	}
    }
    return out;
  };
  
  /**
   * Do pretty much the same as projectPointsToCanvas, except
   * a null value is placed for each of the points behind the camera. This
   * should be used when drawing independent points
   */
  Renderer.prototype.projectPointsToCanvas3 =
      function projectPointsToCanvas3(ps) {
    var il = ps.length;
    var out = Array(il);
    for (var i = 0; i < il; ++i) {
    	var p = ps[i];
    	if (p.z < 0) {
	    	out[i] = {x: p.x / p.z, y: p.y / p.z};
    	}
    	else {
    		out[i] = null;
    	}
    }
    return out;
  };

  Renderer.prototype.projectQuadFaceToCanvasIP = function(qf) {
    qf.i0 = this.projectPointToCanvas(qf.i0);
    qf.i1 = this.projectPointToCanvas(qf.i1);
    qf.i2 = this.projectPointToCanvas(qf.i2);
    if (!qf.isTriangle())
      qf.i3 = this.projectPointToCanvas(qf.i3);
    return qf;
  };

  // Textured triangle drawing by Thatcher Ulrich.  Draw a triangle portion of
  // an image, with the source (uv coordinates) mapped to screen x/y
  // coordinates.  A transformation matrix for this mapping is calculated, so
  // that the image |im| is rotated / scaled / etc to map to the x/y dest.  A
  // clipping mask is applied when drawing |im|, so only the triangle is drawn.
  function drawCanvasTexturedTriangle(ctx, im,
                                      x0, y0, x1, y1, x2, y2,
                                      sx0, sy0, sx1, sy1, sx2, sy2) {
    ctx.save();

    // Clip the output to the on-screen triangle boundaries.
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.clip();

    var denom =
        sx0 * (sy2 - sy1) -
        sx1 * sy2 +
        sx2 * sy1 +
        (sx1 - sx2) * sy0;

    var m11 = - (
        sy0 * (x2 - x1) -
        sy1 * x2 +
        sy2 * x1 +
        (sy1 - sy2) * x0) / denom;
    var m12 = (
        sy1 * y2 +
        sy0 * (y1 - y2) -
        sy2 * y1 +
        (sy2 - sy1) * y0) / denom;
    var m21 = (
        sx0 * (x2 - x1) -
        sx1 * x2 +
        sx2 * x1 +
        (sx1 - sx2) * x0) / denom;
    var m22 = - (
        sx1 * y2 +
        sx0 * (y1 - y2) -
        sx2 * y1 +
        (sx2 - sx1) * y0) / denom;
    var dx = (
        sx0 * (sy2 * x1 - sy1 * x2) +
        sy0 * (sx1 * x2 - sx2 * x1) +
        (sx2 * sy1 - sx1 * sy2) * x0) / denom;
    var dy = (
        sx0 * (sy2 * y1 - sy1 * y2) +
        sy0 * (sx1 * y2 - sx2 * y1) +
        (sx2 * sy1 - sx1 * sy2) * y0) / denom;

    ctx.transform(m11, m12, m21, m22, dx, dy);

    // Draw the whole image.  Transform and clip will map it onto the
    // correct output triangle.
    //
    // TODO(tulrich): figure out if drawImage goes faster if we specify the
    // rectangle that bounds the source coords.
    ctx.drawImage(im, 0, 0);
    ctx.restore();
  }

  // A unit vector down the z-axis.
  var g_z_axis_vector = {x: 0, y: 0, z: 1};

  // Put a shape into the draw buffer, transforming it by the current camera,
  // applying any current render state, etc.
  Renderer.prototype.bufferShape = function bufferShape(shape) {
    var quad_callback = this.quad_callback;

    // Our vertex transformation matrix.
    var t = this.precomputedTransform;
    // Our normal transformation matrix.
    var tn = this.precomputedAdjoint;
    var tnp = this.precomputedTransformNoProjection;

    // We are transforming the points even if we decide it's back facing.
    // We could just transform the normal, and then only transform the
    // points if we needed it.  But then you need to check to see if the
    // point was already translated to avoid duplicating work, or just
    // always calculate it and duplicate the work.  Not sure what's best...
    var world_vertices = transformPoints(t, shape.vertices);
    var quads = shape.quads;
    
    var al = this.ambientLight;
    if (!al) {
  	  	al = 0;
    }

    for (var j = 0, jl = shape.quads.length; j < jl; ++j) {
      var qf = quads[j];

      // Call the optional quad callback.  This gives a chance to update the
      // render state per-quad, before we emit into the buffered quads.  It
      // also gives the earliest chance to skip a quad.
      if (quad_callback !== null && quad_callback(qf, j, shape) === true)
        continue;

      var centroid = transformPoint(tnp, qf.centroid);

      // Cull quads that are behind the camera.
      // TODO(deanm): this should probably involve the focal point?
      if (centroid.z > 0) {
        continue;
      }
      // NOTE: The transform tn isn't going to always keep the vectors unit
      // length, so n1 and n2 should be normalized if needed.
      // We unit vector n1 (for lighting, etc).
      var n1 = unitVector3d(transformPoint(tn, qf.normal1));
      var n2 = transformPoint(tn, qf.normal2);

      // Backface culling.  I'm not sure the exact right way to do this, but
      // this seems to look ok, following the eye from the origin.  We look
      // at the normals of the triangulated quad, and make sure at least one
      // is point towards the camera...
      if (shape.drawBackFaces === false &&
          dotProduct3d(centroid, n1) > 0 &&
          dotProduct3d(centroid, n2) > 0) {
        continue;
      }
      
	  // Lighting intensity is just based on just one of the normals pointing
	  // towards the camera.  Should do something better here someday...
	  var intensity = dotProduct3d(g_z_axis_vector, n1);
      if (intensity < 0) {
    	// double sided materials
    	intensity = -intensity;
      }
      intensity = intensity * (1 - al) + al;
	
      if (qf.isTriangle() === true) {
        world_qf = new QuadFace(qf.i0, qf.i1, qf.i2, null);
      } 
      else {
        world_qf = new QuadFace(qf.i0, qf.i1, qf.i2, qf.i3);
      }

      world_qf.centroid = centroid;
      world_qf.normal1 = n1;
      world_qf.normal2 = n2;

      var obj = {
        qf: world_qf,
        v: world_vertices,
        lines: shape.lines,
        intensity: intensity,
        draw_overdraw: this.draw_overdraw || shape.drawOverdraw,
        texture: this.texture,
        fill_rgba: shape.fillColor,
        stroke_rgba: shape.strokeColor,
      };

      this.buffered_quads_.push(obj);
    }
  };

  // Sort an array of points by z axis.
  function zSorter(x, y) {
    return x.qf.centroid.z - y.qf.centroid.z;
  }

  // Paint the background.  You should setup the fill color on ctx.
  Renderer.prototype.drawBackground = function() {
    this.ctx.fillRect(0, 0, this.width_, this.height_);
  };

  // Clear the background so the canvas is transparent.
  Renderer.prototype.clearBackground = function() {
    this.ctx.clearRect(0, 0, this.width_, this.height_);
  };
  
  Renderer.prototype.createOffscreenBuffer = function() {
	this.img = this.ctx.createImageData(this.width_, this.height_);
	this.imgdata = this.img.data;
  };
  
  Renderer.prototype.renderOffscreenBuffer = function() {
	  this.ctx.putImageData(this.img, 0, 0);
  };
  
  function get8BitStrokeColor(c) {
	  return {r: Math.round(c.r * 255), g: Math.round(c.g * 255), b: Math.round(c.b * 255), a: Math.round(c.a * 255)};
  }
  
  Renderer.prototype.iLine = function iLine(x1, y1, x2, y2, color) {
	    var color = get8BitStrokeColor(color);
	    var idata = this.imgdata;
		var w4 = this.width_ * 4;
		x1 = Math.round(x1);
		x2 = Math.round(x2);
		y1 = Math.round(y1);
		y2 = Math.round(y2);
	    var dx = x2 - x1; var sx = 1;
	    var dy = y2 - y1; var sy = 1;
	    var six = 4;
	    var siy = w4;
	    
	    if (dx < 0) {
	        sx = -1;
	        six = -4;
	        dx = -dx;
	    }
	    if (dy < 0) {
	        sy = -1;
	        siy = -w4;
	        dy = -dy;
	    }
	    
	    dx = dx << 1;
	    dy = dy << 1;
	    var ix = w4 * y1 + x1 * 4;
	    idata[ix] = color.r;
	    idata[ix+1] = color.g;
	    idata[ix+2] = color.b;
	    idata[ix+3] = color.a;
	    
	    if (dy < dx) {
	        var fraction = dy - (dx>>1);
	        while (x1 != x2) {
	            if (fraction >= 0) {
	                ix += siy;
	                fraction -= dx;
	            }
	            fraction += dy;
	            x1 += sx;
	            ix += six;
	            idata[ix] = color.r;
	    	    idata[ix+1] = color.g;
	    	    idata[ix+2] = color.b;
	    	    idata[ix+3] = color.a;
	        }
	    } 
	    else {
	        var fraction = dx - (dy>>1);
	        while (y1 != y2) {
	            if (fraction >= 0) {
	                ix += six;
	                fraction -= dy;
	            }
	            fraction += dx;
	            y1 += sy;
	            ix += siy;
	            idata[ix] = color.r;
	    	    idata[ix+1] = color.g;
	    	    idata[ix+2] = color.b;
	    	    idata[ix+3] = color.a;
	        }
	    }
	}

  Renderer.prototype.drawBuffer = function drawBuffer() {
    var ctx = this.ctx;

    var all_quads = this.buffered_quads_;
    var num_quads = all_quads.length;

    // Sort the quads by z-index for painters algorithm :(
    // We're looking down the z-axis in the negative direction, so we want
    // to paint the most negative z quads first.
    if (this.perform_z_sorting === true)
      all_quads.sort(zSorter);
    
    var csrgba = null;

    for (var j = 0; j < num_quads; ++j) {
      var obj = all_quads[j];
      var qf = obj.qf;
      
      var wv = this.projectPointsToCanvas(obj.v);

      var is_triangle = qf.isTriangle();
      var wp0 = wv[qf.i0];
      var wp1 = wv[qf.i1];
      var wp2 = wv[qf.i2];
      if (!is_triangle) {
    	  var wp3 = wv[qf.i3];
      }

      if (obj.draw_overdraw === true) {
        // Unfortunately when we fill with canvas, we can get some gap looking
        // things on the edges between quads.  One possible solution is to
        // stroke the path, but this turns out to be really expensive.  Instead
        // we try to increase the area of the quad.  Each edge pushes its
        // vertices away from each other.  This is sort of similar in concept
        // to the builtin canvas shadow support (shadowOffsetX, etc).  However,
        // Chrome doesn't support shadows correctly now.  It does in trunk, but
        // using shadows to fill the gaps looks awful, and also seems slower.

        pushPoints2dIP(wp0, wp1);
        pushPoints2dIP(wp1, wp2);
        if (is_triangle === true) {
          pushPoints2dIP(wp2, wp0);
        } else {  // Quad.
          pushPoints2dIP(wp2, wp3);
          pushPoints2dIP(wp3, wp0);
        }
      }

      // Create our quad as a <canvas> path.
      ctx.beginPath();
      ctx.moveTo(wp0.x, wp0.y);
      ctx.lineTo(wp1.x, wp1.y);
      ctx.lineTo(wp2.x, wp2.y);
      if (is_triangle !== true)
        ctx.lineTo(wp3.x, wp3.y);
      // Don't bother closing it unless we need to.

      // Fill...
      var frgba = obj.fill_rgba;
      if (frgba !== null) {
        var iy = obj.intensity;
        ctx.setFillColor(frgba.r * iy, frgba.g * iy, frgba.b * iy, frgba.a);
        ctx.fill();
      }

      // Texturing...
      /*if (obj.texture !== null) {
    	var texture = obj.texture;
        drawCanvasTexturedTriangle(ctx, texture.image,
        	wp0.x, wp0.y, wp1.x, wp1.y, wp2.x, wp2.y,
        	texture.u0, texture.v0, texture.u1, texture.v1,
        	texture.u2, texture.v2);
        if (!is_triangle) {
          drawCanvasTexturedTriangle(ctx, texture.image,
        	wp0.x, wp0.y, wp2.x, wp2.y, wp3.x, wp3.y,
            texture.u0, texture.v0, texture.u2, texture.v2,
            texture.u3, texture.v3);
        }
      }*/

      // Stroke...
      var srgba = obj.stroke_rgba;
      if (srgba !== null) {
    	ctx.closePath();
   		ctx.setStrokeColor(srgba.r, srgba.g, srgba.b, srgba.a);
        if (obj.lines != null) {
        	ctx.beginPath();
			var vlines = obj.lines;
			 
			for (var k = 0; k < vlines.length; k++) {
				var line = vlines[k];
				var p1 = wv[line.v1];
				var p2 = wv[line.v2];
				if (p1 === null || p2 === null) {
					continue;
				}
				ctx.moveTo(p1.x, p1.y);
				ctx.lineTo(p2.x, p2.y);
				//this.iLine(p1.x, p1.y, p2.x, p2.y, srgba);
			}
			ctx.stroke();
		}
        else {
        	ctx.stroke();
        }
      }
    }

    return num_quads;
  }

  
  // Draw a Path.  There is no buffering, because there is no culling or
  // z-sorting.  There is currently no filling, paths are only stroked.  To
  // control the render state, you should modify ctx directly, and set whatever
  // properties you want (stroke color, etc).  The drawing happens immediately.
  Renderer.prototype.drawPath = function drawPath(path, opts) {
    var ctx = this.ctx;
    var opts = opts || { };

    var screen_points = this.projectPointsToCanvas3(
        transformPoints(this.precomputedTransform, path.points));

    // Start the path at (0, 0, 0) unless there is an explicit starting point.
    var start_point = (path.starting_point === null ?
        this.projectPointToCanvas(transformPoint(t, {x: 0, y: 0, z: 0})) :
        screen_points[path.starting_point]);
    
    if (start_point === null) {
    	return;
    }
    ctx.beginPath();
    ctx.moveTo(start_point.x, start_point.y);

    var curves = path.curves;
    for (var j = 0, jl = curves.length; j < jl; ++j) {
      var curve = curves[j];
      if (curve.isQuadratic() === true) {
        var c0 = screen_points[curve.c0];
        var ep = screen_points[curve.ep];
        if (ep === null) {
        	break;
        }
        if (c0 === null) {
        	ctx.moveTo(ep.x, ep.y);
        	continue;
        }
        ctx.quadraticCurveTo(c0.x, c0.y, ep.x, ep.y);
      } else {
        var c0 = screen_points[curve.c0];
        var c1 = screen_points[curve.c1];
        var ep = screen_points[curve.ep];
        if (ep === null) {
        	break;
        }
        if (c0 === null || c1 === null) {
        	ctx.moveTo(ep.x, ep.y);
        	continue;
        }
        ctx.bezierCurveTo(c0.x, c0.y, c1.x, c1.y, ep.x, ep.y);
      }
    }
    if (path.drawEndPoints) {
    	square(ctx, start_point);
    	square(ctx, screen_points[curves[curves.length - 1].ep]);
    }
    // We've connected all our Curves into a <canvas> path, now draw it.
    if (opts.fill === true) {
      ctx.fill();
    } else {
      ctx.stroke();
    }
  };
  
  Renderer.prototype.drawCurve = function drawCurve(c) {
	  var ctx = this.ctx;

	  var p1 = this.projectPointToCanvas(
		        transformPoint(this.precomputedTransform, c.p1));
	  var p2 = this.projectPointToCanvas(
		        transformPoint(this.precomputedTransform, c.p2));
	  var d1 = this.projectPointToCanvas(
		        transformPoint(this.precomputedTransform, c.d1));
	  var quadratic = c.d2 === null;
	  if (!quadratic) {
		  var d2 = this.projectPointToCanvas(
				transformPoint(this.precomputedTransform, c.d2));
	  }
	  if (p1 === null || p2 === null || d1 === null || (d2 === null && !quadratic)) {
		  return;
	  }
	  
	  ctx.beginPath();
	  ctx.moveTo(p1.x, p1.y);
	  if (quadratic) {
		  ctx.quadraticCurveTo(d1.x, d1.y, p2.x, p2.y);
	  }
	  else {
		  ctx.bezierCurveTo(d1.x, d1.y, d2.x, d2.y, p2.x, p2.y);
	  }
	  square(ctx, p1);
	  square(ctx, p2);
	  ctx.stroke();
  }
  
  function cross(ctx, sp) {
	  ctx.moveTo(sp.x - 4, sp.y);
	  ctx.lineTo(sp.x + 4, sp.y);
	  ctx.moveTo(sp.x, sp.y - 4);
	  ctx.lineTo(sp.x, sp.y + 4);
  }
  
  function square(ctx, sp) {
	  ctx.moveTo(sp.x - 2, sp.y - 2);
	  ctx.lineTo(sp.x + 2, sp.y - 2);
	  ctx.lineTo(sp.x + 2, sp.y + 2);
	  ctx.lineTo(sp.x - 2, sp.y + 2);
	  ctx.lineTo(sp.x - 2, sp.y - 2);
  }
  
  Renderer.prototype.drawRect = function drawRect(vs) {
	  var ctx = this.ctx;
	  var vpt = this.projectPointsToCanvas2(transformPoints(this.precomputedTransform, vs));
	  if (vpt === null) {
		  return;
	  }
	  
	  ctx.beginPath();
	  ctx.moveTo(vpt[0].x, vpt[0].y);
	  ctx.lineTo(vpt[1].x, vpt[1].y);
	  ctx.lineTo(vpt[2].x, vpt[2].y);
	  ctx.lineTo(vpt[3].x, vpt[3].y);
	  ctx.lineTo(vpt[0].x, vpt[0].y);
	  ctx.stroke();
  };
  
  Renderer.prototype.drawLine = function drawLine(start, end) {
	    var ctx = this.ctx;

	    var sp = this.projectPointToCanvas(
	        transformPoint(this.precomputedTransform, start));
	    var ep = this.projectPointToCanvas(
		        transformPoint(this.precomputedTransform, end));
	    if (sp === null || ep === null) {
	    	return;
	    }

	    ctx.beginPath();
	    ctx.moveTo(sp.x, sp.y);
    	ctx.lineTo(ep.x, ep.y);
    	ctx.stroke();
	  };
	  
	  Renderer.prototype.drawLineWithCaps = function drawLineWithCaps(start, end, caps) {
		    var ctx = this.ctx;
		    var sp = this.projectPointToCanvas(
		        transformPoint(this.precomputedTransform, start));
		    var ep = this.projectPointToCanvas(
			        transformPoint(this.precomputedTransform, end));
		    if (sp === null || ep === null) {
		    	return;
		    }

		    ctx.beginPath();
		    ctx.moveTo(sp.x, sp.y);
	    	ctx.lineTo(ep.x, ep.y);
	    	if (caps == "+") {
	    		ctx.moveTo(sp.x - 2, sp.y);
	    		ctx.lineTo(sp.x + 2, sp.y);
	    		ctx.moveTo(sp.x, sp.y - 2);
	    		ctx.lineTo(sp.x, sp.y + 2);
	    		ctx.moveTo(ep.x - 2, ep.y);
	    		ctx.lineTo(ep.x + 2, ep.y);
	    		ctx.moveTo(ep.x, ep.y - 2);
	    		ctx.lineTo(ep.x, ep.y + 2);
	    	}
	    	else if (caps == "square") {
	    		ctx.moveTo(sp.x - 2, sp.y - 2);
	    		ctx.lineTo(sp.x + 2, sp.y - 2);
	    		ctx.lineTo(sp.x + 2, sp.y + 2);
	    		ctx.lineTo(sp.x - 2, sp.y + 2);
	    		ctx.lineTo(sp.x - 2, sp.y - 2);
	    		ctx.moveTo(ep.x - 2, ep.y - 2);
	    		ctx.lineTo(ep.x + 2, ep.y - 2);
	    		ctx.lineTo(ep.x + 2, ep.y + 2);
	    		ctx.lineTo(ep.x - 2, ep.y + 2);
	    		ctx.lineTo(ep.x - 2, ep.y - 2);
	    	}
	    	ctx.stroke();
		  };
		  
	Renderer.prototype.drawWireframe = function drawWireframe(frame) {
		var ctx = this.ctx;
	    var vpt = this.projectPointsToCanvas3(transformPoints(this.precomputedTransform, frame.points));
	    var lines = frame.lines;
	    
	    ctx.beginPath();
	    
	    for (var i = 0; i < lines.length; i++) {
	    	var l = lines[i];
	    	var p1 = vpt[l.p1];
	    	var p2 = vpt[l.p2];
	    	if (p1 === null || p2 === null) {
	    		continue;
	    	}
	    	ctx.moveTo(p1.x, p1.y);
	    	ctx.lineTo(p2.x, p2.y);
	    }
	    ctx.stroke();
	}
	  
	  Renderer.prototype.drawLines = function drawLines(lines) {
		    var ctx = this.ctx;
		    var pt = this.precomputedTransform;

		    ctx.beginPath();
		    for (var i = 0; i < lines.length; i++) {
		    	var sp = this.projectPointToCanvas(transformPoint(pt, lines[i].p1));
		    	var ep = this.projectPointToCanvas(transformPoint(pt, lines[i].p2));
		    	if (sp === null || ep === null) {
			    	continue;
			    }
		    	ctx.moveTo(sp.x, sp.y);
		    	ctx.lineTo(ep.x, ep.y);
		    }
		    ctx.stroke();
		  };
		  
	Renderer.prototype.drawLines2 = function drawLines2(spa, epa) {
			    var ctx = this.ctx;
			    var pt = this.precomputedTransform;
			    var sp = this.projectPointsToCanvas(transformPoints(pt, spa));
			    var ep = this.projectPointsToCanvas(transformPoints(pt, epa));
			    if (sp === null || ep === null) {
			    	return;
			    }

			    ctx.beginPath();
			    for (var i = 0; i < sp.length; i++) {
			    	ctx.moveTo(sp[i].x, sp[i].y);
			    	ctx.lineTo(ep[i].x, ep[i].y);
			    }
			    ctx.stroke();
			  };
	    
  Renderer.prototype.precomputeTransform = function precomputeTransform() {
	  var pt;
	  if (this.orthographicProjection) {
		  var s = -this.camera.focal_length / this.camera.transform.m.e11;
		  if (s < 0) {
			  s = 0;
		  }
		  pt = makeOrthographicProjectionAffine(this.orthographicScale * s, this.xoff_, this.scale_);
	  }
	  else {
		  pt = makePerspectiveProjectionAffine(this.camera.focal_length, this.xoff_, this.scale_);
	  }
	  this.precomputedTransformNoProjection = multiplyAffine(this.camera.transform.m, this.transform.m);
	  this.precomputedAdjoint = transAdjoint(this.precomputedTransformNoProjection);
	  this.precomputedTransform = multiplyAffine(pt, this.precomputedTransformNoProjection);
  }
  
  Renderer.prototype.drawPoint = function drawPoint(p3d, shape) {
	    var ctx = this.ctx;

	    var sp = this.projectPointToCanvas(
	        transformPoint(this.precomputedTransform, p3d));
	    
	    if (sp === null) {
	    	return;
	    }

	    ctx.beginPath();
	    if (shape == "x") {
	    	ctx.moveTo(sp.x - 3, sp.y - 3);
	    	ctx.lineTo(sp.x + 3, sp.y + 3);
	    	ctx.moveTo(sp.x - 3, sp.y + 3);
	    	ctx.lineTo(sp.x + 3, sp.y - 3);
	    	ctx.stroke();
	    }
	    else if (shape == "+") {
	    	ctx.moveTo(sp.x - 3, sp.y);
	    	ctx.lineTo(sp.x + 6, sp.y);
	    	ctx.moveTo(sp.x, sp.y + 3);
	    	ctx.lineTo(sp.x, sp.y - 3);
	    	ctx.stroke();
	    }
	    else if (shape == "square") {
	    	ctx.moveTo(sp.x - 3, sp.y - 3);
	    	ctx.lineTo(sp.x + 3, sp.y - 3);
	    	ctx.lineTo(sp.x + 3, sp.y + 3);
	    	ctx.lineTo(sp.x - 3, sp.y + 3);
	    	ctx.lineTo(sp.x - 3, sp.y - 3);
	    	ctx.stroke();
	    }
	    else if (shape == "circle" || shape == "disc") {
	    	ctx.arc(sp.x, sp.y, 3, 0, 360, false);
	    	if (shape == "circle") {
	    		ctx.stroke();
	    	}
	    	else {
	    		ctx.fill();
	    	}
	    }
	  };
	  
	  Renderer.prototype.drawText = function drawText(p3d, text) {
		    var ctx = this.ctx;

		    var sp = this.projectPointToCanvas(
		        transformPoint(this.precomputedTransform, p3d));
		    if (sp != null) {
		    	ctx.fillText(text, sp.x, sp.y);
		    }
		  };
	  
	  Renderer.prototype.drawPoints = function drawPoints(p3da, shape, start, end) {
		    var ctx = this.ctx;
		    if (start == null) {
		    	start = 0;
		    }
		    if (end == null) {
		    	end = p3da.length;
		    }

		    var spa = this.projectPointsToCanvas3(
		        transformPoints(this.precomputedTransform, p3da));

		    if (shape == "x") {
		    	ctx.beginPath();
		    	for (var i = start; i < end; i++) {
		    		var sp = spa[i];
		    		if (sp === null) {
		    			continue;
		    		}
		    		ctx.moveTo(sp.x - 3, sp.y - 3);
		    		ctx.lineTo(sp.x + 3, sp.y + 3);
		    		ctx.moveTo(sp.x - 3, sp.y + 3);
		    		ctx.lineTo(sp.x + 3, sp.y - 3);
		    	}
		    	var sc = this.strokeColor;
		    	ctx.stroke();
		    }
		    else if (shape == "+") {
		    	ctx.beginPath();
		    	for (var i = start; i < end; i++) {
		    		var sp = spa[i];
		    		if (sp === null) {
		    			continue;
		    		}
			    	ctx.moveTo(sp.x - 3, sp.y);
			    	ctx.lineTo(sp.x + 6, sp.y);
			    	ctx.moveTo(sp.x, sp.y + 3);
			    	ctx.lineTo(sp.x, sp.y - 3);
		    	}
		    	ctx.stroke();
		    }
		    else if (shape == "square") {
		    	for (var i = start; i < end; i++) {
		    		var sp = spa[i];
		    		if (sp === null) {
		    			continue;
		    		}
		    		ctx.strokeRect(sp.x - 3, sp.y - 3, 6, 6);
		    	}
		    }
		    else if (shape == "circle" || shape == "disc") {
		    	for (var i = start; i < end; i++) {
		    		var sp = spa[i];
		    		if (sp === null) {
		    			continue;
		    		}
		    		ctx.beginPath();
		    		ctx.arc(sp.x, sp.y, 3, 0, 360, false);
			    	if (shape == "circle") {
			    		ctx.stroke();
			    	}
			    	else {
			    		ctx.fill();
			    	}
		    	}
		    }
	  };


  return {
    RGBA: RGBA,
    AffineMatrix: AffineMatrix,
    Transform: Transform,
    QuadFace: QuadFace,
    Shape: Shape,
    Curve: Curve,
    Path: Path,
    Wireframe: Wireframe,
    Camera: Camera,
    TextureInfo: TextureInfo,
    Renderer: Renderer,
    Math: {
      crossProduct: crossProduct,
      dotProduct2d: dotProduct2d,
      dotProduct3d: dotProduct3d,
      subPoints2d: subPoints2d,
      subPoints3d: subPoints3d,
      addPoints2d: addPoints2d,
      addPoints3d: addPoints3d,
      mulPoint2d: mulPoint2d,
      mulPoint3d: mulPoint3d,
      vecMag2d: vecMag2d,
      vecMag3d: vecMag3d,
      unitVector2d: unitVector2d,
      unitVector3d: unitVector3d,
      linearInterpolate: linearInterpolate,
      linearInterpolatePoints3d: linearInterpolatePoints3d,
      averagePoints: averagePoints,
      normalize: normalize,
    },
  };
})();

