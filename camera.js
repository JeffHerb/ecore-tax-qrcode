class CAMERA extends HTMLElement {
        
    constructor() {
        super();

        this.attachShadow({mode: 'open'});

        this.state = {
            stStream: null,
            bEnabled: false,
            bQrReady: false,
            sToggleSelector: null,
            dToggleControl: null,
            dRootContainer: null,
            dVideo: null,
            dCanvas: null,
            dOutput: null
        };

        this.qr = null;
    }

    get style() {

        return `<style>
            :host {
                height: 100vh;
                top: 0;
                left: 0;
                overflow: hidden;
                position: absolute;
                pointer-events: none;
                width: 100vw;
                z-index: 9999;
            }
            :host * {box-sizing: border-box}
            :host .camera-container {
                display: none;
            }

            :host .camera-container.open {
                display:block;
                height: 100%;
                pointer-events: auto;
            }

            :host .camera-container.open #cancelCamera {
                position: absolute;
                background: none;
                border: 0;
                cursor: pointer;
                height: 40px;
                width: 40px;
                top: 20px;
                right: 20px;
                z-index: 11000;
            }

            :host .camera-container.open #cancelCamera:before,
            :host .camera-container.open #cancelCamera:after {
                position: absolute;
                left: 15px;
                content: ' ';
                height: 33px;
                width: 2px;
                background-color: #FFF;
                }

                :host .camera-container.open #cancelCamera:before {
                transform: rotate(45deg);
                }

                :host .camera-container.open #cancelCamera:after {
                transform: rotate(-45deg);
                }

            :host .camera-container .flex-container {
                background: black;
                display: flex;
                flex-direction: column;
                height: 100%;
                justify-content: center;
                align-items: center;
            }

            :host #video,
            :host #canvas,
            :host #image-wrapper {
                position: absolute;
                z-index: 9990;
                width: 100%;
            }

            :host #video {
                height: auto;
                object-fit: cover;
                width: 100%;
            }

            :host #image-wrapper {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            :host #picture-control-row {
                display:flex;
                margin-bottom: 10px;
                position: relative;
            }

            :host #picture-control-row button {
                background: #FFF;
                border-radius: 75px;
                cursor: pointer;
                display: inline-block;
                height: 75px;
                width: 75px;
                z-index: 11000;
            }

            :host #picture-control-row {
                display: flex;
                margin-bottom: 10px;
                position: relative;
                z-index: 11000;
            }

            :host #picture-control-row .accept-controls {
                z-index: 11000;
            }

            :host #picture-control-row .accept-controls button {
                background: #FFF;
                cursor: pointer;
                display: inline-block;
                white-space: nowrap;
                width: auto;
                z-index: 11000;
            }

            :host .qr-code-sights {
                height: 500px;
                position: absolute;
                width: 500px;
                z-index: 11500;
            }

            :host .qr-code-sights .tl,
            :host .qr-code-sights .tr,
            :host .qr-code-sights .br,
            :host .qr-code-sights .bl {
                height: calc(100% - 75%);
                position: absolute;
                width: calc(100% - 75%);
            }

            :host .qr-code-sights .tl {
                border-top: 2px solid yellow;
                border-left: 2px solid yellow;
                top: 0;
                left: 0;
            }

            :host .qr-code-sights .tr {
                border-top: 2px solid yellow;
                border-right: 2px solid yellow;
                top: 0;
                right: 0;
            }

            :host .qr-code-sights .br {
                border-bottom: 2px solid yellow;
                border-right: 2px solid yellow;
                bottom: 0;
                right: 0;
            }

            :host .qr-code-sights .bl {
                border-bottom: 2px solid yellow;
                border-left: 2px solid yellow;
                bottom: 0;
                left: 0;
            }

            :host .hidden {
                display: none !important;
            }

        </style>`
    }

    get template() {

        return `<div class="camera-container">
            <div class="flex-container">
                <button id="cancelCamera"></button>
                <div id="image-wrapper">
                    <video id="video"></video>
                    <canvas id="canvas"></canvas>
                    <div id="qr-code-sights" class="qr-code-sights hidden">
                        <div class="tl"></div>
                        <div class="tr"></div>
                        <div class="br"></div>
                        <div class="bl"></div>
                    </div>
                    <canvas id="temp-canvas"></canvas>
                </div>
                <div id="picture-control-row" class="hidden">
                    <button type="button" id="take-photo" class="take-photo" title="Take Photo"></button>
                    <div id="accept-controls" class="accept-controls hidden">
                        <button type="button" id="accept-photo" class="accept-photo">Accept Photo</button>
                        <button type="button" id="take-another" class="take-another">Take Another</button>
                    </div>
                </div>
            </div>
        </div>`
    }

    imageToConsole(imageData) {

        var image = new Image();

        image.onload = function() {
            // Inside here we already have the dimensions of the loaded image
            var style = [
                // Hacky way of forcing image's viewport using `font-size` and `line-height`
                'font-size: 1px;',
                'line-height: ' + this.height + 'px;',
        
                // Hacky way of forcing a middle/center anchor point for the image
                'padding: ' + this.height * .5 + 'px ' + this.width * .5 + 'px;',
        
                // Set image dimensions
                'background-size: ' + this.width + 'px ' + this.height + 'px;',
        
                // Set image URL
                'background: url('+ imageData +');'
                ].join(' ');
        
                // notice the space after %c
                console.log('%c ', style);

                console.log(image.height, image.width);
            };

            // Actually loads the image
            image.src = imageData;    

    }

    async connectedCallback() {

        const loopDevices = () => {

            return new Promise((res, rej) => {

                let oVideos = {};

                navigator.mediaDevices.enumerateDevices()
                    .then((devices) => {
                        devices.forEach((device) => {

                            console.log(device);
                            
                            // Pull out all of the video input that are 
                            if (device.kind === "videoinput" && (device.label.indexOf('back') !== -1 || device.label.indexOf('environment') !== -1 )){
                                oVideos[device.deviceId] = device
                            }

                        });

                        res(oVideos);
                    })
                    .catch((err) => {
                        console.error(`${err.name}: ${err.message}`);
                    });

            })

            //let devices = await navigator.mediaDevices.enumerateDevices()
                                
            // return devices;
        }

        const closeModal = (evt) => {
            
            if (this.state.stStream.active) {
                this.state.stStream.getTracks()[0].stop();
            }

            this.state.bEnabled = false;

            this.state.dRootContainer.classList.remove('open');

        }

        const handlePhoto = (evt) => {

            this.state.ctx.drawImage(this.state.dVideo, 0, 0, this.state.iVideoWidth, this.state.iVideoHeight);

            this.state.dPhotoButton.classList.add('hidden');
            this.state.dPhotoAcceptControls.classList.remove('hidden');
        }

        const handleTakeAnother = (evt) => {

            this.state.ctx.clearRect(0, 0, this.state.iVideoWidth, this.state.iVideoHeight);

            this.state.dPhotoButton.classList.remove('hidden');
            this.state.dPhotoAcceptControls.classList.add('hidden');
        }

        const handleAcceptPhoto = (evt) => {

            closeModal();

            console.log("Other photo stuff");
        }

        const fCopyImageToCanvase = (dSource, dTargetCTX, iLeft, iTop, iWidth, iHeight) => {

            dTargetCTX.drawImage(dSource, iLeft, iTop, iWidth, iHeight);
        }

        const fCopyCanvasToCanvase = (dSource, iSourceLeft = 0, iSourceTop = 0, dTargetCTX, iDestLeft = 0, iDestTop = 0, iWidth, iHeight) => {

            console.log("Canvase to canvas");

            console.log(iSourceLeft, iSourceTop, iWidth, iHeight, iDestLeft, iDestTop, iWidth, iHeight)

            dTargetCTX.drawImage(dSource, 
                iSourceLeft,
                iSourceTop,
                iWidth,
                iHeight,
                iDestLeft,
                iDestTop,
                iWidth, 
                iHeight);
        }

        this.state.iQRImage = 0;

        const fQRCodeCheck = () => {

            if (this.state.bEnabled && this.state.bQrReady) {

                // Copy the video image to the regular canvas
                fCopyImageToCanvase(this.state.dVideo, this.state.ctx, 0, 0, this.state.iVideoWidth, this.state.iVideoHeight);

                // Now take the image from the regular canvas and crop out the scan image
                console.log(`Height:${this.state.iVideoHeight} x Width:${this.state.iVideoWidth}`);
                console.log(`Left Offset:${this.state.videoImageOffsetLeft} x Top Offset:${this.state.videoImageOffsetTop}`)
                console.log(`QR Code square:${this.state.iSquareSize}`);

                setTimeout(async () => {

                        fCopyCanvasToCanvase(
                            this.state.dCanvas,
                            this.state.videoImageOffsetLeft,
                            this.state.videoImageOffsetTop,
                            this.state.ctxTemp,
                            0,
                            0,
                            this.state.iSquareSize,
                            this.state.iSquareSize);

                        let vQRImage = this.state.dTempCanvas.toDataURL("image/png");

                        await this.qr.decodeFromImage(vQRImage).then((res) => {

                            if (res) {
                                
                                let sPin = res.data.split("?")[1].split('=')[1];

                                console.log(sPin);
    
                                if (this.state.dOutput && this.state.dOutput.nodeName === "INPUT") {
                                    this.state.dOutput.value = sPin;
                                }
    
                                this.state.bEnabled = false;
    
                                closeModal();
                            }
                            else {
    
                                setTimeout(fQRCodeCheck.bind(this), 500);
                            }
                        });

                }, 100);

            }

        };

        const fScaleWrapper = () => {

            requestAnimationFrame(() => {

                let iVideoWidth = this.state.dVideo.offsetWidth;
                let iVideoHeight = this.state.dVideo.offsetHeight; 
                
                this.state.dCanvas.width = this.state.iVideoWidth;
                this.state.dCanvas.height = this.state.iVideoHeight;

                // Save off the scaled size
                this.state.iVideoWidth = iVideoWidth;
                this.state.iVideoHeight = iVideoHeight;

                // Determine what the qr code square size would be (even if its not used)
                let iSquareSize = (iVideoHeight > iVideoWidth) ? iVideoWidth : iVideoHeight;

                if (iSquareSize < 150) {
                    iSquareSize = 150;
                }
                else if (iSquareSize >= 500) {
                    iSquareSize = 500;
                }

                this.state.iSquareSize = iSquareSize - 100;

                // this.state.dImageWrapper.style.width = `${iVideoWidth}px`;
                // this.state.dImageWrapper.style.height = `${iVideoHeight}px`;

                this.state.dCanvas.width = iVideoWidth;
                this.state.dCanvas.height = iVideoHeight;

                if (this.state.sMode === "qr") {

                    this.qr = new QrcodeDecoder();

                    // Change the QR code sights
                    this.state.dQRCodeSights.style.width = `${this.state.iSquareSize}px`;
                    this.state.dQRCodeSights.style.height = `${this.state.iSquareSize}px`;

                    this.state.dTempCanvas.width = this.state.iSquareSize;
                    this.state.dTempCanvas.height = this.state.iSquareSize;
    
                    this.state.videoImageOffsetLeft = (iVideoWidth - this.state.iSquareSize) / 2;
                    this.state.videoImageOffsetTop = (iVideoHeight - this.state.iSquareSize) / 2;

                    this.state.bQrReady = true;

                    requestAnimationFrame(() => {

                        setTimeout(fQRCodeCheck.bind(this), 500);
                    });
                }

            });

        }

        const handleResize = (evt) => {

            console.log(this);

            if (this.state.bEnabled) {

                console.log("Resize occured");

            }

        }

        let oVideoDevices = await loopDevices();

        console.log(oVideoDevices);

        let dVideoInfo = document.getElementById('video-info');

        dVideoInfo.innerHTML = JSON.stringify(oVideoDevices, null, 4);

        this.shadowRoot.innerHTML = `${this.style}${this.template}`;
        
        this.state.dRootContainer = this.shadowRoot.querySelector('.camera-container');
        this.state.dVideo = this.shadowRoot.querySelector('video#video');
        this.state.dCanvas = this.shadowRoot.querySelector('canvas#canvas');
        this.state.ctx = this.state.dCanvas.getContext('2d', { willReadFrequently: true });

        this.state.dTempCanvas = this.shadowRoot.querySelector('canvas#temp-canvas');
        this.state.ctxTemp = this.state.dTempCanvas.getContext('2d');

        this.state.dPhotoControlRow = this.shadowRoot.querySelector(`#picture-control-row`);
        this.state.dPhotoButton = this.shadowRoot.querySelector(`#take-photo`);
        this.state.dPhotoAcceptControls = this.shadowRoot.querySelector('#accept-controls');
        this.state.dAcceptPhotoButton = this.shadowRoot.querySelector('#accept-photo');
        this.state.dTakeAnotherButton = this.shadowRoot.querySelector('#take-another');
        this.state.dQRCodeSights = this.shadowRoot.querySelector('#qr-code-sights');
        this.state.dImageWrapper = this.shadowRoot.querySelector('#image-wrapper');
        this.state.dCancelCamera = this.shadowRoot.querySelector('#cancelCamera');
        this.state.fQRTimeout = null;

        this.state.iVideoWidth = null;
        this.state.iVideoHeight = null;
        
        if (this.getAttribute("for")) {
            
            this.state.sToggleSelector = this.getAttribute("for");
            
            if (this.state.sToggleSelector.startsWith('#') || this.state.sToggleSelector.startsWith('.')) {

                this.state.dToggleControl = document.querySelector(this.state.sToggleSelector);
            }
            else {

                this.state.dToggleControl = document.getElementById(this.state.sToggleSelector);
            }

        }
        
        if (this.getAttribute('output')) {

            console.log("We have output");
            console.log(this.getAttribute('output'));
            console.log(document.querySelector(this.getAttribute('output')));

            this.state.dOutput = document.querySelector(this.getAttribute('output'))
        }

        if (this.state.dToggleControl) {

            this.state.dToggleControl.addEventListener('click', (evt) => {

                if (this.state.bEnabled) {

                    if (this.state.stStream.active) {
                        this.state.stStream.getTracks()[0].stop();
                    }

                    this.state.bEnabled = false;

                    this.state.dRootContainer.classList.remove('open');
                }
                else {

                    var constraints = {
                        audio: false,
                        video: {
                            mandatory: {
                                minWidth: 1280,
                                minHeight: 720
                            }
                        } 
                    }

                    window.addEventListener('resize', (evt) => {

                        requestAnimationFrame(() => {
                            fScaleWrapper();
                        })
            
                    }, false);

                    navigator.mediaDevices
                        .getUserMedia({
                            ...constraints,
                            video: { 
                                deviceId: Object.keys(oVideoDevices)[1] 
                            }
                        })
                        .then((stream) => {

                            this.state.dVideo.addEventListener('play', () => {

                                this.state.dCancelCamera.addEventListener('click', closeModal.bind(this), false);
                                document.body.addEventListener('resize', handleResize.bind(this), false);

                                if (this.state.sMode === "photo") {

                                    this.state.dPhotoControlRow.classList.remove('hidden');
                        
                                    this.state.dPhotoButton.addEventListener('click', handlePhoto.bind(this), false);
                                    this.state.dAcceptPhotoButton.addEventListener('click', handleAcceptPhoto.bind(this), false);
                                    this.state.dTakeAnotherButton.addEventListener('click', handleTakeAnother.bind(this), false);
                                    
                                }
                                else {
                        
                                    this.state.dQRCodeSights.classList.remove('hidden');
                                    this.state.dCanvas.classList.add("hidden");
                                }

                                setTimeout(() => {
                                    requestAnimationFrame(() => {
                                        fScaleWrapper();
                                    })
                                }, 500)
                            })

                            this.state.stStream = stream;

                            this.state.dVideo.srcObject = stream;
                            this.state.dVideo.play();

                        })
                        .catch((err) => {
                            console.error(`An error occurred: ${err}`);
                        });

                    this.state.bEnabled = true;

                    this.state.dRootContainer.classList.add('open');
                }
                
            });
        }

        if (this.getAttribute('mode')) {

            let sUserDefinedMode = this.getAttribute('mode').toLowerCase();

            if (sUserDefinedMode !== "qr" && sUserDefinedMode !== "photo") {

                // Force unknown modes to photo
                this.state.sMode = "photo";
            }
            else {

                this.state.sMode = sUserDefinedMode;
            }

        }
        else {

            this.state.sMode = "photo";
        }

    }
        
}