const functions = require('firebase-functions');
const express = require('express');
const db = require('./db');
const { isNumber } = require('lodash');
const { onStart, onWrong, onCorrect, onDone, onUnknown } = require('./actions');

const app = express();

app.use(express.json());

app.post('/', (req, res) => {
  const { body } = req;
  const { session = {}, request } = body || {};
  const { command } = request || {};

  if (session.new) {
    onStart(res, session);
    return;
  }

  if (command === 'хватит') {
    onDone(res, session);
    return;
  }

  const currentSession = db.getSession(session.session_id);
  const answer = parseInt(command, 10);

  console.log(currentSession);

  if (!isNumber(answer)) {
    onUnknown(res, session);
  } else if (currentSession.word && answer === currentSession.word.length) {
    onCorrect(res, session);
  } else {
    onWrong(res, session);
  }
});

exports.letterCount = functions.https.onRequest(app);
