export class AppError extends Error {
    statusCode: number;
    // Normally, Error has: message, stack , name property
    // But, we extend it and add a status code in it. So, now it is: message, stack , name, statusCode

    constructor(statusCode: number, message: string) {
        super(message) // It tells parent (Error) to "Please save this message.". Otherwise, it would be empty
        this.statusCode = statusCode // Now we're saving our own information.

        Object.setPrototypeOf(this, AppError.prototype)
        // Sometimes, when extending build in class like 'Error', JavaScript gets confused and treats object like a 
        // plain 'Error' instead of an 'AppError'
        // Object.setPrototypeOf - Fix this problem. It tells JS that this object was created from 'AppError'
    }
}