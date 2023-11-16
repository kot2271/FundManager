export const delay = async (time: number) => {
    console.log('Wait for delay...');
    return new Promise((resolve: any) => {
      setInterval(() => {
        resolve()
      }, time)
    })
  }