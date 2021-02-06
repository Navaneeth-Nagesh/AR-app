import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Platform } from 'ionic-angular/platform/platform';
import '@tensorflow/tfjs'; // The tensorflow has to be imported before face-api.js
import * as faceapi from 'face-api.js';

declare let cordova: any;
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  @ViewChild('overlay') canvasOverlay: ElementRef;
  @ViewChild('image') canvasImage: ElementRef;

  public canvasOverlayNe: any;
  public faceDetection = [];

  constructor(public navCtrl: NavController, public platform: Platform) {}

  ngAfterViewInit() {
    let canvasOverlayNe = this.canvasOverlay.nativeElement;
    this.init(canvasOverlayNe);
  }

  init(canvasOverlayNe) {
    this.platform.ready().then(() => {
      if (this.platform.is('cordova')) {
        this.handleCameraPermission(() => this.initDetection(canvasOverlayNe));
      }
      this.initDetection(canvasOverlayNe);
    });
  }

  public initDetection(canvasOverlayNe) {
    var win: any = window;
    var MODEL_URL: string = '../../assets/models';

    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
    ]).then(() => {
      if (win.navigator) {
        navigator.getUserMedia({video: true},
          (stream) => {
            var video = document.querySelector('video');
            let overlayContext = canvasOverlayNe.getContext('2d');
            const videoDisplaySize = {width: video.width, height: video.height};
            faceapi.matchDimensions(overlayContext, videoDisplaySize);
            video.srcObject = stream
            const glass_image = new Image()
            glass_image.src = "../../assets/imgs/glass.png";
            const hat_image = new Image()
            hat_image.src = "../../assets/imgs/hat.png";

            setInterval(async () => {
              const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()
              const resizedDetections = faceapi.resizeResults(detections, videoDisplaySize);
              overlayContext.clearRect(0, 0, canvasOverlayNe.width, canvasOverlayNe.height);
              this.faceDetection = resizedDetections
              if (this.faceDetection.length > 0) {
                const box = this.faceDetection[0].detection.box
                let x_position = this.faceDetection[0].landmarks.positions[0].x
                let y_position = this.faceDetection[0].landmarks.positions[0].y - 15
                overlayContext.drawImage(glass_image, x_position, y_position, box.width - 15, box.height - 60);
                overlayContext.drawImage(hat_image, x_position - 20, y_position - 100, box.width + 40, box.height);
              }
            }, 100);
          }, (err) => console.error("err: ", err)
        );
      } else {
        console.log('phonertc is not defined');
      }
    })
  }

  public handleCameraPermission(cb) {
    let permissions = cordova.plugins.permissions;
    permissions.requestPermission(permissions.CAMERA, (status) => {
      cb(status);
    }, (err) => console.log('error on request permissions: ', err));
  }

  takePhoto() {
    let canvas = this.canvasImage.nativeElement;
    let videoGet = document.querySelector("video");
    canvas.width = videoGet.width;
    canvas.height = videoGet.height;
    const glass_image = new Image()
    glass_image.src = "../../assets/imgs/glass.png";
    const hat_img = new Image()
    hat_img.src = "../../assets/imgs/hat.png";
    canvas.getContext('2d').drawImage(videoGet, 0, 0, canvas.width, canvas.height);
    if (this.faceDetection.length > 0) {
      const box = this.faceDetection[0].detection.box
      let x_position = this.faceDetection[0].landmarks.positions[0].x
      let y_position = this.faceDetection[0].landmarks.positions[0].y - 15
      canvas.drawImage(glass_image, x_position, y_position, box.width - 15, box.height - 60);
      canvas.drawImage(hat_img, x_position - 20, y_position - 100, box.width + 40, box.height);
    }
    canvas.toDataURL();
  }
}
