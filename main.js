
// đối tượng validator
function Validator(options){

    var selectorRules = {};

    function getParent(element, selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement
        }
    }

    // hàm thực hiện validate
    function validate (inputElement, rule){
        var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage

        var rules = selectorRules[rule.selector]
        for( var i=0; i < rules.length; ++i){
            switch(inputElement.type){
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'))
                    break;
                default:
                    errorMessage = rules[i](inputElement.value)
            }
            if(errorMessage) break
        }

        if(errorMessage){
            errorElement.innerText = errorMessage
            getParent(inputElement,options.formGroupSelector).classList.add('invalid')
        } else {
            errorElement.innerText = ''
            getParent(inputElement,options.formGroupSelector).classList.remove('invalid')
        }
        return !errorMessage
    }
    // lấy element của form cần validate
    var formElement = document.querySelector(options.form)
    if(formElement){
        
        // khi submit form
        formElement.onsubmit = function(e){
            e.preventDefault()
            var isFormValid = true
            options.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if(!isValid){
                    isFormValid = false
                }
            })
            if(isFormValid){
                if( typeof options.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]')
                    var formValues = Array.from(enableInputs).reduce(function(values, input){
                        switch(input.type){
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                                break;
                            case 'checkbox':
                                if (!input.matches(':checked')){
                                    values[input.name] = '';
                                    return values
                                }
                                if(!Array.isArray(values[input.name])){
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value)
                                break;
                            default:
                                values[input.name] = input.value;  
                        }
                        return values;
                    }, {})
                    options.onSubmit(formValues)
                }else{
                    formElement.submit();
                }
            }
        }

        // lặp qua mỗi rule và xử lý (lắng nghe các sự kiện như blur, input,...)
        options.rules.forEach(function(rule) {

            // lưu lại các rules cho mỗi input
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }
            
            var inputElements = formElement.querySelectorAll(rule.selector)
            Array.from(inputElements).forEach(function(inputElement){
                if(inputElement){
                    // xử lí khi blur (click) ra ngoài
                    inputElement.onblur = function() {
                        validate(inputElement, rule)                   
                    }
    
                    // xử lí khi người dùng gõ
                    inputElement.oninput = function(){
                        var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector)
                        errorElement.innerText = ''
                        getParent(inputElement,options.formGroupSelector).classList.remove('invalid')
                    }
                }
            })
            
        });
    }
}

// định nghĩa các rules ( điều luật )

Validator.isRequired = function (selector){
    return {
        selector: selector,
        test: function(value){
            return value ? undefined : 'Vui lòng không để trống!'
        }
    }
}

Validator.isEmail = function (selector) {
    return {
        selector: selector,
        test: function(value){
            var regex =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            return regex.test(value) ? undefined : ' Vui lòng nhập đúng email!'
        }
    }
}

Validator.minlength = function (selector, min){
    return {
        selector: selector,
        test: function(value){
            return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`
        }
    }
}

Validator.isComfirm = function (selector, confirmPassword, message){
    return {
        selector: selector,
        test: function(value){
            return value === confirmPassword() ? undefined : message || 'Mật khẩu không trùng khớp vui lòng nhập lại'
        }
    }
}