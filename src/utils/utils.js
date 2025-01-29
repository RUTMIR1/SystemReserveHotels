export const messageErrorZod = (zodMessage)=>{
    return zodMessage.error.issues.map(el=> {
        return el.message;
    }).join(' - ');
}