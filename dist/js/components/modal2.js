/*! Empire 2
 *  @description  eCore
 *  @version      0.1.0.REL20221118
 *  @copyright    2022 New York State Office of Information Technology Services
 */

define(['css!modal2'], function() {

    var _CLASSES = {
        sModalRoot: 'emp-modal-2',
        sModalOuterWrapper: 'emp-modal-2-outer-wrapper',
        sModalInnerWrapper: 'emp-modal-2-inner',
        sModalHeader: 'emp-modal-2-header',
        sModalContent: 'emp-modal-2-content',
        sModalFooter: 'emp-modal-2-footer',
        sModalFooterCancel: 'emp-modal-2-cancel',
        sModalFooterConfirm: 'emp-modal-2-confirm',
        sModalPrimaryButton: 'cui-button-primary',
        sBlackout: 'emp-modal-blockout'
    };

    var _priv = {
        oDefaults: {
            dCustomFooter: null,
            dCustomHeader: null,
            fCancel: null,
            fConfirm: null,
            bForceAnswer: false,
            bBlackoutScreen: true
            /**
             *  Non Configurable settings:
             */
        }
    };

    _priv.fCreateModal = function _create_modal(oSettings, dContents) {

        console.log("create modal contents");
        console.log(dContents);

        var dModalContainer = document.createElement('div');
        dModalContainer.classList.add(_CLASSES.sModalRoot);

        if (oSettings.bBlackoutScreen) {
            dModalContainer.classList.add(_CLASSES.sBlackout);
        }

        var dModalContainerOuter = document.createElement('div');
        dModalContainerOuter.classList.add(_CLASSES.sModalOuterWrapper);

        // Modal Header
        var dModalHeader = document.createElement('header');
        dModalHeader.classList.add(_CLASSES.sModalHeader);

        var dModalContent = document.createElement('div');
        dModalContent.classList.add(_CLASSES.sModalContent);

        if (dContents) {
            dModalContent.appendChild(dContents);
        }

        // Modal Footer
        var dModalFooter = document.createElement('footer');
        dModalFooter.classList.add(_CLASSES.sModalFooter);

        dModalContainerOuter.appendChild(dModalHeader);
        dModalContainerOuter.appendChild(dModalContent);
        dModalContainerOuter.appendChild(dModalFooter);

        if (!oSettings.dCustomFooter) {

            // Modal Cancal Control
            var dModalFooterCancel = document.createElement('button');
            dModalFooterCancel.classList.add(_CLASSES.sModalFooterCancel);
            dModalFooterCancel.appendChild(document.createTextNode('No'));
            dModalFooterCancel.setAttribute('type', 'button');

            // Bind Cancel Event
            dModalFooterCancel.addEventListener('click', oSettings.fCancel);
            
            // Modal Confirm Control
            var dModalFooterConfirm = document.createElement('button');
            dModalFooterConfirm.classList.add(_CLASSES.sModalFooterConfirm);
            //dModalFooterConfirm.classList.add(_CLASSES.sModalPrimaryButton);
            dModalFooterConfirm.appendChild(document.createTextNode('Yes'));
            dModalFooterConfirm.setAttribute('type', 'button');

            // Bind Confirm Event
            dModalFooterConfirm.addEventListener('click', function() {
                var bResult = oSettings.fConfirm();

                if (bResult) {

                    console.log("Everything is done!");
                }
                
            });

            dModalFooter.appendChild(dModalFooterCancel);
            dModalFooter.appendChild(dModalFooterConfirm);
        }

        dModalContainer.appendChild(dModalContainerOuter);

        return dModalContainer;
    };

    var cModal = function _Modal(dTriggerElem, oSettings, vContents) {

        console.log("vContents");
        console.log(vContents);

        this.dTriggerElem = dTriggerElem || null;
        this.dModal = null;

        // Validate Setting here
        this.oSettings =  Object.assign({}, _priv.oDefaults, oSettings);

        // Check to see if the user provided a simple string (we need to build the contain elements)
        if (typeof vContents === "string") {
            
            var dStringContents = document.createElement('p');
            dStringContents.appendChild(document.createTextNode(vContents));

            vContents = dStringContents;
        }
        else if (typeof vContents === "function") {

            vContents = vContents();
        }

        // Back fill standard functionality
        if (!this.oSettings.fCancel) {
            this.oSettings.fCancel = this.destroy.bind(this);
        }

        if (!this.oSettings.fConfirm) {
            this.oSettings.fConfirm = this.destroy.bind(this);
        }


        // Create the actual modeal
        this.dModal = _priv.fCreateModal(this.oSettings, vContents);
    
        // Append the modal to the body
        document.body.appendChild(this.dModal);

        if (!this.oSettings.bForceAnswer) {

            this.dModal.addEventListener('click', this.destroy.bind(this));
        }

        return this;
    };

    cModal.prototype.destroy = function _destroy_modal(evt) {

        if (this.oSettings.fDestroyFunc && typeof this.oSettings.fDestroyFunc === "function")  {
            this.oSettings.fDestroyFunc();
        }

        document.body.removeChild(this.dModal);

        document.body.removeEventListener('click', this.oSettings.fBodyClose);
    };

    return cModal;

});