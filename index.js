const app = require("./src/app");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Servidor ejecutandose en http://${HOST}:${PORT}`);
});
