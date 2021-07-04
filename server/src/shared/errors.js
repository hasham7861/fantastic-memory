class CustomError extends Error {
    constructor(args, errorName){
        super(args)
        this.name = errorName
    }
}

export class UserError extends CustomError {
    constructor(args){
        super(args, "UserError")
    }
}

export class GameError extends CustomError {
    constructor(args){
        super(args, "GameError")
    }
}

export class AppError extends CustomError {
    constructor(args){
        super(args,"AppError")
    }
}