import { ProxyTagParser } from "../structures/ProxyTagParser";

console.log(
    ProxyTagParser.parse('i', [
        [
            {
                prefix: "Ruben:",
                suffix: "-Ruben"
            }
        ]
    ], "Ruben: hi -Ruben")
)