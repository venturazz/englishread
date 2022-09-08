(function () {
    "use strict";

    var FormVuAPI = {};

    FormVuAPI.extractFormValues = function () {
        let inputs = document.getElementsByTagName("input");
        let textareas = document.getElementsByTagName("textarea");
        let selects = document.getElementsByTagName("select");

        let texts = [];
        let checks = [];
        let radios = [];
        let choices = [];

        for (let i = 0, ii = inputs.length; i < ii; i++) {
            let inp = inputs[i];
            let ref = inp.getAttribute("data-objref");
            if (ref && ref.length > 0) {
                let type = inp.type.toUpperCase();
                if (type === "TEXT" || type === "PASSWORD") {
                    texts.push(inp);
                } else if (type === "CHECKBOX") {
                    checks.push(inp);
                } else if (type === "RADIO") {
                    radios.push(inp);
                }
            }
        }
        for (let i = 0, ii = textareas.length; i < ii; i++) {
            let inp = textareas[i];
            let ref = inp.getAttribute("data-objref");
            if (ref && ref.length > 0) {
                texts.push(inp);
            }
        }
        for (let i = 0, ii = selects.length; i < ii; i++) {
            let inp = selects[i];
            let ref = inp.getAttribute("data-objref");
            if (ref && ref.length > 0) {
                choices.push(inp);
            }
        }

        let output = {};

        for (let i = 0, ii = texts.length; i < ii; i++) {
            let fieldText = texts[i].value;
            let fieldName = texts[i].getAttribute("data-field-name");
            output[fieldName] = fieldText;
        }

        for (let i = 0, ii = checks.length; i < ii; i++) {
            let isChecked = checks[i].checked;
            let fieldName = checks[i].getAttribute("data-field-name");
            output[fieldName] = isChecked;
        }

        for (let i = 0, ii = choices.length; i < ii; i++) {
            let selected = choices[i].value;
            let fieldName = choices[i].getAttribute("data-field-name");
            output[fieldName] = selected;
        }

        for (let i = 0, ii = radios.length; i < ii; i++) {
            let radio = radios[i];
            let fieldName = radio.getAttribute("data-field-name");
            let isChecked = radio.checked;
            let value = radio.value;

            if (isChecked) {
                output[fieldName] = value;
            }
        }
        return output;
    };

    let setRequestEventHandlers = function(xhr, params) {
        xhr.onreadystatechange = function(event) {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    if (params.success) {
                        params.success(event);
                    }
                } else {
                    if (params.failure) {
                        params.failure(event);
                    } else {
                        console.log(event.target.response);
                    }
                }
            }
        };
    };

    FormVuAPI.submitFormAsJSON = function (params) {
        let url = typeof params === 'object' ? params.url : params;

        let formValues = {data: this.extractFormValues()};
        let xhr = new XMLHttpRequest();
        if (xhr.upload) {
            setRequestEventHandlers(xhr, params);
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-type', 'application/json');
            xhr.send(JSON.stringify(formValues));
            return xhr;
        }
    };

    FormVuAPI.submitFormAsFormData = function (params) {
        let url = typeof params === 'object' ? params.url : params;

        let formValues = this.extractFormValues();
        let xhr = new XMLHttpRequest();
        if (xhr.upload) {
            setRequestEventHandlers(xhr, params);
            xhr.open('POST', url, true);

            let formData = new FormData();
            for (var value in formValues) {
                if (formValues.hasOwnProperty(value) && formValues[value] !== undefined) {
                    formData.append(encodeURIComponent(value), formValues[value]);
                }
            }
            xhr.send(formData);
            return xhr;
        }
    };

    window.FormVuAPI = FormVuAPI;

}());