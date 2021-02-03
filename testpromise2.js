const testPromise2 = () => new Promise((resolve,reject) => {console.log("testPromise2"); resolve(2)})
const testPromise4 = () => new Promise((resolve,reject) => {console.log("testPromise4"); resolve(4)})
const v = () => console.log("test"); 
function delay(t, v ) {
  return new Promise(function(resolve) { 
      setTimeout(resolve.bind(null, v()), t)
  });
}
const test = async () => {
await delay(10000, v);
console.log("on the end");
}

test()

// new Promise(function(resolve, reject) {

//     setTimeout(() => resolve(1), 1000); // (*)
  
//   }).then( function(result) { // (**)
  
//     console.log(result); // 1
//     setTimeout(() => console.log("test setTimeout in result 1"), 50)
//     .then (() =>   testPromise2())
//     //return result * 2;
    
  
//   }).then( function(result) { // (***)
  
//     console.log(result); // 2
//     setTimeout(() => console.log("test setTimeout in result 2"), 50);
//     //return result * 2;
//     return  testPromise4()
  
//   }).then( function(result) {
  
//     console.log(result); // 4
//     setTimeout(() => console.log("test setTimeout in result 4"), 50);
//     return result * 2;
  
//   });

// var  test =  setTimeout(() =>  console.log("test setTimeout "), 5000);
// console.log(test);

