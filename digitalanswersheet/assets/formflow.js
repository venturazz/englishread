
(function() {
"use strict";

/**
 * Shorthand helper function to getElementById
 * @param id
 * @returns {Element}
 */
var d = function (id) {
    return document.getElementById(id);
};

var ClassHelper = (function() {
    return {
        addClass: function(ele, name) {
            var classes = ele.className.length !== 0 ? ele.className.split(" ") : [];
            var index = classes.indexOf(name);
            if (index === -1) {
                classes.push(name);
                ele.className = classes.join(" ");
            }
        },

        removeClass: function(ele, name) {
            var classes = ele.className.length !== 0 ? ele.className.split(" ") : [];
            var index = classes.indexOf(name);
            if (index !== -1) {
                classes.splice(index, 1);
            }
            ele.className = classes.join(" ");
        }
    };
})();

var Button = {};

FormViewer.on('ready', function(data) {
    // Grab buttons
    Button.zoomIn = d('btnZoomIn');
    Button.zoomOut = d('btnZoomOut');

    if (Button.zoomIn) {
        Button.zoomIn.onclick = function(e) { FormViewer.zoomIn(); e.preventDefault(); };
    }
    if (Button.zoomOut) {
        Button.zoomOut.onclick = function(e) { FormViewer.zoomOut(); e.preventDefault(); };
    }

    document.title = data.title ? data.title : data.fileName;
    var pageLabels = data.pageLabels;
    var btnPage = d('btnPage');
    if (btnPage != null) {
        btnPage.innerHTML = pageLabels.length ? pageLabels[data.page - 1] : data.page;
        btnPage.title = data.page + " of " + data.pagecount;

        FormViewer.on('pagechange', function(data) {
            d('btnPage').innerHTML = pageLabels.length ? pageLabels[data.page - 1] : data.page;
            d('btnPage').title = data.page + " of " + data.pagecount;
        });
    }

    if (idrform.app) {
        idrform.app.execFunc = idrform.app.execMenuItem;
        idrform.app.execMenuItem = function (str) {
            switch (str.toUpperCase()) {
                case "FIRSTPAGE":
                    idrform.app.activeDocs[0].pageNum = 0;
                    FormViewer.goToPage(1);
                    break;
                case "LASTPAGE":
                    idrform.app.activeDocs[0].pageNum = FormViewer.config.pagecount - 1;
                    FormViewer.goToPage(FormViewer.config.pagecount);
                    break;
                case "NEXTPAGE":
                    idrform.app.activeDocs[0].pageNum++;
                    FormViewer.next();
                    break;
                case "PREVPAGE":
                    idrform.app.activeDocs[0].pageNum--;
                    FormViewer.prev();
                    break;
                default:
                    idrform.app.execFunc(str);
                    break;
            }
        }
    }

    document.addEventListener('keydown', function (e) {
        if (e.target != null) {
            switch (e.target.constructor) {
                case HTMLInputElement:
                case HTMLTextAreaElement:
                case HTMLVideoElement:
                case HTMLAudioElement:
                case HTMLSelectElement:
                    return;
                default:
                    break;
            }
        }
        switch (e.keyCode) {
            case 33: // Page Up
                FormViewer.prev();
                e.preventDefault();
                break;
            case 34: // Page Down
                FormViewer.next();
                e.preventDefault();
                break;
            case 37: // Left Arrow
                data.isR2L ? FormViewer.next() : FormViewer.prev();
                e.preventDefault();
                break;
            case 39: // Right Arrow
                data.isR2L ? FormViewer.prev() : FormViewer.next();
                e.preventDefault();
                break;
            case 36: // Home
                FormViewer.goToPage(1);
                e.preventDefault();
                break;
            case 35: // End
                FormViewer.goToPage(data.pagecount);
                e.preventDefault();
                break;
        }
    });
});

window.addEventListener("beforeprint", function(event) {
    FormViewer.setZoom(FormViewer.ZOOM_AUTO);
});

})();

