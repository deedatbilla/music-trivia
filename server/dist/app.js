"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const constants_1 = require("./constants");
const { StatusCodes } = require("http-status-codes");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bodyParser = require("body-parser");
const app = (0, express_1.default)();
app.use(bodyParser.json());
const server = require("http").Server(app);
dotenv_1.default.config();
const PORT = 5000;
server.listen(PORT, () => console.log("server running on port:" + PORT));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});
app.get("/get-artists", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // Add your code here
        try {
            // const all:any[]=[]
            // ARTISTS.forEach(element => {
            //   // console.log(element)
            //   const data=axios.get(
            //     `${ITUNES_BASE_URL}/search?term=${element}`
            //   );
            //   all.push(data)
            // });
            // const g=await Promise.all(all)
            // const final=[]
            // const d=g.forEach(element => {
            //   const f={
            //     artistId: element.data.results[0].artistId,
            //     artistName:element.data.results[0].artistName,
            //     artworkUrl100:element.data.results[0].artworkUrl100
            //   }
            //   final.push(f)
            // });
            // console.log(final,final.length)
            res.status(StatusCodes.OK);
            res.json({ data: constants_1.ARTISTS, count: constants_1.ARTISTS.length });
        }
        catch (error) {
            res.status(StatusCodes.UNPROCESSABLE_ENTITY);
            console.log(error);
        }
    });
});
app.post("/setup-challenge", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { artistId, playerId } = req.body;
            const { data: artistAlbums } = yield axios_1.default.get(`${constants_1.ITUNES_BASE_URL}/lookup?id=${artistId}&entity=album&limit=12`);
            // await prisma.challenge.deleteMany({
            //   where: {
            //     playerId,
            //   },
            // });
            // await prisma.hint.deleteMany({
            //   where: {
            //     playerId,
            //   },
            // });
            const check = yield prisma.challenge.findMany({
                where: {
                    artistId,
                },
            });
            // console.log(check.length,"sdfd")
            if (check.length === 0) {
                // console.log(artistAlbums);
                const challenges = [];
                console.log(artistAlbums.results.length);
                artistAlbums.results.slice(1, 4).forEach((element, idx) => {
                    const request = prisma.challenge.create({
                        data: {
                            playerId: Number(playerId),
                            attempts: 0,
                            artistId,
                            answered: false,
                            round: idx + 1,
                            albumName: element.collectionName || "",
                            artistName: element.artistName || "",
                            artworkUrl100: element.artworkUrl100 || "",
                            score: 0,
                        },
                    });
                    challenges.push(request);
                });
                const challengeResults = yield Promise.all(challenges);
                res.status(StatusCodes.OK);
                res.json({ challenges: challengeResults });
            }
            else {
                const challenges = yield prisma.challenge.findMany({
                    where: {
                        playerId: Number(playerId),
                        artistId,
                    },
                    orderBy: {
                        score: "asc",
                    },
                });
                res.status(StatusCodes.OK);
                res.json({ challenges });
            }
        }
        catch (error) {
            res.status(StatusCodes.UNPROCESSABLE_ENTITY);
            console.log(error.message);
            res.json(error);
        }
    });
});
app.get("/get-challenges/:playerId", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { playerId } = req.params;
            const challenges = yield prisma.challenge.findMany({
                where: {
                    playerId: Number(playerId),
                },
            });
            const hints = yield prisma.hint.findMany({
                where: {
                    playerId: Number(playerId),
                },
            });
            res.status(StatusCodes.OK);
            res.json({ challenges, hints });
        }
        catch (error) {
            res.status(StatusCodes.UNPROCESSABLE_ENTITY);
            console.log(error.message);
            res.json(error);
        }
    });
});
app.post("/submit-answer", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { challengeId, answer, playerId } = req.body;
            const challenge = yield prisma.challenge.findUnique({
                where: {
                    id: challengeId,
                },
            });
            let update = {
                score: 0,
                attempts: 0,
                answered: false,
            };
            console.log({
                correct: challenge.artistName,
                answer,
                a: challenge.attempts,
            });
            if (challenge.artistName === answer && challenge.attempts === 0) {
                update = {
                    score: 5,
                    attempts: 1,
                    answered: true,
                };
                console.log("attempt 1");
            }
            if (challenge.artistName === answer && challenge.attempts === 1) {
                update = {
                    score: 3,
                    attempts: 2,
                    answered: true,
                };
                console.log("attempt 2");
            }
            if (challenge.artistName === answer && challenge.attempts === 2) {
                update = {
                    score: 1,
                    attempts: 3,
                    answered: true,
                };
                console.log("attempt 3");
            }
            if (challenge.artistName !== answer && challenge.attempts === 0) {
                update = {
                    score: 0,
                    attempts: 1,
                    answered: false,
                };
            }
            if (challenge.artistName !== answer && challenge.attempts === 1) {
                update = {
                    score: 0,
                    attempts: 2,
                    answered: false,
                };
            }
            if (challenge.artistName !== answer && challenge.attempts === 2) {
                update = {
                    score: 0,
                    attempts: 3,
                    answered: true,
                };
            }
            const user = yield prisma.player.findUnique({
                where: {
                    id: Number(playerId),
                },
            });
            // console.log(user, user.score + update.score, update.score);
            const newScore = user.score + update.score;
            const userUpdate = {
                score: newScore,
            };
            console.log(userUpdate);
            yield prisma.player.updateMany({
                where: {
                    id: Number(playerId),
                },
                data: userUpdate,
            });
            const updated = yield prisma.challenge.updateMany({
                where: {
                    id: challengeId,
                },
                data: update,
            });
            res.status(StatusCodes.OK);
            res.json({ updated });
        }
        catch (error) {
            res.status(StatusCodes.UNPROCESSABLE_ENTITY);
            console.log(error.message);
            res.json(error);
        }
    });
});
app.get("/players", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const players = yield prisma.player.findMany();
            res.status(StatusCodes.OK);
            res.json({ data: players });
        }
        catch (error) {
            res.status(StatusCodes.UNPROCESSABLE_ENTITY);
            // console.log(error.message);
            res.json(error);
        }
    });
});
app.post("/restart", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { artistId } = req.body;
            yield prisma.challenge.deleteMany({
                where: {
                    artistId,
                },
            });
            res.status(StatusCodes.OK);
            res.json({ messaged: "restart complete" });
        }
        catch (error) {
            res.status(StatusCodes.UNPROCESSABLE_ENTITY);
            // console.log(error.message);
            res.json(error);
        }
    });
});
app.get("/player/:id", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // Add your code here
        try {
            const { id } = req.params;
            const player = yield prisma.player.findMany({
                where: {
                    id,
                },
            });
            res.status(StatusCodes.OK);
            res.json({ data: player[0] });
        }
        catch (error) {
            res.status(StatusCodes.UNPROCESSABLE_ENTITY);
            // console.log(error.message);
            res.json(error);
        }
    });
});
app.get("/scores", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // Add your code here
        try {
            const player = yield prisma.player.findMany();
            res.status(StatusCodes.OK);
            res.json({ data: player });
        }
        catch (error) {
            res.status(StatusCodes.UNPROCESSABLE_ENTITY);
            // console.log(error.message);
            res.json(error);
        }
    });
});
app.post("/create-player", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // Add your code here
        try {
            const player = yield prisma.player.create({
                data: {
                    score: 0,
                    username: "",
                },
            });
            // await prisma.challenge.create({
            //   data: {
            //     playerId:player.id,
            //     attempts: 0,
            //   },
            // });
            res.status(StatusCodes.OK);
            res.json({ data: player });
        }
        catch (error) {
            res.status(StatusCodes.UNPROCESSABLE_ENTITY);
            // console.log(error.message);
            res.json(error);
        }
    });
});
app.post("/update-user", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { playerId, username } = req.body;
            const player = yield prisma.player.update({
                where: {
                    id: Number(playerId),
                },
                data: {
                    username,
                },
            });
            res.status(StatusCodes.OK);
            res.json({ data: player });
        }
        catch (error) {
            res.status(StatusCodes.UNPROCESSABLE_ENTITY);
            console.log(error.message);
            res.json(error);
        }
    });
});
// app.listen(PORT, function () {
//   console.log(`App started on  port ${PORT}`);
// });
// module.exports = app;
//# sourceMappingURL=app.js.map