import Utils from "./Utils";
import RequestAPI from "./RequestAPI";

const PageMetaStore = (() => {

    const getCurrentPage = () => {
        return document.querySelector('#i4 .sn div')
                        .innerText
                        .split('/')
                        .map(t => +(t.trim()))
                ;
    };

    return class {
        constructor(gid, showKey){
            const page = getCurrentPage();

            const firstImg = document.getElementById('img');
            const firstImgSize = {
                width: +(firstImg.style.width.replace(/[^0-9]+/, '')),
                height: +(firstImg.style.height.replace(/[^0-9]+/, ''))
            };


            const { prevImgHash, nextImgHash } = Utils.extractImgHash(
                document.getElementById('prev').onclick.toString(),
                document.getElementById('next').onclick.toString()
            );

            const store = new Array(page[1]).fill(null);

            store[page[0] - 1] = {
                size: firstImgSize,
                prevImgHash,
                nextImgHash,
                source: firstImg.src,
                binary: null,
                html: {
                    i2: document.getElementById("i2").innerHTML,
                    i4: document.getElementById("i4").innerHTML,
                    i5: document.getElementById("i5").innerHTML,
                    i6: document.getElementById("i6").innerHTML,
                    i7: document.getElementById("i7").innerHTML,
                    nextPageHref: document.querySelector('#i3 a').href
                },
                name: document.getElementById('i4').innerText.split('::')[0].trim()
            };

            this.getPage = pageNum => {
                return store[pageNum - 1];
            };

            this.setPage = (pageNum, obj) => {
                store[pageNum - 1] = obj;
            };

            this.currentPage = page[0];
            this.maxPage = page[1];
            this.gid = gid;
            this.showKey = showKey;

        }

        updateCurrentPage(page){
            this.currentPage = page;
        }

        async initPage(onprogress, onload, waitLoading=null){
            const arrayIdx = this.currentPage - 1;
            const lookPrev = arrayIdx >= 5 ? 5 : arrayIdx;
            const lookAhead = (this.maxPage - 1) - 5 >= 5 ? 5 : (this.maxPage - 1) - 5;

            let currentPageStore = this.getPage(this.currentPage);

            if(currentPageStore.binary === null){
                if(typeof onprogress == 'function'){
                    onprogress('Binary', this.currentPage);
                }

                currentPageStore.binary = await Utils.corsImage(currentPageStore.source)
            }


            for(let i = 1; i<=lookPrev; i++){
                const pageStore = this.getPage(arrayIdx-i + 1);

                if(pageStore === null){
                    if(typeof onprogress == 'function'){
                        onprogress('MetaData', arrayIdx-i + 1);
                    }

                    const pageStoreRst = await RequestAPI(
                        this.gid,
                        this.showKey,
                        currentPageStore.prevImgHash,
                        arrayIdx-i + 1
                    );

                    if(typeof onprogress == 'function'){
                        onprogress('Binary', arrayIdx-i + 1);
                    }

                    const binary = await Utils.corsImage(pageStoreRst.source);
                    
                    currentPageStore = {
                        ...pageStoreRst,
                        binary
                    };

                    this.setPage(arrayIdx-i + 1, currentPageStore);
                }
            }

            currentPageStore = this.getPage(this.currentPage);

            for(let i = 1; i<=lookAhead; i++){
                const pageStore = this.getPage(arrayIdx+i + 1);
                if(pageStore === null){
                    if(typeof onprogress == 'function'){
                        onprogress('MetaData', arrayIdx+i + 1);
                    }

                    const pageStoreRst = await RequestAPI(
                        this.gid,
                        this.showKey,
                        currentPageStore.nextImgHash,
                        arrayIdx+i + 1
                    );

                    if(typeof onprogress == 'function'){
                        onprogress('Binary', arrayIdx+i + 1);
                    }

                    const binary = await Utils.corsImage(pageStoreRst.source);
                    
                    currentPageStore = {
                        ...pageStoreRst,
                        binary
                    };
                    this.setPage(arrayIdx+i + 1, currentPageStore);
                }
            }

            if(typeof onload == 'function'){
                onload();
            }

            if(typeof waitLoading == 'function'){
                waitLoading();
            }
        }

    }

})();

export default PageMetaStore;