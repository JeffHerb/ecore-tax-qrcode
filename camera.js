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

            :host .camera-container.open .camera-controls {
                background: rgba(0, 0, 0, 0.4);
                display:flex;
                justify-content: center;
                left: 0;
                min-height: 60px;
                position: absolute;
                top: 0;
                width: 100%;
                z-index: 12000;
            }

            :host .camera-container.open .camera-controls #switchCamera,
            :host .camera-container.open .camera-controls #cancelCamera {
                position: absolute;
                background: none;
                border: 0;
                cursor: pointer;
                height: 40px;
                width: 40px;
            }

            :host .camera-container.open .camera-controls #switchCamera {
                left: 0;
            }

            :host .camera-container.open .camera-controls #switchCamera svg {
                height: 60px;
                width: 60px;
            }

            :host .camera-container.open .camera-controls #cancelCamera {
                right: 0;
                margin-right: 10px;
                margin-top: 10px;
            }

            :host .camera-container.open .camera-controls #cancelCamera:before,
            :host .camera-container.open .camera-controls #cancelCamera:after {
                    background-color: #FFF;
                    content: ' ';
                    height: 33px;
                    position: absolute;
                    top: 4px;
                    width: 2px;
            }

            :host .camera-container.open #cancelCamera:before {
                transform: rotate(45deg);
            }

            :host .camera-container.open #cancelCamera:after {
                transform: rotate(-45deg);
            }

            :host .camera-container.open .camera-controls #switchCamera {
                border: 0;
                cursor: pointer;
                height: 40px;
                width: 40px;
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
                background: rgba(0, 0, 0, 0.5);
                bottom: 0;
                display: flex;
                margin-bottom: 10px;
                position: absolute;
                z-index: 11000;
                width: 100%;
                justify-content: center;
                padding-top: 10px;
                padding-bottom: 10px;
            }

            :host #picture-control-row button {
                background: #FFF;
                border-radius: 50px;
                cursor: pointer;
                display: inline-block;
                height: 50px;
                width: 50px;
                z-index: 11000;
            }

            :host #picture-control-row {
                display: flex;
                margin-bottom: 10px;
                position: absolute;
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
                <div class="camera-controls">
                    <button id="switchCamera" class="hidden" title="switch-camera">
                        <svg width="700pt" height="700pt" viewBox="0 0 700 700" xmlns="http://www.w3.org/2000/svg"><path d="M350 284.45c-32.93 0-59.754 26.824-59.754 59.754 0 32.93 26.824 59.754 59.754 59.754 32.984 0 59.754-26.824 59.754-59.754 0-32.93-26.824-59.754-59.754-59.754zm0 102.7c-23.688 0-42.953-19.266-42.953-42.953 0-23.687 19.266-42.953 42.953-42.953 23.687 0 42.953 19.266 42.953 42.953 0 23.687-19.266 42.953-42.953 42.953z" style="fill:#fff"/><path d="M449.46 250.34h-31.527l-8.176-13.496c-6.328-10.473-17.809-16.969-30.07-16.969h-59.363c-12.207 0-23.688 6.496-30.07 16.969l-8.176 13.496h-31.586c-17.137 0-31.078 13.945-31.078 31.137v125.44c0 17.191 13.945 31.137 31.078 31.137h198.97c17.191 0 31.137-14 31.137-31.137v-125.44c0-17.137-13.945-31.137-31.137-31.137zm14.336 156.57c0 7.894-6.441 14.336-14.336 14.336l-198.97.004c-7.895 0-14.281-6.441-14.281-14.336v-125.44c0-7.894 6.441-14.336 14.281-14.336h41.047l13.047-21.617c3.305-5.488 9.352-8.848 15.68-8.848h59.305c6.383 0 12.375 3.36 15.68 8.848l13.105 21.617h40.992c7.895 0 14.336 6.441 14.336 14.336v125.44zM564.2 378.02c-5.152-6.047-11.031-11.199-17.305-15.566-6.215-4.48-12.77-8.23-19.488-11.535-13.441-6.61-27.441-11.594-41.664-15.512 13.609 5.656 26.77 12.32 38.863 20.328 6.047 3.977 11.816 8.398 17.023 13.215 5.266 4.762 9.91 10.078 13.664 15.793 3.754 5.656 6.441 11.762 7.617 17.977 1.176 6.16.672 12.375-1.23 18.09-3.754 11.535-13.16 21.168-23.97 28.84l-8.96 6.441-21.617-9.574v28.617h64.625l-19.375-8.566c5.77-5.375 11.145-11.367 15.68-18.2 4.594-7 8.344-14.894 9.91-23.52 1.625-8.566 1.121-17.585-1.512-25.647-2.683-8.133-7.11-15.188-12.262-21.18zM158.43 441.58c-5.266-4.762-9.91-10.078-13.664-15.793-3.754-5.656-6.441-11.762-7.617-17.977-1.176-6.16-.672-12.375 1.23-18.09 3.754-11.535 13.16-21.168 23.97-28.84l8.96-6.441 21.617 9.574v-28.617l-64.625.008 19.375 8.566c-5.77 5.375-11.145 11.367-15.68 18.2-4.594 7-8.344 14.894-9.91 23.52-1.684 8.628-1.18 17.59 1.512 25.651 2.633 8.121 7.054 15.176 12.207 21.168 5.152 6.047 11.03 11.2 17.305 15.566 6.215 4.48 12.77 8.23 19.488 11.535 13.44 6.61 27.44 11.594 41.664 15.512-13.61-5.656-26.77-12.32-38.863-20.328-6.051-4.027-11.82-8.398-16.97-13.215z" style="fill:#fff"/></svg>
                    </button>
                    <button id="cancelCamera" title="close-camera"></button>
                </div>
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

        const fLoopDevices = () => {

            return new Promise((res, rej) => {

                let aoPreferredCamera = [];
                let aoOtherCameras = [];

                // Loop over all of the camera options
                navigator.mediaDevices.enumerateDevices()
                    .then((devices) => {
                        devices.forEach((device) => {
                            
                            // Pull out all of the video input that are 
                            if (device.kind === "videoinput") {
                                
                                // Check to see if the label indicates which way the camera faces
                                if (device.label.indexOf('back') !== -1 || device.label.indexOf('environment') !== -1 ) {
                                    aoPreferredCamera.push(device);
                                }
                                else {
                                    aoOtherCameras.push(device);
                                }
                            }

                        });

                        res([].concat(aoPreferredCamera, aoOtherCameras));
                    })
                    .catch((err) => {
                        console.error(`${err.name}: ${err.message}`);
                    });

            })
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

        }

        const fHandleCameraSwitch = (evt) => {

            if ((this.state.iSetCamera + 1) === this.state.aoCameras.length) {
                this.state.iSetCamera = 0;
            }
            else {
                this.state.iSetCamera += 1;
            }

            // Stop the currenrt camera
            if (this.state.stStream.active) {
                this.state.stStream.getTracks()[0].stop();
            }

            navigator.mediaDevices
                .getUserMedia({
                    ...this.state.oVideoContraints,
                    video: { 
                        deviceId: this.state.aoCameras[this.state.iSetCamera].deviceId
                    }
                })
                .then((stream) => {

                    this.state.dVideo.addEventListener('play', () => {

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

        }

        const fCopyImageToCanvase = (dSource, dTargetCTX, iLeft, iTop, iWidth, iHeight) => {

            dTargetCTX.drawImage(dSource, iLeft, iTop, iWidth, iHeight);
        }

        const fCopyCanvasToCanvase = (dSource, iSourceLeft = 0, iSourceTop = 0, dTargetCTX, iDestLeft = 0, iDestTop = 0, iWidth, iHeight) => {

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

            if (this.state.bEnabled) {

                console.log("Resize occured");

            }

        }

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
        this.state.dSwitchCamera = this.shadowRoot.querySelector('#switchCamera');
        this.state.fQRTimeout = null;

        this.state.aoCameras = await fLoopDevices();
        this.state.iSetCamera = 0;

        this.state.iVideoWidth = null;
        this.state.iVideoHeight = null;

        this.state.oVideoContraints = {
            audio: false,
            video: {
                mandatory: {
                    minWidth: 1280,
                    minHeight: 720
                }
            } 
        }
        
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

                    window.addEventListener('resize', (evt) => {

                        requestAnimationFrame(() => {
                            fScaleWrapper();
                        })
            
                    }, false);

                    if (this.state.aoCameras.length && this.state.aoCameras.length > 1) {
                        this.state.dSwitchCamera.classList.remove("hidden");
                    }

                    // Setup close camera button
                    this.state.dCancelCamera.addEventListener('click', closeModal.bind(this), false);

                    // Setup switch camera button {
                    if (this.state.aoCameras.length && this.state.aoCameras.length > 1) {

                        this.state.dSwitchCamera.addEventListener('click', fHandleCameraSwitch.bind(this), false);
                    }

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

                    navigator.mediaDevices
                        .getUserMedia({
                            ...this.state.oVideoContraints,
                            video: { 
                                deviceId: this.state.aoCameras[this.state.iSetCamera].deviceId
                            }
                        })
                        .then((stream) => {

                            this.state.dVideo.addEventListener('play', () => {

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