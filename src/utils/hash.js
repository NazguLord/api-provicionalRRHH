const generarHash = async (valor) => {
  return `hash-${valor}`;
};

const compararHash = async (valor, hash) => {
  return hash === `hash-${valor}`;
};

module.exports = {
  generarHash,
  compararHash
};
