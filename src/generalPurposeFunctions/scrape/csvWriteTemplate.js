const saveArrayToExcel = (arr)=>{
    const fs = require('fs');
    const writeStream = fs.createWriteStream('newdata.csv');
    arr.forEach(element => {
        writeStream.write(`${element.US} \n`);    
    });
}
module.exports = saveArrayToExcel