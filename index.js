
(async ()=>{
    const targetNode = document.body;
    const config = { childList: true, subtree: true };
    const callback = async function(mutationsList, observer) {
        for(let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                await fillAlt();
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
        try{ document.querySelector('.popupChangeAlt').remove(); } catch (e) { console.log(e);}
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
        try {
            const {filtered, imagesSrc} = findStoredImages();
            if(filtered.length > 0) {
                filtered.forEach(el => el.alt = imagesSrc[el.src]);
            }
        } catch (e) {
            console.log(e);
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
        const filtered = allImages.filter(el => imagesSrc[el.src]);
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
        .popupChangeAlt{background-color:#6b778d;max-width:min-content;min-width:250px;font-size:20px;position:fixed;right:0;bottom:0;padding:10px;text-align:center;color:#e7c944;border-left:3px solid #f6ec2a;border-top:3px solid #f6ec2a;border-radius:10px 0 0 0;font-family:Arial;z-index:999}.popupChangeAlt .btns{display:flex;align-items:center;justify-content:space-around;padding-top:15px}.popupChangeAlt input{width:100%;font-size:20px;background-color:#6b778d;color:#e7c944;margin-top:20px;margin-bottom:10px;outline:#e7c944;box-sizing:border-box;border:2px solid rgba(255,225,108,.42);transition:.5s}.popupChangeAlt input:focus{transition:.5s;border:2px solid #ffe16c;outline:#e7c944;background-color:#6b778d}.popupChangeAlt button{color:#e7c944;font-weight:700;font-size:18px;background-color:rgba(240,248,255,.42);border:#e7c944;border-radius:5px}.popupChangeAlt button{color:rgba(231,201,68,.75);font-weight:700;font-size:20px;background-color:rgba(240,248,255,0);border:#e7c944;border-radius:5px;transition:.5s;border:2px solid rgba(231,201,68,0);outline:#e7c944}.popupChangeAlt button:focus{color:#e7c944;background-color:#f0f8ff;border:2px solid #e7c944;border-radius:5px;transition:.5s}.btns button:hover{cursor:pointer}.imageActive{border:5px solid #e7c944;transform:scale(1.2)}.errorInput::-webkit-input-placeholder{color:#f89a5f}
        `;
        document.body.appendChild(style);
    }
    addCSS();
})();