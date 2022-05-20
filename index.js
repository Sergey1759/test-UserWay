
(async ()=>{
    const targetNode = document.body;
    const config = { childList: true, subtree: true ,attributes: true};
    const callback = async function(mutationsList, observer) {
        for(let mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.target.tagName == 'img') {
                await fillAlt();
            }
            if (mutation.type === 'attributes') {
                if(mutation.attributeName == 'alt'){
                    mutation.target.classList.add('imageChanged');
                }
            }
        }
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    await fillAlt();

    let imageActive;

    document.body.addEventListener("click", (event)=>{
        let myTimer;
        if(event.target.nodeName == "IMG") {
            imageActive = event.target;
            clear();
            event.target.classList.add('imageActive');
            const div = document.createElement('div');
            div.classList.add('popupChangeAlt');
            div.classList.add('myMode');
            div.innerHTML = getHtmlForEditingAlt(event.target, event.target.alt);
            document.body.appendChild(div);

            myTimer = setTimeout((set)=>{
                set.remove();
                set.removeEventListener("mouseenter", mouseEnterListener);
                set.removeEventListener('mouseleave',mouseLeaveListener);
                event.target.classList.remove('imageActive');
                clearTimeout(myTimer);
            },5000,div);

            div.addEventListener("mouseenter", mouseEnterListener);
            div.addEventListener("mouseleave", mouseLeaveListener);

            function mouseEnterListener(){
                clearTimeout(myTimer);
            }
            function mouseLeaveListener(){
                myTimer = setTimeout((set)=>{
                    set.remove();
                    set.removeEventListener("mouseenter", mouseEnterListener);
                    set.removeEventListener('mouseleave',mouseLeaveListener);
                    event.target.classList.remove('imageActive');
                    console.log('leave')
                    clearTimeout(myTimer);
                },5000,div);
            }

        }else if(event.target.className.includes('myMode')){
            if(event.target.id == 'saveAlt') {
                let input = document.querySelector('#newAlt');
                if(input.value){
                    let image = getImg().filter(el => el.src == event.target.dataset.image)[0];
                    image.alt = input.value;
                    saveLocalStorage([image]);
                    event.target.innerText = 'Saved!!!';
                    event.target.style.backgroundColor = 'yellow';
                    setTimeout(()=>{
                        event.target.parentNode.parentNode.remove();
                        imageActive.classList.remove('imageActive');
                    }, 3000)
                } else {
                    input.placeholder = 'this field can`t be empty';
                    input.classList.add('errorInput');
                }
                document.querySelector('#newAlt').addEventListener('focus',(e)=> {
                    e.target.placeholder = '';
                    clearTimeout(myTimer);
                });
            }
            if(event.target.id == 'closeModalWindow'){
                clear();
            }

        }else {
            clear();
        }
    });

    function clear(){
        let popupChangeAlt =  document.querySelector('.popupChangeAlt');
        if(popupChangeAlt)  document.querySelector('.popupChangeAlt').remove();
        let images = getImg();
        images.forEach(img => {
            if(img.className.includes('imageActive')) img.classList.remove('imageActive');
        });
    }

    function getImg(){
        return Array.from(document.getElementsByTagName('img'));
    }
    async function getValuesAlt(count){
        return await fetch(`https://random-word-api.herokuapp.com/word?number=${count}`).then(res => res.json());
    }

    async function fillAlt(){
        const {filtered, imagesSrc} = findStoredImages();
        console.log(filtered);
        if(filtered.length > 0) {
            filtered.forEach(el => el.alt = imagesSrc[el.src]);
        }
        let images = getImg();
        let imagesWithoutAlt = images.filter(img => !img.alt);
        let changedImg = await setAlts(imagesWithoutAlt);
        saveLocalStorage(changedImg)
    }

    async function setAlts(imagesWithoutAlt) {
        let valuesAlts = await getValuesAlt(imagesWithoutAlt.length);
        imagesWithoutAlt.map((img,index) => img.alt = valuesAlts[index]);
        return imagesWithoutAlt;
    }

    function saveLocalStorage(images) {
        let objForSaving = getLocalStorage() || {} ;
        for (const img of images) {
            if(img.getAttribute('src')) {
                objForSaving[img.src] = img.alt;
            }
        }
        localStorage.setItem('withoutAlt', JSON.stringify(objForSaving));
    }

    function getLocalStorage(){
        return JSON.parse(localStorage.getItem('withoutAlt'));
    }

    function findStoredImages(){
        let imagesSrc = getLocalStorage();
        let allImages = getImg();
        let filtered = [];
        if(imagesSrc){
            for (const img of allImages) {
                if(imagesSrc[img.src]) filtered.push(img);
            }
        }
        return {filtered, imagesSrc}
    }

    function getHtmlForEditingAlt(elem,altValue) {
        return `
            <label for="newAlt" class="myMode">To change alt enter text in the text box below </label>
            <input type="text" name="field for new alt" id="newAlt" class="myMode" value="${altValue}">
            <div class="btns myMode" >
                <button value="save alt" aria-label="save alt" class="myMode" id="saveAlt" data-image=${elem.src} >Save</button>
                <button value="close the window" aria-label="close the window" class="myMode" id="closeModalWindow">Close</button>
            </div>
    `;
    }

    function addCSS(){
        let style = document.createElement('style');
        style.innerText = `
        @import url(https://fonts.googleapis.com/css2?family=Metrophobic&display=swap);.popupChangeAlt{background-color:#fff;max-width:-webkit-min-content;max-width:-moz-min-content;max-width:min-content;min-width:250px;font-size:20px;position:fixed;right:0;bottom:0;padding:10px;text-align:center;color:#3368f2;border-left:3px solid #3368f2;border-top:3px solid #3368f2;border-radius:10px 0 0 0;font-family:Metropolis,sans-serif;z-index:999;line-height:1.15;font-weight:500}.popupChangeAlt .btns{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-justify-content:space-around;-ms-flex-pack:distribute;justify-content:space-around;padding-top:15px;font-family:Metropolis,sans-serif}.popupChangeAlt input{width:100%;font-size:20px;background-color:#fff;color:#3368f2;margin-top:20px;margin-bottom:10px;outline:#3368F2;-webkit-box-sizing:border-box;box-sizing:border-box;border:3px solid rgba(51,104,242,.36);-webkit-transition:.5s;-o-transition:.5s;transition:.5s;font-family:Metropolis,sans-serif}.popupChangeAlt input:focus{-webkit-transition:.5s;-o-transition:.5s;transition:.5s;border:2px solid #3368f2;outline:#3368F2;background-color:rgba(51,104,242,.1)}.popupChangeAlt button{color:#3368f2;font-weight:700;font-size:18px;background-color:rgba(240,248,255,.42);border:#3368f2;border-radius:5px}.popupChangeAlt button{color:#3368f2;font-weight:400;font-size:20px;background-color:rgba(240,248,255,0);border:#3368f2;border-radius:5px;-webkit-transition:.5s;-o-transition:.5s;transition:.5s;border:3px solid rgba(0,0,0,.2);outline:#3368F2}.btns button:hover{cursor:pointer;background-color:rgba(51,104,242,.38);border:3px solid #3368f2}.imageActive{border:5px solid #3368f2;-webkit-transform:scale(1.2);-ms-transform:scale(1.2);transform:scale(1.2)}.errorInput::-webkit-input-placeholder{color:#f89a5f}.imageChanged{border:3px solid red}
        `;
        document.body.appendChild(style);
    }
    addCSS();
})();