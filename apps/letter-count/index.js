const db = require('./db');
const { isNaN } = require('lodash');
const { onStart, onWrong, onCorrect, onDone, onUnknown } = require('./actions');

module.exports = (req, res) => {
  const { body } = req;
  const { session = {}, request } = body || {};
  const { command: rawCommand } = request || {};
  const command = rawCommand && rawCommand.toLowerCase();

  if (session.new) {
    onStart(res, session);
    return;
  }

  if (command === 'хватит') {
    onDone(res, session);
    return;
  }

  const currentSession = db.getSession(session.session_id);

  if (currentSession && currentSession.isLoss) {
    if (command === 'да') {
      onStart(res, session);
    } else if (command === 'нет') {
      onDone(res, session);
    } else {
      onUnknown(res, session);
    }

    return;
  }

  const answer = parseInt(command, 10);

  if (isNaN(answer) || !currentSession) {
    onUnknown(res, session);
  } else if (currentSession.word && answer === currentSession.word.length) {
    onCorrect(res, session);
  } else {
    onWrong(res, session);
  }
};
