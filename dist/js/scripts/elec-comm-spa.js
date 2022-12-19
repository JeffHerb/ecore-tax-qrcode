// THIS IS A TERRIBLE POLYFILL TO MAKE IT WORK
define([], function() {

    var init = function() {

        console.log("Single Page App!");

        if (fwData.pageData) {

            oPageData = {
                aEmailItems: [
                    {
                        id: "e203",
                        text: 'jhon.smith@mscorporation.com',
                    },
                    {
                        id: "e123",
                        text: 'jsmith1950@gmail.com'
                    }
                ],
                aPhoneItems: [
                    {
                        id: "p123",
                        text: '(518) 555-0199',
                    },
                    {
                        id: "p456",
                        text: '(301) 555-8100'
                    },
                    {
                        id: "p458",
                        text: '(518) 555-0201'
                    }
                ],
                oSubscriptions: {
                    "ipa": {
                        email: ["e203"],
                        phone: ["p123"]
                    },
                    "etr": {
                        email: null,
                        phone: ["p458", "p123"]
                    },
                    "wpr": {
                        email: null,
                        phone: null
                    }
                }
            }

            var dEmailAddRegion = document.querySelector('#email-spa-group');
            var dPhoneAddRegion = document.querySelector('#phone-spa-group');

            cui.load('ecAddGroupComp', function(ecAddGroupComp) {

                var oEmailCompConfig = {
                    sTitle: "Emails",
                    sSubTitle: "You have $ email addresses",
                    sExpandText: "Edit",
                    sOpentContentHeader: "Current emails",
                    sNotItemName: "emails",
                    sAddParagraph: "This is the message text that needs to display when a user adds a new email address."
                };

                var oPhoneCompConfig = {
                    sTitle: "Phone numbers",
                    sSubTitle: "You have $ phone numbers",
                    sExpandText: "Edit",
                    sOpentContentHeader: "Current phone numbers",
                    sNotItemName: "phone numbers",
                    sAddParagraph: "This is the message text that needs to display when a user adds a new phone numbers."
                };

                var aEmailItems = [
                    {
                        text: 'jhon.smith@mscorporation.com',
                    },
                    {
                        text: 'jsmith1950@gmail.com'
                    }
                ]

                dEmailComp = new ecAddGroupComp.init(oEmailCompConfig, oPageData.aEmailItems, dEmailAddRegion);

                var aPhoneItems = [
                    {
                        text: '(518) 555-0199',
                    },
                    {
                        text: '(301) 555-8100'
                    },
                    {
                        text: '(518) 555-0201'
                    }
                ]

                dPhoneComp = new ecAddGroupComp.init(oPhoneCompConfig, oPageData.aPhoneItems, dPhoneAddRegion)

            });

            cui.load('ecManageGroupComp', function(ecManageGroupComp) {

                new ecManageGroupComp.init(oPageData);

            });

        }

    }

    return {
        init: init
    }

});