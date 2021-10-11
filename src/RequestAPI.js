import Utils from "./Utils";

const RequestAPI = (gid, showKey, imgKey, page) => new Promise(resolve => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        const { i3, n, x, y, i, i2, i4 ,i5 ,i6 ,i7 } = JSON.parse(xhr.responseText);
        
        const i3Doc = new DOMParser().parseFromString(i3, 'text/html');
        const iDoc = new DOMParser().parseFromString(i, 'text/html');
        const nDoc = new DOMParser().parseFromString(n, 'text/html');

        const { prevImgHash, nextImgHash } = Utils.extractImgHash(
            `function onclick(event) {${nDoc.getElementById('prev').getAttribute('onclick')}}`,
            `function onclick(event) {${nDoc.getElementById('next').getAttribute('onclick')}}`
        );

        return resolve({
            source: i3Doc.getElementById('img').getAttribute('src'),
            size: { width: x, height: y },
            prevImgHash,
            nextImgHash,
            html: {
                i2: n + i,
                i3,
                i4: i + n,
                i5,
                i6,
                i7,
                nextPageHref: i3Doc.querySelector('a').getAttribute('href')
            },
            name: iDoc.querySelector('div').innerText.split('::')[0].trim()
        });
    };

    xhr.open('POST', '/api.php');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        gid,
        imgkey: imgKey,
        showkey: showKey,
        page,
        method: "showpage"
    }));
});

export default RequestAPI;