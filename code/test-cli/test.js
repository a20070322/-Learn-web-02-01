// let timeout = (sec, fn) => {
//     const now = new Date().getTime()
//     let flag = true
//     while (flag) {
//         const after = new Date().getTime()
//         const dealy = sec * 1000
//         if (after - dealy >= now) {
//             flag = false
//         }
//     }
//     return new Promise(resolve => {
//         resolve(fn())
//     })
// }
// async function tryWithAsync(sec, fn) {
//     const res = await timeout(sec, fn)
//     console.info(res)
// }
// const fn = () => {
//     return new Date().getTime()
// }

// tryWithAsync(5, fn)

// const res = timeout(1, fn).then(res => {
//     console.info(res)
// })

// let timeout = (sec, num) => {
//     const now = new Date().getTime()
//     let flag = true
//     let count = 0
//     while (flag) {
//       count++
//       const after = new Date().getTime()
//       const dealy = sec * 1000
//       if (after - dealy >= now) {
//         flag = false
//       }
//     }
//     return new Promise((resolve, reject) => {
//       resolve(num * num)
//     })
//   }
//   async function tryWithAsync(sec, num) {
//     const res = await timeout(sec, num)
//     console.info(res)
//   }
//   tryWithAsync(5, 10)

//   let result = ''
//   const res = timeout(1, 20)
//   res.then(x => { 
//     result = x
//     console.info(result) 
//   })