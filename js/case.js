
var fs  = require('fs')
var path = require("path");

const dir = path.resolve(process.cwd(),'../dayinfo')

if (!fs.existsSync(dir))
	fs.mkdirSync(dir)


function popup(content){

	const make2 = $(`
		<div class="popup">
			<div class="content">${content}</div>
		</div>
	`);

	let $maskClone2 = make2.clone()
	$(document.body).append($maskClone2);
	setTimeout(function () {
		$($maskClone2).addClass('disappear');
		setTimeout(function () {
			$maskClone2.remove();
		}, 1000);
	}, 1000);

 }

var camera, scene, renderer, pager, mask ,iframe ,detail;
var controls;

var objects = {};
var targets = { table: {}, sphere: {}, helix: {}, grid: {} };

const make = $('<div id="mask"></div>');

var scene = new THREE.Scene();

function priceSwitch(x) {

	x = String(x)

	//每三位用一个逗号隔开
	var leftNum = x.split(".")[0];

	//定义数组记录截取后的价格
	var resultArray = new Array();

	if (leftNum.length > 3) {
		var i = true;
		while (i) {
			resultArray.push(leftNum.slice(-3));
			leftNum = leftNum.slice(0, leftNum.length - 3);
			if (leftNum.length < 4) {
				i = false;
			}
		}
		//由于从后向前截取，所以从最后一个开始遍历并存到一个新的数组，顺序调换
		var sortArray = new Array();
		for (var i = resultArray.length - 1; i >= 0; i--) {
			sortArray.push(resultArray[i]);
		}
		x = `${leftNum},${sortArray.join(",")}`
	}

	return `￥${x}.00`
}


function shoudayinfo(that) {

	const startDate = document.getElementById('startDate')
	startDate.innerText = `${that.a} 至 ${that.b}`

	const supplementCount = document.getElementById('supplementCount')
	supplementCount.innerText = that.cc - that.aa - Object.keys(that.removeList).length

	const completeCount = document.getElementById('completeCount')
	completeCount.innerText = Object.keys(that.removeList).length

	const remainingCount = document.getElementById('remainingCount')
	remainingCount.innerText = that.aa

};

function datedifference(sDate1, sDate2) {
	var dateSpan,
		iDays;
		
	sDate1 = typeof sDate1 === 'string' ?  Date.parse(sDate1) : sDate1 ;
	sDate2 = typeof sDate2 ==='string' ? Date.parse(sDate2) : sDate2;
	dateSpan = sDate2 - sDate1;
	
	iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
	return iDays < 0 ? 0 : iDays
};

function initDetail({  author = 0, fun }){

	var dt = $(detail.clone());
	$('div.head h1', dt).text('信息详情');
	$('div.body table tr td span.img', dt).text('敬请期待!');
	$('div.body table tr td p', dt).text(`存储金额: ${priceSwitch(author)}`);
	$('div.body table tr td button', dt).text(`签到`).click(function (e) {
		e.stopPropagation();
		fun()
	})

	return dt.show();
}

