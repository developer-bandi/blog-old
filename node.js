const thenable = {
  // Could be a promise object, but does not have to be
  then(success, fail) {
    setTimeout(() => success("성공!"), 1000)
  },
}

const p = new Promise((resolve, reject) => {
  console.log("1. pending 상태로 Promise가 생성됩니다")
  setTimeout(() => {
    reject(thenable)
    console.log("2. thenable과 함께 reject됩니다.")
  }, 1000)
})

p.catch(err => console.log(`3. "${err}" 에러메세지와 함께 reject됩니다.`))
