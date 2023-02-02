let main = document.querySelector("main");
const imgCat = 'imgs/cat.jpg'
const updCards = function (data) {
    let count = 0;
    main.innerHTML = "";
    data.forEach(function (cat) {
        if (cat.id) {
            let card = `<div class="${cat.favourite ? "card like" : "card"}" data-catId="${count}" style="background-image:
    url(${cat.img_link || imgCat})">
    <span>${cat.name}</span>
    </div>`;
            main.innerHTML += card;
        }
        ++count;
    });
    let cards = document.querySelectorAll(".card");
    cards.forEach(el => {
        const width = el.offsetWidth;
        el.style.height = width * 0.6 + 'px';

        el.addEventListener('click', popupinfo)
    })
}



const api = new Api("mi-gl");


let form = document.forms[0];
form.img_link.addEventListener("change", (e) => {
    form.firstElementChild.style.backgroundImage = `url(${e.target.value})`
})
form.img_link.addEventListener("input", (e) => {

    form.firstElementChild.style.backgroundImage = `url(${e.target.value})`
})
form.addEventListener("submit", e => {
    e.preventDefault();
    let body = {};
    for (let i = 0; i < form.elements.length; i++) {
        let inp = form.elements[i];
        if (inp.type === "checkbox") {
            body[inp.name] = inp.checked;
        } else if (inp.name && inp.value) {
            if (inp.type === "number") {
                body[inp.name] = +inp.value;
            } else {
                body[inp.name] = inp.value;
            }
        }
    }
    console.log(body);
    api.addCat(body)
        .then(res => res.json())
        .then(data => {
            if (data.message === "ok") {
                form.reset();
                closePopupForm.click();
                api.getCat(body.id)
                    .then(res => res.json())
                    .then(cat => {
                        if (cat.message === "ok") {
                            catsData.push(cat.data);
                            localStorage.setItem("cats", JSON.stringify(catsData));

                            getCats(api, catsData);
                        } else {
                            console.log(cat);
                        }
                    })
            } else {
                console.log(data);
                api.getIds().then(r => r.json()).then(d => console.log(d));
            }
        })
})

let catsData = localStorage.getItem("cats");
catsData = catsData ? JSON.parse(catsData) : [];
const getCats = function (api, store) {
    if (!store.length) {
        api.getCats()
            .then(res => res.json())
            .then(data => {
                console.log(data);
                if (data.message === "ok") {
                    localStorage.setItem("cats", JSON.stringify(data.data));
                    catsData = [...data.data];
                    updCards(data.data);
                }
            })
    } else {
        updCards(store);
    }
}
getCats(api, catsData);

function popupinfo() {
    const img_link = catsData[this.dataset.catid].img_link;
    let modalInfo = document.createElement('div');
    modalInfo.className = 'modalInfo';
    modalInfo.innerHTML = `
    <div class="popup-info active">
    <div class="popup active">
    <div class="popup_info-close btn"><i class="fa-solid fa-xmark"></i></div>
    <h2>Информация о питомце</h2>
    <p>Имя: ${catsData[this.dataset.catid].name}</p>
    <p>id питомца: ${catsData[this.dataset.catid].id}</p>
    <p>Возраст: ${catsData[this.dataset.catid].age}</p>
    <p>Рейтинг: ${catsData[this.dataset.catid].rate}</p>
    <p>Описание: ${catsData[this.dataset.catid].description}</p>
    <p>Любимчик: 
    ${catsData[this.dataset.catid].favourite ? "Да" : "Нет"}
    </p>
    <p>Картинка:</p>
    <img style="width:300px;heigth:300px" src="
    ${img_link ? img_link : imgCat}
    ">
    <button class="deleteCat btn" type="button">Удалить питомца из базы</button>
    </div>
    </div>
    `
    document.body.append(modalInfo)
    const closeInfo = document.querySelector('.popup_info-close');
    const btnDeleteCat = document.querySelector('.deleteCat');
    closeInfo.addEventListener('click', closeModalInfo)
    btnDeleteCat.addEventListener('click', () =>
        deleteCat(catsData[this.dataset.catid].id));
}

function deleteCat(catId) {
    let findInxCard = catsData.findIndex(e => e.id == catId)
    if (findInxCard == -1) {
        closeModalInfo();
        return console.error('Error deleting a pet. IndexCard = -1');
    }

    api.delCat(catId)
        .then(res => res.json())
        .then(data => {
            if (data.message === "ok") {
                catsData.splice(findInxCard, 1);
                localStorage.setItem('cats', JSON.stringify(catsData));
                updCards(catsData);
                closeModalInfo();
            } else {
                console.error('Error deleting a pet');
            }
        });
}

function closeModalInfo(){
    modalInfo = document.querySelector('.modalInfo')
    modalInfo.remove();
}

let addBtn = document.querySelector("#add");
let popupForm = document.querySelector("#popup-form");
let closePopupForm = popupForm.querySelector(".popup-close");
addBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (!popupForm.classList.contains("active")) {
        popupForm.classList.add("active");
        popupForm.parentElement.classList.add("active");
    }
});
closePopupForm.addEventListener("click", () => {
    popupForm.classList.remove("active");
    popupForm.parentElement.classList.remove("active");
})
