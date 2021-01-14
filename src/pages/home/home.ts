import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import 'tracking/build/tracking';
import 'tracking/build/data/face';
import 'tracking/build/data/eye';
import 'tracking/build/data/mouth';
// import 'dat.gui/build/dat.gui';
import { Platform } from 'ionic-angular/platform/platform';

declare let cordova: any;
declare var tracking: any;
declare var dat: any;
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  public width = 320;    // width of photo which will be captured
  public height = 0;     // height of photo which will be captured

  @ViewChild('overlay') canvasOverlay: ElementRef;
  @ViewChild('image') canvasImage: ElementRef;

  public canvasOverlayNe: any;
  constructor(public navCtrl: NavController, public platform: Platform) {

  }

  ngAfterViewInit() {
    let canvasOverlayNe = this.canvasOverlay.nativeElement;
    this.init(canvasOverlayNe);
  }

  init(canvasOverlayNe) {
    this.platform.ready().then(() => {
      if (this.platform.is('cordova')) {
        this.handleCameraPermission(() => {
          this.initDetection(canvasOverlayNe);
        });
      }
      this.initDetection(canvasOverlayNe);
    });
  }

  public initDetection(canvasOverlayNe) {
    var win: any = window;
    if (win.navigator) {
      navigator.getUserMedia({ video: true },
        function (stream) {
          var img = document.createElement("img");
          let overlayContext = canvasOverlayNe.getContext('2d');

          canvasOverlayNe.style.position = "absolute";
          canvasOverlayNe.style.top = '16px';
          canvasOverlayNe.style.zIndex = '100001';
          canvasOverlayNe.style.display = 'block';

          var video = document.querySelector('video');
          video.srcObject = stream
          
          var tracker = new tracking.ObjectTracker('mouth');
          tracker.setStepSize(1.7);
          tracking.track('#video', tracker, { camera: true });
          // tracker.setInitialScale(1);
          // tracker.setStepSize(2.7);
          // tracker.setEdgesDensity(.2);
          img.src = '';
          
          
          tracker.on('track', function(event) {
            if (event.data.length === 0) {
              // No colors were detected in this frame.
              img.src = '';
              console.log("NO FACE")
              overlayContext.clearRect(0, 0, canvasOverlayNe.width, canvasOverlayNe.height);
            } else {
              event.data.forEach(function(rect) {
                img.src = 'https://d2t25beedf4h7i.cloudfront.net/static/home/images/about_image_fktblq_c_scale,w_681.6a0af93aaa6b.webp';
                overlayContext.clearRect(0, 0, canvasOverlayNe.width, canvasOverlayNe.height);
                overlayContext.drawImage(img, rect.x, rect.y, rect.width, rect.height);
                console.log(rect.x, rect.y, rect.height, rect.width);
              });
            }
          });

          // var gui = new dat.GUI();
          // gui.add(tracker, 'edgesDensity', 0.1, 0.5).step(0.01);
          // gui.add(tracker, 'initialScale', 1.0, 10.0).step(0.1);
          // gui.add(tracker, 'stepSize', 1, 5).step(0.1);
        
        }, function (err) {
          console.log("err: ", err);
        }
      );
    } else {
      console.log('phonertc is not defined');
    }
  }

  public handleCameraPermission(cb) {
    let permissions = cordova.plugins.permissions;
    permissions.requestPermission(permissions.CAMERA, function (status) {
      cb(status);
    }, (err) => {
      console.log('error on request permissions: ', err);
    });
  }

  takePhoto() {
    let canvas = this.canvasImage.nativeElement;
    let videoGet = document.querySelector("video");
    canvas.width = videoGet.width;
    canvas.height = videoGet.height;
    canvas.getContext('2d').drawImage(videoGet, 0, 0, canvas.width, canvas.height);
    let img = canvas.toDataURL();
    console.log(img)
  }

  takeFace() {
    
  }

}
