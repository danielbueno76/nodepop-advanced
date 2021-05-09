const Jimp = require("jimp");
const cote = require("cote");
const response = new cote.Responder({ name: "image service" });

// microservice logic
response.on("thumbnail", async (req, done) => {
  const { file } = req;

  const image = await Jimp.read(`${file.destination}${file.originalname}`);

  image.resize(100, 100);

  image.write(`${file.destination}${file.originalname}`);

  done();
});
