    class CAMERA extends HTMLElement {
        
            constructor() {
                super();
        
                this.attachShadow({mode: 'open'});

                console.log("Camera constructor");
        
                this.state = {
                    stStream: null,
                    bEnabled: false,
                    sToggleSelector: null,
                    dToggleControl: null,
                    dRootContainer: null,
                    dVideo: null,
                    dCanvas: null,
                    dOutput: null
                };
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
                        z-index: 9990
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
                        <div id="image-wrapper">
                            <video id="video"></video>
                            <canvas id="canvas"></canvas>
                            <div id="qr-code-sights" class="qr-code-sights hidden">
                                <div class="tl"></div>
                                <div class="tr"></div>
                                <div class="br"></div>
                                <div class="bl"></div>
                            </div>
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
        
            connectedCallback() {
        
                this.shadowRoot.innerHTML = `${this.style}${this.template}`;
                
                this.state.dRootContainer = this.shadowRoot.querySelector('.camera-container');
                this.state.dVideo = this.shadowRoot.querySelector('video#video');
                this.state.dCanvas = this.shadowRoot.querySelector('canvas#canvas');
                this.state.iQRCodeSquareSize = 500;
        
                this.state.ctx = this.state.dCanvas.getContext('2d', { willReadFrequently: true });
                this.state.dPhotoControlRow = this.shadowRoot.querySelector(`#picture-control-row`);
                this.state.dPhotoButton = this.shadowRoot.querySelector(`#take-photo`);
                this.state.dPhotoAcceptControls = this.shadowRoot.querySelector('#accept-controls');
                this.state.dAcceptPhotoButton = this.shadowRoot.querySelector('#accept-photo');
                this.state.dTakeAnotherButton = this.shadowRoot.querySelector('#take-another');
                this.state.dQRCodeSights = this.shadowRoot.querySelector('#qr-code-sights');
                this.state.dImageWrapper = this.shadowRoot.querySelector('#image-wrapper');
                this.state.fQRTimeout = null;
        
                this.state.videoWidth = null;
                this.state.videoHeight = null;
                
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
        
                            this.state.dRootContainer.classList.remove('open');
                        }
                        else {
        
                            var constraints = {
                                audio: false,
                                video: {
                                    mandatory: {
                                        minWidth: 1280,
                                        minHeight: 720
                                    },
                                    // width: { ideal: 4096 },
                                    // height: { ideal: 2160 } 
                                } 
                            }
        
                            const setupVideo = (evt) => {
        
                                this.state.videoWidth = evt.target.videoWidth;
                                this.state.videoHeight = evt.target.videoHeight;
        
                                this.state.dImageWrapper.style.width = this.state.videoWidth + 'px';
                                this.state.dImageWrapper.style.height = this.state.videoHeight + 'px';
        
                                this.state.dVideo.width = this.state.videoWidth;
                                this.state.dCanvas.width = this.state.videoWidth;
                                this.state.dVideo.height = this.state.videoHeight;
                                this.state.dCanvas.height = this.state.videoHeight;
        
                                this.state.dPhotoControlRow.style.top = `${(this.state.dVideo.height /2) - 37}px`;
        
                                if (this.state.sMode === "qr") {
            
                                    this.state.iQRCropStartX = ((this.state.videoWidth - this.state.iQRCodeSquareSize) / 2 );
                                    this.state.iQRCropStartY = ((this.state.videoHeight - this.state.iQRCodeSquareSize) / 2 );
        
                                    let dTempCanvas = document.createElement('canvas');
                                    dTempCanvas.height = 500;
                                    dTempCanvas.width = 500;
                                    dTempCanvas.id = "temp-canvas";
        
                                    dTempCanvas.style.position = "absolute";
        
                                    this.state.dTempCanvas = dTempCanvas;
                                    this.state.dTempCXT = dTempCanvas.getContext('2d');
        
                                    this.state.dImageWrapper.appendChild(dTempCanvas);
        
                                    // Repeating function for qr code decoding
                                    const fQRCodeCheck = () => {
        
                                        const check =() => {
                                            const pixelBuffer = new Uint32Array(
                                                this.state.dTempCXT.getImageData(0, 0, 500, 500).data.buffer
                                            );
        
                                            return !pixelBuffer.some(color => color !== 0);
                                        }
        
                                        if (this.state.bEnabled) {
        
                                            this.state.ctx.drawImage(this.state.dVideo, 0, 0, this.state.videoWidth, this.state.videoHeight);
        
                                            this.state.dTempCXT.beginPath();
                                            this.state.dTempCXT.rect(
                                                10,
                                                10,
                                                10,
                                                10
                                            );
                                            this.state.dTempCXT.fillStyle = '#828387';
                                            this.state.dTempCXT.fill();
                                            this.state.dTempCXT.closePath();
        
                                            setTimeout(async () => {
        
        
                                                this.state.dTempCXT.drawImage(
                                                    this.state.dCanvas, 
                                                    this.state.iQRCropStartX, 
                                                    this.state.iQRCropStartY, 
                                                    this.state.iQRCodeSquareSize, 
                                                    this.state.iQRCodeSquareSize, 
                                                    0, 
                                                    0, 
                                                    this.state.iQRCodeSquareSize, 
                                                    this.state.iQRCodeSquareSize);
        
                                                let vQRImage = this.state.dTempCanvas.toDataURL("image/png");
        
                                                await qr.decodeFromImage(vQRImage).then((res) => {
        
                                                    if (res) {
        
                                                        //console.log(res)
                                                        
                                                        let sPin = res.data.split("?")[1].split('=')[1];
        
                                                        if (this.state.dOutput && this.state.dOutput.nodeName === "INPUT") {
                                                            this.state.dOutput.value = sPin;
                                                        }
        
                                                        this.state.bEnabled = false;
        
                                                        this.state.dRootContainer.classList.remove('open');
        
                                                        this.state.stStream.getTracks().forEach(function(track) {
                                                            track.stop();
                                                        });
                                                    }
                                                    else {
            
                                                        setTimeout(fQRCodeCheck.bind(this), 500);
                                                    }
                                                });
        
        
                                            }, 100);
        
                                        }
                        
                                    };
                        
                        
                                    setTimeout(fQRCodeCheck.bind(this), 500);
                                }
        
                            };
        
                            this.state.dVideo.addEventListener("loadedmetadata", setupVideo.bind(this));
        
                            navigator.mediaDevices
                                .getUserMedia(constraints)
                                .then((stream) => {
        
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
        
                if (this.state.sMode === "photo") {
        
                    this.state.dPhotoControlRow.classList.remove('hidden');
        
                    const handlePhoto = (evt) => {
        
                        this.state.ctx.drawImage(this.state.dVideo, 0, 0, this.state.videoWidth, this.state.videoHeight);
        
                        this.state.dPhotoButton.classList.add('hidden');
                        this.state.dPhotoAcceptControls.classList.remove('hidden');
                    }
        
                    const handleTakeAnother = (evt) => {
        
                        this.state.ctx.clearRect(0, 0, this.state.videoWidth, this.state.videoHeight);
        
                        this.state.dPhotoButton.classList.remove('hidden');
                        this.state.dPhotoAcceptControls.classList.add('hidden');
                    }
        
                    const handleAcceptPhoto = (evt) => {
        
                        console.log("Not yet coded");
        
                    }
        
                    this.state.dPhotoButton.addEventListener('click', handlePhoto.bind(this), false);
                    this.state.dAcceptPhotoButton.addEventListener('click', handleAcceptPhoto.bind(this), false);
                    this.state.dTakeAnotherButton.addEventListener('click', handleTakeAnother.bind(this), false);
        
                }
                else {
        
                    this.state.dQRCodeSights.classList.remove('hidden');
                    this.state.dCanvas.classList.add("hidden");
                    
                    var qr = new QrcodeDecoder();
        
                }
        
            }
        
    }