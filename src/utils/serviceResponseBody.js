export function serviceResponse(success, message, data){
    return {
        success:success,
        message:message,
        data:data
    }
}