import chalk from "chalk"
import { UnknownMethod } from "../../typings/types/UnknownMethod"

function findCommand(...args: unknown[]) {
    const cmd = require(`../../structures/Command`).Command
}

export function LogExecutionTime() {
    return function(target: any, property: string, descriptor: PropertyDescriptor) {
        const fn = descriptor.value! as UnknownMethod

        descriptor.value = function(this: any, ...args: unknown[]) {
            const cons = this === null ? null : this?.constructor.name === 'Function' ? null : this?.constructor.name  ?? null

            const start = performance.now()
            
            const res = fn.call(this, ...args)

            const end = performance.now() - start
            
            console.log(`${chalk.green.bold(`[EXECUTION LOGGER]`)} => ${cons ? chalk.blue.bold(`${cons}#`) : ''}${chalk.magenta.bold(property)} executed within ${chalk.red.bold(`${end}ms`)}.`)

            return res
        }
    }
}

export function AsyncLogExecutionTime() {
    return function(target: any, property: string, descriptor: PropertyDescriptor) {
        const fn = descriptor.value! as UnknownMethod

        descriptor.value = async function(this: any, ...args: unknown[]) {
            const cons = this === null ? null : this?.constructor.name === 'Function' ? null : this?.constructor.name  ?? null

            const start = performance.now()
            
            const res = await fn.call(this, ...args)

            const end = performance.now() - start
            
            console.log(`${chalk.green.bold(`[EXECUTION LOGGER]`)} => ${cons ? chalk.blue.bold(`${cons}#`) : ''}${chalk.magenta.bold(property)} executed within ${chalk.red.bold(`${end}ms`)}.`)

            return res
        }
    }
}