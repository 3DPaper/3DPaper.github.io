test = []

function asyncFunction1() {
    return new Promise(function (resolve) {
        setTimeout(function() {
            console.log(1)
            test.push(1)
            resolve()
        }, 1000)
    })
}

function asyncFunction2() {
    return new Promise(function (resolve) {

        console.log("test length is")
        console.log(test.length)
        resolve()
    })
}

function asyncFunction3() {
    return new Promise(function (resolve) {
        setTimeout(function() {
            console.log(3)
            resolve()
        }, 100)
    })
}

//asyncFunction1()
//asyncFunction2()
//asyncFunction3()

asyncFunction1()
    .then(function(result) {
        return asyncFunction2()
    })
    .then(function(result) {
        return asyncFunction3()
    })
    .catch(function(error) {
        console.log(error)
    })