
function response<T>(message:string,  data: T | null = null, status:boolean=true){
    return {
        status: status,
        message: message,
        data: data
    }
}

export default response;