const saveArrayToExcel = (arr)=>{
    const fs = require('fs');
    const writeStream = fs.createWriteStream('newdata99.csv');
    arr.forEach(element => {
        writeStream.write(`${element} \n`);    
    });
}
module.exports = saveArrayToExcel