const delay = async (milliseconds) => {
    console.log(`Waiting: ${milliseconds / 1000} seconds.`);return new Promise((resolve) => {
      setTimeout(() => {
        resolve(milliseconds);
      }, milliseconds);
    });
  }

const delay1 =  (milliseconds) => {
      //setTimeout(() => { 
    
    return new Promise((resolve,reject) => {
      console.log(`Waiting: ${milliseconds / 1000} seconds.`);
        resolve(milliseconds);

    });
  
  }
  const delays = [1000, 2000, 5000, 3000, 500, 12000];
  const startTime = Date.now();
  
  const doNextPromise = async  (d) => {   delay1(delays[d])    .then(x => {
        console.log(`Waited: ${x / 1000} seconds\n`);
        d++;      if (d < delays.length)
           doNextPromise(d)
        else
          console.log(`Total: ${(Date.now() - startTime) / 1000} seconds.`);    })
  }
  doNextPromise(0);

  const iterator = iteratorGenerator(['apple', 'orange', 'watermelon']);