const Jimp = require("jimp");
const cote = require("cote");
const response = new cote.Responder({ name: "image service" });

// microservice logic
response.on("thumbnail", (req, done) => {
  const { files } = req;
  files.forEach((file) => {
    Jimp.read(`${file.destination}${file.originalname}`).then((image) => {
      image.resize(100, 100);

      image.write(`${file.destination}${file.originalname}`);
    });
  });
});
