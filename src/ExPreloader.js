import Utils from "./Utils";
import PageMetaStore from "./PageMetaStore";


const ExPreloader = (() => {
    const privateMember = new WeakMap();

    const _getVal = (obj, key) => {
        const member = privateMember.get(obj);
        return (typeof member == 'undefined') ? undefined : member[key];
    };

    const _setVal = (obj, key, val) => {
        const member = privateMember.get(obj);

        if(typeof member == 'undefined'){
            const o = {};
            o[key] = val;
            privateMember.set(obj, o);
            return;
        }
        member[key] = val;
        privateMember.set(obj, member);
        return;
    };

    let resizeHandler = null;

    const updateSize = size => {
        Utils.updateSize(size.width, size.height);
    };

    return class {
        constructor(gid, showKey){
            const store = new PageMetaStore(gid, showKey);

            this.currentPage = store.currentPage;
            _setVal(this, 'store', store);
            _setVal(this, 'isInfoSet', false);
        }

        async preload(onprogress, onload){
            const store = _getVal(this, 'store');
            await store.initPage(onprogress, onload);
        }

        updatePage(page){
            const store = _getVal(this, 'store');
            
            store.updateCurrentPage(page);
            let pageMeta = store.getPage(page);

            const _fn = () => {
                pageMeta = store.getPage(page);
                document.getElementById("i2").innerHTML = pageMeta.html.i2;
                document.getElementById("i4").innerHTML = pageMeta.html.i4;
                document.getElementById("i5").innerHTML = pageMeta.html.i5;
                document.getElementById("i6").innerHTML = pageMeta.html.i6;
                document.getElementById("i7").innerHTML = pageMeta.html.i7;
                const img = new Image();
                const a = document.createElement('a');
                a.addEventListener('click', evt => {
                    load_image(page+1, pageMeta.nextImgHash);
                });
                a.href = pageMeta.html.nextPageHref;
                img.setAttribute('id', 'img');
                img.src = URL.createObjectURL(pageMeta.binary);
                img.style.width = pageMeta.size.width;
                img.style.height = pageMeta.size.height;
                a.appendChild(img);
                document.getElementById("i3").innerHTML = '';
                document.getElementById("i3").appendChild(a);
                updateSize(pageMeta.size);
                this.currentPage = page;
            };

            if(pageMeta === null){
                return;
            }
            else {
                _fn();
            }
        }

        listenResize(bool){
            const _this = this;
            const zip = new JSZip();

            if(bool === false){
                if(resizeHandler === null){
                    return;
                }

                window.removeEventListener('resize', resizeHandler);
                resizeHandler = null;
            }
            else if(bool === true){
                if(resizeHandler !== null) {
                    return;
                }

                resizeHandler = event => {
                    const store = _getVal(_this, 'store');
                    const pageMeta = store.getPage(store.currentPage);
                    
                    Utils.updateSize(pageMeta.size.width, pageMeta.size.height);
                };

                window.addEventListener('resize', resizeHandler);
            }
        }

        packStoredImg(cb){
            const store = _getVal(this, 'store');

            const zip = new JSZip();

            for(let i = 1 ; i<=store.maxPage; i++){
                const pageMeta = store.getPage(i);
                if(pageMeta !== null){
                    zip.file(
                        pageMeta.name,
                        pageMeta.binary
                    );
                }
            }

            zip.generateAsync({type : "blob"}).then(zipFile => {
                const a = document.createElement("a");
                a.href = URL.createObjectURL(zipFile);
                a.download = document.querySelector('title').innerText.trim() + '.zip';
                a.click();

                if(typeof cb == 'function'){
                    cb();
                }
            });
        }

        installStatusInfo(){
            if(_getVal(this, 'isInfoSet')){
                return;
            }

            const _this = this;

            const div = document.createElement('div');

            Object.assign(div.style, {
                padding: '1rem 0',
                textAlign: 'center'
            });

            const status = document.createElement('div');

            const infoContainer = document.createElement('span');
            infoContainer.style.marginRight = '1.5rem';
            status.appendChild(infoContainer);

            const downloadBtn = document.createElement('button');
            downloadBtn.innerText = '下載目前緩存';

            let canClick = true;
            downloadBtn.addEventListener('click', evt => {
                if(canClick){
                    canClick = false;
                    _this.packStoredImg(() => {canClick = true});
                }
            });

            status.appendChild(downloadBtn);
            const setInfo = (isBusy, str) => {
                infoContainer.innerHTML = '';
                const span = document.createElement('span');
                span.innerText = str;
                span.style.color = isBusy ? 'red' : 'blue';
                span.style.fontSize = '1rem';
                infoContainer.appendChild(span);
            }

            document.getElementById('i1').insertBefore(
                status,
                document.getElementById('i2')
            );

            _setVal(this, 'isInfoSet', true);

            return setInfo;
        }

        get maxPage(){
            const store = _getVal(this, 'store');
            return store.maxPage;
        }

        set preLookPage(page){
            const store = _getVal(this, 'store');
            store.preLookPage = page;
        }

        get preLookPage(){
            const store = _getVal(this, 'store');
            return store.preLookPage;
        }
    }
})();

export default ExPreloader;