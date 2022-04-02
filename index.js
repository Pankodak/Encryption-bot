const Discord = require("discord.js");
const JavaScriptObfuscator = require("javascript-obfuscator");
const fs = require("fs");
const request = require("request");
const { exec } = require("child_process");
const path = require("path");
const obfuscator = path.join(__dirname, "obfuscate.bash");
const mysql = require("mysql2");
const client = new Discord.Client();
const prefix = "!";
const TOKEN = "";
let crypting = false;
let cryptingJS = false;
const db = mysql.createPool({
    host: "localhost",
    user: "",
    password: "",
    database: "",
});

client.on("ready", () => {
    console.log(`Bot sie uruchomił`);
    client.user.setActivity("SystemAUTH", {
        type: "WATCHING",
    });
});
client.on("message", async (message) => {
    if (message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const authorID = message.author.id;
    if (command == "zaszyfrujjs") {
        db.execute("SELECT * FROM `luaobfuscator` WHERE discordID=?", [
            authorID,
        ])
            .then(([data]) => data[0])
            .then(async (data) => {
                if (!data) {
                    message.channel.send(
                        "Nie posiadasz uprawnień żeby użyć tej komendy"
                    );
                    return;
                }
                if (cryptingJS) {
                    message.channel.send(
                        "Aktualnie inny użytkownik szyfruje plik"
                    );
                    return;
                }
                if (!message.attachments.first()) {
                    message.channel.send("Nie dołączyłeś pliku");
                    return;
                }
                const letMessage = message.attachments.first().name.split(".");
                if (letMessage.length > 2 || letMessage[1] != "js") {
                    message.channel.send(
                        "Wysłałeś nieprawidłowy typ pliku, prawidłowy plik powinien wyglądać 'nazwa.js'"
                    );
                    return;
                }
                const m = await message.channel.send(
                    "Rozpoczęto pobieranie pliku na nasz serwer"
                );
                cryptingJS = true;
                var dd = new Date();
                var nn = new String(dd.toDateString()).replace(/ /g, "_");
                const textt = `${letMessage[0]}_${letMessage[1]}_${Math.floor(
                    Math.random() * 10000
                )}_${message.author.username}_${
                    message.author.discriminator
                }_${Math.floor(Math.random() * 10000)}_${nn}.txt`;
                // let file = fs.createWriteStream(`../test.txt`);
                const filePath = "./jsSzyfrator/test.js";
                let file = fs.createWriteStream(filePath);
                await new Promise((resolve, reject) => {
                    request({
                        uri: message.attachments.first().attachment,
                        headers: {
                            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
                            "Accept-Encoding": "gzip, deflate, br",
                            "Accept-Language":
                                "en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3",
                            "Cache-Control": "max-age=0",
                            Connection: "keep-alive",
                            "Upgrade-Insecure-Requests": "1",
                            "User-Agent":
                                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36",
                        },
                        gzip: true,
                    })
                        .pipe(file)
                        .on("finish", () => {
                            file.close();
                            m.edit(
                                `Zakończono pobieranie pliku na nasz serwer i rozpoczęto proces szyfrowania`
                            );
                            fs.readFile(
                                filePath,
                                { encoding: "utf8" },
                                async (err, data) => {
                                    const newData =
                                        JavaScriptObfuscator.obfuscate(data, {
                                            compact: true,
                                            identifierNamesGenerator:
                                                "hexadecimal",
                                            stringArray: true,
                                            rotateStringArray: true,
                                            shuffleStringArray: true,
                                            stringArrayThreshold: 0.8,
                                            target: "node",
                                            stringArrayEncoding: "base64",
                                        });
                                    fs.writeFile(
                                        filePath,
                                        newData,
                                        { encoding: "utf8" },
                                        () => {
                                            fs.copyFile(
                                                filePath,
                                                `./pliki/${textt}`,
                                                (err) => {
                                                    if (err) throw err;
                                                    fs.readFile(
                                                        filePath,
                                                        async (err, data) => {
                                                            const d =
                                                                Math.floor(
                                                                    Math.random() *
                                                                        10000
                                                                );
                                                            const text = `${message.author.username}_${message.author.discriminator}_${d}.js`;
                                                            const attachment =
                                                                new Discord.MessageAttachment(
                                                                    data,
                                                                    text
                                                                );
                                                            await message.channel.send(
                                                                `Oto zaszyfrowany plik CHUJU`,
                                                                attachment
                                                            );
                                                            fs.unlink(
                                                                filePath,
                                                                () => true
                                                            );
                                                            cryptingJS = false;
                                                            resolve();
                                                        }
                                                    );
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        })
                        .on("error", (error) => {
                            cryptingJS = false;
                            message.channel.send("Wystąpił błąd");
                            reject(error);
                        });
                }).catch((error) => {
                    cryptingJS = false;
                    message.channel.send(
                        "Wystąpił błąd, nie byliśmy w stanie pobrać pliku z serwerów discorda."
                    );
                });
                return;
            })
            .catch((err) => {
                message.channel.send(`${err}`);
            });
    }
    if (command == "zabierzlicke") {
        db.execute("SELECT * FROM `resellers` WHERE discordID=?", [authorID])
            .then(([data]) => data[0])
            .then((data) => {
                if (!data) {
                    message.channel.send(
                        "Nie posiadasz uprawnień żeby użyć tej komendy"
                    );
                    return;
                }
                const canADD = data.canremove == 0 || data.master == 0;
                if (canADD) {
                    message.channel.send(
                        "Nie masz uprawnień do używania tej komendy"
                    );
                    return;
                }
                if (args.length != 1) {
                    message.channel.send(
                        "Prawidłowa składnia powinna wyglądać tak: !zabierzlicke 'id uzytkownika'"
                    );
                    return;
                }
                db.execute("DELETE FROM `luaobfuscator` WHERE discordID=?", [
                    args[0],
                ])
                    .then(() => {
                        message.channel.send(
                            `Pomyślnie zabrano licencje użytkownikowi o id ${args[0]}`
                        );
                    })
                    .catch((err) => {
                        message.channel.send(`ERROR: ${err}`);
                    });
            })
            .catch((err) => {
                message.channel.send(`ERROR: ${err}`);
            });
    }
    if (command == "dodajlicke") {
        db.execute("SELECT * FROM `resellers` WHERE discordID=?", [authorID])
            .then(([data]) => data[0])
            .then((data) => {
                if (!data) {
                    message.channel.send(
                        "Nie posiadasz uprawnień żeby użyć tej komendy"
                    );
                    return;
                }
                const canADD = data.canadd == 0 || data.master == 0;
                if (canADD) {
                    message.channel.send(
                        "Nie masz uprawnień do używania tej komendy"
                    );
                    return;
                }
                if (args.length != 1) {
                    message.channel.send(
                        "Prawidłowa składnia powinna wyglądać tak: !dodajlicke 'id uzytkownika'"
                    );
                    return;
                }
                db.execute("INSERT INTO luaobfuscator (discordID) VALUES (?)", [
                    args[0],
                ])
                    .then(() => {
                        message.channel.send(
                            `Pomyślnie dodano licencje dla użytkownika o id ${args[0]}`
                        );
                    })
                    .catch((err) => {
                        message.channel.send(`ERROR: ${err}`);
                    });
            })
            .catch((err) => {
                console.log(err);
            });
    }
    if (command == "zaszyfrujlua") {
        db.execute("SELECT * FROM `luaobfuscator` WHERE discordID=?", [
            authorID,
        ])
            .then(([data]) => data[0])
            .then(async (data) => {
                if (!data) {
                    message.channel.send(
                        "Nie posiadasz uprawnień żeby użyć tej komendy"
                    );
                    return;
                }
                if (crypting) {
                    message.channel.send(
                        "Aktualnie inny użytkownik szyfruje plik"
                    );
                    return;
                }
                if (!message.attachments.first()) {
                    message.channel.send("Nie dołączyłeś pliku");
                    return;
                }
                const letMessage = message.attachments.first().name.split(".");
                if (letMessage.length > 2 || letMessage[1] != "lua") {
                    message.channel.send(
                        "Wysłałeś nieprawidłowy typ pliku, prawidłowy plik powinien wyglądać 'nazwa.lua'"
                    );
                    return;
                }
                const m = await message.channel.send(
                    "Rozpoczęto pobieranie pliku na nasz serwer"
                );
                crypting = true;
                var dd = new Date();
                var nn = new String(dd.toDateString()).replace(/ /g, "_");
                const text = `${letMessage[0]}_${letMessage[1]}_${Math.floor(
                    Math.random() * 10000
                )}_${message.author.username}_${
                    message.author.discriminator
                }_${Math.floor(Math.random() * 10000)}_${nn}.txt`;
                let file = fs.createWriteStream(`../test.txt`);
                await new Promise((resolve, reject) => {
                    request({
                        uri: message.attachments.first().attachment,
                        headers: {
                            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
                            "Accept-Encoding": "gzip, deflate, br",
                            "Accept-Language":
                                "en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3",
                            "Cache-Control": "max-age=0",
                            Connection: "keep-alive",
                            "Upgrade-Insecure-Requests": "1",
                            "User-Agent":
                                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36",
                        },
                        gzip: true,
                    })
                        .pipe(file)
                        .on("finish", () => {
                            file.close();
                            m.edit(
                                `Zakończono pobieranie pliku na nasz serwer i rozpoczęto proces szyfrowania`
                            );
                            fs.copyFile(
                                "../test.txt",
                                `./pliki/${text}`,
                                (err) => {
                                    if (err) throw err;
                                }
                            );
                            exec(obfuscator, (error, stdout, stderr) => {
                                if (error) {
                                    console.log(`error: ${error.message}`);
                                    message.channel.send(
                                        "Wystąpił błąd, prosimy o powiadomienie administratora"
                                    );
                                    crypting = false;
                                    return;
                                }
                                if (stderr) {
                                    console.log(`stderr: ${stderr}`);
                                    message.channel.send(
                                        "Wystąpił błąd, prosimy o powiadomienie administratora"
                                    );
                                    crypting = false;
                                    return;
                                }
                                crypting = false;
                                fs.access(
                                    "../out.lua",
                                    fs.F_OK,
                                    async (err) => {
                                        if (err) {
                                            m.edit(
                                                `Wystąpił błąd podczas szyfrowania, sprawdź czy twój kod nie generuje żadnych błędów.`
                                            );
                                            resolve();
                                            return;
                                        }
                                        await m.edit(
                                            `Zakończono szyfrowanie pliku`
                                        );
                                        const buffer =
                                            fs.readFileSync("../out.lua");
                                        const d = Math.floor(
                                            Math.random() * 10000
                                        );
                                        const text = `${message.author.username}_${message.author.discriminator}_${d}.lua`;
                                        const attachment =
                                            new Discord.MessageAttachment(
                                                buffer,
                                                text
                                            );
                                        message.channel.send(
                                            `Oto zaszyfrowany plik CHUJU`,
                                            attachment
                                        );
                                        resolve();
                                    }
                                );
                            });
                        })
                        .on("error", (error) => {
                            crypting = false;
                            message.channel.send("Wystąpił błąd");
                            reject(error);
                        });
                }).catch((error) => {
                    crypting = false;
                    message.channel.send(
                        "Wystąpił błąd, nie byliśmy w stanie pobrać pliku z serwerów discorda."
                    );
                });
                return;
            })
            .catch((err) => {
                message.channel.send(`${err}`);
            });
    }
});

client.login(TOKEN);