//global variables that can be used by ALL the functions on this page.
var is64;
var inputs;
var states = ['On.png', 'Off.png', 'DownOn.png', 'DownOff.png', 'RollOn.png', 'RollOff.png'];
var states64 = ['imageOn', 'imageOff', 'imageDownOn', 'imageDownOff', 'imageRollOn', 'imageRollOff'];

function setImage(input, state) {
    if (inputs[input].getAttribute('images').charAt(state) === '1') {
        document.getElementById(inputs[input].getAttribute('id') + "_img").src = getSrc(input, state);
    }
}

function getSrc(input, state) {
    var src;
    if (is64) {
        src = inputs[input].getAttribute(states64[state]);
    } else {
        src = inputs[input].getAttribute('imageName') + states[state];
    }
    return src;
}

function replaceChecks(isBase64) {

    is64 = isBase64;
    //get all the input fields on the page
    inputs = document.getElementsByTagName('input');

    //cycle trough the input fields
    for(var i=0; i<inputs.length; i++) {
        if(inputs[i].hasAttribute('images'))

        //check if the input is a checkbox
            if(inputs[i].getAttribute('class') !== 'idr-hidden' && inputs[i].getAttribute('data-imageAdded') !== 'true'
                && (inputs[i].getAttribute('type') === 'checkbox' || inputs[i].getAttribute('type') === 'radio')) {

                //create a new image
                var img = document.createElement('img');

                //check if the checkbox is checked
                if(inputs[i].checked) {
                    if(inputs[i].getAttribute('images').charAt(0) === '1')
                        img.src = getSrc(i, 0);
                } else {
                    if(inputs[i].getAttribute('images').charAt(1) === '1')
                        img.src = getSrc(i, 1);
                }

                //set image ID
                img.id = inputs[i].getAttribute('id') + "_img";

                //set action associations
                let imageIndex = i;
                img.addEventListener("click", function(event) {
                    checkClick(imageIndex);
                });
                img.addEventListener("mousedown", function(event) {
                    checkDown(imageIndex);
                });
                img.addEventListener("mouseover", function(event) {
                    checkOver(imageIndex);
                });
                img.addEventListener("mouseup", function(event) {
                    checkRelease(imageIndex);
                });
                img.addEventListener("mouseout", function(event) {
                    checkRelease(imageIndex);
                });

                img.style.position = "absolute";
                var style = window.getComputedStyle(inputs[i]);
                img.style.top = style.top;
                img.style.left = style.left;
                img.style.width = style.width;
                img.style.height = style.height;
                img.style.zIndex = style.zIndex;

                //place image in front of the checkbox
                inputs[i].parentNode.insertBefore(img, inputs[i]);
                inputs[i].setAttribute('data-imageAdded','true');

                //hide the checkbox
                inputs[i].style.display='none';
            }
    }
}

//change the checkbox status and the replacement image
function checkClick(i) {
    if(!inputs[i].hasAttribute('images')) return;
    if(inputs[i].checked) {
        inputs[i].checked = '';
        setImage(i, 1);
    } else {
        inputs[i].checked = 'checked';

        setImage(i, 0);

        if(inputs[i].getAttribute('name') !== null){
            for(var index=0; index<inputs.length; index++) {
                if(index !== i && inputs[index].getAttribute('name') === inputs[i].getAttribute('name')){
                    inputs[index].checked = '';
                    setImage(index, 1);
                }
            }
        }
    }
    inputs[i].dispatchEvent(new Event('click'));
}

function checkRelease(i) {
    if(!inputs[i].hasAttribute('images')) return;
    if(inputs[i].checked) {
        setImage(i, 0);
    } else {
        setImage(i, 1);
    }
    inputs[i].dispatchEvent(new Event('mouseup'));
}

function checkDown(i) {
    if(!inputs[i].hasAttribute('images')) return;
    if(inputs[i].checked) {
        setImage(i, 2);
    } else {
        setImage(i, 3);
    }
    inputs[i].dispatchEvent(new Event('mousedown'));
}

function checkOver(i) {
    if(!inputs[i].hasAttribute('images')) return;
    if(inputs[i].checked) {
        setImage(i, 4);
    } else {
        setImage(i, 5);
    }
    inputs[i].dispatchEvent(new Event('mouseover'));
}
