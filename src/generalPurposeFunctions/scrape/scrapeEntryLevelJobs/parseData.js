/*
    https://www.indeed.com/jobs?q=software+developer&jt=fulltime&explvl=entry_level
    
    https://www.linkedin.com/jobs/search/?f_E=2&f_JT=F&geoId=92000000&keywords=Data%20Entry%20Clerk&location=Worldwide

    https://www.linkedin.com/jobs/search/?f_E=2&f_JT=F&geoId=92000000&keywords=ER%20Nurse&location=Worldwide
    
    

    body > div.application-outlet > div.authentication-outlet > div.job-search-ext > div > div > section.jobs-search__left-rail > div > header > div.jobs-search-results-list__title-heading > small
    
    body > div.application-outlet > div.authentication-outlet > div.job-search-ext > div > div > section.jobs-search__left-rail > div > header > div.jobs-search-results-list__title-heading > small
    
*/

    const scrapeData = async (data)=>{
        const fs = require('fs');
        const writeStream = fs.createWriteStream('data.csv');
        const cheerio = await require('cheerio')
        const fetch = await require('isomorphic-fetch')
        let results = []
        let url = ''
        let encoded = ''
        // await data.forEach(async element => {
        //     encoded = encodeURI(data[element])
        //     url = `https://www.linkedin.com/jobs/search/?f_E=2&f_JT=F&geoId=92000000&keywords=${encoded}&location=Worldwide`
        //     const response = await fetch(url)
        //     const text = await response.text()
        //     const load = await cheerio.load(text)
        //     const content = await load('#main-content > div > section > div.results-context-header > h1 > span.results-context-header__job-count').text()
        //     console.log(content)
            
        //     await results.push(content)
        // });
        // console.log(results[0])
        // console.log(results[20])
        // console.log(results[100])
        let i = 100
        while(i<data.length){
            encoded = encodeURI(data[i])
            url = `https://www.linkedin.com/jobs/search?keywords=${encoded}&location=Worldwide&geoId=92000000&trk=public_jobs_jobs-search-bar_search-submit&f_E=2&f_JT=F&sortBy=R&redirect=false&position=1&pageNum=0`
            const response = await fetch(url)
            const text = await response.text()
            const load = await cheerio.load(text)
            const content = load('#main-content > div > section > div.results-context-header').text()
            writeStream.write(`${content} \n`);
            console.log(content)
            i++
        }
            // encoded = encodeURI('Computer Programmer')
            // url = `https://www.linkedin.com/jobs/search?keywords=${encoded}&location=Worldwide&geoId=92000000&trk=public_jobs_jobs-search-bar_search-submit&f_E=2&f_JT=F&sortBy=R&redirect=false&position=1&pageNum=0`
            // const response = await fetch(url)
            // const text = await response.text()
            // const load = await cheerio.load(text)
            // const content = load('#main-content > div > section > div.results-context-header').text()
            // writeStream.write(`${content} \n`);
            // console.log(content)
    }

    const parseData = async ()=>{
    const parse = require('csv-parser');
    const fs = require('fs');
    let csvData = []
    let parsedData = []
    await fs.createReadStream('Book1.csv')
      .pipe(parse({
          delimiter: ','
      })
      )
      .on('data', function (row) {
        csvData.push(row)
      })
      .on('end', async() => {
          parsedData.push('Account Clerk')
          await csvData.forEach( async element => {
              await parsedData.push(Object.values(element)[0])
          })
          scrapeData(parsedData)
      })
}
parseData()