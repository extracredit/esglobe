//   url="iglobe.php/earth"+res[0]+".jpg";
var sz = args.sz;
var w = args.w;
var scalefac=args.scalefac;

var sph = {
    rot: rot,
    tilt: tilt,
    orient: orient,
    show: show,
    skip: 1,
    sphereClick: null,
    sphereDrag: null,
    mouseDown: null,
    mouseUp: null,
    url: null,
    res: null,
    baseurl: "graphics/",
    getcanvas: getcanvas,
    putcanvas: putcanvas,
    reload: reload,
    stop: stopSphere,
    latlon2xy: latlon2xy,
    xy2latlon: xy2latlon,
    pause:pauseSphere,
    notify:null,
};

if ("res" in args) {
    var res = args.res;
} else {
    var res = [2048, 1024];
}
if ("im" in args) {
    var url = rebase(args.im);
} else {
    var url = rebase("earth2048.jpg");
}
sph.url=url;
sph.res=res;

var movie=false;
var playing=true;
var mp4=false;
var vid;

var pi=3.1415926536;
var radtodeg=180.0/pi;
//var res=[1024,512];

var theta=pi;
var phi=0;
var rottheta=0;
var rotphi=0;

var simg;
var pg=false;

var sphereok=false;
var nSphere=0;
var currentFrame=0;

function rebase(nm){
    if(nm.startsWith("@g:")){
	console.log("get not implemented yet");
    }else if(nm.startsWith("@p:")){
	console.log("post not implemented yet");
    }else if(nm.startsWith("@")){
	nm="/esglobe/ht.php/"+nm.substr(1);
//	console.log("trans "+nm);
    }else if(!nm.startsWith("/")){
	nm=sph.baseurl+nm;
    };
//    console.log("rebase -> "+nm);
    return nm;
}

function convfn(fn,fnum){
    if(movie){
	p=fn.indexOf("#");
        z="0000";
        ns=fnum.toString();
        if (ns.length < 4) ns=z.substr(0,4-ns.length)+ns;
        nm=fn.substr(0,p)+ns+fn.substr(p+1);
    } else {
	nm=fn;
    };
    return nm;
}

function drawSphere(){
//    pg.image(simg,0,0,simg.width,simg.height,0,0,1024,512);
//    pg.strokeWeight(2);
//    pg.stroke(255,0,0);
//    pg.line(20,20,300,300);//x0,y0,x,y);
    if(mp4){
	texture(vid);
    } else {
	texture(pg);
    };
    rotateX(phi);
    rotateY(theta);
    ellipsoid(w,w,w,40,24);
    theta += rottheta;
}

function checkSphere(im){
    pg.image(im,0,0,im.width,im.height,0,0,res[0],res[1]);
    nSphere += skp;
    if(sph.notify)sph.notify(true);
    if(!movie) {
	sphereok=false;
	playing=false;
    } else {
	sphereok=true;
    };
}

function stopSphere(){
    console.log("stop "+imgnum+"\n");
    sphereok=false;
    playing=false;
    movie=false;
    mp4=false;
    if(vid)vid.stop();
    if(sph.notify)sph.notify(false);
}

// get an image with callback to draw it
function loadSphere(j) {
    imgnum=j+1;
    skp=sph.skip;
    console.log(convfn(url,j+1));
    if(j==0 || movie){
	sphereok=false;
	loadImage(convfn(url,j+1), checkSphere, stopSphere);
    };
}

var x0=0;
var y0=0;
var x00=0;
var y00=0;
var x_p=0;
var y_p=0;

function dragInSphere(mx,my){
    xz=mouse2xz(mx,my);
    if (xz[0]*xz[0]+xz[1]*xz[1]>1) return;
    if(sph.sphereDrag){
	latlon=xy2latlon(xz);
	r=sph.sphereDrag(xz,latlon);
	if (!r) return;
    };
    theta += 0.005*(mx-x0);
    phi += 0.005*(my-y0);
    rottheta=0;
    rotphi=0;
    x0=mx;
    y0=my;
    return;
}

function clickInSphere(mx,my){
    xz=mouse2xz(mx,my);
    if (xz[0]*xz[0]+xz[1]*xz[1]<=1){
	if(sph.sphereClick){
	    latlon=xy2latlon(xz);
	    sph.sphereClick(xz,latlon);
	};
//    } else {
//	if(sph.sphereClick){
//	    sph.sphereClick([-999,-999],[0,0]);
//	};
    };
//    var typ="u";
//    if (yt>0) typ="l";
//    if (xt>0) typ=typ+"r";
//    else typ=typ+"l";
//    clickOutside(typ);
    return false;
}

