class Utils {
    static corsImage(url){ 
        return new Promise(resolve => {
            GM.xmlHttpRequest({
                method: 'GET',
                url,
                responseType: 'arraybuffer',
                onload(xhr){
                    const buf = xhr.response;
                    const type = xhr
                                    .responseHeaders
                                    .split('\n')
                                    .find(e => /Content\-Type/i.test(e))
                                    .trim()
                                    .replace(/Content\-Type.?:/i, '')
                                    .trim()
                    ;
                    const b = new Blob([buf], {type});
                    return resolve(b);
                }
            });
        });
    }

    static extractImgHash(prevOnclickFn, nextOnclickFn){
        const prevImgHash = eval(`
            function load_image(n, hash){
                return hash;
            };
            ${prevOnclickFn};
            onclick(null)
        `);
        
        const nextImgHash = eval(`
            function load_image(n, hash){
                return hash;
            };
            ${nextOnclickFn};
            onclick(null)
        `);
        
        return { prevImgHash, nextImgHash };
    }

    static updateSize(xres, yres){
        let d = Math.max(700, window.innerWidth - 70);
        let b = xres;
        let c = yres;
        if (b > d) {
            c = Math.round(c * d / b);
            b = d
        }
        const a = document.getElementById("img");
        const e = document.getElementById("i1");
        a.style.maxWidth = b + "px";
        a.style.maxHeight = c + "px";
        e.style.maxWidth = (b + 20) + "px";
    }
};

export default Utils;