/* role
Name
Education_Degree
Salary
Jobs
Summary
Detail
Skills
Qualification
Education_Summary
*/
require('../database/dbConnect')
const Roles = require('../models/roles/roles')
const fs = require('fs')
const parse = require('csv-parser')
const arr = []
const database = async ()=>{
    //const Roles = require('../models/roles/roles')
    console.log(arr)
    // let education_degree = [...Object.values(element)[1].split(', ')]
    // let detail = [...Object.values(element)[5].split('. ')]
    // let skills = [...Object.values(element)[6].split('. ')]
    // let qualifications = [...Object.values(element)[7].split('. ')]
    //console.log(qualifications)
    try {
        let Prom1 = await new Roles({
            role: Object.values(csvData[i])[0],
            education_degree,
            salary: Object.values(csvData[i])[2],
            jobs: Object.values(csvData[i])[3],
            summary: Object.values(csvData[i])[4],
            detail,
            skills,
            qualifications,
            education_summary: Object.values(csvData[i])[8],
        })
        await Prom1.save()
        console.log(Prom1)
    } catch (error) {
        console.log(error)
    }
}
const readCsv = async () =>{
    let csvData = []
    let parsedData = []
    await fs.createReadStream(`book1.csv`)
    .pipe(parse({
        delimiter: ','
    })
    )
    .on('data', function (row) {
        csvData.push(row)
    })
    .on('end', async() => {
        let i = 0
        await csvData.forEach(async element => {
            arr.push(Object.values(element)[0])
            let education_degree = [...Object.values(element)[1].split(', ')]
            let detail = [...Object.values(element)[5].split('. ')]
            let skills = [...Object.values(element)[6].split('. ')]
            let qualifications = [...Object.values(element)[7].split('. ')]
            let sortJobs = Object.values(element)[3].split('+')[0]
            sortJobs = sortJobs.split(',')
            sortJobs = (sortJobs[0] + sortJobs[1])
            let sortSalary = (Object.values(element)[2].split(' per')[0])
            try {
                let Prom1 = await new Roles({
                    role: Object.values(element)[0].trim(),
                    education_degree,
                    salary: Object.values(element)[2],
                    jobs: Object.values(element)[3],
                    summary: Object.values(element)[4],
                    detail,
                    skills,
                    qualifications,
                    education_summary: Object.values(element)[8],
                    sortJobs: parseInt(sortJobs),
                    sortSalary: parseInt(sortSalary)
                })
                await Prom1.save()
                console.log('a')
            } catch (error) {
                console.log(error)
            }
        })
    })
    
}
readCsv()