function mouse2xz(mx,my){
    xt = scalefac*(mx - sz / 2) / (sz / 2 - 20);
    zt = scalefac*(sz / 2 - my) / (sz / 2 - 20);
//    xt=(mx-sz/2)*2/sz;
//    zt=(sz/2-my)*2/sz;
//    console.log(mx+","+my+" =>  "+xt+","+zt);
    return [xt,zt];
}
function latlon2xy(latlon){
    lat=latlon[0];
    lon=latlon[1];
    if(lon<-180) lon +=360;
    if(lon>180) lon -=360;
    return [Math.round(10.0*(lon+180.0)/360.0*res[0])/10.0,
            Math.round(10.0*(90.0-lat)/180.0*res[1])/10.0];
}
function xy2latlon(xz){
    xt=xz[0];
    zt=xz[1];
    yt=-sqrt(abs(1-xt*xt-zt*zt));
    zn=-yt*sin(phi)+zt*cos(phi);
    yt=yt*cos(phi)+zt*sin(phi)
    xn=-xt*cos(theta)-yt*sin(theta);
    yn=xt*sin(theta)-yt*cos(theta);
    lat=radtodeg*asin(zn);
    lon=radtodeg*atan2(xn,-yn);
    return [lat,lon];
}

function mousePressed(){
    x00=x0=mouseX;
    y00=y0=mouseY;
    if(sph.mouseDown){
	xz=mouse2xz(x0,y0);
	sph.mouseDown(xz,xy2latlon(xz));
    };
    return false;
}

function mouseDragged(){
    msx=mouseX;msy=mouseY;
    dragInSphere(msx,msy);
    return false;
}

function mouseReleased(){
    msx=mouseX;msy=mouseY;
    if(sph.mouseUp){
	r=sph.mouseUp([msx,msy],xy2latlon([msx,msy]));
	if(!r)return;
    };
    if ((msx-x00)*(msx-x00)+(msy-y00)*(msy-y00)>16)return false;
//    console.log("click "+msx+", "+msy);
    clickInSphere(msx,msy);
    return false;
}

var maincanvas;

function myevent(e){
    alert(e.type);
}

function setup(){
    maincanvas=createCanvas(sz, sz, WEBGL);
    ortho(-width/2,width/2,-height/2,height/2,-1000,1000);
    pg = createGraphics(res[0],res[1]);
    loadSphere(0);
//    maincanvas.elt.addEventListener('keydown', myevent, false);
}

function draw(){
//    if(keyIsPressed)console.log(key);
    if(nSphere <= currentFrame) return;
    drawSphere();
    if(movie && sphereok){
	currentFrame += sph.skip;
	loadSphere(currentFrame);
    };
}

function rot(f){
  rottheta += f;
}
function tilt(f){
  phi +=f;
}
function orient(lat,lon){
    rottheta=0;
    theta=(180-lon)*pi/180;
    phi=lat*pi/180;
}
function show(fn){
    url=rebase(fn);
    if (url.slice(-3) == "mp4" || url.slice(-4) == "webm"){
	console.log("video "+url);
	vid = createVideo([url]);
//	vid.loop();
	vid.hide();
	vid.paused=false;
	vid.play();
	mp4=true;
	return;
    };
    mp4=false;
    playing=false;
//    if (fn.indexOf(".php")>0){
//	url=fn;
//    } else {
//	url="f.php/"+fn;
//    };
    if(url.indexOf("#") >= 0)
	movie=true;
    else
	movie=false;
    currentFrame=0;
    loadSphere(0);
//    loadFlat(0);
    playing=true;
}

function getcanvas(c){
    if(!pg) return false;
   return pg.elt;
}

function putcanvas(c){
    context=pg.elt.getContext('2d');
    pg.elt.width=c.width;
    pg.elt.height=c.height;
    context.drawImage(c, 0, 0);
};

function reload(c){
    pg = createGraphics(res[0],res[1]);
    loadSphere(0);
}

function stop(){
    stopSphere();
}

function pauseSphere(){
    playing = !playing;
    if(vid){
	if(vid.paused) vid.play(); else vid.pause();
	vid.paused= !vid.paused
    };
}
