// вызов функции открытия и закрытия формы входа
popupHandler('popup__login-form_js', 'header__login-btn_js', 'login-form__btn-close_js', 'form__input-focus_js');
// вызов функции открытия и закрытия формы регистрации
popupHandler('popup__registration-form_js', 'header__reg-btn_js', 'registration-form__btn-close_js', 'form__input-focus_js');
// вызов функции открытия и закрытия для отправки сообщения
popupHandler('popup__connect-form_js', 'footer__btn-connect_js', 'connect-form__btn-close_js', 'form__input-focus_js');
// вызов функции открытия и закрытия форм из мобильного меню 
popupMobileHandler('popup__login-form_js', 'header__burger-login-btn_js', 'login-form__btn-close_js', 'form__input-focus_js');
popupMobileHandler('popup__registration-form_js', 'header__burger-reg-btn_js', 'registration-form__btn-close_js', 'form__input-focus_js');

// функция выделение текущей страницы как активной
(function() {
    const currentPage = document.querySelector('.header__home-link_js');
    const currentBurgerPage = document.querySelector('.header__burger-home-link_js');
    currentPage.classList.add('header__link_active');
    currentBurgerPage.classList.add('header__link_active');

})();
// Инициализация ссылок в меню при аутентификации
(function setMenuLinks() {
    rerenderLinks();
    rerenderBurgerLinks();
})();

// РАБОТА С ФОРМОЙ АВТОРИЗАЦИИ