function init(table , callback) {

	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 3000;


	$('#back').click(function(){
		pager.animate({left:'0%'},1000);
	});

	// table

	mask = $('<div id="mask"></div>');

	pager = $('#pager');

	iframe = $('#iframe');

	detail = $('#detail');

	Object.keys(table).forEach((i)=>{


		var tableTarget = table[i];

		var element = document.createElement( 'div' );
		element.className = 'element';
		element.style.backgroundColor = 'rgba(0,127,127,' + ( Math.random() * 0.5 + 0.25 ) + ')';
		element.detail = tableTarget['detail'];

		// 元素块名称
		var symbol = document.createElement( 'div' );
		symbol.className = 'symbol';
		symbol.textContent = tableTarget['name'];
		element.appendChild( symbol );

		var object = new THREE.CSS3DObject( element );
		object.position.x = Math.random() * 4000 - 2000;
		object.position.y = Math.random() * 4000 - 2000;
		object.position.z = Math.random() * 4000 - 2000;
		scene.add( object );

		objects[i] = object;

		var object = new THREE.Object3D();
		object.position.x = ( parseInt(Math.random()*19) * 140 ) - 1330;
		object.position.y = - ( parseInt(Math.random()*19) * 180 ) + 990;

		targets.table[i] = object;

	})

	// sphere

	var vector = new THREE.Vector3();

	Object.keys(objects).forEach((i) => {

		const l = Object.keys(objects).length


		var phi = Math.acos( -1 + ( 2 * i ) / l );
		var theta = Math.sqrt( l * Math.PI ) * phi;

		var object = new THREE.Object3D();

		object.position.x = 800 * Math.cos( theta ) * Math.sin( phi );
		object.position.y = 800 * Math.sin( theta ) * Math.sin( phi );
		object.position.z = 800 * Math.cos( phi );

		vector.copy( object.position ).multiplyScalar( 2 );

		object.lookAt( vector );

		targets.sphere[i]= object ;

	})

	// helix

	var vector = new THREE.Vector3();

	Object.keys(objects).forEach((i) => {

		var phi = i * 0.175 + Math.PI;

		var object = new THREE.Object3D();

		object.position.x = 900 * Math.sin( phi );
		object.position.y = - ( i * 8 ) + 450;
		object.position.z = 900 * Math.cos( phi );

		vector.x = object.position.x * 2;
		vector.y = object.position.y;
		vector.z = object.position.z * 2;

		object.lookAt( vector );

		targets.helix[i] = object ;

	})

	// grid

	Object.keys(objects).forEach((i) => {

		var object = new THREE.Object3D();

		object.position.x = ( ( i % 5 ) * 400 ) - 800;
		object.position.y = ( - ( Math.floor( i / 5 ) % 5 ) * 400 ) + 800;
		object.position.z = ( Math.floor( i / 25 ) ) * 1000 - 2000;

		targets.grid[i] = object;

	})


	//

	renderer = new THREE.CSS3DRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.domElement.style.position = 'absolute';
	document.getElementById( 'container' ).appendChild( renderer.domElement );

	//

	controls = new THREE.TrackballControls( camera, renderer.domElement );
	controls.rotateSpeed = 0.5;
	controls.minDistance = 500;
	controls.maxDistance = 6000;
	controls.addEventListener( 'change', render );

	var button = document.getElementById( 'table' );
	button.addEventListener( 'click', function ( event ) {

		transform('table', 2000 );

	}, false );

	var button = document.getElementById( 'sphere' );
	button.addEventListener( 'click', function ( event ) {

		transform('sphere', 2000 );

	}, false );

	var button = document.getElementById( 'helix' );
	button.addEventListener( 'click', function ( event ) {

		transform('helix', 2000 );

	}, false );

	var button = document.getElementById( 'grid' );
	button.addEventListener( 'click', function ( event ) {

		transform('grid', 2000 );

	}, false );

	var button = document.getElementById('getInfo');
	button.addEventListener('click', function (event) {

		callback()


	}, false);

	transform('grid', 5000 );

	//

	window.addEventListener( 'resize', onWindowResize, false );

}

function transform( target, duration ) {

	var targetaa = targets[target]
	

	TWEEN.removeAll();

	Object.keys(objects).forEach((i) => {

		var object = objects[ i ];
		var target = targetaa[ i ];

		new TWEEN.Tween( object.position )
			.to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
			.easing( TWEEN.Easing.Exponential.InOut )
			.start();

		new TWEEN.Tween( object.rotation )
			.to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
			.easing( TWEEN.Easing.Exponential.InOut )
			.start();

	})

	new TWEEN.Tween( this )
		.to( {}, duration * 2 )
		.onUpdate( render )
		.start();

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	render();

}

function animate() {

	requestAnimationFrame( animate );

	TWEEN.update();

	controls.update();

}

function render() {

	renderer.render( scene, camera );

}
