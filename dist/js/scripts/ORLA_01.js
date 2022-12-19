define([], function () {

    //Remove global menu data and prevent display on render. 
    if (fwData.menus && fwData.menus.global) {
        delete fwData.menus.global;            
    } 

    return {
       
    };
});

