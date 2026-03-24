const generarToken = (payload) => {
  return `token-demo-${JSON.stringify(payload)}`;
};

module.exports = {
  generarToken
};