(function() {
    const loginPopup = document.querySelector('.popup__login-form_js');
    const loginForm = document.forms.loginForm;
    const loginFormInputs = [...loginForm.querySelectorAll('.form__input_js')];
    const serverMessagePopup = document.querySelector('.server-message_js');

    rerenderLinks();
    rerenderBurgerLinks();

    if(!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        clearErrors(loginForm);
        clearValidityMessage(loginForm);
      
        const userData = getAllFormData(loginForm);
        let errors = getValidationFeildsResult(loginFormInputs);

        if(Object.keys(errors).length) {
            errorFormHandler(errors, loginForm);
            return;
        }
        
        showLoader(); 
        const data = {
            email: userData.email,
            password: userData.password,  
        };
        sendRequest({
            url: '/api/users/login',
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
        .then((response) => {
            return response.json();
        })
        .then((response) => {
            if(response.success) {
                console.log("Вы успешно вошли");
                setSuccessServerMessage(serverMessagePopup);
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userId', response.data.userId);
                rerenderLinks();
                rerenderBurgerLinks();
                setTimeout(() => {
                    interactionModal(loginPopup);
                    interactionModal(serverMessagePopup);
                    location.pathname = '/';
                }, 2000);
            } else {
                throw response;
            }  
        })
        .catch(err => {
            if(err._message) {
                setErrorServerMessage(serverMessagePopup, err._message);
                loginForm.reset();
                clearErrors(loginForm);
                clearValidityMessage(loginForm);
                setTimeout(() => { 
                    interactionModal(loginPopup);
                    interactionModal(serverMessagePopup);
                 }, 2000)
            }
        })
        .finally(() => {
            removeLoader();
        })
        
    });
})();

// РАБОТА С ФОРМОЙ РЕГИСТРАЦИИ

(function() {
    const RegPopup = document.querySelector('.popup__registration-form_js');
    const regForm = document.forms.regForm;
    const regFormInputs = regForm.querySelectorAll('.form__input_js');
    const regFormBtn = regForm.querySelector('.registration-form__btn_js');
    const userAgreement = regForm.elements.agreement;
    const serverMessagePopup = document.querySelector('.server-message_js');
               
    if(!regForm) return;

    // разблокировка кнопки по нажатию на чекбокс и смена aria-label у input'ов
    userAgreement.addEventListener('click', () => agreementCheckedHandler(userAgreement, regFormInputs, regFormBtn));

    regForm.addEventListener('submit', (e) => {
        e.preventDefault();

        clearErrors(regForm);
        clearValidityMessage(regForm);

        const userData = getAllFormData(regForm); // кладем данные формы во временный объект
        let errors = getValidationFeildsResult(regFormInputs, userData);

        if(Object.keys(errors).length) {
            errorFormHandler(errors, regForm);
            return;
        }

        showLoader(); 

        const data = {
            email: userData.email,
            name: userData.name,
            surname: userData.surname,
            password: userData.password,
            location: userData.location,
            age: +userData.age,
        };

        sendRequest({
            url: '/api/users',
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            return response.json();
        })
        .then(response => {
            if(response.success) {
                setSuccessServerMessage(serverMessagePopup);
                clearValidityMessage(RegPopup);
                regForm.reset();
                setTimeout(() => { 
                    interactionModal(RegPopup);
                    interactionModal(serverMessagePopup);
                 }, 2000)
                console.log(`Пользователь с id ${response.data.id} & email ${response.data.email} зарегистрирован!`);   
            } else {
                throw response;  
            }
        })
        .catch(err => {
            if(err._message) {
                setErrorServerMessage(serverMessagePopup, err._message);
                setTimeout(() => { 
                    interactionModal(RegPopup);
                    regForm.reset();
                    clearErrors(RegPopup);
                    clearValidityMessage(RegPopup);
                    interactionModal(serverMessagePopup);
                 }, 2000)
            }
            if(err.errors) {
                setErrorServerMessage(serverMessagePopup, err.errors.email);
                regForm.reset();
                clearErrors(RegPopup);
                clearValidityMessage(RegPopup);
                setTimeout(() => { 
                    interactionModal(RegPopup);
                    interactionModal(serverMessagePopup);
                 }, 2000)
            }
        })
        .finally(() => {
            removeLoader();
        })
    });
})();

//  РАБОТА С ФОРМОЙ ОТПРАВКИ СООБЩЕНИЯ

(function() {
    const connectFormPopup = document.querySelector('.popup__connect-form_js');
    const connectForm = document.forms.connectForm;
    const connectFormInputs = connectForm.querySelectorAll('.form__input_js');
    const connectFormBtn = connectForm.querySelector('.connect-form__btn_js');
    const userAgreement = connectForm.elements.connectAgreement;
    const serverMessagePopup = document.querySelector('.server-message_js');

    if(!connectForm) return;

    // разблокировка кнопки по нажатию на чекбокс и смена aria-label у input'ов
    userAgreement.addEventListener('click', () => agreementCheckedHandler(userAgreement, connectFormInputs, connectFormBtn));

    connectForm.addEventListener('submit', (e) => {
        e.preventDefault();

        clearErrors(connectForm);
        clearValidityMessage(connectForm);

        const userData = getAllFormData(connectForm); 
        let errors = getValidationFeildsResult(connectFormInputs, userData);

        if(Object.keys(errors).length) {
            errorFormHandler(errors, connectForm);
            return;
        }
        
        const data = {
            to: userData.email,
            body: JSON.stringify({
                name: userData.fullName,
                subject: userData.subject,
                phone: userData.phone,
                message: userData.message,
            })
        };

        showLoader();
        sendRequest({
            url: '/api/emails',
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            return response.json();
        })
        .then(response => {
            if(response.success) {
                setSuccessServerMessage(serverMessagePopup);
                connectForm.reset();
                clearValidityMessage(connectForm);
                setTimeout(() => { 
                    interactionModal(connectFormPopup);
                    interactionModal(serverMessagePopup);
                 }, 2000)
            } else {
                throw response;  
            }
        })
        .catch(err => {
            if(err._message) {
                setErrorServerMessage(serverMessagePopup, err._message);
                connectForm.reset();
                clearErrors(connectForm);
                clearValidityMessage(connectForm);
                setTimeout(() => { 
                    interactionModal(connectFormPopup);
                    interactionModal(serverMessagePopup);
                }, 2000)
            }
        })
        .finally(() => {
            removeLoader();
        }); 
    });
})();

/* __________________________________SLIDER________________________________ */
(function() {
    const slider = document.querySelector('.summary__slider_js');
    const wrapper = slider.querySelector('.summary__slider-wrapper_js');
    const innerWrapper = wrapper.querySelector('.summary__slider-inner_js');
    const btnBack = slider.querySelector('.summary__slider-btn-back_js');
    const btnNext = slider.querySelector('.summary__slider-btn-next_js');
    const pagination = slider.querySelector('.summary__slider-pagination_js');
    const slides = [...innerWrapper.querySelectorAll('.summary__slide_js')];
    const slidesCount = slides.length;
    const paginationDots = [];
    const animationDuration = 500; // время задержки анимации

    let timer = null;
    let slideWidth = wrapper.offsetWidth; // ширина wrapper
    let activeSlideIndex;

    const updateSlideIndex = () => {
        +localStorage.getItem('activeSlideIndex')
            ? (activeSlideIndex = +localStorage.getItem('activeSlideIndex'))
            : (activeSlideIndex = 0);
    }
    updateSlideIndex();

    initWidth();
    createDots();
    setActiveSlide(activeSlideIndex, withAnimation = false);

    window.addEventListener('resize', () => {
        initWidth();
        setActiveSlide(activeSlideIndex, withAnimation = false);
    });

    btnBack.addEventListener('click', () => {
        setActiveSlide(activeSlideIndex - 1);
    });
    btnNext.addEventListener('click', () => {
        setActiveSlide(activeSlideIndex + 1);
    });

    function setActiveSlide(index, withAnimation = true) {
        if(index < 0 || index >= slidesCount) return; // проверяем не было ли переключения без кнопки
        innerWrapper.style.transform = `translateX(${index * slideWidth * (-1)}px)`;

        if(withAnimation) {
            clearTimeout(timer);
            innerWrapper.style.transition = `transform ${animationDuration}ms`;
            timer = setTimeout(() => {
                innerWrapper.style.transition = ''; // снимаем анимацию на время задержки
            }, animationDuration);
        }

        if(index === 0) {
            btnBack.setAttribute('disabled', 'disabled');
        } else {
            btnBack.removeAttribute('disabled');
        }

        if(index === slidesCount - 1) {
            btnNext.setAttribute('disabled', 'disabled');
        } else {
            btnNext.removeAttribute('disabled');
        }

        paginationDots[activeSlideIndex].classList.remove('summary__slider-dot_active');
        paginationDots[index].classList.add('summary__slider-dot_active');


        activeSlideIndex = index; //обновляем значение для дальнейшего пролистывания
        localStorage.setItem('activeSlideIndex', activeSlideIndex);
    }

    function initWidth() {
        slideWidth = wrapper.offsetWidth;

        slides.forEach(slide => {
            slide.style.width = `${slideWidth}px`; 
        });
    }
    function createDots() {
        for (let i = 0; i < slidesCount; i++) {
            const dot = createDot(i);
            paginationDots.push(dot);
            pagination.insertAdjacentElement('beforeEnd', dot);
        }
    }

    function createDot(index) {
        const dot = document.createElement('button');
        dot.classList.add('summary__slider-dot');
        dot.setAttribute('aria-label', 'switch slide');

        if(index === activeSlideIndex) {
            dot.classList.add('summary__slider-dot_active');
        }

        dot.addEventListener('click', () => {
            setActiveSlide(index);
        });

        return dot;
    }
})();

/* ___________________________  SLIDER(swiper.js) __________________________ */

const swiper = new Swiper('.swiper', {
    // Optional parameters
    direction: 'horizontal',
    loop: true,
  
    // Navigation arrows
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });