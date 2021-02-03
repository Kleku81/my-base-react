var arr = [] 

const fun1 = async () => {
    
     console.log("fun1");
    //console.log("fun2");
    await resolveAfter2Seconds()
     //await fun2(); 
      console.log("fun3")
    
}

const fun2 = async () => {
    //process.nextTick(() => 
    console.log("fun4")
    setImmediate(() => 
    console.log("fun2")
    );
    return 0;
}

function resolveAfter2Seconds() {

  return new Promise(resolve => { resolve('resolved')  
    // return new Promise(resolve => {
    //   setTimeout(() => {
    //     console.log("log resolved");
    //     resolve('resolved');
    //   }, 0);
    // });
  })
}

  const fun4 = async (i) => {
   
   console.log("test_before "+ i)
   console.log(arr); 
   arr.push(i);
   const result = await  resolveAfter2Seconds();
   console.log(result);

   //await setTimeout(() =>  console.log(i));
   console.log("test_after "+ i)

   return new Promise((resolve) => { resolve("ok"); } )



  }

const fun3 = (i) => {

//var arr = [0,1,2,3,4,5,6,7,8,9] 
// for(var i = 0; i < 10; i++ )   
// fun4(i)

//{
//arr.reduce((j, i) => 


i++;
if (i < 10)
fun4(i).then( fun3(i))


//console.log(i)
//fun1()
//await fun2()
//fun1()
//await fun2()
}

fun3(0); 

// let ratings = [5, 4, 5];
// let sum = 0;

// // let sumFunction =  function (a, b)
// // {
// //   return a + b
// // }

// // let sumFunction =  function (a, b)
// // {
// //   return a + b
// // }

//  sum = ratings.reduce( (sum, rating) =>
//   sum + rating
// )

// console.log(sum);

