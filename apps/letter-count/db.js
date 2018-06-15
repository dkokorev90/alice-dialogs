const SESSION = {};

exports.getSession = id => SESSION[id];
exports.setSession = (id, data) => {
  SESSION[id] = data;
};

exports.deleteSession = (id) => {
  delete SESSION[id];
};

exports.setWord = (id, word) => {
  SESSION[id].word = word;
};

exports.setLoss = (id) => {
  SESSION[id].isLoss = true;
};

exports.getWord = id => SESSION[id].word;

exports.decreaseAttempts = (id) => {
  SESSION[id].attempts -= 1;
};

exports.getAttempts = id => SESSION[id].attempts;
