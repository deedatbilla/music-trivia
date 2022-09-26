import axios from "axios";
import dotenv from "dotenv";
import express, { Request, Response, NextFunction, Express } from "express";
import { ITUNES_BASE_URL, ARTISTS } from "./constants";
import { Album } from "./types/types";
const { StatusCodes } = require("http-status-codes");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bodyParser = require("body-parser");
const app: Express = express();
app.use(bodyParser.json());
const server = require("http").Server(app);
dotenv.config();
const PORT = 5000;
server.listen(PORT, () => console.log("server running on port:" + PORT));
app.use(function (req: Request, res: Response, next: NextFunction) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

app.get("/get-artists", async function (req: Request, res: Response) {
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
    res.json({ data: ARTISTS, count: ARTISTS.length });
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY);
    console.log(error);
  }
});

app.post("/setup-challenge", async function (req: Request, res: Response) {
  try {
    const { artistId, playerId } = req.body;
    const { data: artistAlbums } = await axios.get(
      `${ITUNES_BASE_URL}/lookup?id=${artistId}&entity=album&limit=12`
    );
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
    const check = await prisma.challenge.findMany({
      where: {
        artistId,
      },
    });
    // console.log(check.length,"sdfd")
    if (check.length === 0) {
      // console.log(artistAlbums);

      const challenges: Album[] = [];
      console.log(artistAlbums.results.length);
      artistAlbums.results.slice(1, 4).forEach((element: Album, idx: any) => {
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

      const challengeResults = await Promise.all(challenges);

      res.status(StatusCodes.OK);
      res.json({ challenges: challengeResults });
    } else {
      const challenges = await prisma.challenge.findMany({
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
  } catch (error: any) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY);
    console.log(error.message);
    res.json(error);
  }
});
app.get(
  "/get-challenges/:playerId",
  async function (req: Request, res: Response) {
    try {
      const { playerId } = req.params;
      const challenges = await prisma.challenge.findMany({
        where: {
          playerId: Number(playerId),
        },
      });
      const hints = await prisma.hint.findMany({
        where: {
          playerId: Number(playerId),
        },
      });

      res.status(StatusCodes.OK);
      res.json({ challenges, hints });
    } catch (error: any) {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY);
      console.log(error.message);
      res.json(error);
    }
  }
);

app.post("/submit-answer", async function (req: Request, res: Response) {
  try {
    const { challengeId, answer, playerId } = req.body;
    const challenge = await prisma.challenge.findUnique({
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

    const user = await prisma.player.findUnique({
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

    await prisma.player.updateMany({
      where: {
        id: Number(playerId),
      },
      data: userUpdate,
    });
    const updated = await prisma.challenge.updateMany({
      where: {
        id: challengeId,
      },
      data: update,
    });
    res.status(StatusCodes.OK);
    res.json({ updated });
  } catch (error: any) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY);
    console.log(error.message);
    res.json(error);
  }
});
app.get("/players", async function (req: Request, res: Response) {
  try {
    const players = await prisma.player.findMany();
    res.status(StatusCodes.OK);
    res.json({ data: players });
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY);
    // console.log(error.message);
    res.json(error);
  }
});

app.post("/restart", async function (req: Request, res: Response) {
  try {
    const { artistId } = req.body;

    await prisma.challenge.deleteMany({
      where: {
        artistId,
      },
    });

    res.status(StatusCodes.OK);
    res.json({ messaged: "restart complete" });
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY);
    // console.log(error.message);
    res.json(error);
  }
});
app.get("/player/:id", async function (req: Request, res: Response) {
  // Add your code here

  try {
    const { id } = req.params;
    const player = await prisma.player.findMany({
      where: {
        id,
      },
    });
    res.status(StatusCodes.OK);
    res.json({ data: player[0] });
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY);
    // console.log(error.message);
    res.json(error);
  }
});

app.get("/scores", async function (req: Request, res: Response) {
  // Add your code here

  try {
    const player = await prisma.player.findMany();

    res.status(StatusCodes.OK);
    res.json({ data: player });
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY);
    // console.log(error.message);
    res.json(error);
  }
});
app.post("/create-player", async function (req: Request, res: Response) {
  // Add your code here

  try {
    const player = await prisma.player.create({
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
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY);
    // console.log(error.message);
    res.json(error);
  }
});

app.post("/update-user", async function (req: Request, res: Response) {
  try {
    const { playerId, username } = req.body;
    const player = await prisma.player.update({
      where: {
        id: Number(playerId),
      },
      data: {
        username,
      },
    });
    res.status(StatusCodes.OK);
    res.json({ data: player });
  } catch (error: any) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY);
    console.log(error.message);
    res.json(error);
  }
});

// app.listen(PORT, function () {
//   console.log(`App started on  port ${PORT}`);
// });

// module.exports = app;
