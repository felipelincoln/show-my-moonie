var images = {}

async function refresh(){
  let els = document.getElementsByTagName('article')

  for (let el of els){
    // 1. Get article's tokenId from the anchor tag
    let [contract, tokenId] = el.getElementsByClassName('Asset--anchor')[0].href.split('/').slice(-2) // obter tokenId e converter em hex
    let hexTokenId = parseInt(tokenId).toString(16).padStart(10, '0')
    let hexData = '0xc87b56dd000000000000000000000000000000000000000000000000000000' + hexTokenId

    if(tokenId >= 6000){return false}

    if(contract == '0xcab4f7f57af24cef0a46eed4150a23b36c29d6cc'){
      if(images[tokenId]){
        el.getElementsByClassName('Image--image')[0].src = images[tokenId]
      }
      else {
        let body = JSON.stringify({
          jsonrpc: '2.0',
          id: '1',
          method: 'eth_call',
          params: [{data: hexData, to: contract}, "latest"]
        })

        // 2. Interact with the moonie contract to get the metadata ipfs link
        let web3Metadata = await fetch('https://rpc-mainnet.maticvigil.com/', {method: 'POST', body: body}).then(r => {return r.json()})
        let metadataId = hexToUtf8(web3Metadata.result)

        // 4. Make a get request to the ipfs link to retrieve the "image" url
        let ipfsMetadata = await fetch('https://ipfs.io/ipfs/' + metadataId).then(r => {return r.json()})
        let imageId = ipfsMetadata.image.split('//').slice(-1)[0]
        let image = 'https://ipfs.io/ipfs/' + imageId

        console.log(ipfsMetadata.name + ' image loaded!')

        // 5. Set the image url in the article's image
        el.getElementsByClassName('Image--image')[0].src = image
        images[tokenId] = image
      }
    }
  }
}

setInterval(refresh, 1000)

var hexToUtf8 = function(hex) {
    var str = "";
    var code = 0;
    hex = hex.replace(/^0x/i,'');

    // remove 00 padding from either side
    hex = hex.replace(/^(?:00)*/,'');
    hex = hex.split("").reverse().join("");
    hex = hex.replace(/^(?:00)*/,'');
    hex = hex.split("").reverse().join("");

    var l = hex.length;

    for (var i=0; i < l; i+=2) {
        code = parseInt(hex.substr(i, 2), 16);
        // if (code !== 0) {
        str += String.fromCharCode(code);
        // }
    }

    return str.split('//').slice(-1)[0];
};
